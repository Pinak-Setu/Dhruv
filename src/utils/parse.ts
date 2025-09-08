type Post = { id: string | number; timestamp: string; content: string };

type ParseResult = {
  id: string | number;
  ts: string;
  when: string;
  where: string[];
  what: string[];
  which: { mentions: string[]; hashtags: string[] };
  how: string;
  enriched?: Array<{ tag: string; domain: 'tags' | 'locations'; canonical: string }>;
};

const MONTHS_HI = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

const DAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function formatHindiDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dayNum = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_HI[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const dow = DAYS_HI[d.getUTCDay()];
  return `${dow}, ${dayNum} ${month} ${year}`;
}

// Known places and variants; extendable
const PLACE_REGEX =
  /(नई दिल्ली|नयी दिल्ली|रायगढ़|दिल्ली|रायपुर|भारत|छत्तीसगढ़|खरसिया|गढ़ उमरिया|बस्तर|सरगुजा|जशपुर|बगीचा)/g;
const HASHTAG_REGEX = /#[^\s#]+/g;
const MENTION_REGEX = /@[A-Za-z0-9_]+/g;
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

// Noun/subject keywords to surface also as hashtags from content
const NOUN_TAG_KEYWORDS = ['किसान', 'सड़क', 'शिविर', 'महिला', 'स्टार्टअप'];

// Check FLAG_LANGEXTRACT
const FLAG_LANGEXTRACT = process.env.FLAG_LANGEXTRACT === 'on' || true; // default on for branch

export async function parsePost(post: Post): Promise<ParseResult> {
  if (FLAG_LANGEXTRACT) {
    try {
      // Call Flask API /api/parse
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.content }),
      });
      if (response.ok) {
        const data = await response.json();
        const extraction = data.extraction;
        return {
          id: post.id,
          ts: post.timestamp,
          when: formatHindiDate(post.timestamp),
          where:
            extraction.entities
              ?.filter((e: any) => e.type === 'LOCATION')
              .map((e: any) => e.text) || [],
          what:
            extraction.entities?.filter((e: any) => e.type === 'EVENT').map((e: any) => e.text) ||
            [],
          which: {
            mentions:
              extraction.entities
                ?.filter((e: any) => e.type === 'MENTION')
                .map((e: any) => e.text) || [],
            hashtags:
              extraction.entities?.filter((e: any) => e.type === 'TAG').map((e: any) => e.text) ||
              [],
          },
          how: post.content,
          enriched: [], // Can add from API if needed
        };
      } else {
        console.error('API error:', response.status);
        return fallbackParse(post);
      }
    } catch (e) {
      console.error('Fetch failed:', e);
      return fallbackParse(post);
    }
  } else {
    return fallbackParse(post);
  }
}

function fallbackParse(post: Post) {
  const when = formatHindiDate(post.timestamp);
  const whereSet = new Set<string>();
  // Direct matches from known list
  const matchWhere = post.content.match(PLACE_REGEX) || [];
  matchWhere.forEach((w) => whereSet.add(w));
  // Heuristic: tokens before 'में' (e.g., 'रायगढ़ में' -> 'रायगढ़')
  const inMatches = Array.from(post.content.matchAll(/([\p{L} ]{2,}?)\s+में/gu));
  for (const m of inMatches) {
    const token = (m[1] || '').trim();
    if (token.length >= 2) {
      // If token includes a known place word, prefer it
      const known = (token.match(PLACE_REGEX) || [])[0];
      if (known) whereSet.add(known);
    }
  }
  const where = Array.from(whereSet);

  const hashtagsSet = new Set<string>(post.content.match(HASHTAG_REGEX) || []);
  const mentions = Array.from(new Set(post.content.match(MENTION_REGEX) || []));

  const what: string[] = [];
  for (const k of ACTION_KEYWORDS) {
    if (post.content.includes(k)) {
      what.push(k);
      hashtagsSet.add(`#${k}`);
    }
  }
  for (const k of NOUN_TAG_KEYWORDS) {
    if (post.content.includes(k)) hashtagsSet.add(`#${k}`);
  }

  const hashtags = Array.from(hashtagsSet);
  // Optional enrichment using alias seed JSON (dev-only convenience)
  let enriched: Array<{ tag: string; domain: 'tags' | 'locations'; canonical: string }> = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { enrichHashtags } = require('@/utils/alias-enrich');
    enriched = enrichHashtags(hashtags);
  } catch {
    // ignore if module not available
  }

  const how = post.content.trim().slice(0, 180);

  return {
    id: post.id,
    ts: post.timestamp,
    when,
    where,
    what,
    which: { mentions, hashtags },
    how,
    enriched,
  };
}
