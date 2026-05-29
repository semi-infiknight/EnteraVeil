const defaultTheme = require('tailwindcss/defaultTheme')

const fontFamily = {
  sans: ['var(--font-body)', 'Inter', ...defaultTheme.fontFamily.sans],
  body: ['var(--font-body)', 'Inter', ...defaultTheme.fontFamily.sans],
  heading: [
    'var(--font-heading)',
    'Space Grotesk',
    ...defaultTheme.fontFamily.sans,
  ],
  display: [
    'var(--font-display)',
    'Bricolage Grotesque',
    'var(--font-heading)',
    ...defaultTheme.fontFamily.sans,
  ],
  mono: [
    'var(--font-mono)',
    'JetBrains Mono',
    ...defaultTheme.fontFamily.mono,
  ],
}

const fontSize = {
  sm: ['0.75rem', { lineHeight: '1.25rem' }],
  md: ['0.875rem', { lineHeight: '1.375rem' }],
  lg: ['1rem', { lineHeight: '1.5rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['2rem', { lineHeight: '2.5rem' }],
  '4xl': ['2.5rem', { lineHeight: '3rem' }],
  '5xl': ['3rem', { lineHeight: '3.5rem' }],
  // Editorial poster scale — used by ev-display hero/section titles
  '6xl': ['3.75rem', { lineHeight: '0.95' }],
  '7xl': ['4.5rem', { lineHeight: '0.92' }],
  '8xl': ['6rem', { lineHeight: '0.88' }],
  '9xl': ['8rem', { lineHeight: '0.86' }],
  '10xl': ['10rem', { lineHeight: '0.84' }],
}

module.exports = { fontFamily, fontSize }
