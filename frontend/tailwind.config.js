export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEEDFE',
          100: '#CECBF6',
          400: '#9F8FEC',
          500: '#8B7AE0',
          600: '#6B46E0',
          700: '#5a38c4',
        },
        surface: {
          50:  '#F8F7F4',
          100: '#F0EEE9',
          200: '#E2DED6',
          300: '#C8C4BC',
        }
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

