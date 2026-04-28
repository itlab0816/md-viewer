/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            pre: false,
            code: false,
            'pre code': false,
            'code::before': false,
            'code::after': false,
            strong: false,
            em: false
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
