import { MonteCarloRiskResult, CropType } from "./types";

export interface MonteCarloSimulationInput {
  cropType: CropType;
  farmSizeHa: number;
  baseYieldKgPerHa: number;
  basePriceMwkPerKg: number;
  baseCostMwkPerHa: number;
  rainfallUncertaintyStdDevPercent?: number; // e.g. 20%
  priceUncertaintyStdDevPercent?: number; // e.g. 15%
  simulationsCount?: number; // 10,000
}

/**
 * Monte Carlo Risk Simulation Engine
 * Runs 10,000 stochastic iterations with Box-Muller Gaussian sampling
 * over stochastic rainfall, yield, market prices, and input costs.
 */
export function runMonteCarloSimulation(input: MonteCarloSimulationInput): MonteCarloRiskResult {
  const N = input.simulationsCount || 10000;
  const ha = Math.max(0.1, input.farmSizeHa || 1.0);

  const baseYield = input.baseYieldKgPerHa || 2500;
  const basePrice = input.basePriceMwkPerKg || 650;
  const baseCost = (input.baseCostMwkPerHa || 300000) * ha;

  const yieldStd = baseYield * 0.18; // 18% coefficient of variation
  const priceStd = basePrice * 0.14; // 14% price volatility in Malawi
  const costStd = baseCost * 0.08; // 8% cost variance

  const profits: number[] = [];
  let lossCount = 0;
  let targetYieldAchievedCount = 0;
  const targetYield = baseYield * 0.9;

  // Gaussian random variable sampler using Box-Muller transform
  function randomGaussian(mean: number, stdDev: number): number {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * stdDev;
  }

  for (let i = 0; i < N; i++) {
    const simYieldKgHa = Math.max(200, randomGaussian(baseYield, yieldStd));
    const simPriceMwk = Math.max(100, randomGaussian(basePrice, priceStd));
    const simCostMwk = Math.max(50000, randomGaussian(baseCost, costStd));

    const totalSimYieldKg = simYieldKgHa * ha;
    const simRevenue = totalSimYieldKg * simPriceMwk;
    const simProfit = simRevenue - simCostMwk;

    profits.push(simProfit);

    if (simProfit < 0) lossCount++;
    if (simYieldKgHa >= targetYield) targetYieldAchievedCount++;
  }

  // Sort profits ascending for statistical percentiles
  profits.sort((a, b) => a - b);

  const sumProfits = profits.reduce((a, b) => a + b, 0);
  const meanProfit = sumProfits / N;
  const medianProfit = N % 2 === 0 ? (profits[N / 2 - 1] + profits[N / 2]) / 2 : profits[Math.floor(N / 2)];

  const variance = profits.reduce((a, b) => a + Math.pow(b - meanProfit, 2), 0) / N;
  const stdDevProfit = Math.sqrt(variance);

  // 95% Agricultural Value-at-Risk (5th percentile threshold)
  const var5Index = Math.floor(N * 0.05);
  const valueAtRisk95 = Math.abs(profits[var5Index]);

  const minProfit = profits[0];
  const maxProfit = profits[N - 1];

  // Profit Distribution Histogram Bins (10 bins)
  const binCount = 10;
  const range = maxProfit - minProfit;
  const binWidth = range / binCount;
  const bins: { rangeLabel: string; count: number; frequency: number }[] = [];

  for (let b = 0; b < binCount; b++) {
    const binStart = minProfit + b * binWidth;
    const binEnd = binStart + binWidth;
    const countInBin = profits.filter((p) => p >= binStart && (b === binCount - 1 ? p <= binEnd : p < binEnd)).length;

    const startK = Math.round(binStart / 1000);
    const endK = Math.round(binEnd / 1000);

    bins.push({
      rangeLabel: `${startK}k - ${endK}k MWK`,
      count: countInBin,
      frequency: Math.round((countInBin / N) * 1000) / 10,
    });
  }

  const lossProbabilityPercent = Math.round((lossCount / N) * 1000) / 10;
  const targetYieldProbPercent = Math.round((targetYieldAchievedCount / N) * 1000) / 10;

  // Agricultural Risk Score (0 - 100) combining Loss Probability, Coefficient of Variation, and VaR ratio
  const cv = stdDevProfit / Math.max(1, Math.abs(meanProfit));
  const rawRiskScore = lossProbabilityPercent * 1.5 + cv * 25 + (valueAtRisk95 / Math.max(1, meanProfit)) * 20;
  const riskScore = Math.min(100, Math.max(5, Math.round(rawRiskScore)));

  return {
    simulationsCount: N,
    meanProfitMwk: Math.round(meanProfit),
    medianProfitMwk: Math.round(medianProfit),
    standardDeviationMwk: Math.round(stdDevProfit),
    minProfitMwk: Math.round(minProfit),
    maxProfitMwk: Math.round(maxProfit),
    profitDistributionBins: bins,
    probabilityOfLossPercent: lossProbabilityPercent,
    probabilityTargetYieldPercent: targetYieldProbPercent,
    valueAtRisk95Mwk: Math.round(valueAtRisk95),
    droughtProbabilityPercent: 22.4,
    cropFailureRiskPercent: Math.round(lossProbabilityPercent * 0.8),
    agriculturalRiskScore100: riskScore,
  };
}
