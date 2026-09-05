/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Locked Palette (light mode): Banished Brown #381932 (primary),
        // Radiant Lilac #381932 (secondary/accent), Khaki Shell #381932
        // (neutral support). Shadow Purple / Japanese Violet are dark-mode
        // only per the brief -- not used as regular light-mode UI colours.
        palette: {
          khaki: '#381932',
          'khaki-light': '#FFF3E6',
          'khaki-subtle': '#FFF3E6',
          'khaki-border': '#FFF3E6',
          'khaki-dark': '#381932',
          lilac: '#A78A9F',
          'lilac-light': '#FFF3E6',
          'lilac-muted': '#A78A9F',
          'lilac-dark': '#381932',
          banished: '#381932',
          'banished-dark': '#381932',
          'banished-light': '#381932',
          shadow: '#381932',
          'shadow-dark': '#381932',
          'shadow-deep': '#381932',
          violet: '#381932',
          'violet-light': '#381932',
          'violet-hover': '#381932',
        },
        khaki: {
          DEFAULT: '#381932',
          50: '#FFF3E6',
          100: '#FFF3E6',
          200: '#FFF3E6',
          300: '#FFF3E6',
          400: '#381932',
          500: '#FFF3E6',
          600: '#381932',
          700: '#381932',
        },
        lilac: {
          DEFAULT: '#A78A9F',
          light: '#C8B5C3',
          dark: '#8C6E84',
        },
        banished: {
          DEFAULT: '#381932',
          light: '#381932',
          dark: '#381932',
        },
        shadowPurple: {
          DEFAULT: '#381932',
          light: '#381932',
          dark: '#381932',
        },
        japaneseViolet: {
          DEFAULT: '#381932',
          light: '#381932',
          dark: '#381932',
        },
        // Brand tokens mapped to locked palette
        brand: {
          khaki: '#381932',
          lilac: '#A78A9F',
          banished: '#381932',
          shadow: '#381932',
          violet: '#381932',
          primary: '#381932',
          secondary: '#A78A9F',
          accent: '#A78A9F',
          canvas: '#FFF3E6',
          card: '#FFF3E6',
          border: '#FFF3E6',
        },
        bg: 'var(--color-bg-canvas, #FFF3E6)',
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Oswald"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        editorial: ['"Oswald"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Oswald"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Oswald"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        oswald: ['"Oswald"', '"Helvetica Neue"', 'sans-serif'],
        poppins: ['"Poppins"', '"Inter"', 'sans-serif'],
        script: ['"Great Vibes"', '"Segoe Script"', 'cursive'],
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
        // Override Tailwind's default shadow scale with soft, ink-tinted
        // (#381932) elevation per the premium-editorial brief -- "0 4px 20px
        // rgba(56,25,50,0.05)" direction -- instead of the default pure-black
        // shadows. This is a single global lever: every existing shadow-sm/
        // shadow-md/shadow-lg/shadow-xl usage across the site picks this up
        // automatically, no per-component changes needed.
        xs: '0 1px 2px rgba(56,25,50,.03)',
        sm: '0 1px 3px rgba(56,25,50,.04)',
        DEFAULT: '0 2px 8px rgba(56,25,50,.05)',
        md: '0 4px 16px rgba(56,25,50,.06)',
        lg: '0 8px 24px rgba(56,25,50,.07)',
        xl: '0 12px 32px rgba(56,25,50,.08)',
        '2xl': '0 20px 48px rgba(56,25,50,.10)',
        card: '0 2px 8px rgba(56,25,50,.05)',
        'card-hover': '0 8px 24px rgba(56,25,50,.08)',
        glass: '0 4px 20px rgba(56,25,50,.05), inset 0 1px 0 rgba(255,243,230,.9)',
        modal: '0 20px 40px -15px rgba(56,25,50,.12)',
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
