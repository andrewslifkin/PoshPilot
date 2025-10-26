import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/auth";
import { AuthForm } from "../../../components/auth-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <AuthForm mode="login" />
      <div className="form-card space-y-2 bg-slate-900 text-slate-100">
        <h2 className="text-lg font-semibold">Security commitments</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-slate-200">
          <li>Passwords are hashed with bcrypt before hitting persistent storage.</li>
          <li>We use OAuth tokens whenever possible to avoid storing credentials.</li>
          <li>
            Poshmark secrets are encrypted client-side in our API layer using libsodium and customer-managed keys before
            landing in the database.
          </li>
          <li>
            Need a security review? <Link href="mailto:security@poshpilot.app">Contact our security team</Link> anytime.
          </li>
        </ul>
      </div>
    </div>
  );
}
