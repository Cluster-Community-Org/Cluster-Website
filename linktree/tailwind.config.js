/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lime: '#C6FF4D',
        'cluster-acid': '#C6FF4D',
        'cluster-lime': '#C6FF4D',
        'cluster-green': '#76B900',
        'cluster-ink': '#080808',
        'cluster-black': '#000000',
        'cluster-offwhite': '#F8F7F3',
        graphite: '#3A3A3A',
        mute: '#8E8E88',
        line: '#272727',
        obsidian: {
          950: '#000000',
          900: '#080808',
          850: '#0C0D0E',
          800: '#141517',
          750: '#1A1C1F',
          700: '#24262B',
          600: '#343840',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Space Grotesk', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cluster-glow': '0 0 35px rgba(198, 255, 77, 0.22)',
        'cluster-glow-lg': '0 0 70px rgba(198, 255, 77, 0.35)',
        'surface-card': '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      transitionTimingFunction: {
        cluster: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        sheen: {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '100%': { transform: 'translateX(250%) skewX(-20deg)' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        sparkPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.92)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
      },
      animation: {
        sheen: 'sheen 5s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        nudge: 'nudge 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        spark: 'sparkPulse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
