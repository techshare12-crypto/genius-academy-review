import { getCourseContext, getFallbackReview } from './courseConfig.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 12000; // 12 seconds request timeout

/**
 * List of prohibited phrases that represent fabricated personal experiences or promotional hype
 */
const PROHIBITED_PATTERNS = [
  /guaranteed\s+(?:placement|job|career)/i,
  /100%\s+placement/i,
  /best\s+decision\s+of\s+my\s+life/i,
  /life-changing/i,
  /highest\s+salary/i,
];

/**
 * Validates and sanitizes the generated review text
 * @param {string} text
 * @returns {boolean}
 */
function isValidDraftText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 50 || trimmed.length > 800) return false;

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 30 || wordCount > 130) return false;

  // Check against prohibited exaggerated claims
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Review Sanitizer] Rejected output due to prohibited pattern match:', pattern);
      return false;
    }
  }

  return true;
}

/**
 * Calls OpenAI to generate a neutral, editable review draft for a course
 * @param {string} courseName
 * @returns {Promise<{ review: string, source: 'openai' | 'fallback' }>}
 */
export async function generateReviewDraft(courseName) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  // If no API key is configured in the environment, use the safe verified fallback immediately
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    return {
      review: getFallbackReview(courseName),
      source: 'fallback',
    };
  }

  const courseInfo = getCourseContext(courseName);
  if (!courseInfo) {
    return {
      review: getFallbackReview(courseName),
      source: 'fallback',
    };
  }

  const topicsList = courseInfo.topics.join(', ');

  const systemPrompt = `You are a neutral writing assistant creating an editable Google review draft for a student at Genius Academy, a technical and computer training institute in Kalaburagi (Gulbarga), Karnataka, India.

CRITICAL POLICY:
- The student has selected a course name but has NOT provided any personal feedback yet.
- Generate a short, neutral, factual review draft based ONLY on verified course topics and the institute.
- Do NOT claim personal experiences, personal enrollment stories, opinions, faculty quality, staff interactions, lab equipment used, placements, jobs, certifications, salaries, or satisfaction levels (no "I loved", "best decision", "amazing teacher", "guaranteed job").
- The text must be a natural, human, neutral draft suitable for a Google review that the student will edit before posting.
- Target word count: 50 to 80 words.
- Return ONLY a valid JSON object in this exact schema: {"review": "..."}. Do not include markdown code fences or explanatory text.`;

  const userPrompt = `Course Name: "${courseName}"
Verified Course Topics: ${topicsList}
Institute: Genius Academy, Kalaburagi, Karnataka

Generate a neutral 50-80 word editable draft about this course at Genius Academy.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model.trim(),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 220,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[OpenAI API] Request returned HTTP ${response.status}. Falling back to pre-verified draft.`);
      return {
        review: getFallbackReview(courseName),
        source: 'fallback',
      };
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return {
        review: getFallbackReview(courseName),
        source: 'fallback',
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.warn('[OpenAI JSON Parse] Failed to parse model response as JSON. Falling back.');
      return {
        review: getFallbackReview(courseName),
        source: 'fallback',
      };
    }

    const reviewText = parsed.review?.trim();
    if (isValidDraftText(reviewText)) {
      return {
        review: reviewText,
        source: 'openai',
      };
    } else {
      console.warn('[Review Validation] Model output failed length or content validation. Using fallback draft.');
      return {
        review: getFallbackReview(courseName),
        source: 'fallback',
      };
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.warn('[OpenAI API] Request timed out. Using fallback draft.');
    } else {
      console.warn('[OpenAI API] Network or service error. Using fallback draft.');
    }
    return {
      review: getFallbackReview(courseName),
      source: 'fallback',
    };
  }
}
