/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Locked Palette (light mode): Khaki Lavender #C7B8E8, Primary Purple #8F6FC4, Neutral Gray #6B6B76, Shadow Purple #483250 (dark mode only), Ink #1C1B22
        palette: {
          khaki: '#C7B8E8',
          'khaki-light': '#FAF8F5',
          'khaki-subtle': '#F2EEFA',
          'khaki-border': '#E4DEF2',
          'khaki-dark': '#9C8FBE',
          lilac: '#8F6FC4',
          'lilac-light': '#F2EEFA',
          'lilac-muted': '#B9A6D9',
          'lilac-dark': '#7D5DB2',
          banished: '#6B6B76',
          'banished-dark': '#55555E',
          'banished-light': '#B6A2DE',
          shadow: '#483250',
          'shadow-dark': '#38223E',
          'shadow-deep': '#1F1222',
          violet: '#1C1B22',
          'violet-light': '#1C1B22',
          'violet-hover': '#141319',
        },
        khaki: {
          DEFAULT: '#C7B8E8',
          50: '#FAF8F5',
          100: '#F2EEFA',
          200: '#EAE5F5',
          300: '#E4DEF2',
          400: '#C7B8E8',
          500: '#B0A0D8',
          600: '#9C8FBE',
          700: '#84789F',
        },
        lilac: {
          DEFAULT: '#8F6FC4',
          light: '#B9A6D9',
          dark: '#7D5DB2',
        },
        banished: {
          DEFAULT: '#6B6B76',
          light: '#B6A2DE',
          dark: '#55555E',
        },
        shadowPurple: {
          DEFAULT: '#483250',
          light: '#62456C',
          dark: '#302036',
        },
        japaneseViolet: {
          DEFAULT: '#1C1B22',
          light: '#1C1B22',
          dark: '#141319',
        },
        // Brand tokens mapped to locked palette
        brand: {
          khaki: '#C7B8E8',
          lilac: '#8F6FC4',
          banished: '#6B6B76',
          shadow: '#483250',
          violet: '#1C1B22',
          primary: '#8F6FC4',
          secondary: '#6B6B76',
          accent: '#8F6FC4',
          canvas: '#FAF8F5',
          card: '#F2EEFA',
          border: '#E4DEF2',
        },
        bg: 'var(--color-bg-canvas, #FAF8F5)',
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
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
