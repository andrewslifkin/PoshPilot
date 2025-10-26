'use client';

import { useMemo, useState } from 'react';
import { Tab } from '@headlessui/react';
import { ShareJobForm } from '@/components/forms/share-job-form';
import { JobList } from '@/components/jobs/job-list';
import { HistoryTimeline } from '@/components/history/history-timeline';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import type { JobStatus, ShareJob, ShareTarget } from '@/lib/jobs-store';
import { useJobs, type JobsResponse } from '@/hooks/use-jobs';

interface DashboardClientProps {
  initialData: JobsResponse;
}

function filterJobs(
  jobs: ShareJob[],
  target: 'all' | ShareTarget,
  status: JobStatus | 'all'
): ShareJob[] {
  return jobs.filter((job) => {
    const matchesTarget = target === 'all' ? true : job.shareTarget === target;
    const matchesStatus = status === 'all' ? true : job.status === status;
    return matchesTarget && matchesStatus;
  });
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { jobs, summary, history, isLoading, refresh } = useJobs(initialData);
  const [selectedTarget, setSelectedTarget] = useState<'all' | ShareTarget>('all');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const filteredJobs = useMemo(
    () => filterJobs(jobs, selectedTarget, statusFilter),
    [jobs, selectedTarget, statusFilter]
  );

  return (
    <div className="space-y-8">
      <SummaryCards summary={summary} isLoading={isLoading} />

      <Tab.Group>
        <Tab.List className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white/60 p-2">
          {['Plan & monitor', 'History'].map((label) => (
            <Tab
              key={label}
              className={({ selected }) =>
                `${
                  selected
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                } rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2`
              }
            >
              {label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6 space-y-6">
          <Tab.Panel className="space-y-6">
            <ShareJobForm
              onCreated={() => {
                void refresh();
              }}
            />
            <JobList
              jobs={filteredJobs}
              selectedTarget={selectedTarget}
              onTargetChange={setSelectedTarget}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              isLoading={isLoading}
            />
          </Tab.Panel>
          <Tab.Panel className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Share history</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review completed shares, timestamps, and any error messages captured during the run.
              </p>
              <div className="mt-4">
                <HistoryTimeline items={history} />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
