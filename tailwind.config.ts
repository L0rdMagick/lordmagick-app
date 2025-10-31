import type { Config } from "tailwindcss";

const config: Config = {
  // @ts-ignore - This is a valid property, but the project's type definitions are not picking it up.
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
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;