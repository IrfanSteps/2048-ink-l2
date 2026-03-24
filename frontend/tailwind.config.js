/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: {
          50:  '#f0f0ff',
          100: '#e0dfff',
          200: '#c4c2ff',
          300: '#a89eff',
          400: '#8b78ff',
          500: '#6e51ff',
          600: '#5533f0',
          700: '#4020d5',
          800: '#2e14a8',
          900: '#1e0b7a',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.1s ease-out',
        'pop':      'pop 0.15s ease-out',
        'fade-in':  'fadeIn 0.3s ease',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
