/**
 * Review API service
 * Connects to the backend POST /api/generate-review and POST /api/private-feedback endpoints.
 */

const USE_MOCK_API = false;

/**
 * 15 Supported Courses matching authoritative backend configuration
 */
export const VALID_COURSES = [
  'MS Office',
  'Tally with GST',
  'Internet Concept',
  'English & Kannada Typing',
  'Hardware & Software',
  'Computer Fundamentals',
  'D.T.P. (Desktop Publishing)',
  'C Programming',
  'C++ Programming',
  'Python',
  'Java',
  'AutoCAD',
  '3ds Max',
  'Lumion',
  'Other Course',
];

/**
 * Multi-variation client fallbacks for offline resilience
 */
const CLIENT_FALLBACKS = {
  'MS Office': [
    'Genius Academy in Kalaburagi offers a comprehensive MS Office training program covering Microsoft Word, Excel, and PowerPoint. The course focuses on building foundational document creation, spreadsheet formulas, and slide presentation design for workplace and academic needs.',
    'The MS Office training at Genius Academy emphasizes practical applications across Word, Excel, and PowerPoint. Topics include document formatting, data tables, basic workbook calculations, and presentation workflows for everyday office tasks.',
    'Training in MS Office at Genius Academy covers essential desktop productivity tools including Microsoft Word for text processing, Excel for spreadsheet management, and PowerPoint for structured slide decks.',
  ],
  'Tally with GST': [
    'The Tally with GST course at Genius Academy in Kalaburagi covers computerized accounting, ledger maintenance, inventory management, taxation rules, and GST compliance procedures.',
    'Genius Academy provides practical training in Tally with GST, focusing on computerized accounting software, voucher entries, GST calculation, invoicing, and financial statement generation.',
  ],
  'Python': [
    'The Python course at Genius Academy in Kalaburagi covers Python syntax, core data structures, functions, modular programming, and basic file handling.',
    'Genius Academy provides Python programming training covering foundational concepts, script development, list and dictionary manipulation, and problem-solving using Python.',
  ],
};

function getClientFallback(course, variation = 0) {
  const list = CLIENT_FALLBACKS[course] || [
    'Genius Academy is a technical and computer training institute located in Kalaburagi (Gulbarga), Karnataka, offering structured training across various computer and IT subjects.',
    'Genius Academy in Kalaburagi provides practical computer training courses designed to build technical and software skills across multiple IT domains.',
  ];
  return list[variation % list.length];
}

/**
 * Generate a review draft for the selected course with variation tracking and session ID
 * @param {string} course - The selected course name
 * @param {number} variation - The variation count for the current session (0, 1, 2...)
 * @param {string|null} sessionId - Unique session ID
 * @returns {Promise<{ review: string, requestId: string }>} The generated review text and requestId
 * @throws {Error} If course is missing or invalid
 */
export async function generateReview(course, variation = 0, sessionId = null) {
  if (!course || typeof course !== 'string' || !course.trim()) {
    throw new Error('MISSING_COURSE');
  }

  const trimmed = course.trim();
  if (!VALID_COURSES.includes(trimmed)) {
    throw new Error('INVALID_COURSE');
  }

  const safeVariation = Number.isInteger(variation) && variation >= 0 ? variation : 0;

  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      review: getClientFallback(trimmed, safeVariation),
      requestId: 'mock-' + Date.now(),
    };
  }

  try {
    const response = await fetch('/api/generate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course: trimmed,
        variation: safeVariation,
        sessionId,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'INVALID_COURSE');
      }
      throw new Error('SERVER_ERROR');
    }

    const data = await response.json();

    if (!data.review || typeof data.review !== 'string' || data.review.trim() === '') {
      throw new Error('EMPTY_RESPONSE');
    }

    return {
      review: data.review.trim(),
      requestId: data.requestId || 'req-' + Date.now(),
    };
  } catch (error) {
    if (error.message !== 'INVALID_COURSE' && error.message !== 'MISSING_COURSE') {
      console.warn('[Review API] Backend call failed, using client-side fallback:', error.message);
      return {
        review: getClientFallback(trimmed, safeVariation),
        requestId: 'fallback-' + Date.now(),
      };
    }
    throw error;
  }
}

/**
 * Send private feedback to the backend
 * @param {number} rating - Rating 1 to 5
 * @param {string} course - Selected course name
 * @param {string} feedback - Feedback text
 * @param {string} sessionId - Session ID
 * @returns {Promise<{ success: boolean }>}
 */
export async function sendPrivateFeedback(rating, course, feedback, sessionId) {
  try {
    const response = await fetch('/api/private-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        course,
        feedback: feedback || '',
        sessionId,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to submit feedback');
    }

    return await response.json();
  } catch (error) {
    console.warn('[Private Feedback API Error]:', error.message);
    // Graceful optimistic fallback for UI responsiveness
    return { success: true, offline: true };
  }
}
