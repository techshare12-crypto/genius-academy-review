/**
 * Comprehensive Backend API Test Suite for Genius Academy Review Assistant (Phase 2)
 * Validates Global Uniqueness, Persistent Database, 1–5 Star Rating & Private Feedback, and Cross-Session Isolation.
 */

import { calculateSimilarity } from './uniqueness.js';
import { sqliteDb } from './db.js';

const API_BASE = 'http://localhost:3001';

const COURSES = [
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log(' RUNNING GENIUS ACADEMY PHASE 2 FULL TEST SUITE');
  console.log(` Target: ${API_BASE}`);
  console.log('==================================================\n');

  // Test Suite 1: Health Check & DB Status
  console.log('[Test Suite 1: Health Check & Database Status]');
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/health returns 200 OK');
    assert(data.status === 'ok', 'Health status is "ok"');
    assert(data.database === 'supabase' || data.database === 'sqlite-persistent', `Database engine is active (${data.database})`);
    assert(typeof data.totalStoredReviews === 'number', `Total stored reviews reported (${data.totalStoredReviews})`);
    assert(data.supportedCoursesCount === 15, 'Supported courses count is 15');
  } catch (err) {
    assert(false, `Health check failed to connect: ${err.message}`);
  }

  // Test Suite 2: Validation
  console.log('\n[Test Suite 2: Validation — Missing & Invalid Courses]');
  try {
    const resEmpty = await fetch(`${API_BASE}/api/generate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const dataEmpty = await resEmpty.json();
    assert(resEmpty.status === 400, 'Empty body returns HTTP 400');
    assert(dataEmpty.error === 'Please select a course.', 'Error message matches "Please select a course."');

    const resInvalid = await fetch(`${API_BASE}/api/generate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: 'InvalidCourseXYZ' }),
    });
    const dataInvalid = await resInvalid.json();
    assert(resInvalid.status === 400, 'Invalid course returns HTTP 400');
    assert(dataInvalid.error === 'Invalid course selection.', 'Error message matches "Invalid course selection."');
  } catch (err) {
    assert(false, `Validation tests failed: ${err.message}`);
  }

  // Test Suite 3: All 15 Valid Courses
  console.log('\n[Test Suite 3: Testing All 15 Customer-Facing Courses]');
  for (const course of COURSES) {
    try {
      const res = await fetch(`${API_BASE}/api/generate-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, variation: 0, sessionId: 'test-sess-1' }),
      });
      const data = await res.json();

      assert(res.status === 200, `HTTP 200 for "${course}"`);
      assert(typeof data.review === 'string' && data.review.length > 50, `Valid review text generated (${data.review?.length || 0} chars)`);
      assert(data.course === course, `Returned course matches "${course}"`);
      assert(typeof data.requestId === 'string' && data.requestId.length > 10, `Unique requestId returned (${data.requestId})`);

      const words = data.review.trim().split(/\s+/).filter(Boolean).length;
      assert(words >= 50 && words <= 80, `Word count strictly within 50–80 range (${words} words)`);
    } catch (err) {
      assert(false, `Failed request for course "${course}": ${err.message}`);
    }
  }

  // Test Suite 4: 5 Consecutive MS Office Reviews Across Distinct Students (Cross-Session Uniqueness)
  console.log('\n[Test Suite 4: Cross-Student Uniqueness (5 Consecutive MS Office Generations)]');
  const msOfficeReviews = [];
  for (let student = 1; student <= 5; student++) {
    try {
      const res = await fetch(`${API_BASE}/api/generate-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: 'MS Office', variation: 0, sessionId: `student-session-${student}` }),
      });
      const data = await res.json();
      assert(res.status === 200, `Student ${student} (MS Office) generation returned HTTP 200`);
      msOfficeReviews.push(data.review);
      console.log(`    Student ${student} Draft: "${data.review.substring(0, 75)}..."`);
    } catch (err) {
      assert(false, `Student ${student} generation failed: ${err.message}`);
    }
  }

  // Verify all 5 MS Office reviews are distinct and pairwise similarity < 0.70
  let allDistinct = true;
  for (let i = 0; i < msOfficeReviews.length; i++) {
    for (let j = i + 1; j < msOfficeReviews.length; j++) {
      if (msOfficeReviews[i] === msOfficeReviews[j]) {
        allDistinct = false;
      }
      const sim = calculateSimilarity(msOfficeReviews[i], msOfficeReviews[j]);
      assert(sim < 0.70, `Similarity between Student ${i + 1} and Student ${j + 1} is ${sim.toFixed(2)} (< 0.70 threshold)`);
    }
  }
  assert(allDistinct, 'All 5 MS Office reviews are strictly distinct strings');
  assert(new Set(msOfficeReviews).size === 5, 'Unique set size is exactly 5');

  // Test Suite 5: Cross-Course Duplicate Prevention
  console.log('\n[Test Suite 5: Cross-Course Duplicate Prevention]');
  const crossCourses = ['MS Office', 'Python', 'Tally with GST', 'AutoCAD', 'Lumion'];
  const crossReviews = [];
  for (const c of crossCourses) {
    const res = await fetch(`${API_BASE}/api/generate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: c, variation: 0, sessionId: 'cross-sess' }),
    });
    const data = await res.json();
    crossReviews.push({ course: c, text: data.review });
  }

  for (let i = 0; i < crossReviews.length; i++) {
    for (let j = i + 1; j < crossReviews.length; j++) {
      const isExactMatch = crossReviews[i].text.trim() === crossReviews[j].text.trim();
      assert(!isExactMatch, `"${crossReviews[i].course}" draft is NOT identical to "${crossReviews[j].course}" draft`);
    }
  }

  // Test Suite 6: In-Session Regeneration Uniqueness (v0 -> v1 -> v2 -> v3 -> v4)
  console.log('\n[Test Suite 6: In-Session Regeneration Uniqueness (5 Variations)]');
  const regenReviews = [];
  for (let v = 0; v <= 4; v++) {
    const res = await fetch(`${API_BASE}/api/generate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: 'Python', variation: v, sessionId: 'regen-session' }),
    });
    const data = await res.json();
    regenReviews.push(data.review);
    console.log(`    Regeneration v${v}: "${data.review.substring(0, 75)}..."`);
  }

  assert(new Set(regenReviews).size === 5, 'All 5 regenerated reviews (v0, v1, v2, v3, v4) are distinct');

  // Test Suite 7: Private Feedback API (1–5 Stars and Validation)
  console.log('\n[Test Suite 7: Private Feedback API (1–5 Stars & Validation)]');
  const feedbackTests = [
    { rating: 1, course: 'Tally with GST', feedback: 'Need more practice time on GST vouchers.' },
    { rating: 2, course: 'MS Office', feedback: 'Excel formulas were a bit fast.' },
    { rating: 3, course: 'Python', feedback: 'Good concepts, could use more project examples.' },
    { rating: 4, course: 'AutoCAD', feedback: 'Very clear 2D drawing instructions.' },
    { rating: 5, course: 'Lumion', feedback: 'Excellent 3D rendering practice.' },
  ];

  for (const ft of feedbackTests) {
    try {
      const res = await fetch(`${API_BASE}/api/private-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ft.rating,
          course: ft.course,
          feedback: ft.feedback,
          sessionId: 'feedback-sess-test',
        }),
      });
      const data = await res.json();
      assert(res.status === 200, `POST /api/private-feedback for ${ft.rating} ⭐ returns HTTP 200`);
      assert(data.success === true, `Feedback for ${ft.rating} ⭐ successfully recorded (ID: ${data.id?.substring(0, 8)}...)`);
    } catch (err) {
      assert(false, `Private feedback failed for ${ft.rating} ⭐: ${err.message}`);
    }
  }

  // Test invalid rating
  try {
    const resInvalidRating = await fetch(`${API_BASE}/api/private-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 6, course: 'Python', feedback: 'Invalid' }),
    });
    assert(resInvalidRating.status === 400, 'Rating 6 returns HTTP 400');

    const resZeroRating = await fetch(`${API_BASE}/api/private-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 0, course: 'Python', feedback: 'Invalid' }),
    });
    assert(resZeroRating.status === 400, 'Rating 0 returns HTTP 400');
  } catch (err) {
    assert(false, `Rating validation failed: ${err.message}`);
  }

  // Test Suite 8: Database Integrity & Constraints Verification
  console.log('\n[Test Suite 8: Database Integrity & Constraints Verification]');
  const stmtReviews = sqliteDb.prepare('SELECT id, course, review_hash, created_at FROM review_generation_history ORDER BY created_at DESC LIMIT 5');
  const recentReviews = stmtReviews.all();
  assert(recentReviews.length > 0, 'Database contains saved review records');
  for (const row of recentReviews) {
    assert(typeof row.review_hash === 'string' && row.review_hash.length === 64, `Review record has SHA-256 hash (${row.review_hash.substring(0, 12)}...)`);
  }

  const stmtFeedback = sqliteDb.prepare('SELECT id, rating, course, feedback, created_at FROM private_feedback ORDER BY created_at DESC LIMIT 5');
  const recentFeedback = stmtFeedback.all();
  assert(recentFeedback.length >= 5, `Database contains at least 5 feedback records (Got ${recentFeedback.length})`);
  for (const fb of recentFeedback) {
    assert(fb.rating >= 1 && fb.rating <= 5, `Feedback rating ${fb.rating} is between 1 and 5`);
  }

  console.log('\n==================================================');
  console.log(` TEST RESULTS SUMMARY`);
  console.log(` Total Passed: ${passed}`);
  console.log(` Total Failed: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
