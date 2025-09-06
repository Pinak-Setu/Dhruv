import Dashboard from '@/components/Dashboard';
import Metrics from '@/components/Metrics';

export default function HomePage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">ध्रुव डैशबोर्ड</h1>
      <Dashboard />
      <Metrics />
    </main>
  );
}
