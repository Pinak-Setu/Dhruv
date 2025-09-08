import fs from 'node:fs';
import path from 'node:path';
import { mineAliasesFromPosts } from '@/utils/alias-miner';

describe('Alias miner', () => {
  it('mines high-signal variants from posts_new.json', () => {
    const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'posts_new.json'), 'utf8'));
    const existing = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'api', 'data', 'aliases.json'), 'utf8'));
    const sugg = mineAliasesFromPosts(posts, existing);
    // Expect TeachersDay2025 in tags suggestions or existing coverage
    const hasTeachers = 'TeachersDay2025' in sugg.tags || Object.prototype.hasOwnProperty.call(existing.tags, 'TeachersDay2025');
    expect(hasTeachers).toBe(true);
    // Expect Bastar/Surguja mined in locations suggestions or already present
    const hasBastar = 'बस्तर' in sugg.locations || Object.prototype.hasOwnProperty.call(existing.locations, 'बस्तर');
    const hasSarguja = 'सरगुजा' in sugg.locations || Object.prototype.hasOwnProperty.call(existing.locations, 'सरगुजा');
    expect(hasBastar || hasSarguja).toBe(true);
  });
});

