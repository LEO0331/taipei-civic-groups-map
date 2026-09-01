import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT ?? '4317';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}/taipei-civic-groups-map/`,
    channel: process.env.CI ? undefined : 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/taipei-civic-groups-map/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
