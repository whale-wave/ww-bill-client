const REFRESH_EVENT = 'ww-achievement-refresh';

export function requestAchievementFeedback() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

export { REFRESH_EVENT };
