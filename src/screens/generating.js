import { generateReview } from '../services/reviewApi.js';
import { trackEvent, EVENTS } from '../services/analytics.js';

export function render(state) {
  return `
    <section class="screen screen--generating active" id="screen-generating" role="main" aria-label="Creating your review draft" aria-live="polite">
      
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

      <div class="generating-container">
        <!-- Logo with subtle breathing ring -->
        <div class="generating-logo-wrap">
          <div class="generating-pulse-ring"></div>
          <div class="generating-pulse-ring"></div>
          <img src="/logo.png" alt="Genius Academy Logo" class="generating-logo" />
        </div>

        <h1 class="screen__title">Creating your review...</h1>
        <p class="screen__subtitle">
          Preparing a personalized draft for <strong>${state.selectedCourse || 'your course'}</strong>.
        </p>

        <div class="generating-progress-bar" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

export function mount(navigate, state) {
  trackEvent(EVENTS.GENERATION_STARTED, { course: state.selectedCourse });

  const variation = state.reviewVariation || 0;
  const sessionId = state.sessionId || null;

  generateReview(state.selectedCourse, variation, sessionId)
    .then(result => {
      const reviewText = typeof result === 'object' && result.review ? result.review : result;
      const requestId = typeof result === 'object' && result.requestId ? result.requestId : null;
      state.generatedReview = reviewText;
      state.requestId = requestId;
      trackEvent(EVENTS.REVIEW_GENERATED, { course: state.selectedCourse, requestId });
      navigate('review');
    })
    .catch(error => {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        state.errorMessage = 'Please check your internet connection and try again.';
      } else if (error.message === 'EMPTY_RESPONSE') {
        state.errorMessage = 'We received an empty response. Please try again.';
      } else if (error.message === 'INVALID_COURSE') {
        state.errorMessage = 'Please select a valid course and try again.';
      } else {
        state.errorMessage = 'Something went wrong while creating your review. Please try again.';
      }
      state.errorRetryAction = () => navigate('generating');
      navigate('error');
    });
}
