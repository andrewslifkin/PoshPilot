import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { AuthForm } from "../../../components/auth-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <AuthForm mode="register" />
      <div className="form-card space-y-2 bg-blue-900 text-blue-50">
        <h2 className="text-lg font-semibold">Why we require strong passwords</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-blue-100">
          <li>Longer, more complex passwords reduce credential stuffing risk.</li>
          <li>
            We hash passwords with bcrypt and monitor for credential compromise events to prompt resets.
          </li>
          <li>Multi-factor authentication is coming soon via authenticator apps and passkeys.</li>
        </ul>
      </div>
    </div>
  );
}
