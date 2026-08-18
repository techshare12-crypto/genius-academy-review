import crypto from 'node:crypto';
import { isHashInHistory, isNormalizedInHistory, getHistoryForCourse, getRecentHistory } from './db.js';

export const DEFAULT_SIMILARITY_THRESHOLD = 0.70;

/**
 * Normalizes review text for consistent comparison and hashing
 * @param {string} text
 * @returns {string}
 */
export function normalizeReview(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // replace punctuation and special chars with space
    .replace(/\s+/g, ' ')     // collapse multiple spaces
    .trim();
}

/**
 * Generates SHA-256 hash of normalized review text
 * @param {string} normalizedText
 * @returns {string}
 */
export function hashReview(normalizedText) {
  return crypto.createHash('sha256').update(normalizedText).digest('hex');
}

/**
 * Calculate token and bigram similarity between two review texts (0.0 to 1.0)
 * @param {string} textA
 * @param {string} textB
 * @returns {number}
 */
export function calculateSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  const normA = normalizeReview(textA);
  const normB = normalizeReview(textB);

  if (normA === normB) return 1.0;

  const wordsA = normA.split(' ').filter(Boolean);
  const wordsB = normB.split(' ').filter(Boolean);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  // 1. Bigram Jaccard Similarity (structure & phrase matching)
  const getBigrams = words => {
    const bigrams = new Set();
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.add(`${words[i]} ${words[i + 1]}`);
    }
    return bigrams;
  };

  const bigramsA = getBigrams(wordsA);
  const bigramsB = getBigrams(wordsB);

  let intersection = 0;
  for (const b of bigramsA) {
    if (bigramsB.has(b)) intersection++;
  }

  const union = new Set([...bigramsA, ...bigramsB]).size;
  const bigramScore = union > 0 ? intersection / union : 0;

  // 2. Word Token Jaccard Similarity (vocabulary overlap)
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let wordIntersection = 0;
  for (const w of setA) {
    if (setB.has(w)) wordIntersection++;
  }
  const wordUnion = new Set([...setA, ...setB]).size;
  const wordScore = wordUnion > 0 ? wordIntersection / wordUnion : 0;

  // Weighted composite score (70% structural bigrams + 30% lexical vocabulary)
  return 0.70 * bigramScore + 0.30 * wordScore;
}

/**
 * Checks candidate review against historical database for exact duplicates and near-duplicates
 * @param {string} candidateText - The raw candidate review draft
 * @param {string} courseName - The course name
 * @param {number|null} customThreshold - Optional custom threshold override
 * @param {Array|null} preloadedHistory - Optional preloaded course history for batch performance
 * @returns {{ isUnique: boolean, normalized: string, hash: string, reason?: string, score?: number, matchedText?: string }}
 */
export function checkReviewUniqueness(candidateText, courseName, customThreshold = null, preloadedHistory = null) {
  const threshold = customThreshold || (process.env.REVIEW_SIMILARITY_THRESHOLD ? parseFloat(process.env.REVIEW_SIMILARITY_THRESHOLD) : DEFAULT_SIMILARITY_THRESHOLD);

  const normalized = normalizeReview(candidateText);
  if (!normalized || normalized.split(' ').length < 15) {
    return {
      isUnique: false,
      normalized,
      hash: '',
      reason: 'text_too_short',
    };
  }

  const hash = hashReview(normalized);

  // 1. Exact Global Hash Check
  if (isHashInHistory(hash)) {
    return {
      isUnique: false,
      normalized,
      hash,
      reason: 'exact_hash_match',
    };
  }

  // 2. Exact Global Normalized Text Check
  if (isNormalizedInHistory(normalized)) {
    return {
      isUnique: false,
      normalized,
      hash,
      reason: 'exact_normalized_match',
    };
  }

  // 3. Course-Specific Near-Duplicate Check
  const courseHistory = preloadedHistory || getHistoryForCourse(courseName);
  for (const item of courseHistory) {
    const similarity = calculateSimilarity(candidateText, item.review_text);
    if (similarity >= threshold) {
      return {
        isUnique: false,
        normalized,
        hash,
        reason: 'near_duplicate_course',
        score: similarity,
        matchedText: item.review_text,
      };
    }
  }

  // 4. Cross-Course Exact and High-Similarity Check
  const recentGlobal = getRecentHistory(25);
  for (const item of recentGlobal) {
    if (item.course !== courseName) {
      const crossSimilarity = calculateSimilarity(candidateText, item.review_text);
      if (crossSimilarity >= 0.85) {
        return {
          isUnique: false,
          normalized,
          hash,
          reason: 'cross_course_duplicate',
          score: crossSimilarity,
          matchedText: item.review_text,
        };
      }
    }
  }

  return {
    isUnique: true,
    normalized,
    hash,
  };
}
