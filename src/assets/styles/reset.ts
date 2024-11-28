export const themeColor = '#aeeeff';

export function initResetStyle() {
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --ww-theme-color: ${themeColor};
    }
  `;
  document.head.appendChild(style);
}
