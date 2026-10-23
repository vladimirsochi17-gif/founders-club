import { defineConfig } from 'vitest/config';

const database = process.env.TEST_DATABASE_URL || 'postgres://founders:founders_local@localhost:54329/founders_club_test';
if (!new URL(database).pathname.endsWith('_test')) throw new Error('Tests require a dedicated database ending in _test');

export default defineConfig({
  test: {
    environment: 'node',
    env: { NODE_ENV: 'test', DATABASE_URL: database, UPLOAD_DIR: './data/test-uploads', LOCAL_AUTH_DEV_CODE: '123456', PAYMENTS_MODE: 'mock' },
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000,
    coverage: { reporter: ['text', 'html'] },
  },
});
