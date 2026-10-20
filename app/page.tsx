import Link from "next/link";

import { LeadCaptureForm } from "@/components/lead-form/LeadCaptureForm";
import { SiteShell } from "@/components/brand/SiteShell";

export default function HomePage() {
  return (
    <SiteShell label="Convention enquiry">
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-6 text-center sm:pt-24 sm:pb-10">
        <h1 className="text-[clamp(2.4rem,1.2rem+4vw,4.25rem)] font-light leading-[1.05] tracking-[-0.04em] text-ink">
          Let’s connect your business <span className="text-teal-deep">to what’s next.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-muted">
          Tell us what you’re interested in and the STRATO team will follow up.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#enquiry"
            className="inline-flex h-11 items-center rounded-full bg-teal px-5 text-sm font-medium text-ink transition hover:bg-teal-dark"
          >
            Talk to us
          </a>
          <Link
            href="/business-cards"
            className="glass inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-ink transition hover:bg-white/70"
          >
            Digital business cards
          </Link>
        </div>
      </section>
      <section id="enquiry" className="mx-auto w-full max-w-3xl scroll-mt-28 px-4 pb-20 sm:px-6">
        <LeadCaptureForm />
      </section>
    </SiteShell>
  );
}
