import Image from "next/image";
import { siteConfig } from "@/config/site";

// Cached so the dynamic year is safe to prerender under Cache Components.
async function getCurrentYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCurrentYear();

  return (
    <footer className="border-t border-hairline px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Image
          src="/edgefolio-logo.png"
          alt="Edgefolio"
          width={832}
          height={192}
          className="h-8 w-auto"
        />
        <p className="text-sm text-muted">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
