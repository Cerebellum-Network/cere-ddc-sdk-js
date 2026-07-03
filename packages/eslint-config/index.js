module.exports = {
  env: {
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',

  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/no-extraneous-dependencies': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    'import/no-unresolved': 'off', // Disable due to ts paths configuration
  },
};
