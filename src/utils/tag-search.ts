// Utilities for robust Hindi/Hinglish/English hashtag search
// Goal: Match variants like #रोज़गार, #रोजगार, #rozgar, #rojgar, #rojgaar

const NUKTA_MAP: Record<string, string> = {
  'क़': 'क',
  'ख़': 'ख',
  'ग़': 'ग',
  'ज़': 'ज',
  'फ़': 'फ',
  'ड़': 'ड',
  'ढ़': 'ढ',
  'ऱ': 'र',
  'य़': 'य',
};

const DEVANAGARI_TO_LATIN: Record<string, string> = {
  // vowels
  'अ': 'a',
  'आ': 'aa',
  'इ': 'i',
  'ई': 'ii',
  'उ': 'u',
  'ऊ': 'uu',
  'ए': 'e',
  'ऐ': 'ai',
  'ओ': 'o',
  'औ': 'au',
  'ऋ': 'ri',
  // consonants
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  // nukta letters mapped to typical Latin
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'फ़': 'f', 'ड़': 'd', 'ढ़': 'dh', 'ऱ': 'r', 'य़': 'y',
};

const MATRA_TO_LATIN: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
  'ॉ': 'o', 'ॅ': 'ae',
};

const COMBINING_REMOVE = /[\u093C\u094D\u200C\u200D\uFE00-\uFE0F]/g; // nukta, virama, zwj, zwnj, VS

function stripHashAt(s: string) {
  return s.replace(/^[#@]/, '');
}

function replaceNukta(s: string) {
  return s
    .split('')
    .map((ch) => NUKTA_MAP[ch] || ch)
    .join('')
    .replace(COMBINING_REMOVE, '');
}

function isDevanagari(str: string) {
  return /[\u0900-\u097F]/.test(str);
}

export function transliterateDevanagariToLatin(input: string) {
  const s = replaceNukta(input);
  let out = '';
  for (const ch of s) {
    if (MATRA_TO_LATIN[ch]) {
      out += MATRA_TO_LATIN[ch];
    } else if (DEVANAGARI_TO_LATIN[ch]) {
      out += DEVANAGARI_TO_LATIN[ch];
    } else if (/\u0900-\u097F/.test(ch)) {
      // Unmapped Devanagari char: skip combining or approximate
      // leave blank to avoid noise
    } else {
      out += ch;
    }
  }
  return out.toLowerCase();
}

function collapseVariants(lat: string) {
  const collapsed = lat.replace(/aa/g, 'a');
  const zToJ = lat.replace(/z/g, 'j');
  const jToZ = lat.replace(/j/g, 'z');
  const zToJCollapsed = zToJ.replace(/aa/g, 'a');
  const jToZCollapsed = jToZ.replace(/aa/g, 'a');
  return new Set([lat, collapsed, zToJ, jToZ, zToJCollapsed, jToZCollapsed]);
}

export function buildSearchKeys(raw: string): Set<string> {
  const s = stripHashAt(raw).toLowerCase();
  const keys = new Set<string>([s]);
  // Nukta-free variant
  const noNukta = replaceNukta(s);
  keys.add(noNukta);
  // Transliteration for Devanagari -> Latin
  if (isDevanagari(s)) {
    const latin = transliterateDevanagariToLatin(s);
    for (const v of collapseVariants(latin)) keys.add(v);
  }
  return keys;
}

export function matchTagFlexible(tag: string, query: string): boolean {
  if (!tag || !query) return false;
  const tagKeys = buildSearchKeys(tag);
  const queryKeys = buildSearchKeys(query);
  // Compare any normalized substring presence between key sets
  for (const tk of tagKeys) {
    for (const qk of queryKeys) {
      if (tk.includes(qk) || qk.includes(tk)) return true;
    }
  }
  return false;
}
