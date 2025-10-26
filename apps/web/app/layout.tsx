import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'PoshPilot Web',
  description: 'Modern mobile-first control center for the PoshPilot platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-50 text-brand-600">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
