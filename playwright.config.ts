import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 300_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:43180', trace: 'retain-on-failure' },
  webServer: { command: 'npm run start', url: 'http://127.0.0.1:43180/library', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
