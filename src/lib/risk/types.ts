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
