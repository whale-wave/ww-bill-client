/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans SC Variable"',
          '"HarmonyOS Sans SC"',
          'MiSans',
          '"PingFang SC"',
          '"Source Han Sans SC"',
          '"Microsoft YaHei UI"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        display: [
          '"Alimama ShuHeiTi"',
          '"Alibaba PuHuiTi"',
          '"HarmonyOS Sans SC"',
          'MiSans',
          '"PingFang SC"',
          '"Noto Sans SC Variable"',
          'system-ui',
          'sans-serif',
        ],
        number: [
          '"Nunito Variable"',
          '"Noto Sans SC Variable"',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        'primary': 'var(--ww-theme-color)',
        'primary-light': 'var(--ww-theme-color-light)',
        'primary-mid': 'var(--ww-theme-color-mid)',
        'primary-deep': 'var(--ww-theme-color-deep)',
        'ww-pink': 'var(--ww-pink-color)',
        'ww-pink-light': 'var(--ww-pink-color-light)',
        'ww-ink': 'var(--ww-theme-text-color)',
        'ww-mid': 'var(--ww-text-color-mid)',
        'ww-soft': 'var(--ww-text-color-soft)',
        'ww-ghost': 'var(--ww-text-color-ghost)',
        'ww-card': 'var(--ww-card-color)',
        'bg-gray': 'var(--ww-background-color)',
        'border-primary': 'var(--ww-border-color)',
        'font-gray': 'var(--ww-text-color-soft)',
        'font-black': 'var(--ww-theme-text-color)',
        'ww-border-color': 'var(--ww-border-color)',
        'ww-surface': 'var(--ww-surface-color)',
        'ww-surface-raised': 'var(--ww-surface-raised-color)',

        'gray96': '#969696',
        'black333': '#333333',
      },
      fontSize: {
        'xs': 'var(--ww-font-size-xs)',
        'sm': 'var(--ww-font-size-sm)',
        'base': 'var(--ww-font-size-base)',
        'lg': 'var(--ww-font-size-lg)',
        'xl': 'var(--ww-font-size-xl)',
        '2xl': 'var(--ww-font-size-2xl)',
      },
      borderRadius: {
        'radius-small': '4px',
        'ww': '20px',
        'ww-lg': '24px',
      },
      boxShadow: {
        'ww': 'var(--ww-card-shadow)',
        'ww-xs': 'var(--ww-card-shadow-xs)',
        'ww-lg': 'var(--ww-card-shadow-lg)',
        'ww-floating': 'var(--ww-card-shadow-floating)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        // '.page-new': {
        //   height: '100%',
        //   display: 'flex',
        //   flexDirection: 'column',
        // },
      });
    },
  ],
};
