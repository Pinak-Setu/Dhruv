/**
 * Legacy Glassmorphic Card Prevention Test
 *
 * This test ensures that no residual 'glassmorphic-card' CSS classes
 * exist in the codebase, enforcing the migration to 'glass-section-card'.
 *
 * Production Ready: Zero violations allowed
 * CI Gate: Fails if any glassmorphic-card classes found
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

describe('Legacy glassmorphic-card prevention', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const testDir = path.join(process.cwd(), 'tests');

  it('no accidental glassmorphic-card in source files', async () => {
    const files = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: srcDir,
      ignore: ['node_modules/**', '.next/**', 'coverage/**']
    });

    const violations: string[] = [];

    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for glassmorphic-card class usage
      if (content.includes('glassmorphic-card')) {
        violations.push(`${file}: contains 'glassmorphic-card' class`);
      }
    }

    expect(violations).toHaveLength(0);

    if (violations.length > 0) {
      console.error('Legacy glassmorphic-card violations found:');
      violations.forEach(violation => console.error(`  - ${violation}`));
    }
  });

  it('no accidental glassmorphic-card in test files', async () => {
    const files = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: testDir,
      ignore: ['node_modules/**', '.next/**', 'coverage/**']
    });

    const violations: string[] = [];

    for (const file of files) {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for glassmorphic-card class usage (except in test files that should contain it)
      const allowedFiles = [
        'no-glassmorphic-card.spec.ts',
        'e2e-glass-migration.spec.ts',
        'verify-theme-consistency.js'
      ];
      if (content.includes('glassmorphic-card') && !allowedFiles.some(allowed => file.includes(allowed))) {
        violations.push(`${file}: contains 'glassmorphic-card' class`);
      }
    }

    expect(violations).toHaveLength(0);

    if (violations.length > 0) {
      console.error('Legacy glassmorphic-card violations found in tests:');
      violations.forEach(violation => console.error(`  - ${violation}`));
    }
  });
});
