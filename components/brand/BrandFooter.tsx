import Image from "next/image";
import Link from "next/link";

export function BrandFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div
        className={`mx-auto grid w-full max-w-[1240px] gap-10 px-5 sm:px-8 ${compact ? "py-8" : "py-14 md:grid-cols-12"}`}
      >
        <div className={compact ? "" : "md:col-span-5"}>
          <Image
            src="/brand/strato-wordmark.png"
            alt="STRATO"
            width={144}
            height={24}
            className="h-6 w-auto"
            style={{ width: "auto", height: "auto" }}
          />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">Sensible. Seamless. Sustainable.</p>
        </div>
        {compact ? null : (
          <>
            <div className="md:col-span-3">
              <h2 className="text-sm font-medium text-ink">This site</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>
                  <Link href="/" className="hover:text-ink">
                    Convention enquiry
                  </Link>
                </li>
                <li>
                  <Link href="/business-cards" className="hover:text-ink">
                    Digital business cards
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-ink">
                    Privacy notice
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h2 className="text-sm font-medium text-ink">STRATO IT Group</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>
                  <a href="https://www.stratoit.co.za/" className="hover:text-ink">
                    stratoit.co.za
                  </a>
                </li>
                <li>
                  <a href="mailto:info@stratoitgroup.co.za" className="hover:text-ink">
                    info@stratoitgroup.co.za
                  </a>
                </li>
                <li>
                  <a href="tel:+27112587800" className="hover:text-ink">
                    011 258 7800
                  </a>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1240px] px-5 py-5 text-sm text-muted sm:px-8">
          © {new Date().getFullYear()} Strato IT Group (Pty) Ltd.
        </p>
      </div>
    </footer>
  );
}
