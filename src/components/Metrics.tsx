import { computeMetrics } from '@/utils/metrics';

export default function Metrics() {
  const { places, actions } = computeMetrics();
  return (
    <section className="p-4 space-y-6">
      <div>
        <h3 className="text-xl font-semibold">स्थान सारांश</h3>
        <ul className="list-disc list-inside mt-2">
          {places.map((p) => (
            <li key={p.key} className="leading-6">{`${p.key} — ${p.count} बार`}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-semibold">गतिविधि सारांश</h3>
        <ul className="list-disc list-inside mt-2">
          {actions.map((a) => (
            <li key={a.key} className="leading-6">{`${a.key} — ${a.count} बार`}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

