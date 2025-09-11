/**
 * Task: Add targeted embeddingNormalizer tests to exercise diacritic-strip/segment branches
 * Scope: tests only — no implementation changes
 */

import { normalizeForEmbedding } from '@/sota/embeddings/embeddingNormalizer';

function hasVariant(variants: string[], needle: RegExp | string): boolean {
  if (typeof needle === 'string') {
    return variants.includes(needle);
  }
  return variants.some((v) => needle.test(v));
}

describe('Embedding Normalizer — diacritic strip and segment branches', () => {
  test('diacritic stripping + schwa reduction reflected in latinCanonical and variants (ज़िला)', () => {
    const r = normalizeForEmbedding('ज़िला');

    // latinCanonical should be lowercase, diacritics stripped, and schwa-reduced (no trailing "a")
    expect(r.latinCanonical).toMatch(/^jil/);
    expect(r.latinCanonical.endsWith('a')).toBe(false);

    // Variants should include the plain diacritic-stripped transliteration and the reduced form
    // Plain diacritic-stripped: "jila"
    expect(hasVariant(r.variants, 'jila')).toBe(true);
    // Reduced (often latinCanonical): starts with "jil" and no trailing "a"
    expect(hasVariant(r.variants, /^jil(?!a$)/)).toBe(true);
  });

  test('segment extraction adds per-segment latin variants (em dash separator)', () => {
    // Em dash triggers segment branch; both segments should contribute latin variants
    const r = normalizeForEmbedding('रायपुर—दीपावली');

    // Expect latin plain forms for each segment
    expect(hasVariant(r.variants, 'raipur')).toBe(true);
    expect(hasVariant(r.variants, 'dipavali')).toBe(true);
  });

  test('segment extraction includes both plain and reduced forms when different (खरसिया-दीपावली)', () => {
    // "खरसिया" transliterates to "Kharsiyā" -> plain "kharsiya" -> reduced "kharsiy"
    const r = normalizeForEmbedding('खरसिया-दीपावली');

    // For segment "खरसिया"
    expect(hasVariant(r.variants, 'kharsiya')).toBe(true); // plain (diacritics stripped)
    expect(hasVariant(r.variants, 'kharsiy')).toBe(true); // schwa-reduced alias

    // For segment "दीपावली"
    expect(hasVariant(r.variants, 'dipavali')).toBe(true); // plain (diacritics stripped)
  });
});
