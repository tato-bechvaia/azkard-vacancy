/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7C3AED',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        dark: {
          50:  '#F8FAFC',
          100: '#94A3B8',
          200: '#475569',
          300: '#1E1E2A',
          400: '#13131A',
          500: '#0D0D14',
          600: '#0A0A0F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}