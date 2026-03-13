import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-4">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <Header />
        {children}
      </section>
    </main>
  );
}
