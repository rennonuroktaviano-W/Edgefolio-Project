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
  maxWeeklyLoss: string;
  maxDrawdown: string;
  minRewardRisk: string;
  maxTradesPerDay: string;
  maxConsecutiveLosses: string;
};

const FIELDS: Field[] = [
  {
    id: "accountEquity",
    label: "Modal akun",
    hint: "Ukuran akun trading kamu dalam mata uang dasar. Dipakai untuk semua perhitungan persen.",
    step: "any",
  },
  {
    id: "maxRiskPerTrade",
    label: "Risiko maks. per trade (%)",
    hint: "Porsi akun maksimal yang kamu pasang pada satu trade. 1% adalah batas umum.",
    step: "any",
  },
  {
    id: "maxDailyLoss",
    label: "Loss maks. harian (%)",
    hint: "Berhenti trading hari ini begitu loss menyentuh porsi ini dari akun.",
    step: "any",
  },
  {
    id: "maxWeeklyLoss",
    label: "Loss maks. mingguan (%)",
    hint: "Batas loss untuk satu minggu. Kalau mentok, rehat sampai minggu berikutnya.",
    step: "any",
  },
  {
    id: "maxDrawdown",
    label: "Drawdown maks. (%)",
    hint: "Toleransi total penurunan dari puncak equity sebelum kamu mundur dulu.",
    step: "any",
  },
  {
    id: "minRewardRisk",
    label: "R:R minimum",
    hint: "Abaikan trade yang potensi untungnya lebih kecil dari kelipatan ini terhadap risikonya. Contoh: 2 = untung 2× risiko.",
    step: "any",
  },
  {
    id: "maxTradesPerDay",
    label: "Maks. trade per hari",
    hint: "Jumlah trade maksimal dalam satu hari. Membantu mencegah overtrading.",
    step: "1",
  },
  {
    id: "maxConsecutiveLosses",
    label: "Maks. loss beruntun",
    hint: "Berapa loss beruntun sebelum kamu wajib istirahat.",
    step: "1",
  },
];

export type PlanFormProps = {
  initial: {
    accountEquity: number | null;
    maxRiskPerTrade: number | null;
    maxDailyLoss: number | null;
    maxWeeklyLoss: number | null;
    maxDrawdown: number | null;
    minRewardRisk: number | null;
    maxTradesPerDay: number | null;
    maxConsecutiveLosses: number | null;
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
    maxWeeklyLoss:
      initial.maxWeeklyLoss === null
        ? ""
        : String(round(initial.maxWeeklyLoss * 100, 4)),
    maxDrawdown:
      initial.maxDrawdown === null
        ? ""
        : String(round(initial.maxDrawdown * 100, 4)),
    minRewardRisk:
      initial.minRewardRisk === null ? "" : String(initial.minRewardRisk),
    maxTradesPerDay:
      initial.maxTradesPerDay === null ? "" : String(initial.maxTradesPerDay),
    maxConsecutiveLosses:
      initial.maxConsecutiveLosses === null
        ? ""
        : String(initial.maxConsecutiveLosses),
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
      maxWeeklyLoss: toPercent(state.maxWeeklyLoss),
      maxDrawdown: toPercent(state.maxDrawdown),
      minRewardRisk: toNumber(state.minRewardRisk),
      maxTradesPerDay: toNumber(state.maxTradesPerDay),
      maxConsecutiveLosses: toNumber(state.maxConsecutiveLosses),
    };

    try {
      const response = await fetch("/api/risk/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Rencana risiko tidak bisa disimpan.");
        return;
      }

      setNotice("Rencana risiko tersimpan.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div>
        <p className="text-sm font-medium text-ink">Rencana risiko kamu</p>
        <p className="mt-1 text-xs text-muted">
          Batas yang kamu pegang sendiri. Dipakai oleh kalkulator dan
          dicek terhadap trade nyata kamu.
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
          {saving ? "Menyimpan…" : "Simpan rencana"}
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
