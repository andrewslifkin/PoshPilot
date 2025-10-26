'use client';

import useSWR from 'swr';
import type { JobSummary, ShareHistoryEntry, ShareJob } from '@/lib/jobs-store';

export interface JobsResponse {
  jobs: ShareJob[];
  summary: JobSummary;
  history: ShareHistoryEntry[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useJobs(initialData?: JobsResponse) {
  const { data, error, isLoading, mutate } = useSWR<JobsResponse>('/api/jobs', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    fallbackData: initialData
  });

  return {
    jobs: data?.jobs ?? [],
    summary: data?.summary,
    history: data?.history ?? [],
    isLoading,
    error,
    refresh: mutate
  };
}
