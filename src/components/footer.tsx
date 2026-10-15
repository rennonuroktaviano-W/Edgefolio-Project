import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

// Cached so the dynamic year is safe to prerender under Cache Components.
async function getCurrentYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCurrentYear();

  return (
    <footer className="relative overflow-hidden px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-32 w-[44rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo className="h-8 w-auto opacity-90" />
        <p className="text-sm text-muted">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
