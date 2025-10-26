'use client';

import { format } from 'date-fns';
import type { ShareHistoryEntry } from '@/lib/jobs-store';

interface HistoryTimelineProps {
  items: ShareHistoryEntry[];
}

export function HistoryTimeline({ items }: HistoryTimelineProps) {
  if (!items.length) {
    return (
      <p className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
        Sharing history will appear here once your first jobs complete.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((entry, index) => {
        const isFirst = index === 0;
        return (
          <li key={entry.id} className="relative flex gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <span className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-brand-300/40 to-transparent" aria-hidden />
            <div className="relative z-10 mt-1 flex size-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-700">
              <span className="text-sm font-semibold">{entry.shares}</span>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{entry.listingTitle}</p>
                <span className="text-xs uppercase tracking-wide text-brand-600">{entry.shareTarget}</span>
              </div>
              <p className="text-xs text-slate-500">
                {format(new Date(entry.completedAt), 'MMM d, yyyy • h:mm a')}
              </p>
              {entry.error ? (
                <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{entry.error}</p>
              ) : (
                <p className="text-sm text-slate-600">
                  Successfully shared <strong className="font-semibold text-slate-900">{entry.shares}</strong> times.
                </p>
              )}
              {isFirst ? (
                <span className="mt-1 inline-flex max-w-fit rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  Latest
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
