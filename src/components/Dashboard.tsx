"use client";
import posts from '../../data/posts_new.json';
import { parsePost, formatHindiDate } from '@/utils/parse';
import { isParseEnabled } from '../../config/flags';
import { matchTagFlexible, matchTextFlexible } from '@/utils/tag-search';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import Card from './Card';
import SoftButton from './SoftButton';
import Chip from './Chip';

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

  const parsed = useMemo(() => (posts as Post[]).map((p) => {
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
  }), []);

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
      const tokens = tagFilter
        .split(/[#,\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      rows = rows.filter((r) => {
        const tags = [...r.which.hashtags, ...r.which.mentions];
        return tokens.some((q) => tags.some((t) => matchTagFlexible(t, q)));
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
    <section>
      <div className="mb-4 flex items-end gap-4 flex-wrap bg-gray-50 p-3 rounded-md border">
        <label className="text-sm font-medium">
          स्थान फ़िल्टर
          <input
            aria-label="स्थान फ़िल्टर"
            className="ml-2 border border-gray-300 px-2 py-1 rounded-md w-40"
            placeholder="जैसे: रायगढ़"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          टैग/मेंशन फ़िल्टर
          <input
            aria-label="टैग/मेंशन फ़िल्टर"
            className="ml-2 border border-gray-300 px-2 py-1 rounded-md w-48"
            placeholder="#समारोह, @PMOIndia"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          तिथि से
          <input
            aria-label="तिथि से"
            type="date"
            className="ml-2 border border-gray-300 px-2 py-1 rounded-md"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          तिथि तक
          <input
            aria-label="तिथि तक"
            type="date"
            className="ml-2 border border-gray-300 px-2 py-1 rounded-md"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <SoftButton
          ariaLabel="फ़िल्टर साफ़ करें"
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
        </SoftButton>
      </div>
      <div className="overflow-x-auto border rounded-md">
        <table aria-label="गतिविधि सारणी" className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left font-semibold p-2 border-b">दिन / दिनांक</th>
              <th className="text-left font-semibold p-2 border-b">स्थान</th>
              <th className="text-left font-semibold p-2 border-b">दौरा / कार्यक्रम</th>
              <th className="text-left font-semibold p-2 border-b">कौन/टैग</th>
              <th className="text-left font-semibold p-2 border-b">विवरण</th>
            </tr>
          </thead>
          <tbody className="bg-white" data-testid="tbody">
            {filtered.map((row, index) => (
              <tr key={row.id} className={`align-top ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="p-2 border-b whitespace-nowrap">{row.when}</td>
                <td className="p-2 border-b">{row.where.join(', ') || '—'}</td>
                <td className="p-2 border-b">{row.what.join(', ') || '—'}</td>
                <td className="p-2 border-b" aria-label="कौन/टैग">
                  {(() => {
                    const tags = [...row.which.mentions, ...row.which.hashtags];
                    if (!tags.length) return '—';
                    return (
                      <div className="flex gap-2 flex-wrap">
                        {tags.map((t, i) => {
                          const isSelected = tagFilter
                            .split(/[#,\s]+/)
                            .filter(Boolean)
                            .some((q) => matchTagFlexible(t, q));
                          return (
                            <Chip
                              key={`${t}-${i}`}
                              label={t}
                              selected={isSelected}
                              onClick={() => {
                                const current = tagFilter.trim();
                                const norm = t.replace(/^[@#]/, '');
                                // toggle behavior: add if missing, remove if present
                                const tokens = current
                                  ? current.split(/[,\s]+/).filter(Boolean)
                                  : [];
                                const exists = tokens.some((q) => matchTagFlexible(norm, q));
                                let nextTokens: string[];
                                if (exists) {
                                  nextTokens = tokens.filter((q) => !matchTagFlexible(norm, q));
                                } else {
                                  nextTokens = [...tokens, `#${norm}`];
                                }
                                const next = nextTokens.join(', ');
                                setTagFilter(next);
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </td>
                {(() => {
                  const t = truncate(row.how, 80);
                  return (
                    <td className="p-2 border-b" aria-label="विवरण" title={t.title}>
                      {t.display}
                    </td>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
