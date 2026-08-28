/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1c7ed6',
          sky: '#339af0',
          board: '#e9ecef',
          tray: '#dee2e6',
          slot: '#f8f9fa',
          accent: '#20c997',
          deal: '#51cf66',
          gold: '#ffd43b',
        }
      },
      fontFamily: {
        game: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3d': '0 6px 0 rgba(0, 0, 0, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '3d-pressed': '0 2px 0 rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        '3d-card': '0 4px 0 rgba(0, 0, 0, 0.15)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.6)',
        'glow-gold': '0 0 20px rgba(250, 204, 21, 0.8)',
      },
      keyframes: {
        dealPop: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '70%': { transform: 'scale(1.05) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        mergeGlow: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.08)', filter: 'brightness(1.4) drop-shadow(0 0 12px gold)' },
        },
        floatScore: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.3)' },
        }
      },
      animation: {
        'deal-pop': 'dealPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'merge-glow': 'mergeGlow 0.45s ease-in-out',
        'float-score': 'floatScore 0.8s ease-out forwards',
      }
    },
  },
  plugins: [],
}
