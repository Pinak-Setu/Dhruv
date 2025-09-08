import fs from 'node:fs';
import path from 'node:path';
import { buildSearchKeys } from '@/utils/tag-search';

type Post = { id: string | number; timestamp: string; content: string };

type AliasesJSON = {
  version: number;
  tags: Record<string, { variants: string[] }>;
  locations: Record<string, { variants: string[] }>;
};

type Suggestions = {
  tags: Record<string, { variants: string[] }>;
  locations: Record<string, { variants: string[] }>;
};

const HASHTAG_REGEX = /#[^\s#]+/g;
const PLACE_REGEX = /(नई दिल्ली|नयी दिल्ली|रायगढ़|दिल्ली|रायपुर|भारत|छत्तीसगढ़|खरसिया|गढ़ उमरिया|बस्तर|सरगुजा|जशपुर|बगीचा)/g;

function toKey(s: string) {
  return s.replace(/^([#@])/, '').trim().toLowerCase();
}

function addVariants(canonical: string, variants: Set<string>, existing?: string[]) {
  const out = new Set<string>(variants);
  out.delete('');
  out.delete(toKey(canonical));
  for (const v of existing || []) out.delete(toKey(v));
  // prune too-short/noisy
  return Array.from(out).filter((v) => v.length >= 2).slice(0, 20);
}

export function mineAliasesFromPosts(posts: Post[], existing: AliasesJSON): Suggestions {
  const tagCounts = new Map<string, number>();
  const placeCounts = new Map<string, number>();

  for (const p of posts) {
    const hashtags = p.content.match(HASHTAG_REGEX) || [];
    for (const h of hashtags) tagCounts.set(h, (tagCounts.get(h) || 0) + 1);
    const places = p.content.match(PLACE_REGEX) || [];
    for (const w of places) placeCounts.set(w, (placeCounts.get(w) || 0) + 1);
  }

  const tags: Suggestions['tags'] = {};
  const locations: Suggestions['locations'] = {};

  // Mine tags
  for (const [raw] of Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])) {
    const canonical = raw.replace(/^#/, '');
    const keys = buildSearchKeys(raw);
    const existingPayload = existing.tags[canonical];
    const existingVariants = existingPayload?.variants || [];
    const variants = addVariants(canonical, new Set(Array.from(keys).map(toKey)), existingVariants);
    if (variants.length) tags[canonical] = { variants };
  }

  // Mine locations
  for (const [raw] of Array.from(placeCounts.entries()).sort((a, b) => b[1] - a[1])) {
    const canonical = raw;
    const keys = buildSearchKeys(raw);
    const existingPayload = existing.locations[canonical];
    const existingVariants = existingPayload?.variants || [];
    const variants = addVariants(canonical, new Set(Array.from(keys).map(toKey)), existingVariants);
    if (variants.length) locations[canonical] = { variants };
  }

  return { tags, locations };
}

export function mineFromRepo(): Suggestions {
  const postsPath = path.join(process.cwd(), 'data', 'posts_new.json');
  const aliasesPath = path.join(process.cwd(), 'api', 'data', 'aliases.json');
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8')) as Post[];
  const existing = JSON.parse(fs.readFileSync(aliasesPath, 'utf8')) as AliasesJSON;
  return mineAliasesFromPosts(posts, existing);
}

