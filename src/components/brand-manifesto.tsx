import { Reveal } from "@/components/reveal";

const principles = [
  {
    index: "01",
    title: "Measure the process.",
    detail: "Track the decisions you make, not just the outcomes you get.",
  },
  {
    index: "02",
    title: "Learn from every trade.",
    detail: "Treat each entry and exit as evidence for the next decision.",
  },
  {
    index: "03",
    title: "Improve with intention.",
    detail: "Turn reflection into a habit that compounds over time.",
  },
];

export function BrandManifesto() {
  return (
    <section
      id="manifesto"
      aria-labelledby="manifesto-heading"
      className="relative overflow-hidden px-6 pb-28 md:pb-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-[46rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.28em] text-accent">
            THE EDGEFOLIO WAY
          </p>
          <h2
            id="manifesto-heading"
            className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl"
          >
            Better Data. Clearer Decisions. Stronger Discipline.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-muted">
            Edgefolio is built on a simple belief: the quality of your decisions
            improves when your process is measured.
          </p>
        </Reveal>

        <Reveal className="mt-14" delay={140}>
          <ul className="grid gap-10 text-left sm:grid-cols-3 sm:gap-8">
            {principles.map((principle) => (
              <li
                key={principle.index}
                className="border-t border-hairline pt-5"
              >
                <p className="text-xs font-semibold tracking-[0.28em] text-accent">
                  {principle.index}
                </p>
                <p className="mt-3 text-lg font-medium tracking-tight text-ink">
                  {principle.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {principle.detail}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
