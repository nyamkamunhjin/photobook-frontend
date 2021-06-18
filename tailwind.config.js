/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  important: true,
  theme: {
    fontSize: {
      xs: '.65rem',
      sm: '.9rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    extend: {},
    container: {
      center: true,
      padding: '2rem',
    },
    colors: {
      lightblue: colors.lightBlue,
      blue: colors.blue,
      green: colors.green,
      gray: colors.coolGray,
      white: colors.white,
      transparent: colors.transparent,
      black: colors.black,
      red: colors.red,
      yellow: colors.amber,
    },
  },
  variants: {
    extend: {
      borderStyle: ['hover', 'focus'],
      borderWidth: ['hover', 'focus'],
      blur: ['hover', 'focus'],
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-pseudo-elements'),
    plugin(({ addVariant, e }) => {
      addVariant('before', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`before${separator}${className}`)}::before`
        })
      })
      addVariant('after', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`after${separator}${className}`)}::after`
        })
      })
    }),
    plugin(({ addUtilities }) => {
      const contentUtilities = {
        '.content': {
          content: 'attr(data-content)',
        },
        '.content-before': {
          content: 'attr(data-before)',
        },
        '.content-after': {
          content: 'attr(data-after)',
        },
      }

      addUtilities(contentUtilities, ['before', 'after'])
    }),
  ],
}
