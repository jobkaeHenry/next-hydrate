import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'test-app/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vitest.setup.ts',
      ],
    },
    // Optimize test performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Improve test isolation
    clearMocks: true,
    restoreMocks: true,
  },
});
