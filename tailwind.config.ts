import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#040908',
        surface: '#091412',
        tealAccent: '#20d8bd',
        amberAccent: '#e9a83d',
        violetAccent: '#9b62ff',
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        latin: ['var(--font-jakarta)', 'sans-serif'],
      },
      backgroundImage: {
        'cinematic-grid':
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
