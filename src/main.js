// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';

// Screens
import * as welcomeScreen from './screens/welcome.js';
import * as courseSelectionScreen from './screens/courseSelection.js';
import * as generatingScreen from './screens/generating.js';
import * as reviewScreen from './screens/review.js';
import * as errorScreen from './screens/error.js';
import * as completionScreen from './screens/completion.js';

/**
 * Application state
 */
const state = {
  currentScreen: 'welcome',
  selectedCourse: null,
  generatedReview: null,
  reviewVariation: 0,
  requestId: null,
  sessionId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess-' + Date.now(),
  userRating: null,
  errorMessage: null,
  errorRetryAction: null,
};

/**
 * Screen registry
 */
const screens = {
  welcome: welcomeScreen,
  courses: courseSelectionScreen,
  generating: generatingScreen,
  review: reviewScreen,
  error: errorScreen,
  completion: completionScreen,
};

/**
 * Navigate to a screen
 * @param {string} screenName - The screen to navigate to
 */
function navigate(screenName) {
  const screen = screens[screenName];
  if (!screen) {
    console.error(`Unknown screen: ${screenName}`);
    return;
  }

  state.currentScreen = screenName;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-container">
      ${screen.render(state)}
    </div>
  `;
  screen.mount(navigate, state);

  // Scroll to top on screen change
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Initialize the application
 */
function init() {
  navigate('welcome');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
