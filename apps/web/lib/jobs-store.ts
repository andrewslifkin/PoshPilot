import { addMinutes, formatISO, subMinutes } from 'date-fns';

export type ShareTarget = 'party' | 'followers';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ListingSummary {
  id: string;
  title: string;
  url: string;
  thumbnailColor: string;
}

export interface ShareJob {
  id: string;
  listingId: string;
  listingTitle: string;
  listingUrl: string;
  shareTarget: ShareTarget;
  scheduledFor: string;
  status: JobStatus;
  shares: number;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  error?: string;
  historyRecorded?: boolean;
}

export interface ShareHistoryEntry {
  id: string;
  jobId: string;
  listingTitle: string;
  shareTarget: ShareTarget;
  shares: number;
  completedAt: string;
  error?: string;
}

const savedListings: ListingSummary[] = [
  {
    id: 'listing-001',
    title: 'Vintage Leather Jacket',
    url: 'https://poshmark.com/listing/vintage-leather-jacket-001',
    thumbnailColor: 'bg-orange-200'
  },
  {
    id: 'listing-002',
    title: 'Minimalist Silver Necklace',
    url: 'https://poshmark.com/listing/minimalist-silver-necklace-002',
    thumbnailColor: 'bg-emerald-200'
  },
  {
    id: 'listing-003',
    title: 'Classic Denim Jeans',
    url: 'https://poshmark.com/listing/classic-denim-jeans-003',
    thumbnailColor: 'bg-blue-200'
  }
];

const now = new Date();

const jobs: ShareJob[] = [
  {
    id: 'job-001',
    listingId: 'listing-001',
    listingTitle: savedListings[0].title,
    listingUrl: savedListings[0].url,
    shareTarget: 'party',
    scheduledFor: formatISO(subMinutes(now, 20)),
    status: 'completed',
    shares: 24,
    createdAt: formatISO(subMinutes(now, 70)),
    updatedAt: formatISO(subMinutes(now, 18)),
    lastRunAt: formatISO(subMinutes(now, 18))
  },
  {
    id: 'job-002',
    listingId: 'listing-002',
    listingTitle: savedListings[1].title,
    listingUrl: savedListings[1].url,
    shareTarget: 'followers',
    scheduledFor: formatISO(subMinutes(now, 5)),
    status: 'running',
    shares: 8,
    createdAt: formatISO(subMinutes(now, 45)),
    updatedAt: formatISO(subMinutes(now, 5)),
    lastRunAt: formatISO(subMinutes(now, 3))
  },
  {
    id: 'job-003',
    listingId: 'listing-003',
    listingTitle: savedListings[2].title,
    listingUrl: savedListings[2].url,
    shareTarget: 'party',
    scheduledFor: formatISO(addMinutes(now, 15)),
    status: 'queued',
    shares: 0,
    createdAt: formatISO(subMinutes(now, 10)),
    updatedAt: formatISO(subMinutes(now, 10))
  },
  {
    id: 'job-004',
    listingId: 'listing-002',
    listingTitle: savedListings[1].title,
    listingUrl: savedListings[1].url,
    shareTarget: 'followers',
    scheduledFor: formatISO(subMinutes(now, 40)),
    status: 'failed',
    shares: 3,
    createdAt: formatISO(subMinutes(now, 120)),
    updatedAt: formatISO(subMinutes(now, 39)),
    lastRunAt: formatISO(subMinutes(now, 38)),
    error: 'API rate limit reached during final batch.'
  }
];

const history: ShareHistoryEntry[] = jobs
  .filter((job) => job.status === 'completed' || job.status === 'failed')
  .map((job) => ({
    id: `history-${job.id}`,
    jobId: job.id,
    listingTitle: job.listingTitle,
    shareTarget: job.shareTarget,
    shares: job.shares,
    completedAt: job.lastRunAt ?? job.updatedAt,
    error: job.error
  }));

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function simulateProgress(job: ShareJob) {
  if (job.status === 'completed' || job.status === 'failed') {
    return;
  }

  const nowDate = new Date();
  const scheduled = new Date(job.scheduledFor);
  const runningCutoff = addMinutes(scheduled, 5);

  if (nowDate < scheduled) {
    job.status = 'queued';
  } else if (nowDate < runningCutoff) {
    job.status = 'running';
    job.lastRunAt = formatISO(nowDate);
    job.updatedAt = formatISO(nowDate);
    const minutesSinceStart = Math.max(0, (nowDate.getTime() - scheduled.getTime()) / 60000);
    job.shares = Math.max(job.shares, Math.round(minutesSinceStart * 4));
  } else {
    if (job.error) {
      job.status = 'failed';
    } else {
      job.status = 'completed';
      job.shares = Math.max(job.shares, 24);
    }
    job.lastRunAt = job.lastRunAt ?? formatISO(runningCutoff);
    job.updatedAt = formatISO(nowDate);
    if (!job.historyRecorded) {
      history.unshift({
        id: nextId('history'),
        jobId: job.id,
        listingTitle: job.listingTitle,
        shareTarget: job.shareTarget,
        shares: job.shares,
        completedAt: job.lastRunAt,
        error: job.error
      });
      job.historyRecorded = true;
    }
  }
}

export function getSavedListings(): ListingSummary[] {
  return savedListings;
}

export function getJobs(): ShareJob[] {
  jobs.forEach(simulateProgress);
  return jobs
    .slice()
    .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());
}

export function getHistory(limit = 15): ShareHistoryEntry[] {
  return history.slice(0, limit);
}

interface CreateJobInput {
  listingId?: string;
  listingUrl?: string;
  listingTitle?: string;
  shareTarget: ShareTarget;
  scheduledFor: string;
}

export function createJob(input: CreateJobInput): ShareJob {
  const listing = savedListings.find((item) => item.id === input.listingId);
  const listingTitle = input.listingTitle ?? listing?.title ?? 'Shared Listing';
  const listingUrl = input.listingUrl ?? listing?.url ?? '#';
  const newJob: ShareJob = {
    id: nextId('job'),
    listingId: input.listingId ?? nextId('listing'),
    listingTitle,
    listingUrl,
    shareTarget: input.shareTarget,
    scheduledFor: input.scheduledFor,
    status: 'queued',
    shares: 0,
    createdAt: formatISO(new Date()),
    updatedAt: formatISO(new Date())
  };
  jobs.unshift(newJob);
  return newJob;
}

export interface JobSummary {
  activeCount: number;
  queuedCount: number;
  runningCount: number;
  failedCount: number;
  completedToday: number;
  totalSharesToday: number;
}

export function getJobSummary(): JobSummary {
  const nowDate = new Date();
  const startOfDay = new Date(nowDate);
  startOfDay.setHours(0, 0, 0, 0);

  let completedToday = 0;
  let totalSharesToday = 0;
  let queuedCount = 0;
  let runningCount = 0;
  let failedCount = 0;

  jobs.forEach((job) => {
    simulateProgress(job);
    switch (job.status) {
      case 'queued':
        queuedCount += 1;
        break;
      case 'running':
        runningCount += 1;
        break;
      case 'failed':
        failedCount += 1;
        break;
      case 'completed':
        if (job.lastRunAt) {
          const finished = new Date(job.lastRunAt);
          if (finished >= startOfDay) {
            completedToday += 1;
            totalSharesToday += job.shares;
          }
        }
        break;
      default:
        break;
    }
  });

  return {
    activeCount: queuedCount + runningCount,
    queuedCount,
    runningCount,
    failedCount,
    completedToday,
    totalSharesToday
  };
}
