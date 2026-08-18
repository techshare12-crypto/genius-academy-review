import { getCourseContext, VARIATION_ANGLES } from './courseConfig.js';
import { getHistoryForCourse, saveReviewToHistory } from './db.js';
import { checkReviewUniqueness, normalizeReview, hashReview } from './uniqueness.js';
import { generateUniqueFallback, isWordCountValid } from './fallbackGenerator.js';

const DEFAULT_MODEL = 'gemini-3.6-flash';
const TIMEOUT_MS = 4000; // 4 seconds fast timeout
const MAX_AI_ATTEMPTS = 5;

/**
 * List of prohibited patterns: marketing hype, false claims, or brochure/course-description phrasing
 */
const PROHIBITED_PATTERNS = [
  /guaranteed\s+(?:placement|job|career)/i,
  /100%\s+placement/i,
  /highest\s+salary/i,
  /state-of-the-art/i,
  /cutting-edge/i,
  /world-class/i,
  /holistic\s+learning/i,
  /career\s+transformation/i,
  /seamless\s+learning/i,
  /^(?:The\s+(?:course|module|program|curriculum|syllabus)\s+(?:covers|focuses|includes|provides|teaches|emphasizes|details))/i,
  /^(?:This\s+(?:course|module|program|training)\s+(?:covers|teaches|provides|focuses|includes))/i,
  /^(?:Students\s+learning|Learners\s+attending|Students\s+taking\s+up)/i,
];

/**
 * Validates candidate review text against formatting, word count (strictly 50–80 words), and prohibited brochure/claim patterns
 * @param {string} text
 * @returns {boolean}
 */
function isValidDraftText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 100 || trimmed.length > 800) return false;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  // Strictly enforce 50 to 80 words
  if (wordCount < 50 || wordCount > 80) {
    console.warn(`[Review Validator] Rejected candidate with ${wordCount} words (Requirement: 50–80 words).`);
    return false;
  }

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Review Sanitizer] Rejected output due to prohibited pattern match:', pattern);
      return false;
    }
  }

  return true;
}

/**
 * Generates a globally unique review draft in natural student satisfaction / experience style
 * Strictly between 50 and 80 words (target: 60–70 words).
 * @param {string} courseName
 * @param {number} clientVariation
 * @param {string} requestId
 * @param {string|null} sessionId
 * @returns {Promise<{ review: string, source: 'gemini' | 'fallback', requestId: string }>}
 */
export async function generateUniqueReview(courseName, clientVariation = 0, requestId, sessionId = null) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const rawModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const model = rawModel.replace(/^models\//, '').trim();

  const safeVariation = Number.isInteger(clientVariation) && clientVariation >= 0 ? clientVariation : 0;
  const courseInfo = getCourseContext(courseName);
  const topicsList = courseInfo ? courseInfo.topics.join(', ') : 'practical computer skills and software workflows';

  // Retrieve up to 4 recent reviews for this course from DB to provide as negative examples
  const recentHistory = getHistoryForCourse(courseName).slice(0, 4);
  const recentExamples = recentHistory.map((item, idx) => `${idx + 1}. "${item.review_text.substring(0, 160)}..."`).join('\n');

  const systemPrompt = `You are writing an editable Google review DRAFT for a student at Genius Academy in Kalaburagi (Gulbarga), Karnataka, India.

Do NOT write a course description.
Do NOT write marketing copy or brochure text.
Write in the style of a short, natural student experience / satisfaction review.

CRITICAL RULES:
- The student has selected the course but has not yet provided personal feedback.
- Use only the supplied verified course information as subtle supporting context.
- Do not fabricate specific personal facts (placements, jobs, salaries, certificates, or faculty praise).
- Use first-person language only as an editable draft (e.g. "I found...", "Learning this course helped me understand...", "The training gave me confidence in...").
- The final draft must be strictly between 50 and 80 words (aim for approximately 60–70 words).
- The draft should sound natural when read aloud by a student.
- Avoid syllabus-style lists.
- Avoid corporate language (no "state-of-the-art", "world-class", "cutting-edge", "seamless", "career transformation").
- Do NOT begin with 'The course covers', 'The course focuses on', 'The module includes', 'This course teaches', 'Students learning...', or similar brochure-style wording.
- Return ONLY valid JSON: {"review": "..."}.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey ? apiKey.trim() : '')}`;

  // If Gemini API is configured, attempt up to MAX_AI_ATTEMPTS
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    for (let attempt = 1; attempt <= MAX_AI_ATTEMPTS; attempt++) {
      const angleIndex = (safeVariation + attempt - 1) % VARIATION_ANGLES.length;
      const angleFocus = VARIATION_ANGLES[angleIndex].focus;

      let userPrompt = `Course: "${courseName}"
Key Practical Focus Areas: ${topicsList}
Institute: Genius Academy, Kalaburagi, Karnataka
Requested Variation Number: ${safeVariation} (Generation Attempt ${attempt})
Specific Review Angle: ${angleFocus}

INSTRUCTIONS FOR STUDENT EXPERIENCE STYLE:
- Write a short, natural student experience review draft strictly between 50 and 80 words (aim for 60-70 words).
- Emphasize how the training was helpful, clear, or practical from a student's point of view.
- Focus specifically on this angle: ${angleFocus}.
- Sound like a real student reviewing their experience on Google, not a school describing its syllabus.`;

      if (recentExamples) {
        userPrompt += `\n\nDO NOT COPY OR CLOSELY PARAPHRASE ANY OF THESE RECENTLY GENERATED DRAFTS:\n${recentExamples}`;
      }

      userPrompt += `\n\nReturn JSON: {"review": "..."}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 300,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!response.ok) {
          console.warn(`[Gemini API] HTTP ${response.status} (${response.statusText}). Breaking to fallback.`);
          break;
        }

        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawContent) continue;

        let parsed;
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          const match = rawContent.match(/\{[\s\S]*\}/);
          if (match) {
            try { parsed = JSON.parse(match[0]); } catch {}
          }
        }

        const candidateReview = (parsed && parsed.review ? parsed.review : rawContent).trim();

        // 1. Text format, 50–80 word count filter, and non-brochure check
        if (!isValidDraftText(candidateReview)) {
          continue;
        }

        // 2. Database Uniqueness and Similarity Verification
        const uniquenessCheck = checkReviewUniqueness(candidateReview, courseName);
        if (!uniquenessCheck.isUnique) {
          console.warn(`[Gemini Attempt ${attempt}] Candidate rejected due to ${uniquenessCheck.reason} (score: ${uniquenessCheck.score?.toFixed(2) || 'N/A'}). Retrying...`);
          continue;
        }

        // 3. Atomically persist to database BEFORE returning
        const saved = await saveReviewToHistory({
          id: requestId,
          course: courseName,
          reviewText: candidateReview,
          reviewNormalized: uniquenessCheck.normalized,
          reviewHash: uniquenessCheck.hash,
          variation: safeVariation,
          provider: 'gemini',
          status: 'generated',
          sessionId,
        });

        if (saved) {
          return {
            review: candidateReview,
            source: 'gemini',
            requestId,
          };
        } else {
          console.warn(`[Gemini Attempt ${attempt}] Hash collision during save. Retrying...`);
          continue;
        }
      } catch (error) {
        console.warn(`[Gemini Attempt ${attempt} Error]:`, error.message);
        break; // Fail fast to local fallback on network/timeout errors
      }
    }
  }

  // Fallback Generation Pipeline with natural student experience style, 50–80 words, and DB uniqueness
  const fallbackText = generateUniqueFallback(courseName, safeVariation);
  const normalizedFallback = normalizeReview(fallbackText);
  const hashFallback = hashReview(normalizedFallback);

  await saveReviewToHistory({
    id: requestId,
    course: courseName,
    reviewText: fallbackText,
    reviewNormalized: normalizedFallback,
    reviewHash: hashFallback,
    variation: safeVariation,
    provider: 'fallback',
    status: 'generated',
    sessionId,
  });

  return {
    review: fallbackText,
    source: 'fallback',
    requestId,
  };
}
