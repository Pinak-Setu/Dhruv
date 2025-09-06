#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = require('minimist')(process.argv.slice(2));
const taskId = args.task;
if (!taskId) {
  console.error('Usage: node scripts/update-todo.js --task P1-06');
  process.exit(1);
}

const file = path.join(process.cwd(), 'TODO_PHASE1.md');
if (!fs.existsSync(file)) {
  console.error('TODO file not found:', file);
  process.exit(1);
}

const now = new Date().toISOString();
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
  new RegExp(`^(- \[ \] ${taskId}:[^\n]*?)$`, 'm'),
  `$1` // leave untouched if still pending (not matching our format)
);

// Mark in-progress to completed or pending to completed
text = text.replace(
  new RegExp(`^- \[~\] (${taskId}:[^\n]*?)\s*(\(started:[^\)]*\))?`, 'm'),
  (_m, p1) => `- [x] ${p1} (completed: ${now})`
);
text = text.replace(
  new RegExp(`^- \[ \] (${taskId}:[^\n]*?)\s*(\(created:[^\)]*\))?`, 'm'),
  (_m, p1) => `- [x] ${p1} (completed: ${now})`
);

// Update header timestamp
text = text.replace(
  /(Last Updated:\s*)(.*)/,
  (_m, pfx) => `${pfx}${now}`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Updated TODO for', taskId);

