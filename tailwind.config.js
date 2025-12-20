/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arctic: {
          900: 'hsl(220 25% 4%)',
          800: 'hsl(220 20% 8%)',
          700: 'hsl(220 15% 12%)',
        },
        primary: {
          DEFAULT: 'hsl(168 76% 59%)',
          foreground: 'hsl(0 0% 100%)',
        },
        accent: {
          DEFAULT: 'hsl(189 94% 55%)',
          foreground: 'hsl(0 0% 100%)',
        },
      },
      fontFamily: {
        sans: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
