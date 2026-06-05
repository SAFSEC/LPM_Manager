/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        accent: '#d4a017',
        surface: '#f8f9fa',
        stable: '#22c55e',
        restricted: '#eab308',
        unstable: '#ef4444',
        na: '#94a3b8',
      },
    },
  },
  plugins: [],
};
