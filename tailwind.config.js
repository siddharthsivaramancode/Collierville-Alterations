/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: '#FAF7F2',
        silk: '#F2ECE1',
        ivory: '#FFFFFF',
        ink: '#1A1C20',
        muted: '#57534E',
        brass: {
          DEFAULT: '#B88E4A',
          dark: '#9E7636',
          light: '#D8BE91',
          wash: '#F3E8D5',
        },
        sage: {
          DEFAULT: '#4A7C59',
          wash: '#EDF3EC',
        },
        line: '#E4DDD2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.26em',
      },
      maxWidth: {
        shell: '1200px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 28, 32, 0.03), 0 12px 30px -24px rgba(26, 28, 32, 0.22)',
        lift: '0 24px 60px -28px rgba(26, 28, 32, 0.3)',
        pin: '0 4px 12px rgba(26, 28, 32, 0.12)',
      },
    },
  },
  plugins: [],
};
