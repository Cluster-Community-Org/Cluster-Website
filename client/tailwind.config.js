/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CLUSTER Brand Identity v2.0
        // Ink #080808 | Black #000000 | Off-White #F8F7F3 | Graphite #3A3A3A | Acid Lime #C6FF4D
        'cluster-green': '#C6FF4D',
        'cluster-acid':  '#C6FF4D',
        'cluster-lime':  '#C6FF4D',
        'cluster-graphite': '#3A3A3A',
        'cluster-offwhite': '#F8F7F3',
        'cluster-black': '#000000',
        'cluster-ink':   '#080808',
        cluster: {
          green:    '#C6FF4D',
          acid:     '#C6FF4D',
          lime:     '#C6FF4D',
          graphite: '#3A3A3A',
          offwhite: '#F8F7F3',
          black:    '#000000',
          ink:      '#080808',
          DEFAULT:  '#C6FF4D',
        },
        obsidian: {
          950: '#000000', // Pure brand black
          900: '#0C0D0E', // Surface 1
          850: '#141517', // Surface 2
          800: '#1F2023', // Surface 3
          700: '#2C2D31',
          graphite: '#3A3A3A',
        },
        surface: {
          DEFAULT: '#0C0D0E',
          2:       '#141517',
          3:       '#1F2023',
        },
        'text-muted': '#9E9E98',
        bg: {
          primary:   '#000000',
          secondary: '#0C0D0E',
          tertiary:  '#141517',
          glass:     'rgba(255,255,255,0.04)',
        },
        text: {
          primary:   '#F8F8F5',
          secondary: '#9E9E98',
          tertiary:  '#666660',
          accent:    '#C6FF4D',
        },
        // Backward-compatible aliases
        'cluster-cyan': '#C6FF4D',
        nvidia: {
          DEFAULT: '#C6FF4D',
          light:   '#D4FF70',
          dark:    '#9ECC26',
        },
        'cyber-cyan': '#C6FF4D',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        hero:    ['72px', { lineHeight: '80px',  fontWeight: '800' }],
        h1:      ['48px', { lineHeight: '56px',  fontWeight: '700' }],
        h2:      ['36px', { lineHeight: '44px',  fontWeight: '700' }],
        h3:      ['24px', { lineHeight: '32px',  fontWeight: '600' }],
        body:    ['16px', { lineHeight: '24px',  fontWeight: '400' }],
        caption: ['14px', { lineHeight: '20px',  fontWeight: '400' }],
        label:   ['12px', { lineHeight: '16px',  fontWeight: '600' }],
      },
      boxShadow: {
        'cluster-glow':   '0 0 30px rgba(198,255,77,0.28)',
        'cluster-glow-lg':'0 0 60px rgba(198,255,77,0.45)',
        'acid-glow':      '0 0 35px rgba(198,255,77,0.35)',
        'nvidia-glow':    '0 0 30px rgba(198,255,77,0.28)',
        'nvidia-glow-lg': '0 0 60px rgba(198,255,77,0.45)',
        'cyan-glow':      '0 0 30px rgba(198,255,77,0.25)',
      },
      backgroundImage: {
        'cluster-gradient': 'linear-gradient(135deg, #C6FF4D 0%, #FFFFFF 100%)',
        'acid-gradient':    'linear-gradient(135deg, #C6FF4D 0%, #9FE822 100%)',
        'hero-gradient':    'radial-gradient(ellipse at 50% 0%, #16181B 0%, #000000 75%)',
        'cta-gradient':     'linear-gradient(135deg, #0C0D0E 0%, #000000 100%)',
      },
      borderRadius: {
        btn:  '10px',
        card: '16px',
      },
    },
  },
  plugins: [],
}
