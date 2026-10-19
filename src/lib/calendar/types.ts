export type EventImpact = "high" | "medium" | "low" | "holiday";

export type EconomicEvent = {
  title: string;
  // Currency the event affects ("USD", "EUR", …) or "ALL" for global events.
  currency: string;
  impact: EventImpact;
  // ISO-8601 instant. The feed ships a UTC offset, so this is unambiguous.
  at: string;
  forecast: string | null;
  previous: string | null;
};
