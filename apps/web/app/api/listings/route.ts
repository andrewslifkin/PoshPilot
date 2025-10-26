import { NextResponse } from 'next/server';
import { getSavedListings } from '@/lib/jobs-store';

export async function GET() {
  return NextResponse.json({ listings: getSavedListings() });
}
