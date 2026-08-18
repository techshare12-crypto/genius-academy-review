/**
 * Analytics service — V1 stub
 * No-op implementation. Wired into the app so a real service
 * (e.g. Google Analytics, Plausible) can be plugged in later.
 * Collects ZERO personal information.
 */

const EVENTS = {
  PAGE_OPENED: 'review_page_opened',
  COURSE_SELECTED: 'course_selected',
  GENERATION_STARTED: 'review_generation_started',
  REVIEW_GENERATED: 'review_generated',
  REGENERATE_CLICKED: 'regenerate_clicked',
  GOOGLE_BUTTON_CLICKED: 'google_button_clicked',
};

export function trackEvent(eventName, data = {}) {
  // V1: log to console in development only
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, data);
  }
  // Future: send to analytics service
}

export { EVENTS };
