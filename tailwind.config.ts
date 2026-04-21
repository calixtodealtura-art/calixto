import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta oficial Calixto ──────────────────────────
        green: {
          deep:  '#18532c',   // Color principal
          mid:   '#1a4a28',   // Variante oscura
          olive: '#2d6b42',   // Variante media
          sage:  '#5a9470',   // Variante clara
        },
        orange: {
          DEFAULT: '#ed832b', // Color secundario cálido
          dark:    '#c96a1a', // Variante oscura
          light:   '#f5a85c', // Variante clara
        },
        red: {
          brand:   '#8f2412', // Color secundario intenso
          light:   '#b84030', // Variante clara
        },
        cream: {
          DEFAULT: '#fff0dc', // Color secundario neutro
          warm:    '#f5e4c8', // Variante más oscura
        },
        gray: {
          stone:   '#b2bcc2', // Neutro del manual
        },
        terra:   '#8f2412',   // Alias para compatibilidad
        gold: {
          DEFAULT: '#ed832b', // Remapeado al naranja de la marca
          light:   '#f5a85c',
        },
        ivory: '#fdfaf5',
      },
      fontFamily: {
        // Lora es la tipografía corporativa oficial de Calixto
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        sans:  ['var(--font-lora)', 'Georgia', 'serif'],
      },
      animation: {
        'float':     'float 4s ease-in-out infinite',
        'fade-up':   'fadeUp 0.6s ease both',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config