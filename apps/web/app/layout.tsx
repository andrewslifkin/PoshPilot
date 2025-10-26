import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'PoshPilot Share Dashboard',
  description: 'Plan, track, and review your Poshmark share jobs with ease.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={clsx(
          'min-h-screen bg-slate-50 text-slate-900',
          'selection:bg-brand-200 selection:text-brand-900'
        )}
      >
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
