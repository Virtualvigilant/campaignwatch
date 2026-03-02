/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1e293b', light: '#334155', dark: '#0f172a' },
        gold: { DEFAULT: '#b45309', light: '#d97706', dark: '#92400e' },
        alert: { DEFAULT: '#be123c', light: '#e11d48', dark: '#9f1239' },
        safe: { DEFAULT: '#047857', light: '#059669', dark: '#065f46' },
        ash: { DEFAULT: '#f8fafc', dark: '#e2e8f0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
