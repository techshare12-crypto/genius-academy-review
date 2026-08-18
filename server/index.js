import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'path';
import fs from 'fs';
import { isValidCourse, COURSES_LIST } from './courseConfig.js';
import { generateUniqueReview } from './geminiService.js';
import { getTotalGeneratedCount, savePrivateFeedback, updateReviewStatus, isSupabaseActive } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.resolve('dist');

// Middleware
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// Handle malformed JSON body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request payload.' });
  }
  next();
});

// Serve static assets from Vite production build if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

/**
 * GET /api/health
 * Health check and configuration status
 */
app.get('/api/health', (req, res) => {
  const geminiConfigured = !!((process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''));

  res.json({
    status: 'ok',
    service: 'genius-academy-review-backend',
    database: isSupabaseActive ? 'supabase' : 'sqlite-persistent',
    supabaseConnected: isSupabaseActive,
    totalStoredReviews: getTotalGeneratedCount(),
    geminiConfigured,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    supportedCoursesCount: COURSES_LIST.length,
    similarityThreshold: process.env.REVIEW_SIMILARITY_THRESHOLD || 0.70,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/courses
 * Returns the list of 15 supported courses
 */
app.get('/api/courses', (req, res) => {
  res.json({
    courses: COURSES_LIST,
  });
});

/**
 * POST /api/generate-review
 * Main review generation endpoint with global database uniqueness
 *
 * Request Body:
 * {
 *   "course": "Python",
 *   "variation": 0,
 *   "sessionId": "uuid"
 * }
 */
app.post('/api/generate-review', async (req, res) => {
  try {
    const { course, variation = 0, sessionId = null } = req.body || {};

    // 1. Missing course validation
    if (!course || typeof course !== 'string' || course.trim() === '') {
      return res.status(400).json({
        error: 'Please select a course.',
      });
    }

    const trimmedCourse = course.trim();

    // 2. Invalid course name validation
    if (!isValidCourse(trimmedCourse)) {
      return res.status(400).json({
        error: 'Invalid course selection.',
      });
    }

    // 3. Variation validation
    const numVariation = typeof variation === 'number' ? Math.floor(variation) : parseInt(variation, 10);
    const safeVariation = Number.isInteger(numVariation) && numVariation >= 0 ? numVariation : 0;
    const safeSessionId = typeof sessionId === 'string' ? sessionId.trim() : crypto.randomUUID();

    // 4. Generate unique review draft (guaranteed unique & persisted to DB before return)
    const requestId = crypto.randomUUID();
    const result = await generateUniqueReview(trimmedCourse, safeVariation, requestId, safeSessionId);

    // 5. Safe server-side telemetry logging (NO secrets, NO PII, NO full user text)
    console.log(`[Review] provider=${result.source} course="${trimmedCourse}" variation=${safeVariation} requestId=${requestId}`);

    // 6. Return successful response
    return res.status(200).json({
      review: result.review,
      requestId: result.requestId,
      course: trimmedCourse,
      variation: safeVariation,
      source: result.source,
      sessionId: safeSessionId,
    });
  } catch (error) {
    console.error('[API Error /generate-review]:', error.message);
    return res.status(500).json({
      error: 'Unable to generate review draft. Please try again.',
    });
  }
});

/**
 * POST /api/private-feedback
 * Stores private feedback from 1–3 star ratings (or any rating) in Supabase/Database
 *
 * Request Body:
 * {
 *   "rating": 2,
 *   "course": "Tally with GST",
 *   "feedback": "I would like more practice time.",
 *   "sessionId": "uuid"
 * }
 */
app.post('/api/private-feedback', async (req, res) => {
  try {
    const { rating, course, feedback = '', sessionId = null } = req.body || {};

    // 1. Rating validation (1 to 5 integer)
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        error: 'Rating must be an integer between 1 and 5.',
      });
    }

    // 2. Course validation
    if (!course || typeof course !== 'string' || !isValidCourse(course.trim())) {
      return res.status(400).json({
        error: 'Invalid course selection.',
      });
    }

    // 3. Feedback sanitization (max 2000 characters)
    const cleanFeedback = typeof feedback === 'string' ? feedback.trim().substring(0, 2000) : '';
    const safeSessionId = typeof sessionId === 'string' ? sessionId.trim().substring(0, 100) : null;
    const feedbackId = crypto.randomUUID();

    // 4. Save to persistent database (Supabase / SQLite)
    await savePrivateFeedback({
      id: feedbackId,
      rating: numRating,
      course: course.trim(),
      feedback: cleanFeedback,
      sessionId: safeSessionId,
    });

    console.log(`[Feedback] rating=${numRating} course="${course.trim()}" id=${feedbackId}`);

    return res.status(200).json({
      success: true,
      id: feedbackId,
    });
  } catch (error) {
    console.error('[API Error /private-feedback]:', error.message);
    return res.status(500).json({
      error: 'Unable to save feedback. Please try again.',
    });
  }
});

/**
 * POST /api/analytics
 * Lightweight anonymous analytics receiver
 */
app.post('/api/analytics', async (req, res) => {
  const { event, requestId } = req.body || {};
  if (requestId && typeof requestId === 'string') {
    try {
      if (event === 'GOOGLE_BUTTON_CLICKED') {
        await updateReviewStatus(requestId, 'google_opened');
      } else if (event === 'COMPLETION_CONFIRMED') {
        await updateReviewStatus(requestId, 'completed');
      }
    } catch {
      // ignore
    }
  }
  res.status(200).json({ received: true });
});

/**
 * Catch-all SPA Fallback Route
 * Serves index.html from dist for any non-API client-side route (/review, /completion, etc.)
 */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send('Frontend not built. Please run `npm run build` before starting the production server.');
});

// Start Server
app.listen(PORT, () => {
  const geminiConfigured = !!((process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''));
  console.log(`\n==================================================`);
  console.log(` GENIUS ACADEMY REVIEW ASSISTANT PRODUCTION SERVER`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Database: ${isSupabaseActive ? 'Supabase Connected' : 'SQLite Persistent (server/data/reviews.db)'}`);
  console.log(` Static Frontend: ${fs.existsSync(distPath) ? 'Serving from dist/' : 'Not built yet'}`);
  console.log(` Global Uniqueness: Active (Threshold: ${process.env.REVIEW_SIMILARITY_THRESHOLD || '0.70'})`);
  console.log(` Gemini Configured: ${geminiConfigured ? 'YES' : 'NO (Using pre-verified fallbacks)'}`);
  console.log(` Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.6-flash'}`);
  console.log(` Total Stored Reviews: ${getTotalGeneratedCount()}`);
  console.log(` Supported Courses: ${COURSES_LIST.length}`);
  console.log(`==================================================\n`);
});

export default app;
