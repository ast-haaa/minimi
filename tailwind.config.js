/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        'background-secondary': '#F8F6FB',
        card: '#FFFFFF',
        'text-primary': '#292432',
        'text-secondary': '#77717F',
        border: '#EAE5F0',
        accent: {
          DEFAULT: '#8051C7',
          hover: '#693BAF',
          soft: '#F1EAF9',
          subtle: '#EAE5F0',
        },
        lavender: {
          light: '#F1EAF9',
          border: '#EAE5F0',
        },
        // Mapped aliases for backwards compatibility in existing chat components
        ivory: '#FFFFFF',
        'ivory-dark': '#F8F6FB',
        surface: '#FFFFFF',
        highlight: '#F1EAF9',
        taupe: '#77717F',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(41, 36, 50, 0.04), 0 1px 2px -1px rgba(41, 36, 50, 0.03)',
        card: '0 4px 12px 0 rgba(41, 36, 50, 0.05), 0 1px 2px 0 rgba(41, 36, 50, 0.03)',
        'card-hover': '0 8px 24px 0 rgba(41, 36, 50, 0.08), 0 2px 4px 0 rgba(41, 36, 50, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#292432',
            '--tw-prose-headings': '#292432',
            '--tw-prose-links': '#8051C7',
            '--tw-prose-code': '#292432',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
