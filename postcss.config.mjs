/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This now correctly points to the new package Vercel requires
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;