/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#7c3aed',
          500: '#6c2bd9',
          600: '#5b21b6',
          700: '#4c1d95',
          900: '#2e1065'
        },
        gold: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#7c3aed',
          500: '#6c2bd9',
          600: '#5b21b6'
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c'
        },
        surface: {
          950: '#f8fafc',
          900: '#ffffff',
          850: '#f1f5f9',
          800: '#e2e8f0',
          750: '#cbd5e1'
        }
      }
    },
  },
  plugins: [],
};
