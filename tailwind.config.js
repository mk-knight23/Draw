/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#050505',
          card: '#111114',
          primary: '#3b82f6',
          accent: '#10b981',
          border: '#1f1f23',
          canvas: '#1a1a1f'
        }
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
