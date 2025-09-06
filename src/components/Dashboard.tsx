import posts from '../../data/posts.json';
import { parsePost, formatHindiDate } from '@/utils/parse';
import { isParseEnabled } from '../../config/flags';

type Post = { id: string | number; timestamp: string; content: string };

export default function Dashboard() {
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
  return (
    <section className="p-4">
      <h2 className="sr-only">डैशबोर्ड</h2>
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
          {parsed.map((row) => (
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
