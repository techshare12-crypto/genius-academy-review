import { generateReview, sendPrivateFeedback } from '../services/reviewApi.js';
import { trackEvent, EVENTS } from '../services/analytics.js';
import { ICONS } from '../utils/icons.js';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CY9ssFewm-ItEBM/review';

/**
 * Counts words accurately by splitting on whitespace
 * @param {string} text
 * @returns {number}
 */
function getWordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Returns formatted status string based on word count
 * @param {number} words
 * @returns {string}
 */
function getWordCountStatusText(words) {
  if (words === 0) {
    return '0 / 80 words — Please write or generate a review.';
  }
  if (words < 50) {
    return `${words} / 80 words — Please add a little more.`;
  }
  if (words <= 80) {
    return `${words} / 80 words ✓`;
  }
  return `${words} / 80 words — Please shorten your review.`;
}

export function render(state) {
  const initialText = state.generatedReview || '';
  const initialWords = getWordCount(initialText);
  const rating = state.userRating || null;

  return `
    <section class="screen screen--review active" id="screen-review" role="main" aria-label="Review your draft">
      
      <!-- Branded Header -->
      <header class="app-header">
        <div class="app-header__brand">
          <img src="/logo.png" alt="Genius Academy Official Logo" class="app-header__logo" />
          <div class="app-header__text">
            <span class="app-header__title">GENIUS ACADEMY</span>
            <span class="app-header__subtitle">Technical &amp; Computer Training Institute</span>
          </div>
        </div>
        <div class="app-header__badge">
          <span>${state.selectedCourse || 'Course'}</span>
        </div>
      </header>

      <!-- Progress Tracker: Step 3 Active -->
      <div class="progress-tracker" aria-label="Progress steps">
        <div class="progress-step completed">
          <span class="progress-step__number">01</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
            <span class="progress-step__bar"></span>
          </div>
          <span class="progress-step__label">Welcome</span>
        </div>
        <div class="progress-step completed">
          <span class="progress-step__number">02</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
            <span class="progress-step__bar"></span>
          </div>
          <span class="progress-step__label">Select Course</span>
        </div>
        <div class="progress-step active" aria-current="step">
          <span class="progress-step__number">03</span>
          <div class="progress-step__indicator">
            <span class="progress-step__dot"></span>
          </div>
          <span class="progress-step__label">Review &amp; Rate</span>
        </div>
      </div>

      <!-- Navigation & Title -->
      <div class="screen__nav">
        <button class="back-link" id="btn-back-courses" type="button" aria-label="Change course selection">
          ${ICONS.arrowLeft}
          <span>Change Course</span>
        </button>
      </div>

      <div class="screen__header">
        <h1 class="screen__title">Your Review Draft Is Ready</h1>
        <p class="screen__subtitle">
          Keep your review short and genuine. Edit it to accurately reflect your experience.
        </p>
      </div>

      <!-- Review Card -->
      <div class="screen__body">
        <div class="review-card">
          <div class="review-draft-notice" role="note">
            ${ICONS.sparkles}
            <span>AI-generated draft — please edit it to match your genuine experience.</span>
          </div>

          <label for="review-text" class="sr-only">Your review draft text</label>
          <textarea
            class="review-textarea"
            id="review-text"
            rows="6"
            aria-label="Your review draft — edit freely before posting"
            placeholder="Edit your review here..."
          >${initialText}</textarea>

          <div class="review-textarea-meta">
            <div class="review-word-meta" style="display: flex; flex-direction: column; gap: 2px;">
              <span class="review-word-count" id="word-count" style="font-size: 0.82rem; font-weight: 600; color: ${initialWords >= 50 && initialWords <= 80 ? 'var(--ga-cyan-700)' : 'var(--ga-slate-600)'};">
                ${getWordCountStatusText(initialWords)}
              </span>
              <span class="review-word-hint" style="font-size: 0.75rem; color: var(--ga-slate-500);">
                50–80 words recommended
              </span>
            </div>
            <button class="btn-ghost-copy" id="btn-quick-copy" type="button" title="Copy text to clipboard">
              ${ICONS.copy}
              <span id="quick-copy-text">Copy Text</span>
            </button>
          </div>
        </div>

        <p class="review-validation-error" id="review-validation-error" style="display: none; color: #dc2626; font-size: 0.85rem; margin-top: 6px; font-weight: 500;">
          Please write or generate a review before continuing.
        </p>

        <!-- Rating Section -->
        <div class="rating-section" id="rating-section">
          <div class="rating-section__title">How was your experience?</div>
          <div class="rating-section__subtitle">Tap a star to rate your course training</div>
          <div class="rating-stars" role="radiogroup" aria-label="Rate your experience 1 to 5 stars">
            <button class="star-btn ${rating && rating >= 1 ? 'active' : ''}" data-star="1" type="button" aria-label="1 star">${ICONS.star}</button>
            <button class="star-btn ${rating && rating >= 2 ? 'active' : ''}" data-star="2" type="button" aria-label="2 stars">${ICONS.star}</button>
            <button class="star-btn ${rating && rating >= 3 ? 'active' : ''}" data-star="3" type="button" aria-label="3 stars">${ICONS.star}</button>
            <button class="star-btn ${rating && rating >= 4 ? 'active' : ''}" data-star="4" type="button" aria-label="4 stars">${ICONS.star}</button>
            <button class="star-btn ${rating && rating >= 5 ? 'active' : ''}" data-star="5" type="button" aria-label="5 stars">${ICONS.star}</button>
          </div>

          <!-- Dynamic Feedback Container for 1–3 Stars -->
          <div class="feedback-container" id="private-feedback-container" style="display: ${rating && rating <= 3 ? 'block' : 'none'};">
            <div class="feedback-heading">We're sorry your experience didn't fully meet expectations.</div>
            <div class="feedback-subtext">Your private feedback helps Genius Academy improve our training quality.</div>
            <textarea
              class="feedback-textarea"
              id="private-feedback-text"
              placeholder="Tell us what we could improve..."
              rows="3"
            ></textarea>
            <div id="feedback-success-banner" class="feedback-success-msg" style="display: none;">
              ✓ Thank you for your feedback! Your comments have been saved.
            </div>
            <button class="btn btn--primary btn--compact" id="btn-send-feedback" type="button">
              <span>Send Private Feedback</span>
            </button>
            <button class="btn btn--secondary btn--compact" id="btn-finish-private" type="button" style="margin-top: 8px; display: none;">
              <span>Finish &amp; Return to Home</span>
            </button>
          </div>

          <!-- Positive Confirmation for 4–5 Stars -->
          <div class="feedback-container" id="positive-rating-container" style="display: ${rating && rating >= 4 ? 'block' : 'none'};">
            <div class="feedback-heading" style="color: var(--ga-cyan-700);">Thank you for your rating! ⭐</div>
            <div class="feedback-subtext">If you'd like to share your genuine experience publicly, you can continue to Google below.</div>
          </div>
        </div>

        <!-- Inline Status Area -->
        <div id="clipboard-status" style="display: none;" aria-live="polite"></div>

        <!-- Post Google Return Confirmation -->
        <div class="post-google-prompt" id="post-google-prompt" style="display: none;">
          <div class="post-google-prompt__title">Did you post your review on Google?</div>
          <div class="post-google-prompt__actions">
            <button class="btn btn--primary btn--compact" id="btn-confirm-posted" type="button">
              <span>I've Posted My Review ✓</span>
            </button>
            <button class="btn btn--secondary btn--compact" id="btn-back-to-edit" type="button">
              <span>Back to Edit</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer CTAs -->
      <div class="screen__footer">
        
        <!-- Google Review Option (100% Hidden on 1-3 Stars; Shown ONLY on 4-5 Stars) -->
        <div id="google-flow-wrapper" style="display: ${rating && rating >= 4 ? 'block' : 'none'}; width: 100%;">
          <div class="notice" id="google-notice" role="note" style="margin-bottom: 12px;">
            Please make sure the review reflects your genuine experience before posting.
          </div>
          <button class="btn btn--google" id="btn-google" type="button">
            <span>Copy &amp; Continue to Google</span>
            ${ICONS.star}
          </button>
        </div>

        <button class="btn btn--secondary" id="btn-regenerate" type="button" style="margin-top: 8px;">
          ${ICONS.refresh}
          <span id="regenerate-text">Regenerate Another Variation</span>
        </button>
      </div>
    </section>
  `;
}

/**
 * Robust clipboard copy with fallback
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed:', error);
    }
  }

  // Legacy fallback
  try {
    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.style.position = 'fixed';
    tmp.style.left = '-9999px';
    tmp.style.top = '0';
    document.body.appendChild(tmp);
    tmp.focus();
    tmp.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(tmp);
    if (successful) return true;
  } catch (error) {
    console.warn('Legacy clipboard fallback failed:', error);
  }

  return false;
}

export function mount(navigate, state) {
  const textarea = document.getElementById('review-text');
  const googleBtn = document.getElementById('btn-google');
  const googleFlowWrapper = document.getElementById('google-flow-wrapper');
  const regenerateBtn = document.getElementById('btn-regenerate');
  const regenerateText = document.getElementById('regenerate-text');
  const backBtn = document.getElementById('btn-back-courses');
  const validationError = document.getElementById('review-validation-error');
  const clipboardStatus = document.getElementById('clipboard-status');
  const wordCountElem = document.getElementById('word-count');
  const quickCopyBtn = document.getElementById('btn-quick-copy');
  const quickCopyText = document.getElementById('quick-copy-text');

  // Rating & Feedback Elements
  const starBtns = document.querySelectorAll('.star-btn');
  const privateFeedbackContainer = document.getElementById('private-feedback-container');
  const positiveRatingContainer = document.getElementById('positive-rating-container');
  const privateFeedbackText = document.getElementById('private-feedback-text');
  const sendFeedbackBtn = document.getElementById('btn-send-feedback');
  const finishPrivateBtn = document.getElementById('btn-finish-private');
  const feedbackSuccessBanner = document.getElementById('feedback-success-banner');
  const postGooglePrompt = document.getElementById('post-google-prompt');
  const confirmPostedBtn = document.getElementById('btn-confirm-posted');
  const backToEditBtn = document.getElementById('btn-back-to-edit');

  let isRegenerating = false;

  function updateWordCounter() {
    const words = getWordCount(textarea.value);
    wordCountElem.textContent = getWordCountStatusText(words);

    if (words >= 50 && words <= 80) {
      wordCountElem.style.color = 'var(--ga-cyan-700)';
      validationError.style.display = 'none';
    } else if (words < 50) {
      wordCountElem.style.color = 'var(--ga-slate-600)';
    } else {
      wordCountElem.style.color = '#dc2626';
    }
  }

  // Real-time word count and state sync
  textarea.addEventListener('input', () => {
    state.generatedReview = textarea.value;
    updateWordCounter();
  });

  // Quick Copy button inside textarea
  quickCopyBtn.addEventListener('click', async () => {
    const reviewText = textarea.value.trim();
    const words = getWordCount(reviewText);

    if (words < 50) {
      validationError.textContent = 'Your review is a little short. Please add a few more words.';
      validationError.style.display = 'block';
      textarea.focus();
      return;
    }

    if (words > 80) {
      validationError.textContent = 'Your review is a little long. Please shorten it to 80 words or less.';
      validationError.style.display = 'block';
      textarea.focus();
      return;
    }

    validationError.style.display = 'none';
    const copied = await copyToClipboard(reviewText);
    if (copied) {
      quickCopyText.textContent = 'Copied! ✓';
      setTimeout(() => {
        quickCopyText.textContent = 'Copy Text';
      }, 2500);
    }
  });

  // Star Rating Interaction
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.dataset.star, 10);
      state.userRating = rating;

      // Update star UI visual state
      starBtns.forEach((b, idx) => {
        if (idx < rating) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      trackEvent('RATING_SELECTED', { rating, course: state.selectedCourse });

      // Automatically store rating in database
      sendPrivateFeedback(
        rating,
        state.selectedCourse || 'Technical Training',
        '',
        state.sessionId
      ).catch(() => {});

      if (rating <= 3) {
        // 1-3 Stars: Show Private Feedback ONLY; Hide Google Review flow completely
        privateFeedbackContainer.style.display = 'block';
        positiveRatingContainer.style.display = 'none';
        googleFlowWrapper.style.display = 'none';
        clipboardStatus.style.display = 'none';
        postGooglePrompt.style.display = 'none';
      } else {
        // 4-5 Stars: Show Google Review flow; Hide Private Feedback completely
        privateFeedbackContainer.style.display = 'none';
        positiveRatingContainer.style.display = 'block';
        googleFlowWrapper.style.display = 'block';
      }
    });
  });

  // Send Private Feedback (1–3 stars)
  if (sendFeedbackBtn) {
    sendFeedbackBtn.addEventListener('click', async () => {
      const feedback = privateFeedbackText.value.trim();
      sendFeedbackBtn.disabled = true;
      sendFeedbackBtn.textContent = 'Saving Feedback...';

      await sendPrivateFeedback(
        state.userRating || 3,
        state.selectedCourse || 'Technical Training',
        feedback,
        state.sessionId
      );

      sendFeedbackBtn.style.display = 'none';
      privateFeedbackText.disabled = true;
      feedbackSuccessBanner.style.display = 'block';
      if (finishPrivateBtn) {
        finishPrivateBtn.style.display = 'block';
      }
    });
  }

  if (finishPrivateBtn) {
    finishPrivateBtn.addEventListener('click', () => {
      navigate('completion');
    });
  }

  /**
   * Show inline success message below textarea
   */
  function showCopySuccess() {
    clipboardStatus.style.display = 'block';
    clipboardStatus.className = 'clipboard-inline-success';
    clipboardStatus.innerHTML = `
      <div class="clipboard-inline-success__header">
        ${ICONS.check}
        <span>✓ Review copied!</span>
      </div>
      <p class="clipboard-inline-success__text">
        Opening Google Reviews now. Tap the review box on Google and paste your review.
      </p>
    `;
    postGooglePrompt.style.display = 'block';
  }

  /**
   * Show inline failure warning below textarea
   */
  function showCopyFailure() {
    clipboardStatus.style.display = 'block';
    clipboardStatus.className = 'clipboard-inline-warning';
    clipboardStatus.innerHTML = `
      <div class="clipboard-inline-warning__header">
        <span aria-hidden="true">⚠</span>
        <span>Couldn't copy automatically</span>
      </div>
      <p class="clipboard-inline-warning__text">
        You can try again or touch and hold the review text to copy it manually before opening Google.
      </p>
      <div class="clipboard-inline-warning__actions">
        <button class="btn btn--primary btn--compact" id="btn-retry-copy" type="button">
          ${ICONS.copy}
          <span>Copy Review Again</span>
        </button>
        <a
          href="${GOOGLE_REVIEW_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--secondary btn--compact"
        >
          <span>Open Google Review Page</span>
          ${ICONS.arrowRight}
        </a>
      </div>
    `;

    document.getElementById('btn-retry-copy').addEventListener('click', async () => {
      const reviewText = textarea.value.trim();
      const words = getWordCount(reviewText);
      if (words < 50 || words > 80) return;
      const copied = await copyToClipboard(reviewText);
      if (copied) {
        showCopySuccess();
        window.open(GOOGLE_REVIEW_URL, '_blank');
      }
    });

    clipboardStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Main CTA: Copy & Continue to Google ⭐ (Available ONLY for 4-5 Stars)
   */
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      if (isRegenerating) return;
      const reviewText = textarea.value.trim();
      const words = getWordCount(reviewText);

      // Validate edited review length strictly between 50 and 80 words
      if (words < 50) {
        validationError.textContent = 'Your review is a little short. Please add a few more words.';
        validationError.style.display = 'block';
        clipboardStatus.style.display = 'none';
        textarea.focus();
        return;
      }

      if (words > 80) {
        validationError.textContent = 'Your review is a little long. Please shorten it to 80 words or less.';
        validationError.style.display = 'block';
        clipboardStatus.style.display = 'none';
        textarea.focus();
        return;
      }

      validationError.style.display = 'none';
      trackEvent(EVENTS.GOOGLE_BUTTON_CLICKED, { requestId: state.requestId, sessionId: state.sessionId });

      // Copy CURRENT edited value FIRST to clipboard
      const copied = await copyToClipboard(reviewText);

      if (copied) {
        showCopySuccess();
        window.open(GOOGLE_REVIEW_URL, '_blank');
        googleBtn.innerHTML = `
          <span>✓ Review copied!</span>
          ${ICONS.arrowRight}
        `;
        googleBtn.classList.add('btn--success-state');
      } else {
        showCopyFailure();
      }
    });
  }

  // Post Google Confirmation Handlers
  if (confirmPostedBtn) {
    confirmPostedBtn.addEventListener('click', () => {
      trackEvent('COMPLETION_CONFIRMED', { requestId: state.requestId, sessionId: state.sessionId });
      navigate('completion');
    });
  }

  if (backToEditBtn) {
    backToEditBtn.addEventListener('click', () => {
      postGooglePrompt.style.display = 'none';
      textarea.focus();
    });
  }

  /**
   * In-place Regenerate handler
   */
  regenerateBtn.addEventListener('click', async () => {
    if (isRegenerating) return;
    isRegenerating = true;

    state.reviewVariation = (state.reviewVariation || 0) + 1;

    regenerateBtn.disabled = true;
    if (googleBtn) googleBtn.disabled = true;
    regenerateText.textContent = 'Creating another version...';
    regenerateBtn.style.opacity = '0.7';

    trackEvent(EVENTS.REGENERATE_CLICKED, {
      course: state.selectedCourse,
      variation: state.reviewVariation,
      sessionId: state.sessionId,
    });

    try {
      const result = await generateReview(state.selectedCourse, state.reviewVariation, state.sessionId);
      const newReview = typeof result === 'object' && result.review ? result.review : result;
      state.requestId = typeof result === 'object' && result.requestId ? result.requestId : state.requestId;

      textarea.value = newReview;
      state.generatedReview = newReview;
      updateWordCounter();
      validationError.style.display = 'none';
      clipboardStatus.style.display = 'none';
      postGooglePrompt.style.display = 'none';

      textarea.style.transition = 'border-color 0.3s ease';
      textarea.style.borderColor = 'var(--ga-cyan-500)';
      setTimeout(() => {
        textarea.style.borderColor = '';
      }, 600);
    } catch (err) {
      console.warn('[Regenerate Error]:', err.message);
    } finally {
      isRegenerating = false;
      regenerateBtn.disabled = false;
      if (googleBtn) googleBtn.disabled = false;
      regenerateText.textContent = 'Regenerate Another Variation';
      regenerateBtn.style.opacity = '';
    }
  });

  // Back button
  backBtn.addEventListener('click', () => navigate('courses'));
}
