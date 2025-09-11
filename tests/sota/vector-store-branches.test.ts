import {
  VectorStore,
  VectorStoreConfig,
  initializeVectorStore,
  createPartitionKey,
  parsePartitionKey,
  validateEmbeddingDimension,
  normalizeEmbedding,
} from '@/sota/vector-store/vectorStore';

function uniqueCollection(prefix = 'kb_embed'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

describe('VectorStore branches and utility coverage', () => {
  it('returns false/empty on operations when not connected', async () => {
    const config: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection(),
      dimension: 8,
      partitions: ['place', 'festival'],
    };
    const store = new VectorStore(config);

    // Not initialized
    await expect(store.insert({
      docId: 'x',
      type: 'place',
      text: 'test',
      vector: new Array(8).fill(0.1),
    })).resolves.toBe(false);

    await expect(store.insertBatch([])).resolves.toBe(false);
    await expect(store.search(new Array(8).fill(0.1))).resolves.toEqual([]);
    await expect(store.count()).resolves.toBe(0);
    await expect(store.listPartitions()).resolves.toEqual([]);
    await expect(store.getPartitionStats()).resolves.toEqual([]);
    await expect(store.optimizeIndex()).resolves.toBe(false);
  });

  it('throws on invalid configuration (missing/invalid keys branch)', async () => {
    const badConfig: VectorStoreConfig = {
      host: 'localhost',
      // port missing or falsy will trigger invalid configuration path
      // @ts-expect-error intentional bad config for branch coverage
      port: 0,
      collectionName: '',
      dimension: 8,
      partitions: [],
    };
    const store = new VectorStore(badConfig);
    await expect(store.initialize()).rejects.toThrow(/Invalid configuration|Failed to initialize/);
    expect(store.isConnected()).toBe(false);
  });

  it('is idempotent on repeated initialize against same collection', async () => {
    const name = uniqueCollection('kb_idem');
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: name,
      dimension: 16,
      partitions: ['place'],
    };
    const storeA = new VectorStore(cfg);
    await storeA.initialize();
    expect(storeA.isConnected()).toBe(true);

    // Re-initialize same instance
    await storeA.initialize();
    expect(storeA.isConnected()).toBe(true);

    // New instance same collection (Mock store already has it)
    const storeB = new VectorStore(cfg);
    await storeB.initialize();
    expect(storeB.isConnected()).toBe(true);
  });

  it('replaces existing doc on duplicate insert (existingIndex >= 0 path)', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_dup'),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    const first = {
      docId: 'place:dup',
      type: 'place' as const,
      text: 'पहला',
      vector: new Array(8).fill(0.1),
      metadata: { version: 1 },
    };
    const second = {
      docId: 'place:dup',
      type: 'place' as const,
      text: 'दूसरा',
      vector: new Array(8).fill(0.2),
      metadata: { version: 2 },
    };

    await expect(store.insert(first)).resolves.toBe(true);
    await expect(store.insert(second)).resolves.toBe(true);

    // Should not duplicate
    await expect(store.count('place')).resolves.toBe(1);

    // Search should still return an item for that vector neighborhood
    const results = await store.search(new Array(8).fill(0.2), { partition: 'place', topK: 5 });
    expect(results.length).toBeGreaterThan(0);
  });

  it('searches across all partitions when no partition option is provided', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_all'),
      dimension: 8,
      partitions: ['place', 'festival'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    await store.insert({
      docId: 'place:raipur',
      type: 'place',
      text: 'रायपुर',
      vector: new Array(8).fill(0.3),
    });
    await store.insert({
      docId: 'festival:diwali',
      type: 'festival',
      text: 'दिवाली',
      vector: new Array(8).fill(0.4),
    });

    const results = await store.search(new Array(8).fill(0.3), { topK: 1, threshold: 0.1 });
    expect(results.length).toBe(1);

    // Count without partition should sum across partitions
    const total = await store.count();
    const places = await store.count('place');
    const festivals = await store.count('festival');
    expect(total).toBeGreaterThanOrEqual(places + festivals);
  });

  it('close() sets connected=false and subsequent ops degrade gracefully', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_close'),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();
    expect(store.isConnected()).toBe(true);

    await store.close();
    expect(store.isConnected()).toBe(false);

    await expect(store.optimizeIndex()).resolves.toBe(false);
    await expect(store.search(new Array(8).fill(0.1))).resolves.toEqual([]);
  });

  it('covers utility: create/parse partition keys', () => {
    const key = createPartitionKey('place', 'delhi');
    expect(key).toBe('place:delhi');
    const parsed = parsePartitionKey(key);
    expect(parsed).toEqual({ type: 'place', id: 'delhi' });
  });

  it('covers utility: validateEmbeddingDimension true/false paths', () => {
    const vec = [1, 2, 3];
    expect(validateEmbeddingDimension(vec, 3)).toBe(true);
    expect(validateEmbeddingDimension(vec, 4)).toBe(false);
  });

  it('covers utility: normalizeEmbedding zero vector and non-zero vector branches', () => {
    // Zero magnitude vector: should return as-is
    const zeros = [0, 0, 0];
    const normalizedZeros = normalizeEmbedding(zeros);
    expect(normalizedZeros).toEqual(zeros);

    // Non-zero vector: should be normalized to unit length
    const v = [3, 4];
    const n = normalizeEmbedding(v);
    const magnitude = Math.sqrt(n[0] * n[0] + n[1] * n[1]);
    expect(magnitude).toBeCloseTo(1, 6);
    expect(n[0]).toBeCloseTo(0.6, 6);
    expect(n[1]).toBeCloseTo(0.8, 6);
  });
});
