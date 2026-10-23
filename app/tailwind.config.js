/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vermelho: '#B3261E',
        oliva: { DEFAULT: '#2F4F3A', escuro: '#243D2D', claro: '#E6EDE7' },
        dourado: { DEFAULT: '#C9A227', claro: '#E9C95A' },
        creme: { DEFAULT: '#FBF6EE', escuro: '#F1E7D6' },
        grafite: '#2B2B2B',
        cta: { DEFAULT: '#2E9E4F', escuro: '#1F7438' },
      },
      fontFamily: {
        titulo: ['"Playfair Display"', 'Georgia', 'serif'],
        corpo: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cartao: '0 6px 18px rgba(36,28,16,.10), 0 1px 3px rgba(36,28,16,.08)',
      },
    },
  },
  plugins: [],
};
