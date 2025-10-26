import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#d9e7ff',
          200: '#b3cfff',
          300: '#8bb7ff',
          400: '#639eff',
          500: '#3a86ff',
          600: '#236edb',
          700: '#1854aa',
          800: '#113a77',
          900: '#0b244d'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

export default config;
