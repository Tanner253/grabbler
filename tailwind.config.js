/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'crypto-dark': '#0f0f23',
        'crypto-purple': '#1a1a3e',
        'gold': '#ffd700',
        'gold-light': '#ffe55c',
        'gold-dark': '#b8860b',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'coin-fly': 'coinFly 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        coinFly: {
          '0%': { transform: 'translateX(0) translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(-50vw) translateY(-20px) scale(0.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGold: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'galaxy-gradient': 'radial-gradient(ellipse at top, #1e1b4b, #0f0f23), radial-gradient(ellipse at bottom, #4c1d95, #1e1b4b)',
      },
    },
  },
  plugins: [],
}

