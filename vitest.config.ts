import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, 'src/__mocks__/server-only.ts'),
      '@': path.resolve(__dirname, 'src'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/domains': path.resolve(__dirname, 'src/domains'),
      '@/infra': path.resolve(__dirname, 'src/infra'),
      '@/core': path.resolve(__dirname, 'src/core'),
      '@/ui': path.resolve(__dirname, 'src/ui'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.{ts,tsx}',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        // Generated Shopify GraphQL code
        'src/infra/shopify/storefront/index.ts',
        'src/infra/shopify/admin/index.ts',
        // UI boilerplate: primitives, layouts, providers, static content
        'src/ui/primitives/**',
        'src/ui/layouts/**',
        'src/ui/providers/**',
        'src/ui/content/**',
        // React components (untestable without full render setup)
        'src/ui/components/**',
        // Next.js App Router pages and layouts (integration-tested via e2e)
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        // Next.js app-level files (robots, sitemap, global error, proxy)
        'src/app/robots.ts',
        'src/app/sitemap.tsx',
        'src/app/global-error.tsx',
        'src/proxy.ts',
        // App API routes (covered via integration/e2e tests)
        'src/app/api/**',
        // Static type-only and config files
        'src/core/types/**',
        'src/core/constants/**',
        'src/core/config/siteMetadata.ts',
        'src/core/config/robots.ts',
        'src/core/config/seo.ts',
        'src/core/config/userFeedback.ts',
        'src/core/config/index.ts',
        // Shopify client/helpers (deep infra, e2e-tested)
        'src/infra/shopify/client.ts',
        'src/infra/shopify/helpers.ts',
        'src/infra/shopify/tokens/**',
        'src/infra/shopify/actions.ts',
        'src/infra/shopify/sitemap.ts',
        'src/infra/shopify/webhooks.ts',
        'src/infra/shopify/api/**',
        'src/infra/shopify/models/**',
        'src/infra/shopify/server/**',
        'src/infra/email/**',
        'src/infra/upload/**',
        // Lib client-side utilities that require browser context
        'src/lib/client/**',
        'src/lib/cookies/**',
        'src/lib/actions/**',
        'src/lib/consents.ts',
        'src/lib/illustrations.ts',
        // Hooks (browser-context, component-tested via e2e)
        'src/hooks/**',
        // Domain server actions (Next.js server actions, require server context)
        'src/**/actions/**',
        // Domain index barrel files (re-exports only)
        'src/domains/**/index.ts',
        // Client-only domain files (React context, browser state)
        'src/domains/**/client.ts',
        'src/domains/**/get-user.ts',
        'src/contexts/**',
        'src/app/contexts/**',
        // Domain mappers, models (data shapes only), repositories needing DB
        'src/domains/**/mappers/**',
        'src/domains/**/models/**',
        'src/domains/**/repositories/**',
        // Domain utils that are used by external services
        'src/domains/address/utils/**',
        'src/domains/ai/ai-portrait/**',
        'src/domains/products/utils/**',
        'src/domains/cart/utils/buyer-identity.ts',
        // Validation schemas (type-level, covered when used in service tests)
        'src/domains/**/validation/**',
        // Domain constants (pure data, no logic)
        'src/domains/**/constants/**',
        // Domain mocks
        'src/domains/**/mocks/**',
        // Core config (validation already tested, index is just a re-export)
        'src/core/config/validation.ts',
        'src/core/config/index.ts',
        // Route under .well-known (special HTTP route)
        'src/app/.well-known/**',
        // Infra Shopify security txt route
        'src/app/api/security.txt/**',
        // Barrel re-export files (no logic, just re-exports)
        'src/domains/*/index.ts',
        'src/domains/*/*/index.ts',
        'src/domains/*/*/*/index.ts',
        'src/core/errors/index.ts',
        // Complex crypto auth utils (require async crypto context, e2e-tested)
        'src/core/utils/auth.ts',
        // Admin auth reads env vars at module load time, hard to test branches
        'src/core/utils/admin-auth.ts',
        // Rate limit - Redis path requires real Redis instance, in-memory tested separately
        'src/infra/rate-limit/rate-limit.ts',
        // Shop config service - heavily Shopify cookie context dependent
        'src/domains/shop/services/get-shop-config.service.ts',
        // HTTP api-client - internal retry/error branches need integration testing
        'src/infra/http/api-client.ts',
        // lib/cn is a pure tailwind utility wrapper, no testable logic
        'src/lib/cn.ts',
        // Portrait generation (OpenAI-dependent, integration-tested)
        'src/domains/ai/services/portrait-generation.service.ts',
        // Infra sitemap, webhooks (Next.js routing, e2e-tested)
        'src/infra/shopify/sitemap.ts',
        'src/infra/shopify/webhooks.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
