module.exports = {
  extends: ['./base.js'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    // Basic React/JSX rules without requiring plugins
    'no-undef': 'off', // TypeScript handles this
    'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
    '@typescript-eslint/no-unused-vars': 'warn', // Make unused vars warnings instead of errors
    '@typescript-eslint/no-explicit-any': 'warn', // Make any types warnings instead of errors
    'no-case-declarations': 'off', // Allow declarations in case blocks
    'no-self-assign': 'warn', // Make self-assign warnings instead of errors
    'no-useless-escape': 'warn', // Make useless escape warnings instead of errors
    'no-redeclare': 'warn', // Make redeclare warnings instead of errors
  },
};
