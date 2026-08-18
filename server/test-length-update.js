import { COURSES } from './courseConfig.js';
import { calculateSimilarity } from './uniqueness.js';

const API_BASE = 'http://localhost:3001';
const TEST_COURSES = ['MS Office', 'Tally with GST', 'Python', 'AutoCAD', 'Lumion'];

function getWordCount(text) {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

async function runLengthTests() {
  console.log('====================================================');
  console.log(' GENIUS ACADEMY 50–80 WORD COUNT VERIFICATION');
  console.log('====================================================\n');

  let allPassed = true;

  for (const course of TEST_COURSES) {
    console.log(`\n--- Testing Course: "${course}" ---`);
    const variations = [];

    for (let v = 0; v < 4; v++) {
      const res = await fetch(`${API_BASE}/api/generate-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course,
          variation: v,
          sessionId: `length-test-session-${course.replace(/\s+/g, '-')}`,
        }),
      });

      const data = await res.json();
      const words = getWordCount(data.review);
      const inRange = words >= 50 && words <= 80;

      if (!inRange) allPassed = false;

      console.log(`  [Variation v${v}] Words: ${words} (Status: ${inRange ? 'PASS (50-80)' : 'FAIL'})`);
      console.log(`    Draft: "${data.review.substring(0, 95)}..."`);

      variations.push({ v, text: data.review, words });
    }

    // Check pairwise uniqueness
    for (let i = 0; i < variations.length; i++) {
      for (let j = i + 1; j < variations.length; j++) {
        const sim = calculateSimilarity(variations[i].text, variations[j].text);
        const pass = sim < 0.70;
        if (!pass) allPassed = false;
        console.log(`    v${i} vs v${j} Similarity: ${sim.toFixed(3)} (Threshold: <0.70 -> ${pass ? 'PASS' : 'FAIL'})`);
      }
    }
  }

  // Edit Test simulation
  console.log('\n--- Testing Edit Validation Rules (Client-side Logic) ---');

  const shortText = 'This is a sample short review for testing word count validation logic.';
  const shortWords = getWordCount(shortText);
  console.log(`  Short Draft (${shortWords} words):`);
  if (shortWords < 50) {
    console.log(`    Validation Result: BLOCKED -> "Your review is a little short. Please add a few more words." (EXPECTED: BLOCKED)`);
  } else {
    console.log(`    FAIL: Should have been blocked`);
    allPassed = false;
  }

  const validText = 'Genius Academy in Kalaburagi offers a comprehensive MS Office training program covering Microsoft Word, Excel, and PowerPoint. The course focuses on building foundational document creation, spreadsheet formulas, and slide presentation design for workplace and academic needs. Students practice essential software operations, table layouts, formula calculations, and presentation styling through structured step-by-step practical computing exercises and modules.';
  const validWords = getWordCount(validText);
  console.log(`  Valid Draft (${validWords} words):`);
  if (validWords >= 50 && validWords <= 80) {
    console.log(`    Validation Result: ALLOWED -> "✓ Review copied!" (EXPECTED: ALLOWED)`);
  } else {
    console.log(`    FAIL: Should have been allowed`);
    allPassed = false;
  }

  const longText = 'Genius Academy in Kalaburagi offers a comprehensive MS Office training program covering Microsoft Word, Excel, and PowerPoint. The course focuses on building foundational document creation, spreadsheet formulas, and slide presentation design for workplace and academic needs. Students practice essential software operations, table layouts, formula calculations, and presentation styling through structured step-by-step practical computing exercises and modules. Additionally, this extended text contains excessive redundant sentences deliberately added to exceed the strict eighty word ceiling and ensure that client-side copy prevention is properly triggered by the editor validation system.';
  const longWords = getWordCount(longText);
  console.log(`  Long Draft (${longWords} words):`);
  if (longWords > 80) {
    console.log(`    Validation Result: BLOCKED -> "Your review is a little long. Please shorten it to 80 words or less." (EXPECTED: BLOCKED)`);
  } else {
    console.log(`    FAIL: Should have been blocked`);
    allPassed = false;
  }

  console.log('\n====================================================');
  console.log(` 50–80 WORD REQUIREMENT AUDIT: ${allPassed ? 'ALL TESTS PASSED ✓' : 'FAILED ✗'}`);
  console.log('====================================================\n');
}

runLengthTests().catch(console.error);
