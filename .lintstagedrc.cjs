module.exports = {
  // Run ESLint and TypeScript on the whole project; lint-staged won't append file args here.
  '*.{js,jsx,ts,tsx}': () => ['yarn lint-fix', 'yarn type-check'],
  '*.{css,scss}': ['yarn lint:css:fix'],
};
