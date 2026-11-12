/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base backgrounds & text
        background: '#FFFFFF',
        'background-secondary': '#FFFCFB',
        card: '#FFFFFF',
        'text-primary': '#292929',
        'text-secondary': '#77717F',
        border: '#EEE8E6',

        // Official brand palette: Coral & Magenta
        coral: {
          DEFAULT: '#F0644F',
          deep: '#E65342',
          hover: '#E65342',
          soft: '#FFF2ED',
        },
        magenta: {
          DEFAULT: '#E91E63',
          deep: '#C2185B',
          hover: '#C2185B',
          soft: '#FFF0F5',
        },
        peach: {
          soft: '#FFF2ED',
        },
        pink: {
          soft: '#FFF0F5',
        },

        // Primary Accent Mapping (Coral dominant)
        accent: {
          DEFAULT: '#F0644F', // Primary coral
          hover: '#E65342',   // Deep coral
          soft: '#FFF2ED',    // Soft peach
          subtle: '#EEE8E6',
        },

        // Status indicators
        status: {
          success: '#F0644F',
          warning: '#E91E63',
          error: '#C2185B',
        },

        // Backwards compatibility tokens mapped cleanly
        ivory: '#FFFFFF',
        'ivory-dark': '#FFFCFB',
        surface: '#FFFFFF',
        highlight: '#FFF2ED',
        taupe: '#77717F',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(41, 41, 41, 0.04), 0 1px 2px -1px rgba(41, 41, 41, 0.03)',
        card: '0 4px 14px 0 rgba(240, 100, 79, 0.06), 0 1px 3px 0 rgba(41, 41, 41, 0.04)',
        'card-hover': '0 8px 24px 0 rgba(240, 100, 79, 0.1), 0 2px 6px 0 rgba(41, 41, 41, 0.04)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-delay': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 5s ease-in-out infinite',
        'float-delay': 'float-delay 4.5s ease-in-out 1s infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#292929',
            '--tw-prose-headings': '#292929',
            '--tw-prose-links': '#F0644F',
            '--tw-prose-code': '#292929',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
