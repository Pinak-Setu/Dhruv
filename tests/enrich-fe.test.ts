import '@testing-library/jest-dom';
import { parsePost } from '@/utils/parse';

describe('Frontend alias enrichment (dev)', () => {
  it('enriches hashtags like #समारोह to canonical tags', () => {
    const p = parsePost({ id: 1, timestamp: '2025-09-05T00:00:00Z', content: 'कार्यक्रम सम्पन्न। #समारोह' });
    const enriched = p.enriched || [];
    // Expect at least one enriched mapping present
    expect(enriched.length).toBeGreaterThan(0);
  });
});

