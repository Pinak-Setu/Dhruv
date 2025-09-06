"use client";
import posts from '../../data/posts.json';
import { parsePost, formatHindiDate } from '@/utils/parse';
import { isParseEnabled } from '../../config/flags';
import { useMemo, useState } from 'react';

type Post = { id: string | number; timestamp: string; content: string };

export default function Dashboard() {
  const [locFilter, setLocFilter] = useState('');
  const parsed = (posts as Post[]).map((p) => {
    if (isParseEnabled()) {
      return { id: p.id, ...parsePost(p) };
    }
    return {
      id: p.id,
      when: formatHindiDate(p.timestamp),
      where: [] as string[],
      what: [] as string[],
      which: { mentions: [] as string[], hashtags: [] as string[] },
      how: p.content,
    };
  });
  const truncate = (s: string, max: number) => {
    if (s.length <= max) return { display: s, title: s };
    return { display: s.slice(0, Math.max(0, max - 1)) + '…', title: s };
  };
  const filtered = useMemo(() => {
    if (!locFilter.trim()) return parsed;
    const q = locFilter.trim();
    return parsed.filter((r) => r.where.join(' ').includes(q));
  }, [parsed, locFilter]);

  return (
    <section className="p-4">
      <h2 className="sr-only">डैशबोर्ड</h2>
      <div className="mb-3 flex gap-3">
        <label className="text-sm">
          स्थान फ़िल्टर
          <input
            aria-label="स्थान फ़िल्टर"
            className="ml-2 border px-2 py-1 rounded"
            placeholder="जैसे: रायगढ़"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
          />
        </label>
      </div>
      <table aria-label="गतिविधि सारणी" className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 border-b">कब</th>
            <th className="text-left p-2 border-b">कहाँ</th>
            <th className="text-left p-2 border-b">क्या</th>
            <th className="text-left p-2 border-b">कौन/टैग</th>
            <th className="text-left p-2 border-b">कैसे</th>
          </tr>
        </thead>
        <tbody data-testid="tbody">
          {filtered.map((row) => (
            <tr key={row.id} role="row" className="align-top">
              <td className="p-2 border-b whitespace-nowrap">{row.when}</td>
              <td className="p-2 border-b" aria-label="कहाँ">{row.where.join(', ') || '—'}</td>
              <td className="p-2 border-b" aria-label="क्या">{row.what.join(', ') || '—'}</td>
              <td className="p-2 border-b" aria-label="कौन/टैग">
                {[...row.which.mentions, ...row.which.hashtags].join(' ') || '—'}
              </td>
              {(() => {
                const t = truncate(row.how, 80);
                return (
                  <td className="p-2 border-b" aria-label="कैसे" title={t.title}>
                    {t.display}
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
