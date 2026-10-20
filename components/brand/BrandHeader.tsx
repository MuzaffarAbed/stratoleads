import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Enquiry" },
  { href: "/business-cards", label: "Business cards" },
  { href: "/privacy", label: "Privacy" },
];

export function BrandHeader() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 rounded-full pr-2 pl-4 sm:pl-5">
        <Link href="/" className="shrink-0 rounded-full" aria-label="STRATO IT Group — Home">
          <Image
            src="/brand/strato-wordmark.png"
            alt="STRATO"
            width={108}
            height={18}
            priority
            className="h-[18px] w-auto"
            style={{ width: "auto", height: "18px" }}
          />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink/75 transition hover:bg-white/70 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <details className="relative md:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-full px-3 text-sm text-ink/80 marker:content-none">
              Menu
            </summary>
            <nav
              className="glass absolute right-0 z-50 mt-3 w-52 rounded-3xl p-2"
              aria-label="Mobile"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-3 py-2.5 text-sm text-ink hover:bg-teal-light"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
          <Link
            href="/#enquiry"
            className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-teal px-3.5 text-[13px] font-medium text-ink transition hover:bg-teal-dark sm:px-4"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </header>
  );
}
