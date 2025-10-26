import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { PoshmarkAccountForm } from "../../components/poshmark-account-form";
import { PoshmarkAccountTable } from "../../components/poshmark-account-table";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="badge">End-to-end encryption active</span>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="max-w-2xl text-slate-600">
          Store Poshmark credentials with confidence. We encrypt secrets using libsodium secretboxes and only decrypt them
          inside secure workers with environment-specific keys.
        </p>
      </header>

      <PoshmarkAccountForm />
      <PoshmarkAccountTable />
    </div>
  );
}
