/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CLUSTER brand colours
        'cluster-green': '#A3FF6B',
        'cluster-cyan':  '#00E5FF',
        cluster: {
          green:   '#A3FF6B',
          cyan:    '#00E5FF',
          DEFAULT: '#A3FF6B',
        },
        obsidian: {
          950: '#0B0F14',
          900: '#111827',
          850: '#161D2B',
          800: '#1F2937',
        },
        surface: {
          DEFAULT: '#111827',
          2:       '#1F2937',
        },
        'text-muted': '#94A3B8',
        bg: {
          primary:   '#0B0F14',
          secondary: '#111827',
          tertiary:  '#1F2937',
          glass:     'rgba(255,255,255,0.05)',
        },
        text: {
          primary:   '#E5E7EB',
          secondary: '#94A3B8',
          tertiary:  '#6B7280',
          accent:    '#A3FF6B',
        },
        // keep legacy aliases so old className refs don't break
        nvidia: {
          DEFAULT: '#A3FF6B',
          light:   '#C5FF4D',
          dark:    '#7ACC44',
        },
        'cyber-cyan': '#00E5FF',
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
        'nvidia-glow':    '0 0 30px rgba(163,255,107,0.25)',
        'nvidia-glow-lg': '0 0 60px rgba(163,255,107,0.35)',
        'cluster-glow':   '0 0 30px rgba(163,255,107,0.25)',
        'cyan-glow':      '0 0 30px rgba(0,229,255,0.20)',
      },
      backgroundImage: {
        'cluster-gradient': 'linear-gradient(135deg, #A3FF6B 0%, #00E5FF 100%)',
        'hero-gradient':    'linear-gradient(135deg, #0B0F14 0%, #111827 50%, #0B0F14 100%)',
        'cta-gradient':     'linear-gradient(135deg, #A3FF6B 0%, #00E5FF 100%)',
      },
      borderRadius: {
        btn:  '8px',
        card: '12px',
      },
    },
  },
  plugins: [],
}
