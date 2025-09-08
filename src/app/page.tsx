import Dashboard from '@/components/Dashboard';
import Metrics from '@/components/Metrics';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-center text-3xl md:text-5xl font-bold heading-noto py-2">
        श्री ओपी चौधरी - सोशल मीडिया एनालिटिक्स डैशबोर्ड
      </h1>
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
      <Metrics />
    </main>
  );
}
