import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getHistory, getJobSummary, getJobs } from '@/lib/jobs-store';

export default function DashboardPage() {
  const jobs = getJobs();
  const summary = getJobSummary();
  const history = getHistory();

  return (
    <div className="space-y-8">
      <DashboardClient
        initialData={{
          jobs,
          summary,
          history
        }}
      />
    </div>
  );
}
