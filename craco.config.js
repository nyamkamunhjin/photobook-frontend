const CracoAntDesignPlugin = require('craco-antd')
// craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#4480aa',
          '@link-color': '#4480aa',
          '@pagination-item-size': '40px',
          '@radio-dot-color': '#4480aa',
          '@radio-solid-checked-color': '#4480aa',
          '@radio-dot-disabled-color': '#4480aa',
          '@radio-button-bg': 'tranparent',
          '@radio-button-checked-bg': 'tranparent',
          '@radio-button-color': '#aeaeae',
          '@radio-button-active-color': '#4480aa',
          '@radio-border-width': '0px',
          '@radio-disabled-button-checked-bg': 'tranparent',
          '@font-size-base': '11px',
          '@font-size-sm': '9px',
          '@border-radius': '0.5rem',
        },
      },
    },
  ],
}
