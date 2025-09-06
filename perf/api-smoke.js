import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 10,
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  const res = http.get(`${base}/api/health`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'ok payload': (r) => r.json('status') === 'ok',
  });
  sleep(0.2);
}

