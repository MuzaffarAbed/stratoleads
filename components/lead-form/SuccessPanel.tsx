import Link from "next/link";

export function SuccessPanel() {
  return (
    <section className="glass rounded-3xl px-5 py-8 sm:px-8" aria-live="polite">
      <p className="text-xs font-medium tracking-[0.08em] text-teal-deep uppercase">STRATO IT Group</p>
      <h2 className="mt-3 text-3xl font-light tracking-[-0.03em] text-ink">Thank you</h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">
        Your enquiry has been saved. The STRATO team will follow up with you.
      </p>
      <div className="mt-6">
        <Link
          href="/business-cards"
          className="inline-flex h-11 items-center justify-center rounded-full bg-teal px-5 text-sm font-medium text-ink hover:bg-teal-dark"
        >
          View digital business cards
        </Link>
      </div>
    </section>
  );
}
