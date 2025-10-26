import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "../components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PoshPilot",
  description: "Securely manage Poshmark automations with confidence."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
