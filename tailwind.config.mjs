/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#123447',
        cream: '#f7f2e7',
        paper: '#fffaf0',
        safety: '#f68a3c',
        pine: '#2f6f76',
        rust: '#a43c2c',
      },
      fontFamily: {
        display: ['Bebas Neue', 'Arial Narrow', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hard: '8px 8px 0 #123447',
        'hard-small': '4px 4px 0 #123447',
      },
    },
  },
  plugins: [],
};
