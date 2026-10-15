import Image from "next/image";
import { CtaButton } from "@/components/cta-button";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-16 pb-20 sm:pt-24 md:pb-28">
      <div
        aria-hidden="true"
        className="bg-aurora pointer-events-none absolute inset-x-0 top-0 -z-20 h-[36rem]"
      />
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute left-[6%] top-24 -z-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-float-slow pointer-events-none absolute right-[8%] top-16 -z-10 h-52 w-52 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-breathe pointer-events-none absolute left-1/2 top-[-8rem] -z-10 h-80 w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <Image
          src="/edgefolio-logo.png"
          alt="Edgefolio"
          width={832}
          height={192}
          priority
          className="reveal h-9 w-auto drop-shadow-[0_0_24px_rgba(200,255,61,0.35)] sm:h-11"
        />

        <p
          className="reveal mt-10 text-xs font-semibold tracking-[0.28em] text-accent sm:text-sm"
          style={{ animationDelay: "90ms" }}
        >
          {siteConfig.eyebrow}
        </p>

        <h1
          className="text-gradient reveal mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          style={{ animationDelay: "170ms" }}
        >
          {siteConfig.headline}
        </h1>

        <p
          className="reveal mt-6 max-w-xl text-pretty text-lg leading-8 text-muted"
          style={{ animationDelay: "250ms" }}
        >
          {siteConfig.description}
        </p>

        <div className="reveal mt-10" style={{ animationDelay: "330ms" }}>
          <CtaButton />
        </div>
      </div>
    </section>
  );
}
