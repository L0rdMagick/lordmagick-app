import type { Config } from "tailwindcss";

const config: Config = {
  // @ts-ignore - This is a valid TailwindCSS property.
  // This comment forces TypeScript to ignore the error below.
  safelist: [
    'prose-lg',
    'prose-xl',
    'prose-2xl',
  ],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        medieval: ['var(--font-medieval)'],
        cinzel: ['var(--font-cinzel)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;