/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { main: '#F7F8FC' },
        surface: '#FFFFFF',
        sidebar: '#151B2D',
        primary: { DEFAULT: '#6558E8', hover: '#5548D5' },
        txt: { primary: '#20243A', secondary: '#777D91' },
        border: '#E9EAF1',
        classify: {
          assistant: { bg: '#E9F1FF', text: '#2563EB' },
          client: { bg: '#FFF3DE', text: '#D97706' },
          noreply: { bg: '#E8F7EE', text: '#16A34A' },
          review: { bg: '#F2EAFE', text: '#7C3AED' },
        },
        danger: { DEFAULT: '#EF4444', soft: '#FEE2E2' },
        success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
