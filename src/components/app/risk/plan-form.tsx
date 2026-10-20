"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NumberField } from "@/components/app/form";

type Field = {
  id: keyof PlanState;
  label: string;
  hint: string;
  step: string;
};

type PlanState = {
  accountEquity: string;
  maxRiskPerTrade: string;
  maxDailyLoss: string;
  maxDrawdown: string;
  minRewardRisk: string;
};

const FIELDS: Field[] = [
  {
    id: "accountEquity",
    label: "Account equity",
    hint: "Your trading account size in the base currency. Used for % of account math.",
    step: "any",
  },
  {
    id: "maxRiskPerTrade",
    label: "Max risk per trade (%)",
    hint: "The most of your account you will put at risk on one trade. 1% is a common ceiling.",
    step: "any",
  },
  {
    id: "maxDailyLoss",
    label: "Max daily loss (%)",
    hint: "Stop trading for the day once losses reach this share of your account.",
    step: "any",
  },
  {
    id: "maxDrawdown",
    label: "Max drawdown (%)",
    hint: "Your total loss tolerance from peak equity before you step back.",
    step: "any",
  },
  {
    id: "minRewardRisk",
    label: "Minimum reward / risk",
    hint: "Skip any trade whose planned upside is smaller than this multiple of its risk.",
    step: "any",
  },
];

export type PlanFormProps = {
  initial: {
    accountEquity: number | null;
    maxRiskPerTrade: number | null;
    maxDailyLoss: number | null;
    maxDrawdown: number | null;
    minRewardRisk: number | null;
  };
};

function toState(initial: PlanFormProps["initial"]): PlanState {
  return {
    accountEquity: initial.accountEquity === null ? "" : String(initial.accountEquity),
    maxRiskPerTrade:
      initial.maxRiskPerTrade === null
        ? ""
        : String(round(initial.maxRiskPerTrade * 100, 4)),
    maxDailyLoss:
      initial.maxDailyLoss === null
        ? ""
        : String(round(initial.maxDailyLoss * 100, 4)),
    maxDrawdown:
      initial.maxDrawdown === null
        ? ""
        : String(round(initial.maxDrawdown * 100, 4)),
    minRewardRisk:
      initial.minRewardRisk === null ? "" : String(initial.minRewardRisk),
  };
}

export function PlanForm({ initial }: PlanFormProps) {
  const router = useRouter();
  const [state, setState] = useState<PlanState>(() => toState(initial));
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(id: keyof PlanState, value: string) {
    setState((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);

    const payload = {
      accountEquity: toNumber(state.accountEquity),
      maxRiskPerTrade: toPercent(state.maxRiskPerTrade),
      maxDailyLoss: toPercent(state.maxDailyLoss),
      maxDrawdown: toPercent(state.maxDrawdown),
      minRewardRisk: toNumber(state.minRewardRisk),
    };

    try {
      const response = await fetch("/api/risk/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "We could not save your risk plan.");
        return;
      }

      setNotice("Your risk plan is saved.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div>
        <p className="text-sm font-medium text-ink">Your risk plan</p>
        <p className="mt-1 text-xs text-muted">
          The limits you want to hold yourself to. They are used by the
          calculator and checked against your actual trades.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <NumberField
            key={field.id}
            id={`risk-plan-${field.id}`}
            label={field.label}
            value={state[field.id]}
            onChange={(value) => update(field.id, value)}
            placeholder="—"
            step={field.step}
            min="0"
            hint={field.hint}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save risk plan"}
        </button>
        {notice ? <p className="text-sm text-positive">{notice}</p> : null}
        {error ? <p className="text-sm text-negative">{error}</p> : null}
      </div>
    </form>
  );
}

function toNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toPercent(raw: string): number | null {
  const parsed = toNumber(raw);
  return parsed === null ? null : parsed / 100;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
