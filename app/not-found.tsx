import { SiteShell } from "@/components/brand/SiteShell";
import { ErrorState } from "@/components/ui/ErrorState";

export default function NotFound() {
  return (
    <SiteShell label="STRATO IT Group">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState title="Page not found" body="The page you requested is not available." />
      </section>
    </SiteShell>
  );
}
