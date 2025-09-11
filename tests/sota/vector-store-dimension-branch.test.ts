import { VectorStore, type VectorStoreConfig } from '@/sota/vector-store/vectorStore';

function uniqueCollection(prefix = 'kb_dim'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

describe('VectorStore — dimension mismatch branch', () => {
  it('returns empty results when query vector dimension mismatches and threshold > 0 (cosineSimilarity -> 0, filtered)', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection(),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    // Insert a single item with correct dimension (8)
    await store.insert({
      docId: 'place:dim-ok',
      type: 'place',
      text: 'dimension-ok',
      vector: [0.1, 0.2, 0.3, 0.4, 0.0, 0.1, 0.0, 0.2],
    });

    // Search with mismatched query dimension (4) so cosineSimilarity() returns 0
    // Threshold > 0 should filter out score 0 results
    const mismatchedQuery = [1, 0, 0, 0]; // length 4 instead of 8
    const results = await store.search(mismatchedQuery, { topK: 5, threshold: 0.1 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('includes results with score 0 when threshold is 0 despite dimension mismatch (verifies zero-score path)', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_dim_zero'),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    await store.insert({
      docId: 'place:zero-score',
      type: 'place',
      text: 'zero-score-candidate',
      vector: [0.5, 0.4, 0.3, 0.2, 0.1, 0, 0, 0],
    });

    // Mismatched query dimension → cosineSimilarity returns 0
    // With threshold 0, a zero score should be included in results
    const mismatchedQuery = [0, 0, 1, 0]; // length 4
    const results = await store.search(mismatchedQuery, { topK: 3, threshold: 0 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].docId).toBe('place:zero-score');
    expect(results[0].score).toBe(0);
  });
});
