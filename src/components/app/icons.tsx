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
