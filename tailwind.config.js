/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFeed6',
          100: '#FFeed6',
          200: '#E8A07C',
          300: '#E8A07C',
          400: '#A5AF79',
          500: '#A5AF79',
          600: '#827148',
          700: '#827148',
          800: '#827148',
          900: '#827148',
        },
        purpleBrand: {
          500: '#827148',
          600: '#827148',
        },
        cyanBrand: {
          400: '#E8A07C',
          500: '#E8A07C',
        },
        darkBg: '#0A1728',
        lightBg: '#FFeed6',
        darkCard: '#10233A',
        darkBorder: '#1D4ED8'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(14, 165, 233, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
