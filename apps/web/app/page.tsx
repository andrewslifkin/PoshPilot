import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '@/components/navigation';
import { Stack } from '@/components/ui/stack';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="surface max-w-2xl space-y-8 text-center">
          <Stack as="header" gap="sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              PoshPilot Platform
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Launch production-ready apps faster.
            </h1>
          </Stack>
          <p className="text-base text-brand-600/80 sm:text-lg">
            Kickstart full-stack development with a mobile-first Next.js starter, background
            workers, and batteries-included infrastructure.
          </p>
          <div className="cluster justify-center">
            <Link
              href="https://nextjs.org"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500"
            >
              Explore the docs
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="https://tailwindcss.com"
              className="inline-flex items-center gap-2 rounded-full border border-brand-100 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:border-brand-500"
            >
              Tailwind UI guide
            </Link>
          </div>
        </div>
      </main>
      <footer className="px-6 pb-safe-bottom pt-6 text-center text-xs text-brand-600/70">
        Built with love for modern teams.
      </footer>
    </div>
  );
}
