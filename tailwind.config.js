/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep forest green palette
        forest: { 900: '#0a1210', 800: '#0f1a17', 700: '#162420', 600: '#1e302b' },
        amber: { DEFAULT: '#f59e0b', muted: '#d97706', soft: '#fbbf24' },
        frost: { DEFAULT: '#a5b4fc', muted: '#818cf8' },
        // Single accent token = amber (keeps existing `accent` utilities on-palette)
        accent: { DEFAULT: '#f59e0b', muted: '#d97706' },
      },
      fontFamily: {
        sans: ['"DM Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.06)' },
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        'float-in': 'float-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
