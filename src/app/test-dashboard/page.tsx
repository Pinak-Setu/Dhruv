import { Suspense } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'Test Dashboard',
};

export default function TestDashboardPage() {
  return (
    <DashboardShell activeTab="home">
      <Suspense fallback={<div className="text-center p-8 text-muted">Loading Dashboard...</div>}>
        <Dashboard />
      </Suspense>
    </DashboardShell>
  );
}