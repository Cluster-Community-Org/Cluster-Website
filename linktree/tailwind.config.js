/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'cluster-acid': '#C6FF4D',
        'cluster-lime': '#C6FF4D',
        'cluster-green': '#76B900',
        'cluster-ink': '#080808',
        'cluster-black': '#000000',
        'cluster-offwhite': '#F8F7F3',
        obsidian: {
          950: '#000000',
          900: '#080808',
          850: '#0C0D0E',
          800: '#141517',
          700: '#1E2024',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
