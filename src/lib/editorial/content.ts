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
];

export function getArticle(slug: string): EditorialArticle | null {
  return EDITORIAL.find((article) => article.slug === slug) ?? null;
}
