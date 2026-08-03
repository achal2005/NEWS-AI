/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── The Daily Riso — calm editorial ink on warm ivory ──
        primary: '#2C44A6',        // muted indigo — the single quiet accent
        'primary-dark': '#20326E',
        secondary: '#D9614C',      // warm coral — used sparingly
        tertiary: '#C9A24B',       // muted gold — rare
        neutral: '#242019',
        ink: '#242019',            // soft warm near-black (not pure black)
        canvas: '#F5F2EA',         // clean warm ivory
        surface: '#FFFFFF',        // clean white card stock
        alert: '#D9614C',
        cool: '#2C44A6',
        highlight: '#DEE3F3',      // soft indigo-tint selection
        'paper-grey': '#EFEBDF',   // gentle newsprint (sidebar)
        'paper-accent': '#E7E1D2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        serif: ['var(--font-display)', 'Fraunces', 'serif'],
        sans: ['var(--font-sans)', 'Epilogue', 'sans-serif'],
        mono: ['var(--font-mono)', 'Space Mono', 'monospace'],
      },
      boxShadow: {
        hard: '3px 3px 0px 0px #242019',
        'hard-hover': '5px 5px 0px 0px #242019',
        'hard-sm': '2px 2px 0px 0px #242019',
        'hard-lg': '7px 7px 0px 0px #242019',
        'pop': '4px 4px 0px 0px #D9614C',
        soft: '0 2px 10px 0 rgba(36, 32, 25, 0.06)',
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
