/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px -28px rgba(15, 23, 42, 0.55)',
        medium: '0 28px 70px -34px rgba(15, 23, 42, 0.65)',
      },
    },
  },
  plugins: [],
}
