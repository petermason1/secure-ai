import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './public/**/*.{html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

