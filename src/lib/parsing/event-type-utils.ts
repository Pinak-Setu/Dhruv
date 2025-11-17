export function mergeEventTypes(geminiEventTypes: string[] = [], heuristicEventTypes: string[] = []): string[] {
  const merged = Array.from(new Set([...(geminiEventTypes || []).map(String).filter(Boolean), ...(heuristicEventTypes || []).map(String).filter(Boolean)]));
  return merged;
}

export function choosePrimaryLabel(mergedEventTypes: string[], geminiEventTypes: string[] = []): string {
  if (!Array.isArray(mergedEventTypes)) return 'general';
  if (mergedEventTypes.includes('jayanti')) return 'jayanti';
  if (mergedEventTypes.includes('congratulation')) return 'congratulation';
  if (Array.isArray(geminiEventTypes) && geminiEventTypes.length > 0) return geminiEventTypes[0];
  return 'general';
}
