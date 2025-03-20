/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ECA408',
          50: '#FFF8E6',
          100: '#FEEFC3',
          200: '#FDE29A',
          300: '#FCD56F',
          400: '#FBC748',
          500: '#ECA408', // Color principal
          600: '#BC8306',
          700: '#8B6205',
          800: '#5A4003',
          900: '#2D2001',
        },
        secondary: {
          DEFAULT: '#3498DB',
          50: '#EBF5FB',
          100: '#D6EAF8',
          200: '#AED6F1',
          300: '#85C1E9',
          400: '#5DADE2',
          500: '#3498DB', // Color acento azul
          600: '#2874A6',
          700: '#1F618D',
          800: '#154360',
          900: '#0A2235',
        },
        gray: {
          50: '#F8F9FA', // Gris claro (fondos alternativos)
          100: '#F1F3F5',
          200: '#E9ECEF', // Gris medio (bordes)
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
          950: '#121416',
        },
        text: {
          DEFAULT: '#333333', // Texto principal
          light: '#6C757D',
          lighter: '#ADB5BD',
          dark: '#212529',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'standard': '8px',
      },
      boxShadow: {
        'standard': '0 5px 15px rgba(0, 0, 0, 0.05)',
        'hover': '0 8px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

