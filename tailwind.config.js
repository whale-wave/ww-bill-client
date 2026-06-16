/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"HarmonyOS Sans SC"',
          'MiSans',
          '"PingFang SC"',
          '"Noto Sans SC"',
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
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
        number: [
          'DIN',
          '"DIN Alternate"',
          '"DIN Condensed"',
          '"SF Pro Display"',
          '"HarmonyOS Sans"',
          'MiSans',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        'primary': 'var(--ww-theme-color)',
        'bg-gray': '#F5F5F5',
        'border-primary': '#d7d7d7',
        'font-gray': '#9e9e9e',
        'font-black': '#333',
        'ww-border-color': 'var(--ww-border-color)',

        'gray96': '#969696',
        'black333': '#333333',
      },
      borderRadius: {
        'radius-small': '4px',
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
