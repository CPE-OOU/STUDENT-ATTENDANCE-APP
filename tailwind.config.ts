import { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },

    extend: {
      colors: {
        primary: '#FDCB9E',
        secondary: '#CCEABB',
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.gray,
        emerald: colors.emerald,
        indigo: colors.indigo,
        yellow: colors.yellow,
      },
      borderRadius: {},
      keyframes: {},
      animation: {},
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
