/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF9F6',
        'ivory-dark': '#F3F0EB',
        surface: '#FFFFFF',
        'text-primary': '#292722',
        'text-secondary': '#77736B',
        border: '#E8E4DC',
        accent: '#B86F52',
        'accent-hover': '#A45F46',
        highlight: '#F3E8E1',
        taupe: '#A89B8B',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#292722',
            '--tw-prose-headings': '#292722',
            '--tw-prose-links': '#B86F52',
            '--tw-prose-code': '#292722',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
