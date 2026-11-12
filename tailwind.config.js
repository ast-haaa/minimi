/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        'background-secondary': '#F7F6FA',
        card: '#FFFFFF',
        'text-primary': '#292432',
        'text-secondary': '#77717F',
        border: '#EAE7EF',
        accent: {
          DEFAULT: '#9675B8',
          hover: '#8060A5',
          soft: '#F0EAF6',
          subtle: '#E9DFF2',
        },
        status: {
          success: '#7D649A',
          warning: '#9E783D',
          error: '#BA4E4E',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(41, 36, 50, 0.04), 0 1px 2px -1px rgba(41, 36, 50, 0.03)',
        'card': '0 4px 12px 0 rgba(41, 36, 50, 0.05), 0 1px 2px 0 rgba(41, 36, 50, 0.03)',
        'card-hover': '0 8px 24px 0 rgba(41, 36, 50, 0.08), 0 2px 4px 0 rgba(41, 36, 50, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#292432',
            '--tw-prose-headings': '#292432',
            '--tw-prose-links': '#9675B8',
            '--tw-prose-code': '#292432',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
