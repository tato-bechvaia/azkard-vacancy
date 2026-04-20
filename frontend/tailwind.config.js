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
        },
        ink: {
          950: '#0A0A0A',
          900: '#111111',
          700: '#2C2C2C',
          500: '#6B6B6B',
          300: '#ADADAD',
          100: '#E8E8E8',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'card-lg': '0 8px 24px 0 rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}

