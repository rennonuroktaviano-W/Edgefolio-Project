"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NumberField, SegmentedControl } from "@/components/app/form";
import { Badge } from "@/components/app/badge";
import type { RiskSettings } from "@/lib/risk/types";
import { formatMoney, formatNumber, formatRatio } from "@/lib/trading/format";

type Mode = "risk" | "target" | "fixed";

export function PositionCalculator({ settings }: { settings: RiskSettings }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("risk");
  const [equity, setEquity] = useState(() =>
    settings.accountEquity === null ? "" : String(settings.accountEquity),
  );
  const [riskPct, setRiskPct] = useState(() =>
    settings.maxRiskPerTrade === null
      ? ""
      : String(round(settings.maxRiskPerTrade * 100, 2)),
  );
  const [target, setTarget] = useState("");
  const [rr, setRr] = useState(() =>
    settings.minRewardRisk === null ? "" : String(settings.minRewardRisk),
  );
  const [size, setSize] = useState("");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");

  const result = useMemo(() => {
    const equityValue = parse(equity);

    if (equityValue === null || equityValue <= 0) {
      return { ok: false as const, error: "Isi modal akun dulu untuk menghitung ukuran posisi." };
    }

    if (mode === "risk") {
      const riskValue = parse(riskPct);
      if (riskValue === null || riskValue <= 0 || riskValue >= 100) {
        return { ok: false as const, error: "Risiko per trade harus antara 0 dan 100%." };
      }
      const riskAmount = equityValue * (riskValue / 100);
      const units = unitsFromStop(riskAmount, entry, stop);

      if (!units.ok) return units;

      return {
        ok: true as const,
        size: riskAmount,
        riskOfEquity: riskValue / 100,
        units: units.value > 0 ? units.value : null,
        stopDistance: units.value > 0 ? units.distance : null,
        reward: parse(rr) !== null ? riskAmount * (parse(rr) as number) : null,
        plannedRR: parse(rr),
      };
    }

    if (mode === "target") {
      const targetValue = parse(target);
      const rrValue = parse(rr);
      if (targetValue === null || targetValue <= 0) {
        return { ok: false as const, error: "Masukkan target untung yang lebih besar dari 0." };
      }
      if (rrValue === null || rrValue <= 0) {
        return { ok: false as const, error: "Masukkan R:R yang direncanakan (mis. 2)." };
      }
      const riskAmount = targetValue / rrValue;
      return {
        ok: true as const,
        size: riskAmount,
        riskOfEquity: riskAmount / equityValue,
        units: null,
        stopDistance: null,
        reward: targetValue,
        plannedRR: rrValue,
      };
    }

    const sizeValue = parse(size);
    if (sizeValue === null || sizeValue <= 0) {
      return { ok: false as const, error: "Masukkan ukuran size yang lebih besar dari 0." };
    }
    const rrValue = parse(rr);
    return {
      ok: true as const,
      size: sizeValue,
      riskOfEquity: sizeValue / equityValue,
      units: null,
      stopDistance: null,
      reward: rrValue !== null && rrValue > 0 ? sizeValue * rrValue : null,
      plannedRR: rrValue !== null && rrValue > 0 ? rrValue : null,
    };
  }, [entry, equity, mode, riskPct, rr, size, stop, target]);

  const canPrefill = result.ok && result.size > 0;

  function useForNewTrade() {
    if (!result.ok || result.size <= 0) return;
    const params = new URLSearchParams();
    params.set("size", `$${round(result.size, 2)}`);
    if (result.plannedRR !== null && result.plannedRR > 0) {
      params.set("rr", String(round(result.plannedRR, 2)));
    }
    router.push(`/trades?${params.toString()}`);
  }

  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Kalkulator posisi</p>
          <p className="mt-1 text-xs text-muted">
            Hitung size trade dari batas risiko, target untung, atau size
            tetap — semuanya berbasis modal akun kamu.
          </p>
        </div>
        <Badge tone="accent">Live math</Badge>
      </div>

      <div className="mt-5">
        <SegmentedControl
          label="Mode hitung"
          value={mode}
          onChange={setMode}
          options={[
            { value: "risk", label: "Risiko per trade" },
            { value: "target", label: "Target untung" },
            { value: "fixed", label: "Size tetap" },
          ]}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField
          id="calc-equity"
          label="Modal akun"
          value={equity}
          onChange={setEquity}
          placeholder="10000"
          step="any"
          min="0"
          hint="Dalam mata uang dasar kamu."
        />
        {mode === "risk" ? (
          <NumberField
            id="calc-risk"
            label="Risiko per trade (%)"
            value={riskPct}
            onChange={setRiskPct}
            placeholder="1"
            step="any"
            min="0"
            hint="Default dari rencana risiko kamu."
          />
        ) : null}
        {mode === "target" ? (
          <NumberField
            id="calc-target"
            label="Target untung ($)"
            value={target}
            onChange={setTarget}
            placeholder="200"
            step="any"
            min="0"
            hint="Berapa yang mau kamu dapat dari trade ini."
          />
        ) : null}
        {mode === "fixed" ? (
          <NumberField
            id="calc-size"
            label="Size ($)"
            value={size}
            onChange={setSize}
            placeholder="100"
            step="any"
            min="0"
            hint="Jumlah yang dipasang per trade ini."
          />
        ) : null}
        {mode !== "target" ? (
          <NumberField
            id="calc-rr"
            label="R:R direncanakan (opsional)"
            value={rr}
            onChange={setRr}
            placeholder="2"
            step="any"
            min="0"
            hint="Mis. 2 = target untung 2× risiko."
          />
        ) : (
          <NumberField
            id="calc-rr"
            label="R:R direncanakan"
            value={rr}
            onChange={setRr}
            placeholder="2"
            step="any"
            min="0"
            hint="Wajib: mis. 2 = target untung 2× risiko."
          />
        )}
        {mode === "risk" ? (
          <>
            <NumberField
              id="calc-entry"
              label="Harga entry (opsional)"
              value={entry}
              onChange={setEntry}
              placeholder="100"
              step="any"
              min="0"
              hint="Isi entry + stop kalau mau tahu size dalam satuan unit."
            />
            <NumberField
              id="calc-stop"
              label="Harga stop (opsional)"
              value={stop}
              onChange={setStop}
              placeholder="97"
              step="any"
              min="0"
              hint="Stop harus di sisi berlawanan dari entry."
            />
          </>
        ) : null}
      </div>

      <div className="mt-6 rounded-xl border border-hairline bg-night/40 p-4">
        {result.ok === false ? (
          <p className="text-sm text-muted">{result.error}</p>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted">Size yang disarankan</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {formatMoney(result.size)}
              </p>
              {result.units !== null ? (
                <p className="mt-1 text-xs text-muted">
                  ≈ {formatNumber(result.units, 6)} unit (stop distance{" "}
                  {formatNumber(result.stopDistance ?? 0, 6)})
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              <Readout
                label="Risiko (%)"
                value={`${formatNumber(result.riskOfEquity * 100, 2)}%`}
              />
              <Readout
                label="Potensi untung"
                value={result.reward === null ? "—" : formatMoney(result.reward)}
              />
              <Readout
                label="R:R"
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

      {canPrefill ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Hasilnya bisa langsung jadi isi form trade baru.
          </p>
          <button
            type="button"
            onClick={useForNewTrade}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Pakai untuk trade baru →
          </button>
        </div>
      ) : null}
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

function unitsFromStop(
  riskAmount: number,
  entryRaw: string,
  stopRaw: string,
):
  | { ok: true; value: number; distance: number }
  | { ok: false; error: string } {
  if (entryRaw.trim() === "" && stopRaw.trim() === "") {
    return { ok: true, value: 0, distance: 0 };
  }

  const entryValue = parse(entryRaw);
  const stopValue = parse(stopRaw);
  if (entryValue === null || entryValue <= 0) {
    return { ok: false, error: "Masukkan harga entry yang valid." };
  }
  if (stopValue === null || stopValue <= 0) {
    return { ok: false, error: "Masukkan harga stop yang valid." };
  }

  const distance = Math.abs(entryValue - stopValue);
  if (distance === 0) {
    return { ok: false, error: "Stop harus berbeda dari entry." };
  }
  return { ok: true, value: riskAmount / distance, distance };
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
