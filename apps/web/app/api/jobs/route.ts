import { NextRequest, NextResponse } from 'next/server';
import { createJob, getHistory, getJobSummary, getJobs, ShareTarget } from '@/lib/jobs-store';

export async function GET() {
  const jobs = getJobs();
  const summary = getJobSummary();
  const history = getHistory();
  return NextResponse.json({ jobs, summary, history });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();

  if (!payload) {
    return NextResponse.json({ message: 'Missing request body.' }, { status: 400 });
  }

  const { listingId, listingUrl, listingTitle, shareTarget, scheduledFor } = payload as {
    listingId?: string;
    listingUrl?: string;
    listingTitle?: string;
    shareTarget?: ShareTarget;
    scheduledFor?: string;
  };

  if (!shareTarget || !['party', 'followers'].includes(shareTarget)) {
    return NextResponse.json({ message: 'Invalid share target.' }, { status: 422 });
  }

  if (!scheduledFor) {
    return NextResponse.json({ message: 'Scheduled time is required.' }, { status: 422 });
  }

  const job = createJob({
    listingId,
    listingUrl,
    listingTitle,
    shareTarget,
    scheduledFor
  });

  return NextResponse.json({ job }, { status: 201 });
}
