import { disambiguateMatches, type DisambiguationInput, type DisambiguationResult } from '@/sota/linker/disambiguation';

describe('Disambiguation — branch coverage', () => {
  test('no matches: returns null chosenMatch with reviewRequired and safety notes', async () => {
    const inputs: DisambiguationInput[] = [
      {
        token: 'कुछ',
        deterministicMatches: [],
        semanticMatches: [],
        context: {
          postText: 'पोस्ट टेक्स्ट',
          postedAt: '2025-09-10T00:00:00Z',
        },
      },
    ];

    const results: DisambiguationResult[] = await disambiguateMatches(inputs);
    expect(results).toHaveLength(1);

    const r = results[0];
    expect(r.token).toBe('कुछ');
    expect(r.chosenMatch).toBeNull();
    expect(r.confidence).toBe(0);
    expect(r.reviewRequired).toBe(true);
    expect(r.reasoning).toBe('No matches found');
    expect(r.safetyNotes).toEqual(expect.arrayContaining(['No matches available for disambiguation']));
  });

  test('single low-confidence match: sets reviewRequired and safety notes', async () => {
    const inputs: DisambiguationInput[] = [
      {
        token: 'रायपुर',
        deterministicMatches: [
          {
            id: 'place:raipur',
            type: 'place',
            name: 'रायपुर',
            confidence: 0.5, // < 0.6 triggers reviewRequired in single-match path
            metadata: { hierarchy: { district: 'Raipur', pin: '492001' } },
          },
        ],
        semanticMatches: [],
        context: {
          postText: 'पोस्ट टेक्स्ट',
          postedAt: '2025-09-10T00:00:00Z',
        },
      },
    ];

    const results = await disambiguateMatches(inputs);
    expect(results).toHaveLength(1);

    const r = results[0];
    expect(r.chosenMatch).not.toBeNull();
    expect(r.chosenMatch?.id).toBe('place:raipur');
    expect(r.confidence).toBeCloseTo(0.5, 5);
    expect(r.reviewRequired).toBe(true);
    expect(r.safetyNotes).toEqual(
      expect.arrayContaining(['low confidence', 'manual review recommended']),
    );
    expect(typeof r.reasoning).toBe('string');
    expect(r.reasoning).toMatch(/Single match available/);
  });

  test('multiple matches: applies multi-factor scoring and includes factor reasons', async () => {
    const geoLat = 21.2514; // Raipur approx
    const geoLon = 81.6296;
    const context = {
      postText: 'रायपुर में बैठक आयोजित की गई।',
      postedAt: '2025-09-10T00:00:00Z',
      geoHint: { lat: geoLat, lon: geoLon, pin: '492001' },
      authorHistory: {
        frequentPlaces: ['place:raipur'],
        frequentDistricts: ['Raipur'],
      },
    };

    const inputs: DisambiguationInput[] = [
      {
        token: 'रायपुर',
        deterministicMatches: [
          {
            id: 'place:raipur',
            type: 'place',
            name: 'रायपुर',
            confidence: 0.55, // base lower than semantic, but boosted by factors
            metadata: {
              hierarchy: { district: 'Raipur', pin: '492001' }, // exact PIN match for hierarchy consistency
              coordinates: { lat: geoLat, lon: geoLon }, // 0km -> max geo score
            },
          },
        ],
        semanticMatches: [
          {
            id: 'place:delhi',
            type: 'place',
            name: 'दिल्ली',
            similarityScore: 0.99, // high semantic confidence (0.99 * 0.8 = 0.792)
            metadata: {
              hierarchy: { district: 'Delhi', pin: '110001' },
              coordinates: { lat: 28.6139, lon: 77.2090 },
            },
          },
        ],
        context,
      },
    ];

    const results = await disambiguateMatches(inputs);
    expect(results).toHaveLength(1);

    const r = results[0];
    // Should select raipur due to multi-factor boosts
    expect(r.chosenMatch?.id).toBe('place:raipur');

    // Confidence capped at 1.0 by implementation
    expect(r.confidence).toBeGreaterThanOrEqual(0.55);
    expect(r.confidence).toBeLessThanOrEqual(1.0);

    // Reasoning should include factors if they contributed > 0
    expect(r.reasoning).toMatch(/Selected based on:/);
    expect(r.reasoning).toEqual(
      expect.stringContaining('hierarchy consistency'),
    );
    expect(r.reasoning).toEqual(expect.stringContaining('PIN proximity'));
    expect(r.reasoning).toEqual(expect.stringContaining('geo distance'));
    expect(r.reasoning).toEqual(expect.stringContaining('author history'));

    // With many positive factors, review should be false
    expect(r.reviewRequired).toBe(false);
  });
});
