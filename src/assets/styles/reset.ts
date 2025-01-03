export const THEME_COLOR = '#aeeeff';

export function initResetStyle() {
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --ww-theme-color: ${THEME_COLOR};
    }
  `;
  document.head.appendChild(style);
}
