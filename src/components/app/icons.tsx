type IconProps = {
  className?: string;
};

const base = "h-5 w-5";

function svgProps(className?: string) {
  return {
    "aria-hidden": true,
    viewBox: "0 0 20 20",
    className: className ?? base,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="m13 7-1.6 4.4L7 13l1.6-4.4z" />
    </svg>
  );
}

export function JournalIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 3.5h8.5A1.5 1.5 0 0 1 15 5v11.5H6.5A1.5 1.5 0 0 1 5 15z" />
      <path d="M5 14.5A1.5 1.5 0 0 1 6.5 13H15" />
      <path d="M8 7h4.5M8 9.75h3" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="3.25" y="4.75" width="13.5" height="12" rx="2.25" />
      <path d="M3.25 8.5h13.5M7 3.25v3M13 3.25v3" />
    </svg>
  );
}

export function AnalyticsIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 16V10M8.6 16V5M13.2 16v-4M17 16V8.5" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 3 4.75 5v4.5c0 3.4 2.2 6 5.25 7.25 3.05-1.25 5.25-3.85 5.25-7.25V5z" />
      <path d="m7.9 9.9 1.5 1.5 2.9-2.9" />
    </svg>
  );
}

export function AccountIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

export function PanelIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="3.25" y="4.25" width="13.5" height="11.5" rx="2.25" />
      <path d="M8 4.25v11.5" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 6.5h12M4 10h12M4 13.5h12" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="m6 8 4 4 4-4" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="9" cy="9" r="4.75" />
      <path d="m13 13 3 3" />
    </svg>
  );
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 13.5 8 9.5l2.6 2.6L16 6.5" />
      <path d="M12.5 6.5H16V10" />
    </svg>
  );
}

export function TrendDownIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 6.5 8 10.5l2.6-2.6L16 13.5" />
      <path d="M12.5 13.5H16V10" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function CommunityIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="7.75" cy="7.5" r="2.75" />
      <path d="M3 16.5a4.75 4.75 0 0 1 9.5 0" />
      <path d="M13.5 5.25a2.75 2.75 0 0 1 0 5.5" />
      <path d="M14.25 11.85a4.75 4.75 0 0 1 2.75 4.65" />
    </svg>
  );
}

export function LeaderboardIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M6.75 3.5h6.5v3.75a3.25 3.25 0 0 1-6.5 0z" />
      <path d="M6.75 4.75h-2a2 2 0 0 0 2 2" />
      <path d="M13.25 4.75h2a2 2 0 0 1-2 2" />
      <path d="M10 10.5v2.75" />
      <path d="M7.5 16.5h5" />
      <path d="M8.25 16.5v-1.75a1.75 1.75 0 0 1 3.5 0v1.75" />
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="3.25" y="3.25" width="6" height="6" rx="1.5" />
      <rect x="10.75" y="3.25" width="6" height="3.5" rx="1.5" />
      <rect x="10.75" y="8.25" width="6" height="8.5" rx="1.5" />
      <rect x="3.25" y="10.75" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export function TradesIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 6.5h9.5" />
      <path d="m11.5 3.5 3 3-3 3" />
      <path d="M15 13.5H5.5" />
      <path d="m8.5 16.5-3-3 3-3" />
    </svg>
  );
}

export function SavedIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M6 3.5h8a1.25 1.25 0 0 1 1.25 1.25v11.75L10 13.5l-5.25 3V4.75A1.25 1.25 0 0 1 6 3.5z" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4.25 6.25h11.5" />
      <path d="M4.25 13.75h11.5" />
      <circle cx="8" cy="6.25" r="1.75" />
      <circle cx="12" cy="13.75" r="1.75" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 16.25C6.5 14 3.5 11.6 3.5 8.6A3.35 3.35 0 0 1 10 6.9a3.35 3.35 0 0 1 6.5 1.7c0 3-3 5.4-6.5 7.65z" />
    </svg>
  );
}

export function CommentIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 5.5h12v7.5H9l-3.5 3V13H4z" />
    </svg>
  );
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M6 3.5h8a1.25 1.25 0 0 1 1.25 1.25v11.75L10 13.5l-5.25 3V4.75A1.25 1.25 0 0 1 6 3.5z" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 3.25v9" />
      <path d="m6.75 6.5 3.25-3.25L13.25 6.5" />
      <path d="M5 10.5v4.75h10V10.5" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 3.25c2.5 2.4 3.75 4.7 3.75 6.75a3.75 3.75 0 0 1-7.5 0c0-1.1.4-2.1 1.1-3.05.35.9.9 1.5 1.65 1.8-.35-2 .3-3.85 1-5.5z" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="m10 3.25 1.95 3.95 4.35.63-3.15 3.07.74 4.33L10 13.2l-3.89 2.03.74-4.33L3.7 7.83l4.35-.63z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="10" cy="10" r="6.75" />
      <path d="M10 6.5V10l2.5 1.5" />
    </svg>
  );
}

export function NewsIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M3.5 5.25h10.5a2 2 0 0 1 2 2v7.5a1.5 1.5 0 0 0 1.5-1.5V7" />
      <path d="M3.5 5.25v9A1.75 1.75 0 0 0 5.25 16h10.75" />
      <path d="M6 8.25h6M6 10.75h6M6 13.25h3.5" />
    </svg>
  );
}
