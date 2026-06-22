import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#FDECE8',
          500: '#E86B4A',
          600: '#D45A3A',
        },
        neutral: {
          0: '#FFFFFF',
          100: '#F5F5F5',
          200: '#E8E8E8',
          500: '#8A8A8A',
          700: '#4A4A4A',
          900: '#1A1A1A',
        },
        success: { 500: '#22A06B' },
        warning: { 500: '#E5A100' },
        error: { 500: '#D14343' },
        info: { 500: '#3B82F6' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '220px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(26, 26, 26, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
