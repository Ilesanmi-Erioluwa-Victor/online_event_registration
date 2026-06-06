/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C3BAA',
          light: '#8B5CC8',
          dark: '#431E7A',
          pale: '#F0EBFA',
        },
        accent: {
          DEFAULT: '#E8472A',
          light: '#FDECEA',
          dark: '#B83520',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D1D1D6',
          400: '#A0A0AB',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        status: {
          upcoming: '#0891B2',
          ongoing: '#16A34A',
          past: '#71717A',
          cancelled: '#DC2626',
          full: '#D97706',
          draft: '#A0A0AB',
          confirmed: '#16A34A',
          waitlisted: '#D97706',
          cancelled_reg: '#DC2626',
          attended: '#16A34A',
          absent: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
