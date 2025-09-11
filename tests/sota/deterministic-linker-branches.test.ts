import { deterministicLinker, type LinkResult } from '@/sota/linker/deterministicLinker';

describe('Deterministic Linker — branch coverage for alias/phonetic/no-match paths', () => {
  test('alias path: token matches as a substring of an alias (e.g., "मुंब" -> "मुंबई")', async () => {
    const token = 'मुंब'; // substring of alias "मुंबई" for Mumbai
    const results: LinkResult[] = await deterministicLinker([token]);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const r = results[0];
    expect(r.token).toBe(token);
    // Should follow alias branch (no exact match for "मुंब")
    expect(r.method).toBe('alias');
    expect(r.confidence).toBeGreaterThan(0);

    // Should include a place match (Mumbai record)
    const placeMatch = r.matches.find((m) => m.type === 'place');
    expect(placeMatch).toBeDefined();
    expect(placeMatch?.id).toMatch(/^place:/);
  });

  test('phonetic path: token is a substring of a dataset name (e.g., "छत्तीस" in "छत्तीसगढ़")', async () => {
    const token = 'छत्तीस'; // subset of name "छत्तीसगढ़", triggers phonetic branch
    const results: LinkResult[] = await deterministicLinker([token]);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const r = results[0];
    expect(r.token).toBe(token);
    // No exact or alias match, should hit phonetic branch
    expect(r.method).toBe('phonetic');
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.matches.length).toBeGreaterThan(0);
  });

  test('no-match path: token that does not match any dataset (exact/alias/phonetic)', async () => {
    const token = 'qwerty-no-match-123';
    const results: LinkResult[] = await deterministicLinker([token]);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const r = results[0];
    expect(r.token).toBe(token);
    // No matches expected
    expect(r.matches.length).toBe(0);
    expect(r.confidence).toBe(0);
    // Method remains one of allowed values even when empty
    expect(['exact', 'alias', 'phonetic', 'admin_code']).toContain(r.method);
  });
});
