"use client";
import posts from '../../data/posts.json';
import { parsePost, formatHindiDate } from '@/utils/parse';
import { isParseEnabled } from '../../config/flags';
import { matchTagFlexible, matchTextFlexible } from '@/utils/tag-search';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Route } from 'next';

type Post = { id: string | number; timestamp: string; content: string };

export default function Dashboard() {
  const [locFilter, setLocFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync from URL params
  useEffect(() => {
    const loc = searchParams.get('loc') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';
    const action = searchParams.get('action') ?? '';
    setLocFilter(loc);
    setTagFilter(tag);
    setFromDate(from);
    setToDate(to);
    setActionFilter(action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const parsed = (posts as Post[]).map((p) => {
    if (isParseEnabled()) {
      return { id: p.id, ts: p.timestamp, ...parsePost(p) };
    }
    return {
      id: p.id,
      ts: p.timestamp,
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
    let rows = parsed;
    if (locFilter.trim()) {
      const q = locFilter.trim();
      rows = rows.filter((r) => r.where.some((w) => matchTextFlexible(w, q)));
    }
    if (tagFilter.trim()) {
      const q = tagFilter.trim();
      rows = rows.filter((r) => {
        const tags = [...r.which.mentions, ...r.which.hashtags];
        return tags.some((t) => matchTagFlexible(t, q));
      });
    }
    if (actionFilter.trim()) {
      const q = actionFilter.trim();
      rows = rows.filter((r) => r.what.some((w) => w.includes(q)));
    }
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from || to) {
      rows = rows.filter((r) => {
        const d = new Date(r.ts);
        if (from && d < from) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      });
    }
    return rows;
  }, [parsed, locFilter, tagFilter, actionFilter, fromDate, toDate]);

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
        <label className="text-sm">
          टैग/मेंशन फ़िल्टर
          <input
            aria-label="टैग/मेंशन फ़िल्टर"
            className="ml-2 border px-2 py-1 rounded"
            placeholder="#समारोह, @PMOIndia"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </label>
        <label className="text-sm">
          तिथि से
          <input
            aria-label="तिथि से"
            type="date"
            className="ml-2 border px-2 py-1 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label className="text-sm">
          तिथि तक
          <input
            aria-label="तिथि तक"
            type="date"
            className="ml-2 border px-2 py-1 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <button
          type="button"
          aria-label="फ़िल्टर साफ़ करें"
          className="text-sm border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100"
          onClick={() => {
            setLocFilter('');
            setTagFilter('');
            setFromDate('');
            setToDate('');
            setActionFilter('');
            router.push('/' as Route);
          }}
        >
          फ़िल्टर साफ़ करें
        </button>
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
