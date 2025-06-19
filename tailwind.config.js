/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'e-bosy-purple': '#7C3AED',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}