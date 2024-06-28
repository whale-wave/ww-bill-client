/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      'primary': '#AEEEFF',
      'bg-gray': '#F5F5F5',
      'gray96': '#969696',
      'black333': '#333333',
    },
    extend: {},
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
