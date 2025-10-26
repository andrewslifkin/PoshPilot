'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import type { ShareJob, ShareTarget, JobStatus } from '@/lib/jobs-store';
import { StatusBadge } from './status-badge';
import clsx from 'clsx';

interface JobListProps {
  jobs: ShareJob[];
  selectedTarget: 'all' | ShareTarget;
  onTargetChange: (target: 'all' | ShareTarget) => void;
  statusFilter: JobStatus | 'all';
  onStatusChange: (status: JobStatus | 'all') => void;
  isLoading?: boolean;
}

const shareTargetLabels: Record<'all' | ShareTarget, string> = {
  all: 'All audiences',
  party: 'Party shares',
  followers: 'Followers shares'
};

const statusFilters: Array<{ key: JobStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Any status' },
  { key: 'queued', label: 'Queued' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' }
];

export function JobList({
  jobs,
  selectedTarget,
  onTargetChange,
  statusFilter,
  onStatusChange,
  isLoading
}: JobListProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'party', 'followers'] as Array<'all' | ShareTarget>).map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => onTargetChange(target)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                selectedTarget === target
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {shareTargetLabels[target]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onStatusChange(filter.key)}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                statusFilter === filter.key
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => {
          const scheduled = parseISO(job.scheduledFor);
          const scheduleLabel = formatDistanceToNow(scheduled, { addSuffix: true });
          return (
            <article
              key={job.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{job.listingTitle}</p>
                    <a href={job.listingUrl} className="text-sm font-semibold text-brand-600" target="_blank" rel="noreferrer">
                      View listing
                    </a>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="grid gap-3 rounded-2xl bg-slate-50/70 p-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Audience</p>
                    <p className="capitalize">{job.shareTarget}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Scheduled</p>
                    <p>{scheduleLabel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Shares sent</p>
                    <p>{job.shares}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Last update</p>
                    <p>{job.updatedAt ? formatDistanceToNow(parseISO(job.updatedAt), { addSuffix: true }) : '—'}</p>
                  </div>
                </div>
                {job.error ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{job.error}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Created {formatDistanceToNow(parseISO(job.createdAt), { addSuffix: true })}
                </span>
                {job.lastRunAt ? (
                  <span>Last run {formatDistanceToNow(parseISO(job.lastRunAt), { addSuffix: true })}</span>
                ) : (
                  <span>Not started yet</span>
                )}
              </div>
            </article>
          );
        })}
        {jobs.length === 0 && !isLoading ? (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
            No jobs match your filters just yet. Try scheduling a new share above.
          </p>
        ) : null}
        {isLoading ? (
          <p className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-400">
            Refreshing job activity…
          </p>
        ) : null}
      </div>
    </section>
  );
}
