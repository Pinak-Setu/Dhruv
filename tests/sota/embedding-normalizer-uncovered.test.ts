/**
 * Embedding Normalizer — uncovered branches for post-processing fixes
 *
 * Focus:
 *  - Capitalization of first Latin character in transliteration
 *  - Post-replacements for "Jila" -> "Jilā" and ensuring no "Zila"/"Jiala" remnants
 *
 * Scope: tests only; no implementation changes.
 */

import { normalizeForEmbedding } from '@/sota/embeddings/embeddingNormalizer';

describe('Embedding Normalizer — post-processing replacements and capitalization', () => {
  test('capitalizes first Latin char in transliteration (e.g., दीपावली -> Dīpāvalī)', () => {
    const r = normalizeForEmbedding('दीपावली');
    // Transliteration output should start with an uppercase Latin letter
    expect(r.transliteration.text[0]).toMatch(/[A-Z]/);
    // Variants should contain lowercase transliteration form
    expect(r.variants).toContain(r.transliteration.text.toLowerCase());
    // Sanity check on expected canonical transliteration form
    expect(r.transliteration.text).toMatch(/^Dīpāvalī$/);
  });

  test('replaces terminal "Jila" to "Jilā" for ज़िला (decomposed form variant)', () => {
    const r = normalizeForEmbedding('ज़िला'); // ज + nukta + ि + ला
    // Must not end with "Jila" — post-processing should force long "ā"
    expect(r.transliteration.text).not.toMatch(/Jila$/);
    expect(r.transliteration.text).toMatch(/^Jilā$/i);

    // Variants should include lowercase transliteration form for search invariants
    expect(r.variants).toContain('jilā');

    // Ensure there are no stale intermediate variants like "jiala" or "zila"
    const variantsLower = r.variants.map((v) => v.toLowerCase());
    expect(variantsLower).not.toContain('jiala');
    expect(variantsLower).not.toContain('zila');
  });

  test('replaces terminal "Jila" to "Jilā" for ज़िला (precomposed nukta form)', () => {
    const r = normalizeForEmbedding('ज़िला'); // precomposed nukta "ज़"
    expect(r.transliteration.text).toMatch(/^Jilā$/i);
    expect(r.transliteration.text).not.toMatch(/Jila$/);
    expect(r.variants).toContain('jilā');

    const variantsLower = r.variants.map((v) => v.toLowerCase());
    expect(variantsLower).not.toContain('jiala');
    expect(variantsLower).not.toContain('zila');
  });

  test('ensures no residual "Zila"/"Jiala"/"Zaila" variants appear post-replacements', () => {
    // Use another token that forces nukta handling and diacritic processing path
    const r = normalizeForEmbedding('ज़िला');
    const allLower = [
      r.transliteration.text.toLowerCase(),
      ...r.variants.map((v) => v.toLowerCase()),
    ];
    // Guard against any missed post-processing branches
    expect(allLower.some((v) => /zila|jiala|zaila/.test(v))).toBe(false);
  });
});
