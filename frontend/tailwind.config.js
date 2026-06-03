module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#2D3436',
          100: '#2D3436',
          200: '#2D3436',
          300: '#5E6A6E',
          400: '#5E6A6E',
          500: '#8D9698',
          600: '#8D9698',
          700: '#EAE5DF',
          800: '#EAE5DF',
          900: '#FFFFFF',
          950: '#FAF8F4',
        },
        emerald: {
          300: '#c5d9c0',
          400: '#A8C3A0',
          500: '#8BA983',
          600: '#718d6a',
          950: '#F5F2ED',
        },
        cyan: {
          300: '#f1cca7',
          400: '#E9B384',
          500: '#d09869',
          950: '#fbf5ee',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
