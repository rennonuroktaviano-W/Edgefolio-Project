import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/dal";
import { SettingsForm } from "@/components/app/settings-form";

export const metadata = {
  title: "Settings — Edgefolio",
  description: "Profile, security, preferences, and privacy.",
};

function PlaceholderCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-warning"
          />
          In development
        </span>
      </div>
      <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
    </section>
  );
}

async function SettingsAccount() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <SettingsForm
      user={{
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      }}
    />
  );
}

function SettingsFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-72 animate-pulse rounded-2xl border border-hairline bg-surface/60"
    />
  );
}

export default function SettingsPage() {
  return (
    <div className="reveal">
      <header>
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          SETTINGS
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
          Manage your profile, security, preferences, and privacy.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        <Suspense fallback={<SettingsFallback />}>
          <SettingsAccount />
        </Suspense>

        <PlaceholderCard
          title="Preferences"
          description="Language, timezone, and display options will live here."
        />

        <PlaceholderCard
          title="Privacy"
          description="Control what others can see. Your journal and private notes are never public."
        />
      </div>
    </div>
  );
}
