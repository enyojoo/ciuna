module.exports = {
  extends: ['./base.js'],
  env: {
    'react-native/react-native': true,
  },
  plugins: ['react-native'],
  rules: {
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/no-single-element-style-arrays': 'error',
  },
};
