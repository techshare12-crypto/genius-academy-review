import { ICONS } from '../utils/icons.js';

export function render(state) {
  return `
    <section class="screen screen--error active" id="screen-error" role="main" aria-label="Error state">
      
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

      <div class="error-icon" aria-hidden="true">⚠️</div>
      <h1 class="error-title">Unable to Create Review</h1>
      <p class="error-message">${state.errorMessage || 'Something went wrong while creating your review draft. Please try again.'}</p>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-retry" type="button">
          ${ICONS.refresh}
          <span>Try Again</span>
        </button>
        <button class="btn btn--secondary" id="btn-error-back" type="button">
          ${ICONS.arrowLeft}
          <span>Choose Another Course</span>
        </button>
      </div>
    </section>
  `;
}

export function mount(navigate, state) {
  const retryBtn = document.getElementById('btn-retry');
  const backBtn = document.getElementById('btn-error-back');

  retryBtn.addEventListener('click', () => {
    if (state.errorRetryAction) {
      state.errorRetryAction();
    } else {
      navigate('generating');
    }
  });

  backBtn.addEventListener('click', () => navigate('courses'));
}
