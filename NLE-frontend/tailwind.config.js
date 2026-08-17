/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Locked Palette: Khaki Shell #C9BEAB, Radiant Lilac #A78A9F, Banished Brown #725D75, Shadow Purple #483250, Japanese Violet #34203C
        palette: {
          khaki: '#C9BEAB',
          'khaki-light': '#FAF8F5',
          'khaki-subtle': '#F5EFE6',
          'khaki-border': '#DDD5C7',
          'khaki-dark': '#A69882',
          lilac: '#A78A9F',
          'lilac-light': '#F6EFF4',
          'lilac-muted': '#C8B5C3',
          'lilac-dark': '#866B80',
          banished: '#725D75',
          'banished-dark': '#58445B',
          'banished-light': '#8F7892',
          shadow: '#483250',
          'shadow-dark': '#38223E',
          'shadow-deep': '#1F1222',
          violet: '#34203C',
          'violet-light': '#4D2F57',
          'violet-hover': '#28172F',
        },
        khaki: {
          DEFAULT: '#C9BEAB',
          50: '#FAF8F5',
          100: '#F5EFE6',
          200: '#E6DFD5',
          300: '#DDD5C7',
          400: '#C9BEAB',
          500: '#B5A994',
          600: '#9C907A',
          700: '#7E7360',
        },
        lilac: {
          DEFAULT: '#A78A9F',
          light: '#C8B5C3',
          dark: '#8C6E84',
        },
        banished: {
          DEFAULT: '#725D75',
          light: '#917994',
          dark: '#564459',
        },
        shadowPurple: {
          DEFAULT: '#483250',
          light: '#62456C',
          dark: '#302036',
        },
        japaneseViolet: {
          DEFAULT: '#34203C',
          light: '#4B3056',
          dark: '#1F1224',
        },
        // Brand tokens mapped to locked palette
        brand: {
          khaki: '#C9BEAB',
          lilac: '#A78A9F',
          banished: '#725D75',
          shadow: '#483250',
          violet: '#34203C',
          primary: '#34203C',
          secondary: '#725D75',
          accent: '#A78A9F',
          canvas: '#FAF8F5',
          card: '#F5EFE6',
          border: '#DDD5C7',
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
