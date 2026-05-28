import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS configuration for Sooqly multi‑vendor e‑commerce frontend.
 *
 * - Uses JIT mode (default in Tailwind v4).
 * - Enables dark mode based on class strategy.
 * - Adds custom color palette matching the brand specification.
 * - Configures the content paths for Next.js App Router.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',   // primary
        gold: '#F4A92A',   // accent
        trust: '#1A5FA8', // secondary
        teal: '#0F6E56',  // success
        coral: '#E05A2B', // danger
        surface: '#F8F6F2', // background
      },
    },
  },
  plugins: [],
};

export default config;
