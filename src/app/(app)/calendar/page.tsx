import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { CalendarIcon } from "@/components/app/icons";

export const metadata = {
  title: "Calendar — Edgefolio",
  description: "Daily trading activity and reviews.",
};

export default function CalendarPage() {
  return (
    <FeaturePlaceholder
      eyebrow="CALENDAR"
      title="Review day by day."
      description="Calendar will show your daily trading activity and reviews in a month view."
      Icon={CalendarIcon}
      points={[
        "Daily trading activity",
        "Day-by-day reviews",
        "Spot streaks and gaps",
        "Connected to your journal",
      ]}
    />
  );
}
