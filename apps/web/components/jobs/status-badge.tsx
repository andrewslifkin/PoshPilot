'use client';

import clsx from 'clsx';
import type { JobStatus } from '@/lib/jobs-store';

const statusStyles: Record<JobStatus, string> = {
  queued: 'bg-amber-50 text-amber-600 ring-amber-200',
  running: 'bg-sky-50 text-sky-600 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-600 ring-rose-200'
};

const statusLabels: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed'
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset',
        statusStyles[status]
      )}
    >
      <span className="size-2 rounded-full bg-current" aria-hidden />
      {statusLabels[status]}
    </span>
  );
}
