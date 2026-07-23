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
          50: '#FAEDCA',
          100: '#FAEDCA',
          200: '#F2C078',
          300: '#F2C078',
          400: '#FE5D26',
          500: '#FE5D26',
          600: '#E54F20',
          700: '#C34118',
          800: '#9B3112',
          900: '#78270E',
        },
        purpleBrand: {
          500: '#F2C078',
          600: '#E7A85A',
        },
        cyanBrand: {
          400: '#C1DBB3',
          500: '#C1DBB3',
        },
        darkBg: '#0A1728',
        lightBg: '#FAEDCA',
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
