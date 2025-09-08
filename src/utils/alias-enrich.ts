/* Lightweight alias enrichment using backend alias seed JSON for dev/test */
// eslint-disable-next-line import/no-relative-packages
import aliases from '../../api/data/aliases.json';

type Enriched = { tag: string; domain: 'tags' | 'locations'; canonical: string };

function buildVariantMap(): Record<string, Enriched> {
  const map: Record<string, Enriched> = {};
  const domains: Array<'tags' | 'locations'> = ['tags', 'locations'];
  for (const d of domains) {
    const table = (aliases as any)[d] || {};
    for (const canonical of Object.keys(table)) {
      const payload = table[canonical] || {};
      map[canonical.toLowerCase()] = { tag: canonical, domain: d, canonical } as Enriched;
      const vars = Array.isArray(payload.variants) ? payload.variants : [];
      for (const v of vars) {
        map[String(v).toLowerCase()] = { tag: String(v), domain: d, canonical } as Enriched;
      }
    }
  }
  return map;
}

const VARIANT_MAP = buildVariantMap();

export function enrichHashtags(hashtags: string[]): Enriched[] {
  const out: Enriched[] = [];
  for (const h of hashtags) {
    const key = h.replace(/^[#@]/, '').toLowerCase();
    const hit = VARIANT_MAP[key];
    if (hit) out.push(hit);
  }
  return out;
}

