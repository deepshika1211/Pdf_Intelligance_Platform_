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
          50: '#C1EBE9',
          100: '#C1EBE9',
          200: '#FFF7C5',
          300: '#FFF7C5',
          400: '#F4AE52',
          500: '#F4AE52',
          600: '#FF4400',
          700: '#FF4400',
          800: '#D93600',
          900: '#B42C00',
        },
        purpleBrand: {
          500: '#F4AE52',
          600: '#FF4400',
        },
        cyanBrand: {
          400: '#C1EBE9',
          500: '#C1EBE9',
        },
        darkBg: '#0A1728',
        lightBg: '#C1EBE9',
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
