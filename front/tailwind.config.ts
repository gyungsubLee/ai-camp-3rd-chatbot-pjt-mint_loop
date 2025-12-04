import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Sepia/Warm Browns
        sepia: {
          50: '#FDF8F4',
          100: '#F9EFE7',
          200: '#F0DCCC',
          300: '#E3C4A9',
          400: '#D4A77A',
          500: '#C4894D',
          600: '#A67035',
          700: '#7D5428',
          800: '#543A1D',
          900: '#2E2012',
        },
        // Neutral - Cream Tones
        cream: {
          50: '#FDFBF9',
          100: '#FAF7F4',
          200: '#F4EDE6',
          300: '#E8DDD2',
          400: '#D4C4B2',
        },
        // Film Aesthetic Colors
        film: {
          warm: '#E8D4B8',      // Kodak ColorPlus
          neutral: '#D8D0C8',   // Kodak Portra
          cool: '#C8D4D8',      // Fuji Superia
          mono: '#B0B0B0',      // Ilford HP5
        },
      },
      fontFamily: {
        serif: ['var(--font-libre)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'film-grain': "url('/images/film-grain.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
