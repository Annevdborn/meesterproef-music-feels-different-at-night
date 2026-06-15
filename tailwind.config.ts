import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#04040c',
          900: '#080810',
          800: '#0d0d18',
          700: '#12121f',
        },
        amber: {
          glow: '#c8a96e',
          warm: '#d4b483',
          muted: '#8a7358',
          dim: '#4a3d2a',
        },
        cream: {
          DEFAULT: '#f0e6d3',
          muted: '#c8baa8',
          dim: '#7a6e62',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        grotesk: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      animation: {
        grain: 'grain 0.4s steps(1) infinite',
        'spin-33': 'spin 1.82s linear infinite',
        'spin-45': 'spin 1.33s linear infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '20%': { transform: 'translate(3%, 1%)' },
          '30%': { transform: 'translate(-1%, 4%)' },
          '40%': { transform: 'translate(4%, -2%)' },
          '50%': { transform: 'translate(-3%, 2%)' },
          '60%': { transform: 'translate(2%, -4%)' },
          '70%': { transform: 'translate(-4%, 3%)' },
          '80%': { transform: 'translate(1%, -1%)' },
          '90%': { transform: 'translate(-2%, 4%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.12' },
          '50%': { opacity: '0.22' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [],
}

export default config
