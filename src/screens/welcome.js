import { trackEvent, EVENTS } from '../services/analytics.js';
import { ICONS } from '../utils/icons.js';

export function render() {
  return `
    <section class="screen screen--welcome active" id="screen-welcome" role="main" aria-label="Welcome to Genius Academy Review Assistant">
      <div class="welcome-hero-card">
        
        <!-- Official Brand Showcase -->
        <div class="brand-showcase">
          <img src="/logo.png" alt="Genius Academy Official Logo" class="brand-showcase__logo" />
          <h1 class="brand-showcase__title">GENIUS ACADEMY</h1>
          <p class="brand-showcase__subtitle">Technical &amp; Computer Training Institute</p>
          <div class="brand-showcase__badge">
            <span>📍 Kalaburagi (Gulbarga), Karnataka</span>
          </div>
        </div>

        <!-- Progress Tracker: Step 1 Active -->
        <div class="progress-tracker" aria-label="Progress steps">
          <div class="progress-step active" aria-current="step">
            <span class="progress-step__number">01</span>
            <div class="progress-step__indicator">
              <span class="progress-step__dot"></span>
              <span class="progress-step__bar"></span>
            </div>
            <span class="progress-step__label">Welcome</span>
          </div>
          <div class="progress-step">
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

        <!-- Main Action Content -->
        <div class="welcome-content">
          <h2 class="welcome-heading">Share Your Experience</h2>
          <p class="welcome-description">
            Select your course and we'll help you create a natural review based on your learning experience.
          </p>

          <div class="welcome-trust-note" role="note">
            ⭐ Your review will be shown to you for editing before you post it on Google.
          </div>

          <button class="btn btn--primary" id="btn-continue" type="button">
            <span>Continue to Course Selection</span>
            ${ICONS.arrowRight}
          </button>
        </div>

      </div>
    </section>
  `;
}

export function mount(navigate) {
  trackEvent(EVENTS.PAGE_OPENED);
  const btn = document.getElementById('btn-continue');
  btn.addEventListener('click', () => navigate('courses'));
}
