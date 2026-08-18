import { ICONS } from '../utils/icons.js';

export function render(state) {
  return `
    <section class="screen screen--completion active" id="screen-completion" role="main" aria-label="Thank you for your feedback">
      
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

      <div class="generating-container" style="text-align: center; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #10b981;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 class="screen__title" style="margin-bottom: 12px;">Thank You!</h1>
        <p class="screen__subtitle" style="font-size: 1.05rem; line-height: 1.6; color: var(--ga-slate-700); margin-bottom: 32px;">
          Your review and feedback have been received. Thank you for taking the time to share your learning experience with Genius Academy, Kalaburagi.
        </p>

        <div style="background: white; border: 1px solid var(--ga-slate-200); border-radius: 12px; padding: 20px; margin-bottom: 28px; text-align: left; box-shadow: var(--ga-shadow-sm);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--ga-slate-900); margin-bottom: 6px;">
            ${ICONS.award}
            <span>Genius Academy Kalaburagi</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--ga-slate-600); margin: 0;">
            Course: <strong>${state.selectedCourse || 'Technical Training'}</strong>
          </p>
        </div>

        <button class="btn btn--secondary" id="btn-finish-home" type="button" style="width: 100%;">
          <span>Return to Home</span>
          ${ICONS.arrowRight}
        </button>
      </div>
    </section>
  `;
}

export function mount(navigate, state) {
  const homeBtn = document.getElementById('btn-finish-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      state.selectedCourse = null;
      state.generatedReview = null;
      state.reviewVariation = 0;
      state.sessionId = crypto.randomUUID();
      navigate('welcome');
    });
  }
}
