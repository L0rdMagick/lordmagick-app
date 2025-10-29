import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This makes the 'font-cinzel' utility class available,
        // which we'll use in the layout file.
        cinzel: ["var(--font-cinzel)"],
      },
    },
  },
  plugins: [],
};
export default config;