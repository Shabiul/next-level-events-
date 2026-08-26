/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Locked Palette (light mode): Banished Brown #725D75 (primary),
        // Radiant Lilac #A78A9F (secondary/accent), Khaki Shell #C9BEAB
        // (neutral support). Shadow Purple / Japanese Violet are dark-mode
        // only per the brief -- not used as regular light-mode UI colours.
        palette: {
          khaki: '#C9BEAB',
          'khaki-light': '#F9F6F2',
          'khaki-subtle': '#F3EFE7',
          'khaki-border': '#E4DCD2',
          'khaki-dark': '#A69882',
          lilac: '#A78A9F',
          'lilac-light': '#F3EFE7',
          'lilac-muted': '#A78A9F',
          'lilac-dark': '#8C6E84',
          banished: '#746B72',
          'banished-dark': '#5A5257',
          'banished-light': '#A78A9F',
          shadow: '#483250',
          'shadow-dark': '#38223E',
          'shadow-deep': '#1F1222',
          violet: '#2F2930',
          'violet-light': '#2F2930',
          'violet-hover': '#221E23',
        },
        khaki: {
          DEFAULT: '#C9BEAB',
          50: '#F9F6F2',
          100: '#F3EFE7',
          200: '#EDE7DC',
          300: '#E4DCD2',
          400: '#C9BEAB',
          500: '#B5A994',
          600: '#A69882',
          700: '#84789F',
        },
        lilac: {
          DEFAULT: '#A78A9F',
          light: '#C8B5C3',
          dark: '#8C6E84',
        },
        banished: {
          DEFAULT: '#725D75',
          light: '#917994',
          dark: '#58445B',
        },
        shadowPurple: {
          DEFAULT: '#483250',
          light: '#62456C',
          dark: '#302036',
        },
        japaneseViolet: {
          DEFAULT: '#2F2930',
          light: '#2F2930',
          dark: '#221E23',
        },
        // Brand tokens mapped to locked palette
        brand: {
          khaki: '#C9BEAB',
          lilac: '#A78A9F',
          banished: '#725D75',
          shadow: '#483250',
          violet: '#2F2930',
          primary: '#725D75',
          secondary: '#A78A9F',
          accent: '#A78A9F',
          canvas: '#F9F6F2',
          card: '#FFFFFF',
          border: '#E4DCD2',
        },
        bg: 'var(--color-bg-canvas, #F9F6F2)',
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        editorial: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        script: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        hero: '-0.035em',
        h1: '-0.03em',
        h2: '-0.025em',
        h3: '-0.018em',
        eyebrow: '0.08em',
        nav: '0.005em',
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        card: '14px',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.02)',
        'card-hover': '0 4px 16px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)',
        glass: '0 4px 20px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.9)',
        modal: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
}
