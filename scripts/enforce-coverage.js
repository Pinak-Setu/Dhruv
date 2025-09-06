#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getArg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return Number(process.argv[i + 1]);
  return def;
}

const linesTarget = getArg('lines', 95);
const branchesTarget = getArg('branches', 70);
const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

if (!fs.existsSync(summaryPath)) {
  console.error('coverage-summary.json not found at', summaryPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const totals = data.total || {};
const lines = totals.lines?.pct ?? 0;
const branches = totals.branches?.pct ?? 0;

const ok = lines >= linesTarget && branches >= branchesTarget;
console.log(`Coverage lines=${lines}% (target ${linesTarget}%), branches=${branches}% (target ${branchesTarget}%)`);
if (!ok) {
  console.error('Coverage gate failed.');
  process.exit(1);
}

