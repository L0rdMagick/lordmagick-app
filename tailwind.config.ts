import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // We no longer need to extend the fontFamily here.
    // The font is now handled directly by the className from next/font.
    extend: {},
  },
  plugins: [],
};
export default config;