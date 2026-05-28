import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',   // primary
        gold: '#F4A92A',   // accent
        trust: '#1A5FA8',  // secondary
        teal: '#0F6E56',   // success
        coral: '#E05A2B',  // danger
        surface: '#F8F6F2',// background
      },
    },
  },
  plugins: [],
} as const;

export default config;
