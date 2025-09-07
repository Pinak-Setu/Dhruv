"use client";
import { computeMetrics } from '@/utils/metrics';
import { useRouter, usePathname } from 'next/navigation';

export default function Metrics() {
  const router = useRouter();
  const pathname = usePathname();
  const { places, actions } = computeMetrics();
  return (
    <section className="p-4 space-y-6">
      <div>
        <h3 className="text-xl font-semibold">स्थान सारांश</h3>
        <ul className="list-disc list-inside mt-2">
          {places.map((p) => (
            <li key={p.key} className="leading-6">
              <button
                type="button"
                className="underline text-blue-700 hover:text-blue-900"
                onClick={() => router.push(`${pathname}?loc=${encodeURIComponent(p.key)}`)}
                aria-label={`${p.key} पर फ़िल्टर करें`}
                title={`${p.key} पर फ़िल्टर करें`}
              >
                {`${p.key} — ${p.count} बार`}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-semibold">गतिविधि सारांश</h3>
        <ul className="list-disc list-inside mt-2">
          {actions.map((a) => (
            <li key={a.key} className="leading-6">
              <button
                type="button"
                className="underline text-blue-700 hover:text-blue-900"
                onClick={() => router.push(`${pathname}?action=${encodeURIComponent(a.key)}`)}
                aria-label={`${a.key} पर फ़िल्टर करें`}
                title={`${a.key} पर फ़िल्टर करें`}
              >
                {`${a.key} — ${a.count} बार`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
