import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type EmotionTone = "positive" | "negative";

const emotions: { label: string; tone: EmotionTone }[] = [
  { label: "Focused", tone: "positive" },
  { label: "Impatient", tone: "negative" },
  { label: "FOMO", tone: "negative" },
];

const details = [
  { label: "Setup", value: "Breakout" },
  { label: "Plan followed", value: "No" },
  { label: "Result", value: "−1.0R" },
];

const emotionStyles: Record<EmotionTone, string> = {
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
};

export function TradingPsychology() {
  return (
    <section
      id="psychology"
      aria-labelledby="psychology-heading"
      className="relative px-6 pb-24 md:pb-32"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            headingId="psychology-heading"
            eyebrow="TRADING PSYCHOLOGY"
            title="Understand the Trader Behind Every Trade."
            description="Reflect on your decisions, recognize recurring habits, and build a more disciplined trading process."
          />
          <p className="mt-8 border-l border-hairline-strong pl-4 text-sm leading-6 text-muted">
            Every trade carries a reason. Reviewing your state of mind alongside
            the outcome turns scattered decisions into a pattern you can learn
            from.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="soft-frame rounded-2xl bg-surface p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">Journal entry</p>
              <span className="text-xs text-muted">Mar 14 · EURUSD</span>
            </div>

            <p className="mt-4 text-pretty text-sm leading-6 text-muted">
              &ldquo;Entered before the breakout confirmed, then sized up beyond
              the plan and moved the stop twice. The setup was fine — the
              execution was not.&rdquo;
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <li
                  key={emotion.label}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${emotionStyles[emotion.tone]}`}
                >
                  {emotion.label}
                </li>
              ))}
            </ul>

            <div
              aria-hidden="true"
              className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />

            <dl className="mt-5 grid grid-cols-3 gap-4">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-xs text-muted">{detail.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
