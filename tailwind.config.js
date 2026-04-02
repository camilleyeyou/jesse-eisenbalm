/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      colors: {
        brand: {
          beige: '#EDE6DF',
          cyan: '#00BCD4',
          green: '#1EA87A',
          yellow: '#FFC107',
          crimson: '#B71C5A',
          gray: '#9E9E9E',
          'gray-light': '#C8C8C8',
          'gray-dark': '#5C5C5C',
        },
      },
    },
  },
  plugins: [],
}