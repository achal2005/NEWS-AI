/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E02020',
        'primary-dark': '#B01010',
        ink: '#121212',
        canvas: '#FFFDF5',
        alert: '#0055FF',
        cool: '#6F42C1',
        highlight: '#FFEA00',
        'paper-grey': '#E5E5E5',
        'paper-accent': '#F0F0F0',
      },
      fontFamily: {
        display: ['var(--font-noto-serif)', 'Noto Serif Display', 'serif'],
        serif: ['var(--font-noto-serif)', 'Noto Serif Display', 'Georgia', 'serif'],
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'Space Mono', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #121212',
        'hard-hover': '6px 6px 0px 0px #121212',
        'hard-sm': '2px 2px 0px 0px #121212',
        'hard-lg': '8px 8px 0px 0px #121212',
      },
      borderWidth: {
        3: '3px',
      },
      borderRadius: {
        DEFAULT: '0px',
      },
      animation: {
        marquee: 'scroll-left 25s linear infinite',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'fuse-burn': 'burn 12s linear forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        burn: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        editorial: '72rem',
        reading: '42rem',
      },
    },
  },
  plugins: [],
}
