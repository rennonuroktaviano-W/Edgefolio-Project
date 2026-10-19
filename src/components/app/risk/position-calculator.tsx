"use client";

import { useMemo, useState } from "react";
import { NumberField, SegmentedControl } from "@/components/app/form";
import { Badge } from "@/components/app/badge";
import type { RiskSettings } from "@/lib/risk/types";
import { formatMoney, formatNumber, formatRatio } from "@/lib/trading/format";

type Direction = "long" | "short";

export function PositionCalculator({ settings }: { settings: RiskSettings }) {
  const [equity, setEquity] = useState(() =>
    settings.accountEquity === null ? "" : String(settings.accountEquity),
  );
  const [riskPct, setRiskPct] = useState(() =>
    settings.maxRiskPerTrade === null
      ? ""
      : String(round(settings.maxRiskPerTrade * 100, 2)),
  );
  const [direction, setDirection] = useState<Direction>("long");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");

  const result = useMemo(() => {
    const equityValue = parse(equity);
    const riskValue = parse(riskPct);
    const entryValue = parse(entry);
    const stopValue = parse(stop);
    const targetValue = target === "" ? null : parse(target);

    if (equityValue === null || equityValue <= 0) {
      return { error: "Enter your account equity to size a position." } as const;
    }
    if (riskValue === null || riskValue <= 0 || riskValue >= 100) {
      return {
        error: "Risk per trade must be between 0 and 100%.",
      } as const;
    }
    if (entryValue === null || entryValue <= 0) {
      return { error: "Enter a valid entry price." } as const;
    }
    if (stopValue === null || stopValue <= 0) {
      return { error: "Enter a valid stop price." } as const;
    }

    const stopDistance = Math.abs(entryValue - stopValue);
    if (stopDistance === 0) {
      return {
        error: "Stop must be on the opposite side of entry.",
      } as const;
    }

    if (direction === "long" && stopValue >= entryValue) {
      return {
        error: "For a long, the stop must sit below the entry.",
      } as const;
    }
    if (direction === "short" && stopValue <= entryValue) {
      return {
        error: "For a short, the stop must sit above the entry.",
      } as const;
    }

    const riskAmount = equityValue * (riskValue / 100);
    const perUnitRisk = stopDistance;
    const quantity = riskAmount / perUnitRisk;

    const rewardAmount =
      targetValue !== null && targetValue > 0
        ? Math.abs(targetValue - entryValue) * quantity
        : null;
    const plannedRR = rewardAmount !== null ? rewardAmount / riskAmount : null;

    return {
      quantity: round(quantity, 6),
      riskAmount,
      riskOfEquity: riskValue / 100,
      perUnitRisk,
      rewardAmount,
      plannedRR,
    } as const;
  }, [entry, equity, direction, riskPct, stop, target]);

  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Position size calculator</p>
          <p className="mt-1 text-xs text-muted">
            How many units to buy or sell so a stopped-out trade only costs the
            risk you planned.
          </p>
        </div>
        <Badge tone="accent">Live math</Badge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField
          id="calc-equity"
          label="Account equity"
          value={equity}
          onChange={setEquity}
          placeholder="10000"
          step="any"
          min="0"
          hint="In your base currency."
        />
        <NumberField
          id="calc-risk"
          label="Risk per trade (%)"
          value={riskPct}
          onChange={setRiskPct}
          placeholder="1"
          step="any"
          min="0"
          hint="Defaults from your risk plan when set."
        />
        <NumberField
          id="calc-entry"
          label="Entry price"
          value={entry}
          onChange={setEntry}
          placeholder="100"
          step="any"
          min="0"
        />
        <div className="flex flex-col gap-3">
          <SegmentedControl
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "long", label: "Long" },
              { value: "short", label: "Short" },
            ]}
          />
          <NumberField
            id="calc-stop"
            label="Stop price"
            value={stop}
            onChange={setStop}
            placeholder="97"
            step="any"
            min="0"
          />
        </div>
        <NumberField
          id="calc-target"
          label="Take profit (optional)"
          value={target}
          onChange={setTarget}
          placeholder="110"
          step="any"
          min="0"
          hint="Leave blank to skip the R:R readout."
        />
      </div>

      <div className="mt-6 rounded-xl border border-hairline bg-night/40 p-4">
        {"error" in result ? (
          <p className="text-sm text-muted">{result.error}</p>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted">Suggested size</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {formatNumber(result.quantity, 6)}{" "}
                <span className="text-sm font-normal text-muted">units</span>
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <Readout label="Risk ($)" value={formatMoney(result.riskAmount)} />
              <Readout
                label="Risk (%)"
                value={`${formatNumber(result.riskOfEquity * 100, 2)}%`}
              />
              <Readout
                label="Stop distance"
                value={formatNumber(result.perUnitRisk, 6)}
              />
              <Readout
                label="Planned R:R"
                value={
                  result.plannedRR === null
                    ? "—"
                    : formatRatio(result.plannedRR)
                }
                tone={
                  result.plannedRR !== null && result.plannedRR >= 2
                    ? "positive"
                    : "muted"
                }
              />
            </dl>
          </div>
        )}
      </div>

    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "muted";
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        className={`text-sm ${
          tone === "positive" ? "text-positive" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function parse(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
