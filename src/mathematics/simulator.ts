import { WhatIfScenarioInput, WhatIfScenarioResult, CropType } from "./types";
import { calculateMathematicalYield } from "./yieldModel";
import { calculateFarmEconomics } from "./economics";
import { runMonteCarloSimulation } from "./probabilityRisk";

/**
 * What-If Agriculture Scenario Simulation Engine
 */
export function simulateWhatIfScenario(input: WhatIfScenarioInput): WhatIfScenarioResult {
  const crop: CropType = "maize";
  const baseLandHa = input.landAllocations?.maize || 2.0;

  // BASELINE
  const baseYieldResult = calculateMathematicalYield({
    cropType: crop,
    farmSizeHa: baseLandHa,
    rainfallMm: 500,
    temperatureC: 25,
    soilQualityIndex: 0.75,
    nitrogenKgPerHa: 100,
    waterAvailabilityRatio: 0.8,
    harvestEfficiency: 0.9,
    district: "Chiradzulu",
  });

  const baseEcon = calculateFarmEconomics({
    cropType: crop,
    farmSizeHa: baseLandHa,
    expectedYieldKgPerHa: baseYieldResult.mathematicalYieldKgPerHa,
    marketPriceMwkPerKg: 650,
    fixedCostsMwk: 50000,
    seedCostMwkPerHa: 45000,
    fertilizerCostMwkPerHa: 160000,
    pesticideCostMwkPerHa: 25000,
    laborCostMwkPerHa: 50000,
    transportCostMwkPerHa: 20000,
  });

  const baseRisk = runMonteCarloSimulation({
    cropType: crop,
    farmSizeHa: baseLandHa,
    baseYieldKgPerHa: baseYieldResult.mathematicalYieldKgPerHa,
    basePriceMwkPerKg: 650,
    baseCostMwkPerHa: 300000,
  });

  // SCENARIO
  const scRain = 500 * (1 + (input.rainfallChangePercent || 0) / 100);
  const scTemp = 25 + (input.temperatureChangeC || 0);
  const scFertCost = 160000 * (1 + (input.fertilizerPriceChangePercent || 0) / 100);
  const scPrice = 650 * (1 + (input.marketPriceChangePercent || 0) / 100);

  const scenarioYieldResult = calculateMathematicalYield({
    cropType: crop,
    farmSizeHa: baseLandHa,
    rainfallMm: scRain,
    temperatureC: scTemp,
    soilQualityIndex: 0.75,
    nitrogenKgPerHa: 100,
    waterAvailabilityRatio: Math.max(0.1, 0.8 * (1 + (input.rainfallChangePercent || 0) / 100)),
    harvestEfficiency: 0.9,
    district: "Chiradzulu",
  });

  const scenarioEcon = calculateFarmEconomics({
    cropType: crop,
    farmSizeHa: baseLandHa,
    expectedYieldKgPerHa: scenarioYieldResult.mathematicalYieldKgPerHa,
    marketPriceMwkPerKg: scPrice,
    fixedCostsMwk: 50000,
    seedCostMwkPerHa: 45000,
    fertilizerCostMwkPerHa: scFertCost,
    pesticideCostMwkPerHa: 25000,
    laborCostMwkPerHa: 50000,
    transportCostMwkPerHa: 20000,
  });

  const scenarioRisk = runMonteCarloSimulation({
    cropType: crop,
    farmSizeHa: baseLandHa,
    baseYieldKgPerHa: scenarioYieldResult.mathematicalYieldKgPerHa,
    basePriceMwkPerKg: scPrice,
    baseCostMwkPerHa: (50000 + scFertCost) / baseLandHa,
  });

  const baseYieldTon = (baseYieldResult.mathematicalYieldKgPerHa * baseLandHa) / 1000;
  const scYieldTon = (scenarioYieldResult.mathematicalYieldKgPerHa * baseLandHa) / 1000;

  const yieldDiffTon = scYieldTon - baseYieldTon;
  const revDiffMwk = scenarioEcon.grossRevenueMwk - baseEcon.grossRevenueMwk;
  const profitDiffMwk = scenarioEcon.netProfitMwk - baseEcon.netProfitMwk;
  const profitPercentChange = baseEcon.netProfitMwk !== 0 ? (profitDiffMwk / baseEcon.netProfitMwk) * 100 : 0;

  const actions: string[] = [];
  if (input.rainfallChangePercent < -15) {
    actions.push("Implement supplemental drip irrigation or rainwater harvesting basins to cushion against drought.");
  }
  if (input.fertilizerPriceChangePercent > 15) {
    actions.push("Incorporate organic manure / legume intercropping to reduce inorganic nitrogen fertilizer dependence.");
  }
  if (input.marketPriceChangePercent > 10) {
    actions.push("Increase acreage allocation for this crop to maximize return during high price market windows.");
  }
  if (actions.length === 0) {
    actions.push("Maintain standard agronomic practices and monitor local weather forecasts.");
  }

  return {
    baseline: {
      yieldTon: Math.round(baseYieldTon * 10) / 10,
      revenueMwk: baseEcon.grossRevenueMwk,
      costMwk: baseEcon.totalCostMwk,
      profitMwk: baseEcon.netProfitMwk,
      riskScore: baseRisk.agriculturalRiskScore100,
    },
    scenario: {
      yieldTon: Math.round(scYieldTon * 10) / 10,
      revenueMwk: scenarioEcon.grossRevenueMwk,
      costMwk: scenarioEcon.totalCostMwk,
      profitMwk: scenarioEcon.netProfitMwk,
      riskScore: scenarioRisk.agriculturalRiskScore100,
    },
    difference: {
      yieldTonDiff: Math.round(yieldDiffTon * 10) / 10,
      revenueMwkDiff: revDiffMwk,
      profitMwkDiff: profitDiffMwk,
      profitPercentChange: Math.round(profitPercentChange * 10) / 10,
    },
    recommendedActions: actions,
  };
}
