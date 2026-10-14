import Image from "next/image";
import { CtaButton } from "@/components/cta-button";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-16 pb-20 sm:pt-24 md:pb-28">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-12rem] -z-10 mx-auto h-96 w-[42rem] max-w-full rounded-full bg-accent/10 blur-3xl"
      />

      <div className="reveal mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <Image
          src="/edgefolio-logo.png"
          alt="Edgefolio"
          width={832}
          height={192}
          priority
          className="h-9 w-auto sm:h-11"
        />

        <p className="mt-10 text-xs font-semibold tracking-[0.28em] text-accent sm:text-sm">
          {siteConfig.eyebrow}
        </p>

        <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          {siteConfig.headline}
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted">
          {siteConfig.description}
        </p>

        <div className="mt-10">
          <CtaButton />
        </div>
      </div>
    </section>
  );
}
