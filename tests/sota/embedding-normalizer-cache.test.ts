/**
 * Embedding Normalizer Cache Tests
 *
 * Goal:
 *  - Cover cache hit branch in normalizeForEmbeddingCached()
 *  - Verify deep-copy behavior for returned objects (variants array and transliteration object)
 *
 * Scope: tests only, no implementation changes.
 */

import {
  normalizeForEmbeddingCached,
  type EmbeddingNormalized,
} from '@/sota/embeddings/embeddingNormalizer';

describe('Embedding Normalizer — cache behavior and deep copy', () => {
  test('repeated calls return identical content but different object references (cache hit)', () => {
    const token = 'ज़िला'; // nukta-bearing word

    const a: EmbeddingNormalized = normalizeForEmbeddingCached(token);
    const b: EmbeddingNormalized = normalizeForEmbeddingCached(token); // should hit cache

    // Content parity
    expect(b).toEqual(a);

    // Distinct top-level object (deep copy on return)
    expect(b).not.toBe(a);

    // Distinct nested objects/arrays to prevent external mutation side-effects
    expect(b.transliteration).not.toBe(a.transliteration);
    expect(b.variants).not.toBe(a.variants);
  });

  test('mutating returned object does not affect cache contents (deep copy enforced)', () => {
    const token = 'ज़िला';

    const first = normalizeForEmbeddingCached(token);

    // Mutate returned object's variants and transliteration (should not impact cache)
    const injected = 'custom-variant-123';
    first.variants.push(injected);
    first.transliteration.text = 'CHANGED';

    // Re-fetch; should reflect original (cached) content, not the external mutations
    const again = normalizeForEmbeddingCached(token);

    // Ensure the injected variant is not present
    expect(again.variants).not.toContain(injected);

    // Ensure transliteration text did not change to mutated value
    expect(again.transliteration.text).not.toBe('CHANGED');

    // Still, objects are deep-copied on each call
    expect(again).not.toBe(first);
    expect(again.transliteration).not.toBe(first.transliteration);
    expect(again.variants).not.toBe(first.variants);
  });

  test('composed vs decomposed nukta forms collide in cache key (cache hit path observable)', () => {
    // Precomposed vs decomposed: both should map to same canonical cache key
    const composedInput = 'क़िला'; // precomposed nukta
    const decomposedInput = 'क़िला'; // decomposed nukta

    const composed = normalizeForEmbeddingCached(composedInput);
    const decomposed = normalizeForEmbeddingCached(decomposedInput); // should hit the composed cache entry

    // Hash and folded must match
    expect(decomposed.hash).toBe(composed.hash);
    expect(decomposed.folded).toBe(composed.folded);

    // Because the cached entry is based on the first call (composedInput),
    // the second call returns a clone of the cached object; original will match the first input.
    // This also evidences a cache hit (not recomputed with the second input).
    expect(decomposed.original).toBe(composed.original);

    // Deep copy guarantees: distinct instances and nested clones
    expect(decomposed).not.toBe(composed);
    expect(decomposed.transliteration).not.toBe(composed.transliteration);
    expect(decomposed.variants).not.toBe(composed.variants);
  });
});
