import Link from 'next/link';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                <span className="sr-only">PoshPilot</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  className="size-6"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12c3-5.333 6-8 9-8s6 2.667 9 8c-3 5.333-6 8-9 8s-6-2.667-9-8z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                PoshPilot Dashboard
              </span>
            </Link>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Coordinate and monitor share campaigns across party and follower audiences with live
              status updates.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="#support"
              className="rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            >
              Support
            </Link>
            <Link
              href="#settings"
              className="rounded-full bg-brand-600 px-5 py-2 text-center text-sm font-semibold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>&copy; {new Date().getFullYear()} PoshPilot. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="#privacy" className="hover:text-brand-600">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-brand-600">
              Terms
            </Link>
            <Link href="#accessibility" className="hover:text-brand-600">
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
