/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-flipping neutrals (channels in :root / .dark — see global.css)
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        // Per-source palette (Okabe–Ito, colorblind-safe). Never the only encoding.
        source: {
          cpsc: '#0072B2',
          fda: '#D55E00',
          usda: '#009E73',
          nhtsa: '#CC79A7',
          uscg: '#56B4E9',
        },
        // Lifecycle status (tri-state: CPSC/NHTSA carry no lifecycle -> "unknown")
        status: {
          active: '#b91c1c',
          inactive: '#475569',
          unknown: '#9ca3af',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: { prose: '70ch' },
    },
  },
  plugins: [],
};
