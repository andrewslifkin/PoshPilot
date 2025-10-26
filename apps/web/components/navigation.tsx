'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import { Cluster } from '@/components/ui/cluster';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#infrastructure', label: 'Infrastructure' },
  { href: '#docs', label: 'Docs' },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-brand-50/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-600">
          PoshPilot
        </Link>
        <button
          type="button"
          className="rounded-full border border-brand-100 p-2 text-brand-600 sm:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <Cluster as="div" className="hidden sm:flex" gap="md">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-brand-600/80 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
          <Link
            href="#get-started"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Get started
          </Link>
        </Cluster>
      </nav>
      {open ? (
        <div className="border-t border-brand-100 bg-white px-6 py-4 sm:hidden">
          <Cluster as="div" direction="column" gap="sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-brand-600/80 hover:text-brand-600"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </Cluster>
        </div>
      ) : null}
    </header>
  );
}
