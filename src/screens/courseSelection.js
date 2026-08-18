import { trackEvent, EVENTS } from '../services/analytics.js';
import { getCourseIcon, ICONS } from '../utils/icons.js';

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

export function render(state) {
  const courseCards = COURSES.map((courseName, index) => {
    const isSelected = state && state.selectedCourse === courseName;
    return `
      <button 
        class="course-card ${isSelected ? 'selected' : ''}" 
        data-course="${courseName}" 
        data-index="${index}" 
        type="button" 
        aria-pressed="${isSelected ? 'true' : 'false'}"
      >
        <span class="course-card__check-badge" aria-hidden="true">${ICONS.check}</span>
        <span class="course-card__icon" aria-hidden="true">
          ${getCourseIcon(courseName)}
        </span>
        <span class="course-card__text">${courseName}</span>
      </button>
    `;
  }).join('');

  return `
    <section class="screen screen--courses active" id="screen-courses" role="main" aria-label="Course selection">
      
      <!-- Branded Header -->
      <header class="app-header">
        <div class="app-header__brand">
          <img src="/logo.png" alt="Genius Academy Official Logo" class="app-header__logo" />
          <div class="app-header__text">
            <span class="app-header__title">GENIUS ACADEMY</span>
            <span class="app-header__subtitle">Technical &amp; Computer Training Institute</span>
          </div>
        </div>
      </header>

      <!-- Progress Tracker: Step 2 Active -->
      <div class="progress-tracker" aria-label="Progress steps">
        <div class="progress-step completed">
          <span class="progress-step__number">01</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
            <span class="progress-step__bar"></span>
          </div>
          <span class="progress-step__label">Welcome</span>
        </div>
        <div class="progress-step active" aria-current="step">
          <span class="progress-step__number">02</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
            <span class="progress-step__bar"></span>
          </div>
          <span class="progress-step__label">Select Course</span>
        </div>
        <div class="progress-step">
          <span class="progress-step__number">03</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
          </div>
          <span class="progress-step__label">Review &amp; Post</span>
        </div>
      </div>

      <!-- Navigation & Heading -->
      <div class="screen__nav">
        <button class="back-link" id="btn-back-welcome" type="button" aria-label="Go back to welcome screen">
          ${ICONS.arrowLeft}
          <span>Back</span>
        </button>
      </div>

      <div class="screen__header">
        <h1 class="screen__title">Which course did you attend?</h1>
        <p class="screen__subtitle">Select your course to create your personalized review draft.</p>
      </div>

      <!-- Course Cards Grid -->
      <div class="screen__body">
        <div class="course-grid" role="radiogroup" aria-label="Courses available at Genius Academy">
          ${courseCards}
        </div>
      </div>

      <!-- Footer CTA -->
      <div class="screen__footer">
        <button 
          class="btn btn--primary" 
          id="btn-generate" 
          type="button" 
          ${state && state.selectedCourse ? '' : 'disabled'} 
          aria-disabled="${state && state.selectedCourse ? 'false' : 'true'}"
        >
          <span>Generate My Review</span>
          ${ICONS.arrowRight}
        </button>
      </div>
    </section>
  `;
}

export function mount(navigate, state) {
  const cards = document.querySelectorAll('.course-card');
  const generateBtn = document.getElementById('btn-generate');
  const backBtn = document.getElementById('btn-back-welcome');

  // Restore selection if navigating back
  if (state.selectedCourse) {
    cards.forEach(card => {
      if (card.dataset.course === state.selectedCourse) {
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
      }
    });
    generateBtn.disabled = false;
    generateBtn.setAttribute('aria-disabled', 'false');
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Deselect all
      cards.forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      // Select clicked
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      // Reset variation counter for newly selected course
      if (state.selectedCourse !== card.dataset.course) {
        state.reviewVariation = 0;
        state.generatedReview = null;
      }
      state.selectedCourse = card.dataset.course;

      // Enable generate button
      generateBtn.disabled = false;
      generateBtn.setAttribute('aria-disabled', 'false');

      trackEvent(EVENTS.COURSE_SELECTED, { course: state.selectedCourse });
    });
  });

  generateBtn.addEventListener('click', () => {
    if (!state.selectedCourse) return;
    navigate('generating');
  });

  backBtn.addEventListener('click', () => navigate('welcome'));
}
