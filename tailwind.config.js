// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Desaturated
        indigo: {
          100: '#e8e9f3',
          300: '#b4b8db',
          500: '#6b73a3',
          700: '#4a5178',
          900: '#2d3251',
        },
        teal: {
          100: '#e0f2f1',
          300: '#a5d6d0',
          500: '#5a9b94',
          700: '#3d6b66',
          900: '#254240',
        },
        sky: {
          100: '#e3f2fd',
          300: '#a8d4f0',
          500: '#5ba3d4',
          700: '#3c7099',
          900: '#24455f',
        },
        magenta: {
          100: '#f3e5f5',
          300: '#d4a8da',
          500: '#a366a8',
          700: '#734575',
          900: '#462a48',
        },
        jungle: {
          100: '#e8f5e8',
          300: '#b8d4b8',
          500: '#6b9b6b',
          700: '#4a6b4a',
          900: '#2d4a2d',
        },
        // Neutrals - Charcoal Based
        charcoal: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0e1a',
        },
        // Accent Colors
        gold: {
          100: '#fef3e2',
          300: '#f6d186',
          500: '#d4af37',
          700: '#b8941f',
          900: '#8b6914',
        },
        silver: {
          100: '#f1f5f9',
          300: '#cbd5e1',
          500: '#94a3b8',
          700: '#64748b',
          900: '#334155',
        },
        // Semantic colors
        primary: '#6b73a3',
        secondary: '#5a9b94',
        accent: '#d4af37',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}