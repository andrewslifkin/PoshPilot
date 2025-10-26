import Link from "next/link";
import { auth } from "../lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="space-y-10">
      <header className="space-y-6 text-center">
        <span className="badge">Security-first automation</span>
        <h1 className="text-5xl font-bold text-slate-900">PoshPilot</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Automate your Poshmark business without surrendering control of your credentials. We protect secrets using
          libsodium encryption and scoped hardware security modules per environment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="primary" href={session?.user ? "/dashboard" : "/register"}>
            {session?.user ? "Go to dashboard" : "Create a secure workspace"}
          </Link>
          <Link className="secondary" href="/login">
            Sign in
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {securityHighlights.map((item) => (
          <article key={item.title} className="form-card text-left shadow-none ring-1 ring-slate-100">
            <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

const securityHighlights = [
  {
    title: "Zero-trust storage",
    description: "Credentials are encrypted using libsodium secretboxes and keys stored in your environment's KMS or Vault."
  },
  {
    title: "Role-aware access",
    description: "We scope dashboard access via NextAuth sessions with both email-password and OAuth providers."
  },
  {
    title: "Operational transparency",
    description: "Every connection attempt is validated and logged so you can audit automation activity easily."
  }
];
