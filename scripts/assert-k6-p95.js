#!/usr/bin/env node
const fs = require('fs');

function getArg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

const max = Number(getArg('max', 300));
const summary = getArg('summary', 'k6-summary.json');

if (!fs.existsSync(summary)) {
  console.error('k6 summary not found:', summary);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summary, 'utf8'));
const httpReq = data.metrics && data.metrics['http_req_duration'];
const p95 = httpReq && httpReq['p(95)'];

console.log('k6 p95:', p95, 'ms (limit', max, 'ms)');
if (typeof p95 !== 'number' || p95 > max) {
  console.error('Performance budget failed: p95 >', max);
  process.exit(1);
}

