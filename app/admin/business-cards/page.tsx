import type { Metadata } from "next";

import { AdminManager } from "@/components/admin/AdminManager";
import { SiteShell } from "@/components/brand/SiteShell";

export const metadata: Metadata = {
  title: "Business card administration",
  robots: { index: false, follow: false },
};

export default function AdminBusinessCardsPage() {
  return (
    <SiteShell label="Administration">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdminManager />
      </section>
    </SiteShell>
  );
}
