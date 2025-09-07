import re
from typing import Dict, List

NUKTA_MAP = str.maketrans({
  'क़':'क','ख़':'ख','ग़':'ग','ज़':'ज','फ़':'फ','ड़':'ड','ढ़':'ढ','ऱ':'र','य़':'य'
})

COMBINING = re.compile(r"[\u093C\u094D\u200C\u200D\uFE00-\uFE0F]")


def fold_nukta(s: str) -> str:
  return COMBINING.sub('', s.translate(NUKTA_MAP))


def translit_basic(dev: str) -> str:
  # Minimal conservative transliteration for bootstrap; improved later
  m = {
    'अ':'a','आ':'aa','इ':'i','ई':'ii','उ':'u','ऊ':'uu','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
    'क':'k','ख':'kh','ग':'g','घ':'gh','च':'ch','छ':'chh','ज':'j','झ':'jh','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
    'त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h'
  }
  out = []
  for ch in dev:
    out.append(m.get(ch, ch))
  return ''.join(out)


def loosen_hinglish(s: str) -> str:
  return (
    s.replace('chh','ch')
     .replace('sh','s')
     .replace('th','t')
     .replace('dh','d')
     .replace('ph','f')
  )


def normalize_tokens(text: str, tokens: List[str]) -> Dict[str, List[str]]:
  items = tokens or re.findall(r"[#@]?[\w\u0900-\u097F]+", text or '')
  normalized: Dict[str, List[str]] = {}
  for t in items:
    base = t.strip()
    if not base:
      continue
    d = fold_nukta(base)
    base_lc = base.lower()
    lat = translit_basic(d)
    lat_lc = lat.lower()
    lat2 = loosen_hinglish(lat_lc)
    normalized[base] = list({base, base_lc, d, lat_lc, lat2})
  return normalized
