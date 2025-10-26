"use client";

import useSWR from "swr";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface PoshmarkAccount {
  id: string;
  label: string;
  status: string;
  lastValidatedAt: string | null;
  createdAt: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function PoshmarkAccountTable() {
  const { data, error, isLoading, mutate } = useSWR<PoshmarkAccount[]>("/api/poshmark/accounts", fetcher, {
    refreshInterval: 20_000
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Connected accounts</h3>
        <button className="secondary" onClick={() => mutate()} disabled={isLoading}>
          Refresh
        </button>
      </div>
      <div className="badge">We never store raw credentials. Values shown are metadata only.</div>
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Status</th>
              <th>Validated</th>
              <th>Connected</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center text-slate-500">
                  Loading accounts…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={4} className="text-center text-rose-600">
                  Could not load accounts. {error instanceof Error ? error.message : "Try again."}
                </td>
              </tr>
            )}
            {data?.length ? (
              data.map((account) => (
                <tr key={account.id}>
                  <td>{account.label}</td>
                  <td>{account.status}</td>
                  <td>
                    {account.lastValidatedAt
                      ? formatDistanceToNow(new Date(account.lastValidatedAt), { addSuffix: true })
                      : "Pending"}
                  </td>
                  <td>{formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}</td>
                </tr>
              ))
            ) : (
              !isLoading && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500">
                    No accounts connected yet.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
