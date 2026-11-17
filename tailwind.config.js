/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F7F4',
        surface: '#FFFFFF',
        ink: '#171A26',
        sidebar: '#171C2B',
        accent: { DEFAULT: '#635BDB', hover: '#5248C4', light: '#A7B8FF', subtle: '#E9E7FF', warm: '#F5E8D3' },
        txt: { primary: '#202231', secondary: '#777B89' },
        border: '#E9E9EC',
        classify: {
          assistant: { bg: '#E6EFFF', text: '#2563EB', border: '#BFDBFE' },
          client: { bg: '#FFF8EB', text: '#D97706', border: '#FDE68A' },
          noreply: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
          review: { bg: '#F0EDFF', text: '#7C3AED', border: '#DDD6FE' },
        },
        danger: { DEFAULT: '#EF4444', soft: '#FEE2E2' },
        success: { DEFAULT: '#059669', soft: '#D1FAE5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'panel': '0 8px 24px rgba(0,0,0,0.06)',
        'modal': '0 20px 60px rgba(0,0,0,0.12)',
        'accent': '0 4px 14px rgba(99,91,219,0.25)',
        'accent-lg': '0 8px 24px rgba(99,91,219,0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
