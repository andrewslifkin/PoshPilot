export const SHARE_JOB_QUEUE = "share-jobs";

export type ShareAudience = "followers" | "party";

export type ShareJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface RateLimiterConfig {
  /** Minimum delay in milliseconds between share attempts */
  minMs: number;
  /** Maximum delay in milliseconds between share attempts */
  maxMs: number;
}

export interface SerializedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export interface ShareJobRequest {
  listingIds: string[];
  audience: ShareAudience;
  rate: RateLimiterConfig;
  /**
   * Session cookies captured from a prior authenticated interaction. They are
   * replayed inside the Playwright context to avoid interactive login flows.
   */
  sessionCookies: SerializedCookie[];
  /** Optional refresh endpoint to renew cookies when they expire */
  authRefreshUrl?: string;
}

export interface ShareJobPayload extends ShareJobRequest {
  id: string;
  status: ShareJobStatus;
}

export type ShareEventType =
  | "job-queued"
  | "job-started"
  | "job-completed"
  | "job-failed"
  | "share-started"
  | "share-succeeded"
  | "share-failed"
  | "auth-refresh"
  | "challenge-detected";

export interface ShareEventRecord {
  id: string;
  jobId: string;
  type: ShareEventType;
  message: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ShareJobRecord {
  id: string;
  audience: ShareAudience;
  rate: RateLimiterConfig;
  listingIds: string[];
  status: ShareJobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShareJobStatusResponse {
  job: ShareJobRecord;
  events: ShareEventRecord[];
}

export const SHARE_EVENT_CHANNEL = "share-events";
