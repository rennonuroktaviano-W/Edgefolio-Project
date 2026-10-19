// Edgefolio editorial content.
//
// These articles are written by us and are clearly opinion/education about
// process, psychology, and risk. They contain no market data, price levels, or
// performance claims, so nothing here can be mistaken for live or fabricated
// market information. Each article links to its own route under
// /explore/insights/[slug].

export type EditorialCategory = "Process" | "Psychology" | "Risk" | "Mindset";

export type EditorialArticle = {
  slug: string;
  title: string;
  summary: string;
  category: EditorialCategory;
  readingMinutes: number;
  // Fixed publish date; editorial content is not a live feed.
  date: string;
  body: readonly string[];
};

export const EDITORIAL: readonly EditorialArticle[] = [
  {
    slug: "process-over-outcome",
    title: "Process over outcome",
    summary:
      "Judge a trade by whether you followed your plan, not by whether it won. Over a large sample, good process is what produces good results.",
    category: "Process",
    readingMinutes: 4,
    date: "2026-05-12",
    body: [
      "A single trade is a coin flip dressed up as a decision. The market does not know your thesis is reasonable, and it does not reward you for being right about the setup. That is why grading yourself on the outcome of one trade teaches you almost nothing.",
      "Grading the process is different. Did you have a written plan before you entered? Did you size the position to a rule you set in advance? Did you know where you would be wrong, and did you act on that level when it arrived? These are questions you can answer honestly, trade by trade, without waiting for the market to decide.",
      "Over a hundred trades, the noise of any single result washes out. What remains is the quality of your decisions. If your process is sound and your risk is controlled, the results tend to follow — not every month, not every quarter, but over the sample size a serious trader actually trades.",
      "The practical habit: keep a short checklist of the conditions that must be true before you enter, and score each trade against it afterward. A trade that followed every rule is a good trade even when it loses. A trade that ignored your rules is a bad trade even when it wins.",
    ],
  },
  {
    slug: "write-it-down-before-the-exit",
    title: "Write it down before the exit",
    summary:
      "A journal entry written before the exit is worth ten written after. Capture the thesis while the pressure is real.",
    category: "Psychology",
    readingMinutes: 3,
    date: "2026-05-20",
    body: [
      "Memory is a storyteller, not a recorder. Once a trade closes, your brain quietly rewrites the reasoning to match the result. Wins become obvious in hindsight; losses become unlucky. The note you write after the fact is rarely the note you would have written in the moment.",
      "That is why the most valuable journal entry is the one you write while the position is still open. In that window the outcome is unknown, the emotions are live, and your reasoning is honest — because you cannot yet know which parts to excuse.",
      "Write three things before you exit: why you are in, what would make you wrong, and how you feel right now. The first two give future-you a reference point. The third catches the patterns that quietly drive your worst decisions — the trades taken out of boredom, revenge, or the fear of missing a move that has already happened.",
      "The goal is not perfect prose. It is a truthful snapshot of your thinking at the moment it mattered. Read those snapshots back a month later and your recurring mistakes become almost embarrassingly clear.",
    ],
  },
  {
    slug: "size-for-survival",
    title: "Size for survival",
    summary:
      "Risk a small, fixed fraction per trade so no single loss can set you back. Consistency is what lets an edge compound.",
    category: "Risk",
    readingMinutes: 4,
    date: "2026-06-02",
    body: [
      "Most traders who blow up do not have a bad strategy. They have an oversized position at the wrong time. The mathematics of loss is unforgiving: a fifty percent drawdown requires a hundred percent gain to recover. Survive the drawdowns and you keep the right to compound.",
      "The simplest defense is a fixed fraction rule. Decide in advance what percentage of your account you are willing to lose on any one trade — small enough that a losing streak is annoying rather than existential — and let that rule, not your conviction, choose the size.",
      "Conviction is the enemy here. The trades you feel most certain about are exactly the ones that tempt you to size up, and exactly the ones that can hurt the most. A rule you apply mechanically removes that trap. You stop negotiating with yourself in the heat of a trade.",
      "Survival first is not timidity. It is the foundation. An edge only compounds if you are still around to trade it, so protect the account on the boring trades so it is intact for the rare ones that matter.",
    ],
  },
  {
    slug: "the-quiet-cost-of-overtrading",
    title: "The quiet cost of overtrading",
    summary:
      "More trades is not more edge. Overtrading usually means boredom, revenge, or the need to feel in control — none of which pay.",
    category: "Mindset",
    readingMinutes: 5,
    date: "2026-06-15",
    body: [
      "Activity feels like progress. A screen full of executions looks like a trader working hard. But volume is not the same as edge, and many traders would improve their results by simply trading less.",
      "Overtrading usually shows up for one of three reasons. Boredom: the market is quiet, you are idle, and any movement looks like an opportunity. Revenge: you just took a loss and want to make it back immediately. Control: uncertainty is uncomfortable, so you act to feel like you are doing something about it.",
      "None of these reasons have anything to do with the quality of a setup. Each one pushes you to take trades your plan would never have approved, and each one adds transaction costs and decision fatigue on top of the emotional cost.",
      "A useful countermeasure is to make your plan the source of permission. If a setup is not on the list, you do not take it — no matter how it feels. The discipline to sit still is a skill, and for many traders it is worth more than any indicator.",
    ],
  },
  {
    slug: "the-review-that-changes-behavior",
    title: "The review that actually changes behavior",
    summary:
      "A review is only useful if it ends in one specific, testable change. Vague lessons like \"be more patient\" change nothing.",
    category: "Process",
    readingMinutes: 4,
    date: "2026-07-01",
    body: [
      "Most trade reviews are comforting, not useful. They restate what happened, add a vague lesson, and leave you exactly as you were. \"I need to be more disciplined\" is not a lesson; it is a wish.",
      "A review changes behavior when it ends in one specific, testable change. Not \"trade smaller\" but \"cap size at the fixed fraction on every trade for the next twenty trades.\" Not \"cut losses faster\" but \"place the stop at the level I wrote before entry, with no exceptions.\"",
      "Specific changes can be checked. After twenty trades you can look back and see whether you actually followed the rule. That feedback loop is what makes the next review sharper than the last.",
      "Keep the review short: what did I plan, what did I do, where did the two diverge, and what single rule fixes the gap. One honest rule, applied and checked, beats a page of good intentions every time.",
    ],
  },
  {
    slug: "risk-not-conviction-sets-your-size",
    title: "Let risk, not conviction, set your size",
    summary:
      "The size of a position should follow a rule you set in advance, not how strongly you feel about the trade.",
    category: "Risk",
    readingMinutes: 4,
    date: "2026-07-14",
    body: [
      "It is tempting to size up when a setup feels obvious. The feeling is real, but it is not information — the market does not pay out confidence, it pays out being right while surviving being wrong.",
      "When conviction decides your size, your largest positions cluster around your most emotional trades. Those are exactly the trades where a surprise hurts most, because the loss is magnified by the very confidence that produced it.",
      "A rule does the opposite. You decide in advance how much you will risk, and the size follows from the distance to your invalidation level. A tight stop allows a larger position; a wide stop requires a smaller one. The rule is indifferent to how you feel.",
      "This is not about avoiding big positions. It is about earning them the same way every time, so that no single decision can take you out of the game. Risk is the constant; size is the variable you can actually control.",
    ],
  },
  {
    slug: "sizing-by-volatility",
    title: "Size by volatility, not by habit",
    summary:
      "A fixed share count means your risk changes with the market. Let the instrument's own range decide the size.",
    category: "Risk",
    readingMinutes: 5,
    date: "2026-07-28",
    body: [
      "Trading a set number of shares or coins feels tidy, but it quietly makes your risk inconsistent. The same position size means very different exposure in a calm market and a violent one.",
      "Volatility-based sizing corrects this. Instead of starting from a quantity, you start from the amount you are willing to lose and the distance to the level that proves you wrong. The position is whatever fits between those two numbers.",
      "In practice this means your size shrinks when the instrument is choppy and can grow when it is calm, always anchored to the same dollar risk. You are not predicting volatility; you are responding to what the chart already shows.",
      "The payoff is a smoother equity curve. No single wild session can do outsized damage, because the sizing rule quietly refused to let you take an oversized bet in the first place.",
    ],
  },
  {
    slug: "the-losing-streak-is-normal",
    title: "A losing streak is normal, not a verdict",
    summary:
      "Even a good strategy loses several times in a row. Knowing that in advance is what keeps you from abandoning it at the worst moment.",
    category: "Psychology",
    readingMinutes: 4,
    date: "2026-08-09",
    body: [
      "If you win half your trades, a run of six losses is not a rare disaster — it is something you should expect to see several times across a few hundred trades. Streaks of losses are baked into the arithmetic of any edge.",
      "The danger is not the streak itself; it is what it does to your thinking. After the third loss the temptation is to double down, abandon the plan, or take a trade that has nothing to do with your rules. That reaction, not the streak, is what turns a normal drawdown into a real one.",
      "Knowing the streak is normal is a form of preparation. If you expect it, it is annoying rather than shocking, and you are far less likely to make a desperate decision in the middle of it.",
      "The test of a strategy is not whether it avoids losing streaks. It is whether you can keep executing it while one is happening. That is where most edges are either kept or thrown away.",
    ],
  },
  {
    slug: "is-your-strategy-actually-working",
    title: "Is your strategy actually working?",
    summary:
      "To judge a strategy you need a sample, a baseline, and a rule for what would change your mind — not a feeling after a good week.",
    category: "Process",
    readingMinutes: 5,
    date: "2026-08-12",
    body: [
      "After a good week a strategy feels brilliant; after a bad one it feels broken. Neither reaction is a judgment, because a week is not a sample. Judging an edge on a handful of trades is like judging a coin on three flips.",
      "To evaluate a strategy honestly you need three things. A sample large enough to mean something, a baseline to compare against, and a rule for what result would make you abandon it — decided before you look at the results.",
      "The baseline matters more than most traders admit. Beating zero is a low bar; you want to know whether the edge is worth the risk you are taking to collect it. A strategy that profits but drains you with drawdowns may not be one you can actually trade.",
      "Write the criteria down in advance and review on a schedule, not after every loss. That is the difference between evaluating a strategy and reacting to the last thing that happened to you.",
    ],
  },
];

export function getArticle(slug: string): EditorialArticle | null {
  return EDITORIAL.find((article) => article.slug === slug) ?? null;
}
