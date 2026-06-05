/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
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
