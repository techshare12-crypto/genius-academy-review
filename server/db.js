import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Initialize local persistent SQLite database for local/zero-config fallback
const dataDir = path.resolve('server/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'reviews.db');
export const sqliteDb = new DatabaseSync(dbPath);

// Initialize SQLite tables
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS review_generation_history (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    review_text TEXT NOT NULL,
    review_normalized TEXT NOT NULL,
    review_hash TEXT NOT NULL UNIQUE,
    variation INTEGER NOT NULL DEFAULT 0,
    provider TEXT DEFAULT 'gemini',
    status TEXT DEFAULT 'generated',
    session_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_course ON review_generation_history(course);
  CREATE INDEX IF NOT EXISTS idx_reviews_hash ON review_generation_history(review_hash);
  CREATE INDEX IF NOT EXISTS idx_reviews_created ON review_generation_history(created_at);

  CREATE TABLE IF NOT EXISTS private_feedback (
    id TEXT PRIMARY KEY,
    rating INTEGER NOT NULL,
    course TEXT NOT NULL,
    feedback TEXT,
    session_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_course ON private_feedback(course);
  CREATE INDEX IF NOT EXISTS idx_feedback_rating ON private_feedback(rating);
`);

// Migration helper for existing databases
try {
  sqliteDb.exec('ALTER TABLE review_generation_history ADD COLUMN session_id TEXT');
} catch {
  // column already exists
}

// 2. Initialize Supabase if environment variables are provided
const rawUrl = process.env.SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.trim().replace(/^(https?:\/\/)+/i, 'https://') : null;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your_supabase'))
  ? createClient(supabaseUrl, supabaseKey.trim())
  : null;

export const isSupabaseActive = !!supabase;

/**
 * Save review draft to persistent storage (Supabase or SQLite)
 * @param {object} record
 * @returns {Promise<boolean>} true if saved, false if duplicate hash collision
 */
export async function saveReviewToHistory(record) {
  const { id, course, reviewText, reviewNormalized, reviewHash, variation = 0, provider = 'gemini', status = 'generated', sessionId = null } = record;
  const createdAt = new Date().toISOString();

  // Always write to local persistent SQLite database first for immediate local consistency
  try {
    const stmt = sqliteDb.prepare(`
      INSERT INTO review_generation_history (
        id, course, review_text, review_normalized, review_hash, variation, provider, status, session_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, course, reviewText, reviewNormalized, reviewHash, variation, provider, status, sessionId, createdAt);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      console.warn(`[DB Uniqueness] Collision detected for hash ${reviewHash.substring(0, 10)}`);
      return false;
    }
    console.error('[SQLite Error] Failed to save review:', error.message);
    throw error;
  }

  // If Supabase is connected, mirror to Supabase asynchronously
  if (supabase) {
    try {
      const { error } = await supabase.from('review_generation_history').insert([
        {
          id,
          course,
          review_text: reviewText,
          review_normalized: reviewNormalized,
          review_hash: reviewHash,
          variation,
          provider,
          status,
          session_id: sessionId,
          created_at: createdAt,
        },
      ]);
      if (error) {
        if (error.code === '23505') { // Postgres UNIQUE violation
          return false;
        }
        console.warn('[Supabase Sync Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Error]:', err.message);
    }
  }

  return true;
}

/**
 * Check if exact hash exists anywhere in the database
 * @param {string} reviewHash
 * @returns {boolean}
 */
export function isHashInHistory(reviewHash) {
  const stmt = sqliteDb.prepare('SELECT 1 FROM review_generation_history WHERE review_hash = ? LIMIT 1');
  const row = stmt.get(reviewHash);
  return !!row;
}

/**
 * Check if exact normalized text exists anywhere in the database
 * @param {string} reviewNormalized
 * @returns {boolean}
 */
export function isNormalizedInHistory(reviewNormalized) {
  const stmt = sqliteDb.prepare('SELECT 1 FROM review_generation_history WHERE review_normalized = ? LIMIT 1');
  const row = stmt.get(reviewNormalized);
  return !!row;
}

/**
 * Retrieve all historical reviews for a specific course to check similarity
 * @param {string} course
 * @returns {Array<{ review_text: string, review_normalized: string }>}
 */
export function getHistoryForCourse(course) {
  const stmt = sqliteDb.prepare('SELECT review_text, review_normalized FROM review_generation_history WHERE course = ? ORDER BY created_at DESC');
  return stmt.all(course);
}

/**
 * Retrieve recent reviews across all courses
 * @param {number} limit
 * @returns {Array<{ review_text: string, review_normalized: string, course: string }>}
 */
export function getRecentHistory(limit = 25) {
  const stmt = sqliteDb.prepare('SELECT review_text, review_normalized, course FROM review_generation_history ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit);
}

/**
 * Save private feedback (e.g. 1–3 star ratings) to persistent storage
 * @param {object} feedbackRecord
 * @returns {Promise<boolean>}
 */
export async function savePrivateFeedback(feedbackRecord) {
  const { id, rating, course, feedback, sessionId = null } = feedbackRecord;
  const createdAt = new Date().toISOString();

  // Save to SQLite
  try {
    const stmt = sqliteDb.prepare(`
      INSERT INTO private_feedback (
        id, rating, course, feedback, session_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, rating, course, feedback || '', sessionId, createdAt);
  } catch (err) {
    console.error('[DB Error] Failed to save private feedback:', err.message);
    throw err;
  }

  // Mirror to Supabase if connected
  if (supabase) {
    try {
      const { error } = await supabase.from('private_feedback').insert([
        {
          id,
          rating,
          course,
          feedback: feedback || '',
          session_id: sessionId,
          created_at: createdAt,
        },
      ]);
      if (error) {
        console.warn('[Supabase Feedback Sync Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Feedback Sync Error]:', err.message);
    }
  }

  return true;
}

/**
 * Update review status (e.g. 'google_opened', 'completed')
 * @param {string} id
 * @param {string} status
 */
export async function updateReviewStatus(id, status) {
  if (!id) return;
  try {
    const stmt = sqliteDb.prepare('UPDATE review_generation_history SET status = ? WHERE id = ?');
    stmt.run(status, id);
  } catch (err) {
    console.warn('[DB Error] Failed to update status in SQLite:', err.message);
  }

  if (supabase) {
    try {
      await supabase.from('review_generation_history').update({ status }).eq('id', id);
    } catch {
      // ignore
    }
  }
}

/**
 * Get count of total generated reviews stored
 * @returns {number}
 */
export function getTotalGeneratedCount() {
  const stmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM review_generation_history');
  const row = stmt.get();
  return row ? row.count : 0;
}
