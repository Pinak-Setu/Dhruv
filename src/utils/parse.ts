type Post = { id: string | number; timestamp: string; content: string };

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

export function formatHindiDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_HI[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

const PLACE_REGEX = /(नई दिल्ली|नयी दिल्ली|रायगढ़|दिल्ली|रायपुर|भारत|छत्तीसगढ़)/g;
const HASHTAG_REGEX = /#[^\s#]+/g;
const MENTION_REGEX = /@[A-Za-z0-9_]+/g;
const ACTION_KEYWORDS = ['भूमिपूजन', 'समारोह', 'उद्घाटन', 'बैठक', 'सम्मिलित'];

export function parsePost(post: Post) {
  const when = formatHindiDate(post.timestamp);
  const whereSet = new Set<string>();
  const matchWhere = post.content.match(PLACE_REGEX) || [];
  matchWhere.forEach((w) => whereSet.add(w));
  const where = Array.from(whereSet);

  const hashtags = Array.from(new Set(post.content.match(HASHTAG_REGEX) || []));
  const mentions = Array.from(new Set(post.content.match(MENTION_REGEX) || []));

  const what: string[] = [];
  for (const k of ACTION_KEYWORDS) {
    if (post.content.includes(k)) what.push(k);
  }

  const how = post.content.trim().slice(0, 120);

  return {
    when,
    where,
    what,
    which: { mentions, hashtags },
    how,
  };
}
