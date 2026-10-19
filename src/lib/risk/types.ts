export type RiskSettings = {
  userId: string | null;
  accountEquity: number | null;
  maxRiskPerTrade: number | null;
  maxDailyLoss: number | null;
  maxDrawdown: number | null;
  minRewardRisk: number | null;
  maxOpenPositions: number | null;
};

export type RiskSettingsInput = Omit<RiskSettings, "userId">;

export const EMPTY_RISK_SETTINGS: RiskSettingsInput = {
  accountEquity: null,
  maxRiskPerTrade: null,
  maxDailyLoss: null,
  maxDrawdown: null,
  minRewardRisk: null,
  maxOpenPositions: null,
};

export function hasAnyRiskSettings(settings: RiskSettingsInput): boolean {
  return Object.values(settings).some(
    (value) => value !== null && value !== undefined,
  );
}
