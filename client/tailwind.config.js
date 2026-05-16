/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
      },
      animation: {
        'fade-in-up':   'fadeInUp 0.6s ease-out both',
        'fade-in-down': 'fadeInDown 0.5s ease-out both',
        'fade-in':      'fadeIn 0.5s ease-out both',
        'slide-in-left':'slideInLeft 0.45s ease-out both',
        'slide-down':   'slideDown 0.28s ease-out both',
        'streak-pop':   'streakPop 0.5s ease-out',
        'glass-wave':   'glassWave 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-green':  'pulseGreen 2s ease-in-out infinite',
        'pulse-red':    'pulseRed 1.4s ease-in-out infinite',
        'shimmer':      'shimmer 1.6s infinite linear',
        'bounce-emoji': 'bounceEmoji 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        streakPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.3) rotate(-8deg)' },
          '70%':  { transform: 'scale(0.9) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        glassWave: {
          '0%':   { transform: 'scale(0.85)', opacity: '0.5' },
          '60%':  { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(22,163,74,0.35)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(22,163,74,0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(220,38,38,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        bounceEmoji: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%':      { transform: 'translateY(-12px)' },
          '60%':      { transform: 'translateY(-6px)' },
        },
      },
      transitionDelay: {
        '0':   '0ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}