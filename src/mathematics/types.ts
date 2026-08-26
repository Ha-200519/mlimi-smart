export type CropType =
  | "maize"
  | "groundnuts"
  | "soybeans"
  | "tobacco"
  | "rice"
  | "beans"
  | "cassava"
  | "sweet_potatoes";

export interface CropGrowthInput {
  cropType: CropType;
  initialBiomass: number; // kg/ha or g/m2
  growthRate: number; // r
  carryingCapacity: number; // K (max biomass kg/ha)
  temperature: number; // °C
  rainfall: number; // mm
  soilQualityIndex: number; // 0 to 1
  waterAvailabilityRatio: number; // 0 to 1
  nitrogenLevel: number; // kg/ha
  days: number;
}

export interface GrowthPoint {
  day: number;
  biomassLogistic: number;
  biomassEnvironmental: number;
  growthRateLogistic: number;
  growthRateEnvironmental: number;
  temperatureFactor: number;
  waterFactor: number;
  nutrientFactor: number;
}

export interface YieldPredictionResult {
  cropType: CropType;
  mathematicalYieldKgPerHa: number;
  mlYieldKgPerHa: number;
  differenceKgPerHa: number;
  percentageDiff: number;
  confidenceInterval: { lower: number; upper: number };
  metrics: {
    mae: number;
    mse: number;
    rmse: number;
    rSquared: number;
    mape: number;
  };
  formulaUsed: string;
  variables: Record<string, number>;
  interpretation: string;
}

export interface CalculusSensitivities {
  dY_dT: number; // Yield change per °C
  dY_dR: number; // Yield change per mm rainfall
  dY_dW: number; // Yield change per % water
  dY_dN: number; // Yield change per kg Nitrogen
  secondDerivativeTemp: number; // d2Y / dT2
  integralBiomassOverTime: number; // Cumulative biomass
  explanations: string[];
}

export interface ODESimulationResult {
  timeSteps: number[];
  biomassTrajectory: number[];
  soilWaterStorage: number[];
  soilNitrogenLevel: number[];
  transpirationRate: number[];
}

export interface ClimateAnalyticsResult {
  rainfallMovingAvg7d: number[];
  rainfallMovingAvg30d: number[];
  temperatureTrend: number[];
  seasonalityIndex: number;
  droughtProbability: number;
  extremeRainfallRisk: number;
  forecastNext30Days: number[];
  anomalies: { day: number; value: number; type: "drought" | "excess_rain" }[];
  correlationTempRain: number;
}

export interface IrrigationRequirementResult {
  referenceEvapotranspirationET0: number; // mm/day
  cropCoefficientKc: number;
  cropEvapotranspirationETc: number; // mm/day
  effectiveRainfallPe: number; // mm/day
  soilWaterChangeDeltaS: number; // mm
  waterDeficitMm: number; // mm
  recommendedIrrigationLitersPerHa: number; // Liters/ha
  recommendedTimingHours: number;
  irrigationSchedule7Days: { day: string; reqMm: number; status: string }[];
  equationSteps: string[];
}

export interface OptimizationInput {
  availableLandHa: number;
  availableBudgetMwk: number;
  availableWaterLiters: number;
  crops: {
    cropType: CropType;
    expectedYieldTonPerHa: number;
    marketPriceMwkPerTon: number;
    productionCostMwkPerHa: number;
    waterReqLitersPerHa: number;
    minLandHa?: number;
    maxLandHa?: number;
  }[];
}

export interface OptimizationResult {
  objectiveValueMaxProfitMwk: number;
  allocations: {
    cropType: CropType;
    allocatedLandHa: number;
    expectedProductionTons: number;
    expectedRevenueMwk: number;
    costMwk: number;
    profitMwk: number;
    waterUsedLiters: number;
  }[];
  resourceUtilization: {
    landPercentage: number;
    budgetPercentage: number;
    waterPercentage: number;
  };
  method: "Linear Programming (Simplex)" | "Genetic Algorithm" | "MATLAB Linprog";
  assumptions: string[];
}

export interface EconomicAnalysisResult {
  totalCostMwk: number;
  fixedCostMwk: number;
  variableCostMwk: number;
  grossRevenueMwk: number;
  grossMarginMwk: number;
  netProfitMwk: number;
  profitMarginPercent: number;
  returnOnInvestmentPercent: number;
  breakEvenYieldKgPerHa: number;
  breakEvenPriceMwkPerKg: number;
  costPerHectareMwk: number;
  scenarios: {
    bestCaseProfitMwk: number;
    expectedCaseProfitMwk: number;
    worstCaseProfitMwk: number;
  };
  transparentCalculations: { label: string; formula: string; result: string }[];
}

export interface MonteCarloRiskResult {
  simulationsCount: number;
  meanProfitMwk: number;
  medianProfitMwk: number;
  standardDeviationMwk: number;
  minProfitMwk: number;
  maxProfitMwk: number;
  profitDistributionBins: { rangeLabel: string; count: number; frequency: number }[];
  probabilityOfLossPercent: number;
  probabilityTargetYieldPercent: number;
  valueAtRisk95Mwk: number; // Agricultural VaR at 95% confidence
  droughtProbabilityPercent: number;
  cropFailureRiskPercent: number;
  agriculturalRiskScore100: number; // 0 (low risk) to 100 (extreme risk)
}

export interface WhatIfScenarioInput {
  rainfallChangePercent: number; // e.g. -20 for 20% reduction
  temperatureChangeC: number; // e.g. +2 for +2°C
  fertilizerPriceChangePercent: number; // e.g. +30
  marketPriceChangePercent: number; // e.g. +15
  landAllocations: Record<CropType, number>;
  irrigationWaterLimitLiters?: number;
}

export interface WhatIfScenarioResult {
  baseline: {
    yieldTon: number;
    revenueMwk: number;
    costMwk: number;
    profitMwk: number;
    riskScore: number;
  };
  scenario: {
    yieldTon: number;
    revenueMwk: number;
    costMwk: number;
    profitMwk: number;
    riskScore: number;
  };
  difference: {
    yieldTonDiff: number;
    revenueMwkDiff: number;
    profitMwkDiff: number;
    profitPercentChange: number;
  };
  recommendedActions: string[];
}

export interface PCAResult {
  explainedVarianceRatio: number[];
  principalComponents: number[][];
  covarianceMatrix: number[][];
  correlationMatrix: number[][];
  featureNames: string[];
}
