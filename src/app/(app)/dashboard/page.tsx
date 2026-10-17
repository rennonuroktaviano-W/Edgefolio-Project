import { MyDashboard } from "@/components/app/my-dashboard";

export const metadata = {
  title: "My Dashboard — Edgefolio",
  description: "Your private performance statistics and equity curve.",
};

export default function DashboardPage() {
  return (
    <div className="reveal">
      <header>
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          MY DASHBOARD
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Your performance, privately.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
          A private view of your statistics and equity curve. Only you can see
          this page.
        </p>
      </header>

      <MyDashboard />
    </div>
  );
}
