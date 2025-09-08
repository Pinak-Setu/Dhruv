import posts from '../../data/posts_new.json';
// Lightweight parsing for metrics (sync, avoids async parsePost)

type CountMap = Record<string, number>;

function tally(arr: string[]): CountMap {
  const map: CountMap = {};
  for (const item of arr) {
    if (!item) continue;
    map[item] = (map[item] || 0) + 1;
  }
  return map;
}

function topN(map: CountMap, n: number): Array<{ key: string; count: number }> {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

const PLACE_REGEX = /(नई दिल्ली|नयी दिल्ली|रायगढ़|दिल्ली|रायपुर|भारत|छत्तीसगढ़|खरसिया|गढ़ उमरिया|बस्तर|सरगुजा|जशपुर|बगीचा)/g;
const ACTION_KEYWORDS = [
  'बैठक',
  'समापन',
  'शिलान्यास',
  'निरीक्षण',
  'भूमिपूजन',
  'उद्घाटन',
  'संवाद',
  'जन्मदिन',
  'स्वागत',
  'नमन',
  'प्रार्थना',
  'शुभकामनायें',
  'लोकार्पण',
  'समीक्षा',
  'समारोह',
  'सम्मिलित',
];

export function computeMetrics() {
  const parsed = (posts as Array<{ id: string | number; timestamp: string; content: string }>).map(
    (p) => {
      const where = Array.from(new Set(p.content.match(PLACE_REGEX) || []));
      const what: string[] = [];
      for (const k of ACTION_KEYWORDS) if (p.content.includes(k)) what.push(k);
      return { where, what };
    },
  );
  const allPlaces = parsed.flatMap((p) => p.where);
  const allActions = parsed.flatMap((p) => p.what);
  const placeCounts = tally(allPlaces);
  const actionCounts = tally(allActions);
  return {
    places: topN(placeCounts, 5),
    actions: topN(actionCounts, 10),
  };
}
