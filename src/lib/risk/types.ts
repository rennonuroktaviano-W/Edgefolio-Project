export type RiskSettings = {
  userId: string | null;
  accountEquity: number | null;
  maxRiskPerTrade: number | null;
  maxDailyLoss: number | null;
  maxWeeklyLoss: number | null;
  maxDrawdown: number | null;
  minRewardRisk: number | null;
  maxTradesPerDay: number | null;
  maxConsecutiveLosses: number | null;
};

export type RiskSettingsInput = Omit<RiskSettings, "userId">;
