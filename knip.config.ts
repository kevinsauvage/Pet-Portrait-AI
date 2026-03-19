import type { KnipConfig } from 'knip';

/**
 * Next.js Knip plugin only treats sitemap/robots/manifest as `{js,ts}` by default.
 * This project uses `sitemap.tsx`; overriding `next.entry` requires repeating the full set.
 * @see https://knip.dev/reference/plugins/next
 */
const PAGE_EXT = '{js,jsx,ts,tsx}';

const nextEntry: string[] = [
  `app/{,[(]*[)]/}{manifest,robots}.${PAGE_EXT}`,
  `src/app/{,[(]*[)]/}{manifest,robots}.${PAGE_EXT}`,
  `app/**/sitemap.${PAGE_EXT}`,
  `src/app/**/sitemap.${PAGE_EXT}`,
  `app/**/{icon,apple-icon,opengraph-image,twitter-image}.${PAGE_EXT}`,
  `src/app/**/{icon,apple-icon,opengraph-image,twitter-image}.${PAGE_EXT}`,
  `{instrumentation,instrumentation-client,middleware,proxy}.${PAGE_EXT}`,
  `src/{instrumentation,instrumentation-client,middleware,proxy}.${PAGE_EXT}`,
  `app/global-{error,not-found}.${PAGE_EXT}`,
  `src/app/global-{error,not-found}.${PAGE_EXT}`,
  `app/**/{default,error,forbidden,loading,not-found,unauthorized}.${PAGE_EXT}`,
  `src/app/**/{default,error,forbidden,loading,not-found,unauthorized}.${PAGE_EXT}`,
  `app/**/{layout,page,route,template}.${PAGE_EXT}`,
  `src/app/**/{layout,page,route,template}.${PAGE_EXT}`,
  `pages/**/*.${PAGE_EXT}`,
  `src/pages/**/*.${PAGE_EXT}`,
];

const config: KnipConfig = {
  // Unused export/type reports are dominated by barrels, domain “public” APIs, and
  // shadcn-style primitive re-exports. Use `npx knip --include exports,types` when
  // you want a stricter audit.
  exclude: ['exports', 'types'],
  // Codegen configs, Vitest, Playwright, Sentry, and bin/run-codegen are already
  // picked up via package.json scripts and their plugins—extra entry globs only
  // duplicate that and trigger Knip configuration hints.
  ignoreDependencies: [
    // GraphQL Code Generator plugin names in codegen.*.ts (not import specifiers)
    '@graphql-codegen/typescript',
    '@graphql-codegen/typescript-graphql-request',
    '@graphql-codegen/typescript-operations',
    // ESLint: FlatCompat `extends: ['prettier', 'plugin:import/...']` etc. (string refs)
    'eslint-config-next',
    'eslint-config-prettier',
    'eslint-import-resolver-alias',
    'eslint-plugin-css-modules',
    'eslint-plugin-import',
    'eslint-plugin-prettier',
    'eslint-plugin-sort-keys',
    'prettier',
    // Stylelint: .stylelintrc.json extends / plugins (no JS require graph)
    'stylelint-checkstyle-formatter',
    'stylelint-scss',
  ],
  ignoreIssues: {
    'src/infra/shopify/generated/**': ['exports', 'types', 'classMembers', 'enumMembers'],
  },
  next: {
    config: ['next.config.ts'],
    entry: nextEntry,
  },
};

export default config;
