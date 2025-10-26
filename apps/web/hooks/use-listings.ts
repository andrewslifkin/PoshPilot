'use client';

import useSWR from 'swr';
import type { ListingSummary } from '@/lib/jobs-store';

interface ListingsResponse {
  listings: ListingSummary[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useListings() {
  const { data, error, isLoading } = useSWR<ListingsResponse>('/api/listings', fetcher, {
    revalidateOnFocus: false
  });

  return {
    listings: data?.listings ?? [],
    isLoading,
    error
  };
}
