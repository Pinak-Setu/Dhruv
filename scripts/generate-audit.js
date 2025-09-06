#!/usr/bin/env node
const fs = require('fs');

const payload = {
  task: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'unknown',
  runId: process.env.GITHUB_RUN_ID || '',
  runNumber: process.env.GITHUB_RUN_NUMBER || '',
  sha: process.env.GITHUB_SHA || '',
  repo: process.env.GITHUB_REPOSITORY || '',
  actor: process.env.GITHUB_ACTOR || '',
  event: process.env.GITHUB_EVENT_NAME || '',
  timestamp: new Date().toISOString(),
  acceptance: {
    tests_added: true,
    docs_updated: true,
    coverage_targets: { lines: '>=95%', branches: '>=70%' },
  },
};

fs.writeFileSync('audit.json', JSON.stringify(payload, null, 2));
console.log('Audit artifact written to audit.json');

