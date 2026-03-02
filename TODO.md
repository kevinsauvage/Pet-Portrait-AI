### 1. Pre-commit hooks

- **What:** Run lint and type-check before commits.
- **Where:** Root `.husky/`, `package.json`.
- **How:** Add Husky + lint-staged. Run `lint`, `type-check`, and optionally `test` on staged files.
