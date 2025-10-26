'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { addMinutes } from 'date-fns';
import clsx from 'clsx';
import { useListings } from '@/hooks/use-listings';
import type { ShareJob, ShareTarget } from '@/lib/jobs-store';

interface ShareJobFormProps {
  onCreated?: (jobs: ShareJob[]) => void;
}

type Mode = 'saved' | 'url';

function toLocalDateTimeValue(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ShareJobForm({ onCreated }: ShareJobFormProps) {
  const { listings } = useListings();
  const [mode, setMode] = useState<Mode>('saved');
  const [shareTarget, setShareTarget] = useState<ShareTarget>('party');
  const [scheduledFor, setScheduledFor] = useState(() => toLocalDateTimeValue(addMinutes(new Date(), 15)));
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>(listings[0]?.id);
  const [urlInput, setUrlInput] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const targetOptions: Array<{ key: ShareTarget; label: string; description: string }> = useMemo(
    () => [
      {
        key: 'party' as const,
        label: 'Party',
        description: 'Best for themed parties where high velocity matters.'
      },
      {
        key: 'followers' as const,
        label: 'Followers',
        description: 'Reach your followers feed with scheduled pulses.'
      }
    ],
    []
  );

  useEffect(() => {
    if (!selectedListingId && listings.length) {
      setSelectedListingId(listings[0]?.id);
    }
  }, [listings, selectedListingId]);

  useEffect(() => {
    if (!listings.length && mode === 'saved') {
      setMode('url');
    }
  }, [listings, mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const scheduledDate = new Date(scheduledFor);
      const isoDate = scheduledDate.toISOString();
      const createdJobs: ShareJob[] = [];

      if (mode === 'saved') {
        const payload = {
          listingId: selectedListingId,
          shareTarget,
          scheduledFor: isoDate
        };
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error('Unable to schedule job. Please try again.');
        }
        const { job } = (await response.json()) as { job: ShareJob };
        createdJobs.push(job);
      } else {
        const urls = urlInput
          .split(/\n|,/) // allow newline or comma separated
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        if (!urls.length) {
          throw new Error('Add at least one listing URL to schedule.');
        }

        for (const url of urls) {
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              listingUrl: url,
              listingTitle: customTitle || 'Shared Listing',
              shareTarget,
              scheduledFor: isoDate
            })
          });
          if (!response.ok) {
            throw new Error('Unable to schedule one of the jobs.');
          }
          const { job } = (await response.json()) as { job: ShareJob };
          createdJobs.push(job);
        }
      }

      if (onCreated) {
        onCreated(createdJobs);
      }

      setFeedback(
        createdJobs.length === 1
          ? 'Share job added successfully!'
          : `${createdJobs.length} share jobs added successfully!`
      );
      setUrlInput('');
      setCustomTitle('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unexpected error while scheduling job.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm"
      aria-describedby="share-form-feedback"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Plan a share</h2>
        <p className="text-sm text-slate-600">
          Paste listing URLs or pick from saved inventory, then choose where and when to share.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-slate-800">Listing source</legend>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'saved', label: 'Saved listings' },
            { key: 'url', label: 'Paste URLs' }
          ] as Array<{ key: Mode; label: string }>).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setMode(option.key)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                mode === option.key ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mode === 'saved' ? (
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Select listing</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base"
              value={selectedListingId ?? ''}
              onChange={(event) => setSelectedListingId(event.target.value)}
              aria-label="Saved listing"
              required
            >
              <option value="" disabled>
                Choose a listing
              </option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid gap-3">
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Listing URLs</span>
              <textarea
                className="min-h-[120px] w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-base"
                placeholder="https://poshmark.com/listing/your-awesome-piece"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                aria-required={mode === 'url'}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Custom title (optional)</span>
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
                placeholder="How should we label this share?"
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-slate-800">Share target</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {targetOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setShareTarget(option.key)}
              className={clsx(
                'flex flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left shadow-sm transition focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                shareTarget === option.key
                  ? 'border-brand-400 bg-brand-50/80 text-brand-700 shadow-brand-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
              )}
              aria-pressed={shareTarget === option.key}
            >
              <span className="text-base font-semibold">{option.label}</span>
              <span className="text-sm text-slate-500">{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Schedule</span>
        <input
          type="datetime-local"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          min={toLocalDateTimeValue(new Date())}
          required
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Scheduling…' : 'Schedule share'}
        </button>
        <span id="share-form-feedback" className="text-sm text-emerald-600" aria-live="polite">
          {feedback}
        </span>
      </div>
    </form>
  );
}
