#!/usr/bin/env node
/*
  Mine aliases from data/posts_new.json and write suggestions to api/data/aliases.suggestions.json.
  Non-destructive. Review suggestions and merge into aliases.json as needed.
*/
const fs = require('fs');
const path = require('path');

function strip(s) {
  return String(s || '').replace(/^[#@]/, '').toLowerCase();
}

function collapseVariants(lat) {
  const collapsed = lat.replace(/aa/g, 'a');
  const loosen = (s) => s.replace(/chh/g, 'ch').replace(/sh/g, 's').replace(/th/g, 't').replace(/dh/g, 'd').replace(/ph/g, 'f');
  const vSwap = (s) => s.replace(/v/g, 'w');
  const wSwap = (s) => s.replace(/w/g, 'v');
  const dedupe = (s) => s.replace(/(.)\1+/g, '$1');
  const insertSchwaStart = (s) => s.replace(/^([bcdfghjklmnpqrstvwxyz])([bcdfghjklmnpqrstvwxyz])/i, (_m, c1, c2) => `${c1}a${c2}`);
  const bases = [lat, collapsed];
  const out = new Set();
  for (const b of bases) {
    [b, loosen(b), vSwap(b), wSwap(b), dedupe(b), insertSchwaStart(b)].forEach((x) => out.add(x));
  }
  return out;
}

function devanagariToLatin(s) {
  const MATRA = { 'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri', 'ॉ': 'o', 'ॅ': 'ae' };
  const MAP = { 'अ':'a','आ':'aa','इ':'i','ई':'ii','उ':'u','ऊ':'uu','ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऋ':'ri',
    'क':'k','ख':'kh','ग':'g','घ':'gh','च':'ch','छ':'chh','ज':'j','झ':'jh','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ं':'n','ँ':'n','ः':'h' };
  let out = '';
  for (const ch of s) {
    if (MATRA[ch]) out += MATRA[ch];
    else if (MAP[ch]) out += MAP[ch];
    else out += ch;
  }
  return out.toLowerCase();
}

function buildKeys(raw) {
  const keys = new Set([strip(raw)]);
  if (/^[\u0900-\u097F#]+/.test(raw)) {
    const lat = devanagariToLatin(raw);
    collapseVariants(lat).forEach((k) => keys.add(k));
  }
  return keys;
}

function main() {
  const postsPath = path.join(process.cwd(), 'data', 'posts_new.json');
  const aliasesPath = path.join(process.cwd(), 'api', 'data', 'aliases.json');
  const outPath = path.join(process.cwd(), 'api', 'data', 'aliases.suggestions.json');
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  const existing = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
  const HASHTAG = /#[^\s#]+/g;
  const PLACE = /(नई दिल्ली|नयी दिल्ली|रायगढ़|दिल्ली|रायपुर|भारत|छत्तीसगढ़|खरसिया|गढ़ उमरिया|बस्तर|सरगुजा|जशपुर|बगीचा)/g;
  const tags = {};
  const locs = {};

  for (const p of posts) {
    const hashtags = p.content.match(HASHTAG) || [];
    for (const h of hashtags) {
      const canonical = h.replace(/^#/, '');
      const existingVars = (existing.tags[canonical]?.variants) || [];
      const keys = Array.from(buildKeys(h)).map(strip);
      const newVars = Array.from(new Set(keys.filter((k) => k && !existingVars.map(strip).includes(k) && k !== strip(canonical))));
      if (newVars.length) tags[canonical] = { variants: Array.from(new Set([...(tags[canonical]?.variants || []), ...newVars])) };
    }
    const places = p.content.match(PLACE) || [];
    for (const w of places) {
      const canonical = w;
      const existingVars = (existing.locations[canonical]?.variants) || [];
      const keys = Array.from(buildKeys(w)).map(strip);
      const newVars = Array.from(new Set(keys.filter((k) => k && !existingVars.map(strip).includes(k) && k !== strip(canonical))));
      if (newVars.length) locs[canonical] = { variants: Array.from(new Set([...(locs[canonical]?.variants || []), ...newVars])) };
    }
  }

  const suggestions = { tags, locations: locs };
  fs.writeFileSync(outPath, JSON.stringify(suggestions, null, 2));
  console.log('Wrote suggestions to', outPath);
}

if (require.main === module) main();

