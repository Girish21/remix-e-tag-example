module.exports = {
  mode: 'jit',
  purge: ['./app/**/*.tsx'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
