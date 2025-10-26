'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import type { JobSummary } from '@/lib/jobs-store';

interface SummaryCardsProps {
  summary?: JobSummary;
  isLoading?: boolean;
}

const metrics = [
  {
    key: 'activeCount' as const,
    label: 'Active jobs',
    description: 'Queued or currently sharing across your targets.'
  },
  {
    key: 'queuedCount' as const,
    label: 'Queued',
    description: 'Scheduled to share later today.'
  },
  {
    key: 'completedToday' as const,
    label: 'Completed today',
    description: 'Jobs that wrapped up since midnight.'
  },
  {
    key: 'totalSharesToday' as const,
    label: 'Shares today',
    description: 'Total shares delivered across audiences.'
  }
];

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const value = summary?.[metric.key] ?? 0;
        return (
          <article
            key={metric.key}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                Live
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <Transition
                as={Fragment}
                show={!isLoading}
                enter="transition ease-out duration-300"
                enterFrom="translate-y-2 opacity-0"
                enterTo="translate-y-0 opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              </Transition>
              {isLoading ? (
                <span className="animate-pulse text-sm text-slate-400">Updating…</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-600">{metric.description}</p>
          </article>
        );
      })}
    </div>
  );
}
