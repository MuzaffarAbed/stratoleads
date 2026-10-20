import { BrandFooter } from "@/components/brand/BrandFooter";
import { BrandHeader } from "@/components/brand/BrandHeader";

export function SiteShell({
  children,
  compactFooter = false,
}: {
  label?: string;
  children: React.ReactNode;
  compactFooter?: boolean;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_-8%,#b7e6ea_0%,rgba(230,247,248,0.2)_34%,transparent_64%),radial-gradient(ellipse_at_88%_0%,rgba(51,192,202,0.42)_0%,transparent_40%),radial-gradient(ellipse_at_50%_72%,rgba(51,192,202,0.2)_0%,transparent_52%)]" />
      <BrandHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <BrandFooter compact={compactFooter} />
    </>
  );
}
