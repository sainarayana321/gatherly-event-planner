/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4ECE1',
          300: '#EADBCB',
        },
        forest: {
          50: '#F0F5F2',
          100: '#DCE8E2',
          200: '#BAD2C6',
          500: '#2A5847',
          600: '#1F4739',
          700: '#1B3B30',
          800: '#142E25',
          900: '#0E211A',
        },
        rose: {
          50: '#FDF6F5',
          100: '#F9EBE8',
          200: '#F2D3CD',
          500: '#C27367',
          600: '#AD5C50',
          700: '#94473C',
        },
        gold: {
          50: '#FCF9F0',
          100: '#F7F0DC',
          200: '#EDDCB3',
          500: '#C29B4A',
          600: '#A98135',
          700: '#8E6824',
        },
        stone: {
          border: '#E5DFD5',
          dark: '#1C1917',
          muted: '#6B655F',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'card': '0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
        'elevated': '0 12px 32px -4px rgba(28, 25, 23, 0.1), 0 4px 12px -2px rgba(28, 25, 23, 0.05)',
      }
    },
  },
  plugins: [],
}
