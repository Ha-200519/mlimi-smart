import { CropType } from "./types";
import { calculateMathematicalYield } from "./yieldModel";
import { calculateFarmEconomics } from "./economics";

export interface MultiParameterPerturbation {
  rainfallPercent: number; // -50 to +50%
  temperatureChangeC: number; // -5 to +5 °C
  nitrogenPercent: number; // -50 to +50%
  pricePercent: number; // -50 to +50%
}

export interface SensitivityCurvePoint {
  perturbationPercent: number;
  yieldImpactKgHa: number;
  revenueImpactMwk: number;
  profitImpactMwk: number;
}

/**
 * Multi-parameter Agricultural Sensitivity Plot Generator
 */
export function generateSensitivityPlot(
  cropType: CropType,
  baseYieldKgHa: number = 2600,
  basePriceMwkKg: number = 650
): SensitivityCurvePoint[] {
  const points: SensitivityCurvePoint[] = [];
  const perturbations = [-30, -20, -10, 0, 10, 20, 30];

  for (const delta of perturbations) {
    const pertScalar = 1 + delta / 100;

    const yieldVal = baseYieldKgHa * Math.pow(pertScalar, 0.75);
    const priceVal = basePriceMwkKg * (1 + (delta * 0.5) / 100);

    const revenue = yieldVal * priceVal;
    const cost = 300000;
    const profit = revenue - cost;

    points.push({
      perturbationPercent: delta,
      yieldImpactKgHa: Math.round(yieldVal),
      revenueImpactMwk: Math.round(revenue),
      profitImpactMwk: Math.round(profit),
    });
  }

  return points;
}
