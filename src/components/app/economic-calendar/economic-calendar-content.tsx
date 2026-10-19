import { getEconomicEvents } from "@/lib/calendar/provider";
import { EconomicCalendar } from "@/components/app/economic-calendar/economic-calendar";

export async function EconomicCalendarContent() {
  const events = await getEconomicEvents();
  return <EconomicCalendar events={events} />;
}
