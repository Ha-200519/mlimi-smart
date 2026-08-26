import { CropGrowthInput, GrowthPoint, CropType } from "./types";

// Crop specific parameters for Malawi agricultural varieties
export const CROP_GROWTH_PARAMETERS: Record<
  CropType,
  {
    optimalTempC: number;
    tempToleranceC: number;
    waterReqMm: number;
    nitrogenOptimalKg: number;
    defaultK: number; // Max biomass kg/ha
    defaultR: number; // Growth rate per day
  }
> = {
  maize: { optimalTempC: 25, tempToleranceC: 7, waterReqMm: 500, nitrogenOptimalKg: 120, defaultK: 12000, defaultR: 0.085 },
  groundnuts: { optimalTempC: 27, tempToleranceC: 6, waterReqMm: 450, nitrogenOptimalKg: 40, defaultK: 4500, defaultR: 0.065 },
  soybeans: { optimalTempC: 26, tempToleranceC: 5, waterReqMm: 500, nitrogenOptimalKg: 50, defaultK: 5000, defaultR: 0.070 },
  tobacco: { optimalTempC: 24, tempToleranceC: 6, waterReqMm: 550, nitrogenOptimalKg: 90, defaultK: 3500, defaultR: 0.075 },
  rice: { optimalTempC: 28, tempToleranceC: 5, waterReqMm: 900, nitrogenOptimalKg: 100, defaultK: 8000, defaultR: 0.090 },
  beans: { optimalTempC: 22, tempToleranceC: 6, waterReqMm: 350, nitrogenOptimalKg: 30, defaultK: 3200, defaultR: 0.080 },
  cassava: { optimalTempC: 27, tempToleranceC: 8, waterReqMm: 600, nitrogenOptimalKg: 60, defaultK: 15000, defaultR: 0.045 },
  sweet_potatoes: { optimalTempC: 25, tempToleranceC: 6, waterReqMm: 500, nitrogenOptimalKg: 50, defaultK: 14000, defaultR: 0.055 },
};

/**
 * Calculates environmental response factor f(T, R, S, W, N)
 */
export function calculateEnvironmentalFactors(
  cropType: CropType,
  temperature: number,
  rainfall: number,
  soilQualityIndex: number,
  waterAvailabilityRatio: number,
  nitrogenLevel: number
) {
  const params = CROP_GROWTH_PARAMETERS[cropType] || CROP_GROWTH_PARAMETERS.maize;

  // Temperature response curve (Gaussian bell curve centered on optimalTempC)
  const tempDiff = Math.abs(temperature - params.optimalTempC);
  const tempFactor = Math.max(0.1, Math.exp(-Math.pow(tempDiff / params.tempToleranceC, 2)));

  // Water / Rainfall availability factor
  const waterRatio = Math.min(1.2, (rainfall / (params.waterReqMm / 90)) * 0.5 + waterAvailabilityRatio * 0.5);
  const waterFactor = Math.min(1.0, Math.max(0.1, waterRatio));

  // Nitrogen nutrient response curve (Michaelis-Menten saturation kinetics)
  const nutrientFactor = Math.min(1.0, nitrogenLevel / (nitrogenLevel + params.nitrogenOptimalKg * 0.3));

  // Soil quality factor
  const soilFactor = Math.max(0.2, Math.min(1.0, soilQualityIndex));

  // Combined multiplicative environmental scalar f(T, R, S, W, N)
  const combinedEnvScalar = tempFactor * waterFactor * nutrientFactor * soilFactor;

  return {
    tempFactor,
    waterFactor,
    nutrientFactor,
    soilFactor,
    combinedEnvScalar,
  };
}

/**
 * Simulates logistic growth: dB/dt = r * B * (1 - B / K)
 * and environmental growth: dB/dt = r * B * (1 - B / K) * f(T, R, S, W, N)
 */
export function simulateCropGrowth(input: CropGrowthInput): GrowthPoint[] {
  const params = CROP_GROWTH_PARAMETERS[input.cropType] || CROP_GROWTH_PARAMETERS.maize;
  const K = input.carryingCapacity || params.defaultK;
  const r = input.growthRate || params.defaultR;

  const env = calculateEnvironmentalFactors(
    input.cropType,
    input.temperature,
    input.rainfall,
    input.soilQualityIndex,
    input.waterAvailabilityRatio,
    input.nitrogenLevel
  );

  const points: GrowthPoint[] = [];

  let currentBLogistic = Math.max(10, input.initialBiomass);
  let currentBEnv = Math.max(10, input.initialBiomass);

  const totalDays = Math.min(180, Math.max(10, input.days || 120));

  for (let day = 1; day <= totalDays; day++) {
    // Unconstrained Logistic Growth: dB/dt = r * B * (1 - B / K)
    const dBdtLogistic = r * currentBLogistic * (1 - currentBLogistic / K);
    currentBLogistic += dBdtLogistic;
    currentBLogistic = Math.min(K, Math.max(0, currentBLogistic));

    // Environmental Growth: dB/dt = r * B * (1 - B / K) * f(T, R, S, W, N)
    const dBdtEnv = r * currentBEnv * (1 - currentBEnv / K) * env.combinedEnvScalar;
    currentBEnv += dBdtEnv;
    currentBEnv = Math.min(K, Math.max(0, currentBEnv));

    points.push({
      day,
      biomassLogistic: Math.round(currentBLogistic * 10) / 10,
      biomassEnvironmental: Math.round(currentBEnv * 10) / 10,
      growthRateLogistic: Math.round(dBdtLogistic * 100) / 100,
      growthRateEnvironmental: Math.round(dBdtEnv * 100) / 100,
      temperatureFactor: Math.round(env.tempFactor * 100) / 100,
      waterFactor: Math.round(env.waterFactor * 100) / 100,
      nutrientFactor: Math.round(env.nutrientFactor * 100) / 100,
    });
  }

  return points;
}
