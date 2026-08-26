import { CropType, IrrigationRequirementResult } from "./types";

export interface IrrigationInputParams {
  cropType: CropType;
  temperatureC: number;
  humidityPercent: number;
  windSpeedMps: number;
  solarRadiationMj: number;
  rainfallMm: number;
  currentSoilMoisturePercent: number; // e.g. 28%
  targetSoilMoisturePercent: number; // e.g. 50%
  rootZoneDepthM: number; // e.g. 0.4 m
}

/**
 * Irrigation Mathematics Engine
 * Uses Hargreaves / Penman-Monteith equation for ET0, Kc coefficients, and water mass balance:
 * ET_c = K_c * ET_0
 * I = ET_c - P_e - ΔS
 */
export function calculateIrrigationRequirement(params: IrrigationInputParams): IrrigationRequirementResult {
  // Hargreaves Equation for Reference Evapotranspiration ET0 (mm/day):
  // ET0 = 0.0023 * (T_mean + 17.8) * (T_max - T_min)^0.5 * Ra
  const temp = params.temperatureC || 24;
  const tempRange = 10; // °C typical daily diurnal range
  const Ra = params.solarRadiationMj || 18.5; // Extraterrestrial radiation

  const ET0 = 0.0023 * (temp + 17.8) * Math.sqrt(tempRange) * (Ra * 0.408);
  const roundedET0 = Math.round(ET0 * 100) / 100;

  // Crop coefficients Kc
  const cropKcMap: Record<CropType, number> = {
    maize: 1.15,
    groundnuts: 0.95,
    soybeans: 1.05,
    tobacco: 1.10,
    rice: 1.25,
    beans: 0.90,
    cassava: 0.80,
    sweet_potatoes: 0.85,
  };

  const Kc = cropKcMap[params.cropType] || 1.10;

  // Crop evapotranspiration ETc = Kc * ET0
  const ETc = Kc * roundedET0;
  const roundedETc = Math.round(ETc * 100) / 100;

  // Effective Rainfall Pe (USDA SCS Method)
  const P = Math.max(0, params.rainfallMm || 0);
  let Pe = 0;
  if (P < 8.3) {
    Pe = Math.max(0, P * 0.6);
  } else {
    Pe = 0.8 * P - 4.1;
  }
  const roundedPe = Math.round(Pe * 100) / 100;

  // Change in soil water storage ΔS = RootDepth * SoilBulkDensity * (TargetMoisture - CurrentMoisture)
  const rootDepth = params.rootZoneDepthM || 0.4;
  const currentMoisture = (params.currentSoilMoisturePercent || 25) / 100;
  const targetMoisture = (params.targetSoilMoisturePercent || 50) / 100;
  const bulkDensity = 1.35; // g/cm3

  const deltaS = rootDepth * 1000 * bulkDensity * (targetMoisture - currentMoisture);
  const roundedDeltaS = Math.round(deltaS * 10) / 10;

  // Net Water Deficit I = ETc - Pe + ΔS (mm)
  const waterDeficitMm = Math.max(0, roundedETc - roundedPe + (roundedDeltaS / 10));
  const roundedDeficit = Math.round(waterDeficitMm * 10) / 10;

  // Liters/ha (1 mm depth over 1 ha = 10,000 Liters)
  const litersPerHa = Math.round(roundedDeficit * 10000);

  // Recommended timing
  const timingHours = roundedDeficit > 8 ? 6 : roundedDeficit > 4 ? 3 : 1.5;

  // 7-day schedule
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const schedule = days.map((d, i) => {
    const dailyReq = i % 2 === 0 ? Math.round(roundedDeficit * 0.8 * 10) / 10 : 0;
    return {
      day: d,
      reqMm: dailyReq,
      status: dailyReq > 0 ? "Irrigation Active" : "Rest / Soil Monitoring",
    };
  });

  const steps = [
    `1. Reference Evapotranspiration: ET_0 = 0.0023 \\times (${temp} + 17.8) \\times \\sqrt{10} \\times ${Math.round(
      Ra * 0.408 * 100
    ) / 100} = ${roundedET0} \\text{ mm/day}`,
    `2. Crop Evapotranspiration: ET_c = K_c \\times ET_0 = ${Kc} \\times ${roundedET0} = ${roundedETc} \\text{ mm/day}`,
    `3. Effective Rainfall: P_e = ${roundedPe} \\text{ mm/day}`,
    `4. Soil Moisture Storage Deficit: \\Delta S = ${rootDepth} \\text{ m} \\times 1350 \\times (${Math.round(
      targetMoisture * 100
    )}% - ${Math.round(currentMoisture * 100)}%) = ${roundedDeltaS} \\text{ mm}`,
    `5. Net Irrigation Requirement: I = ET_c - P_e + \\frac{\\Delta S}{10} = ${roundedDeficit} \\text{ mm} \\equiv ${litersPerHa.toLocaleString()} \\text{ Liters/hectare}`,
  ];

  return {
    referenceEvapotranspirationET0: roundedET0,
    cropCoefficientKc: Kc,
    cropEvapotranspirationETc: roundedETc,
    effectiveRainfallPe: roundedPe,
    soilWaterChangeDeltaS: roundedDeltaS,
    waterDeficitMm: roundedDeficit,
    recommendedIrrigationLitersPerHa: litersPerHa,
    recommendedTimingHours: timingHours,
    irrigationSchedule7Days: schedule,
    equationSteps: steps,
  };
}
