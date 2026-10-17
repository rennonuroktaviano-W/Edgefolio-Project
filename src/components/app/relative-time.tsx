"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/trading/format";

// Relative time depends on the current clock, which is not available (and would
// not be stable) during prerendering. Render empty on the server, then fill the
// value after mount so hydration stays deterministic.
export function RelativeTime({ value }: { value: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to after mount so the server HTML ("") matches the first client
    // render; the clock is only read on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(formatRelativeTime(value));
  }, [value]);

  return (
    <time dateTime={value} suppressHydrationWarning>
      {text ?? ""}
    </time>
  );
}
