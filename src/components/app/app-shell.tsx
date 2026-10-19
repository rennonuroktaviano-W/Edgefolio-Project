"use client";

import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { SidebarCollapseContext } from "@/components/app/sidebar-context";
import { markAppSession } from "@/lib/auth/app-session";
import {
  AnalyticsIcon,
  CalendarIcon,
  CloseIcon,
  CommunityIcon,
  CompassIcon,
  DashboardIcon,
  JournalIcon,
  LeaderboardIcon,
  MenuIcon,
  PanelIcon,
  SavedIcon,
  SettingsIcon,
  ShieldIcon,
  TradesIcon,
} from "@/components/app/icons";

type NavItem = {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { label: "Explore", href: "/explore", Icon: CompassIcon },
      { label: "Community", href: "/community", Icon: CommunityIcon },
      { label: "Leaderboard", href: "/leaderboard", Icon: LeaderboardIcon },
    ],
  },
  {
    label: "My Workspace",
    items: [
      { label: "My Dashboard", href: "/dashboard", Icon: DashboardIcon },
      { label: "Journal", href: "/journal", Icon: JournalIcon },
      { label: "Trades", href: "/trades", Icon: TradesIcon },
      { label: "Analytics", href: "/analytics", Icon: AnalyticsIcon },
      { label: "Calendar", href: "/calendar", Icon: CalendarIcon },
      { label: "Risk Management", href: "/risk", Icon: ShieldIcon },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Saved Recaps", href: "/saved-recaps", Icon: SavedIcon },
      { label: "Settings", href: "/settings", Icon: SettingsIcon },
    ],
  },
];

const COLLAPSE_STORAGE_KEY = "edgefolio:sidebar-collapsed";
const COLLAPSE_EVENT = "edgefolio:sidebar-collapsed-change";

function getCollapseSnapshot() {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function NavLink({
  item,
  collapsed,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.Icon;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <li>
      <Link
        href={item.href}
        transitionTypes={["nav-forward"]}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={`group relative flex items-center rounded-xl py-2.5 text-sm transition-colors ${
          collapsed ? "justify-center px-2.5" : "gap-3 px-3"
        } ${
          active
            ? "bg-accent/12 text-accent"
            : "text-muted hover:bg-surface-strong hover:text-ink"
        }`}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
          />
        ) : null}
        <Icon className="h-5 w-5 shrink-0" />
        {collapsed ? null : (
          <span className="flex-1 truncate font-medium">{item.label}</span>
        )}
      </Link>
    </li>
  );
}

function SidebarContent({
  account,
  collapsed,
  onToggle,
  onNavigate,
  showToggle = true,
}: {
  account: ReactNode;
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  showToggle?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={`flex h-16 shrink-0 items-center border-b border-hairline ${
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-4"
        }`}
      >
        {collapsed ? null : <Logo priority className="h-6 w-auto" />}
        {showToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-transparent text-muted transition-colors hover:border-hairline hover:bg-surface-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <PanelIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Primary"
        className="scrollbar-none flex-1 overflow-y-auto px-2 py-3"
      >
        {NAV_GROUPS.map((group, index) => (
          <div key={group.label}>
            {collapsed ? (
              index > 0 ? (
                <div
                  aria-hidden="true"
                  className="mx-2 my-2.5 h-px bg-hairline"
                />
              ) : null
            ) : (
              <p
                className={`px-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-faint ${
                  index > 0 ? "mt-5" : ""
                }`}
              >
                {group.label}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={`shrink-0 border-t border-hairline ${
          collapsed ? "p-2" : "p-3"
        }`}
      >
        {account}
      </div>
    </div>
  );
}

type AppShellProps = {
  children: ReactNode;
  account: ReactNode;
};

export function AppShell({ children, account }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default to expanded for the server render and the first client render so the
  // markup matches on hydration; the persisted preference is applied after mount.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Hydration-safe sync of a persisted UI preference: the server and the first
    // client render both use the expanded default, then we read the external
    // store (localStorage) once after mount. Reading it during render would make
    // the client markup diverge from the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(getCollapseSnapshot());

    function onChange() {
      setCollapsed(getCollapseSnapshot());
    }

    window.addEventListener("storage", onChange);
    window.addEventListener(COLLAPSE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(COLLAPSE_EVENT, onChange);
    };
  }, []);

  useEffect(() => {
    markAppSession();
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    const next = !collapsed;
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
    } catch {
      // Ignore persistence failures.
    }
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  }

  return (
    <div className="relative flex min-h-dvh w-full">
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-hairline bg-surface/60 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex ${
          collapsed ? "w-[4.75rem]" : "w-64"
        }`}
      >
        <SidebarCollapseContext.Provider value={collapsed}>
          <SidebarContent
            account={account}
            collapsed={collapsed}
            onToggle={toggleCollapsed}
          />
        </SidebarCollapseContext.Provider>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-night/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="grid h-10 w-10 place-items-center rounded-xl border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <Logo priority className="h-6 w-auto" />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="auth-overlay absolute inset-0 bg-night/75 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="auth-pop absolute inset-y-0 left-0 flex w-72 max-w-[86vw] flex-col border-r border-hairline bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <SidebarCollapseContext.Provider value={false}>
              <SidebarContent
                account={account}
                collapsed={false}
                showToggle={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </SidebarCollapseContext.Provider>
          </div>
        </div>
      ) : null}
    </div>
  );
}
