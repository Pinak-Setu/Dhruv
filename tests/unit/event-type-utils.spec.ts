import { describe, it, expect } from 'vitest';
import { mergeEventTypes, choosePrimaryLabel } from '@/lib/parsing/event-type-utils';

describe('mergeEventTypes', () => {
  it('dedupes and merges gemini + heuristic labels', () => {
    expect(mergeEventTypes(['election_campaign', 'election_campaign'], ['congratulation'])).toEqual([
      'election_campaign',
      'congratulation'
    ]);
  });

  it('returns DAO for only heuristics', () => {
    expect(mergeEventTypes([], ['jayanti'])).toEqual(['jayanti']);
  });
});

describe('choosePrimaryLabel', () => {
  it('prefers jayanti above others', () => {
    expect(choosePrimaryLabel(['election_campaign', 'jayanti'], ['election_campaign'])).toBe('jayanti');
  });
  it('prefers congratulation when available', () => {
    expect(choosePrimaryLabel(['congratulation', 'election_campaign'], ['election_campaign'])).toBe('congratulation');
  });
  it('returns gemini first item if no heuristics', () => {
    expect(choosePrimaryLabel(['election_campaign'], ['election_campaign'])).toBe('election_campaign');
  });
  it('returns general when nothing found', () => {
    expect(choosePrimaryLabel([], [])).toBe('general');
  });
});
