import {
  VectorStore,
  VectorStoreConfig,
  generateEmbedding,
  generateEmbeddings,
} from '@/sota/vector-store/vectorStore';

function uniqueCollection(prefix = 'kb_embed'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

describe('VectorStore additional branch coverage', () => {
  test('initialize rejects on invalid host branch', async () => {
    const cfg: VectorStoreConfig = {
      host: 'invalid-host',
      port: 19530,
      collectionName: uniqueCollection('kb_bad_host'),
      dimension: 8,
      partitions: ['place', 'festival'],
    };
    const store = new VectorStore(cfg);
    await expect(store.initialize()).rejects.toThrow(/Failed to initialize|Connection refused/);
    expect(store.isConnected()).toBe(false);
  });

  test('optimizeIndex returns true when connected', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_opt'),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();
    await expect(store.optimizeIndex()).resolves.toBe(true);
  });

  test('listPartitions returns configured partitions and getPartitionStats reflects indexType', async () => {
    const partitions = ['place', 'festival', 'scheme'] as const;
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_parts'),
      dimension: 8,
      partitions: [...partitions],
      indexType: 'HNSW',
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    const listed = await store.listPartitions();
    expect(listed).toEqual(partitions as unknown as string[]);

    const stats = await store.getPartitionStats();
    expect(Array.isArray(stats)).toBe(true);
    // At minimum, stats should include our configured partitions.
    const byName = new Map(stats.map((s) => [s.partitionName, s]));
    for (const p of partitions) {
      expect(byName.has(p)).toBe(true);
      // indexType should be set from config for created partitions
      const s = byName.get(p)!;
      expect(s.indexType === 'HNSW' || s.indexType === undefined).toBe(true);
    }
  });

  test('search threshold filters out low-similarity results', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_thresh'),
      dimension: 4,
      partitions: ['place', 'festival'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    // Insert one orthogonal vector and one aligned vector
    await store.insert({
      docId: 'place:aligned',
      type: 'place',
      text: 'aligned',
      vector: [0, 1, 0, 0],
    });
    await store.insert({
      docId: 'festival:orthogonal',
      type: 'festival',
      text: 'orthogonal',
      vector: [1, 0, 0, 0],
    });

    // Query matches [0,1,0,0] strongly; orthogonal ~0 similarity
    const query = [0, 1, 0, 0];
    const results = await store.search(query, { topK: 2, threshold: 0.9 });
    expect(results.length).toBe(1);
    expect(results[0].docId).toBe('place:aligned');
    expect(results[0].score).toBeGreaterThanOrEqual(0.9);
  });

  test('insert returns false on bad partition (not present in collection)', async () => {
    const cfg: VectorStoreConfig = {
      host: 'localhost',
      port: 19530,
      collectionName: uniqueCollection('kb_bad_partition'),
      dimension: 8,
      partitions: ['place'],
    };
    const store = new VectorStore(cfg);
    await store.initialize();

    const ok = await store.insert({
      docId: 'place:ok',
      type: 'place',
      text: 'ok',
      vector: new Array(8).fill(0.1),
    });
    expect(ok).toBe(true);

    const bad = await store.insert({
      docId: 'unknown:oops',
      // @ts-ignore intentional invalid partition type for branch coverage
      type: 'unknown',
      text: 'oops',
      vector: new Array(8).fill(0.2),
    });
    expect(bad).toBe(false);
  });

  test('generateEmbedding and generateEmbeddings produce correct dimension and stable vectors', async () => {
    const dim = 12;
    const text = 'रायपुर';

    const single = await generateEmbedding(text, dim);
    expect(single.vector.length).toBe(dim);
    expect(single.confidence).toBeGreaterThanOrEqual(0.85);
    expect(single.confidence).toBeLessThanOrEqual(1);

    const batch = await generateEmbeddings([text, 'दिवाली'], dim);
    expect(batch.length).toBe(2);
    expect(batch[0].vector.length).toBe(dim);
    expect(batch[1].vector.length).toBe(dim);

    // Deterministic embedding for the same text (vectors equal)
    expect(batch[0].vector).toEqual(single.vector);
  });
});
