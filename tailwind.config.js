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
        navy:  { DEFAULT: '#1B2A4A', light: '#2D4A7A', dark: '#0F1A2E' },
        gold:  { DEFAULT: '#F5A623', light: '#FDC96A', dark: '#C97D0A' },
        alert: { DEFAULT: '#E63946', light: '#FF6B76', dark: '#B02030' },
        safe:  { DEFAULT: '#2DC653', light: '#5DE07D', dark: '#1A8A37' },
        ash:   { DEFAULT: '#F4F6F9', dark: '#E0E4EA' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
