import { parsePost } from '@/utils/parse';

describe('parse places (extended variants)', () => {
  it('extracts multi-word places like नई दिल्ली', () => {
    const p = parsePost({ id: 1, timestamp: '2025-09-05T00:00:00Z', content: 'नई दिल्ली में बैठक' });
    expect(p.where).toContain('नई दिल्ली');
  });

  it('recognizes छत्तीसगढ़ and भारत mentions', () => {
    const p = parsePost({ id: 2, timestamp: '2025-09-05T00:00:00Z', content: 'छत्तीसगढ़ और भारत की बात' });
    expect(p.where).toEqual(expect.arrayContaining(['छत्तीसगढ़', 'भारत']));
  });
});

