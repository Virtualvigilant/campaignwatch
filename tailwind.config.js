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
        'bg-primary': '#FAFBFC',
        'bg-elevated': '#FFFFFF',
        'risk-low': '#10B981',
        'risk-medium': '#F59E0B',
        'risk-high': '#EF4444',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'accent-kenya': '#006600',
        'border-subtle': '#E5E7EB',

        // Legacy fallbacks where absolute needed
        navy: { DEFAULT: '#111827', light: '#374151', dark: '#000000' },
        gold: { DEFAULT: '#006600', light: '#008000', dark: '#004d00' },
        alert: { DEFAULT: '#EF4444', light: '#F87171', dark: '#DC2626' },
        safe: { DEFAULT: '#10B981', light: '#34D399', dark: '#059669' },
        ash: { DEFAULT: '#FAFBFC', dark: '#E5E7EB' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
