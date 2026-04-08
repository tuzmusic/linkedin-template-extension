/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0073b1',
          dark: '#005885',
        },
        text: {
          primary: '#000',
          secondary: '#666',
          placeholder: '#999',
        },
        bg: {
          light: '#f9f9f9',
          lighter: '#f0f0f0',
          DEFAULT: '#f3f6f8',
        },
        border: {
          DEFAULT: '#ddd',
        },
        state: {
          selected: '#e8f4f8',
          danger: '#cc1016',
          dangerBg: '#fee',
          success: '#057642',
          warning: '#ff8c00',
        },
      },
    },
  },
};
