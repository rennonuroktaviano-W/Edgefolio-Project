export function ExploreHeader({ greeting }: { greeting: string }) {
  return (
    <header className="reveal">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          EXPLORE
        </p>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Your market briefing.
        </h1>
        <p className="mt-2 text-sm text-muted">{greeting}</p>
      </div>
    </header>
  );
}
