import { test, expect } from '@playwright/test';

test('health endpoint returns ok with traceId', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.status).toBe('ok');
  expect(typeof json.traceId).toBe('string');
  expect(json.traceId.length).toBeGreaterThan(0);
});

