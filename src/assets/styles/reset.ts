export const THEME_COLOR = '#6fc2dc';

export function initResetStyle() {
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --ww-theme-color: ${THEME_COLOR};
    }
  `;
  document.head.appendChild(style);
}
