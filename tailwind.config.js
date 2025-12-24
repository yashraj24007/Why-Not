/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      colors: {
        glass: {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.05)',
        },
        neon: {
          blue: '#0aff99',  // Changed to teal/green
          purple: '#bc13fe',
          teal: '#0aff99',
          pink: '#ff006e',
        },
        'dark-purple': {
          950: '#0a0012',
          900: '#1a0a2e',
          800: '#2a1a3e',
        },
        'purple-glow': {
          10: 'rgba(188, 19, 254, 0.1)',
          15: 'rgba(188, 19, 254, 0.15)',
          20: 'rgba(188, 19, 254, 0.2)',
          30: 'rgba(188, 19, 254, 0.3)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #000000 0%, #0a0012 25%, #1a0a2e 50%, #0a0012 75%, #000000 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
}
