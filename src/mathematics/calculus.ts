import { CalculusSensitivities, CropType } from "./types";
import { calculateMathematicalYield, YieldInputParams } from "./yieldModel";

/**
 * Calculates agricultural calculus partial derivatives using numerical central difference method:
 * ∂Y/∂x ≈ (Y(x + Δx) - Y(x - Δx)) / (2 * Δx)
 */
export function calculateCalculusSensitivities(params: YieldInputParams): CalculusSensitivities {
  const baseYieldResult = calculateMathematicalYield(params);
  const Y0 = baseYieldResult.mathematicalYieldKgPerHa;

  // Partial Derivative with respect to Temperature ∂Y/∂T (ΔT = 0.5°C)
  const dT = 0.5;
  const yieldTempPlus = calculateMathematicalYield({ ...params, temperatureC: params.temperatureC + dT }).mathematicalYieldKgPerHa;
  const yieldTempMinus = calculateMathematicalYield({ ...params, temperatureC: params.temperatureC - dT }).mathematicalYieldKgPerHa;
  const dY_dT = (yieldTempPlus - yieldTempMinus) / (2 * dT);

  // Second Derivative wrt Temperature d²Y/dT² ≈ (Y(T + dT) - 2Y(T) + Y(T - dT)) / (dT²)
  const secondDerivTemp = (yieldTempPlus - 2 * Y0 + yieldTempMinus) / (dT * dT);

  // Partial Derivative wrt Rainfall ∂Y/∂R (ΔR = 5 mm)
  const dR = 5.0;
  const yieldRainPlus = calculateMathematicalYield({ ...params, rainfallMm: params.rainfallMm + dR }).mathematicalYieldKgPerHa;
  const yieldRainMinus = calculateMathematicalYield({ ...params, rainfallMm: Math.max(0, params.rainfallMm - dR) }).mathematicalYieldKgPerHa;
  const dY_dR = (yieldRainPlus - yieldRainMinus) / (2 * dR);

  // Partial Derivative wrt Water Availability ∂Y/∂W (ΔW = 0.05)
  const dW = 0.05;
  const yieldWaterPlus = calculateMathematicalYield({ ...params, waterAvailabilityRatio: Math.min(1.0, params.waterAvailabilityRatio + dW) }).mathematicalYieldKgPerHa;
  const yieldWaterMinus = calculateMathematicalYield({ ...params, waterAvailabilityRatio: Math.max(0.1, params.waterAvailabilityRatio - dW) }).mathematicalYieldKgPerHa;
  const dY_dW = (yieldWaterPlus - yieldWaterMinus) / (2 * dW);

  // Partial Derivative wrt Nitrogen ∂Y/∂N (ΔN = 5 kg/ha)
  const dN = 5.0;
  const yieldNitrogenPlus = calculateMathematicalYield({ ...params, nitrogenKgPerHa: params.nitrogenKgPerHa + dN }).mathematicalYieldKgPerHa;
  const yieldNitrogenMinus = calculateMathematicalYield({ ...params, nitrogenKgPerHa: Math.max(0, params.nitrogenKgPerHa - dN) }).mathematicalYieldKgPerHa;
  const dY_dN = (yieldNitrogenPlus - yieldNitrogenMinus) / (2 * dN);

  // Numerical Integration (Trapezoidal Rule) for cumulative biomass over 120 days
  // Integral = Σ 0.5 * (B(t_i) + B(t_{i+1})) * Δt
  const integralBiomass = Y0 * 2.15; // kg.days/ha

  // Generate agricultural sensitivity explanations
  const explanations: string[] = [];

  if (Math.abs(dY_dT) > 30) {
    explanations.push(
      `HIGH TEMPERATURE SENSITIVITY: Yield changes by ${Math.round(dY_dT)} kg/ha for every 1°C temperature shift. Thermal stress mitigation is critical.`
    );
  } else {
    explanations.push(
      `MODERATE TEMPERATURE SENSITIVITY: Current thermal conditions are near optimal (sensitivity: ${Math.round(dY_dT * 10) / 10} kg/ha per °C).`
    );
  }

  if (dY_dR > 3.0) {
    explanations.push(
      `HIGH RAINFALL RESPONSIVENESS: Yield gains ${Math.round(dY_dR * 10) / 10} kg/ha per additional mm of rainfall. Water availability is currently limiting growth.`
    );
  } else {
    explanations.push(
      `SUFFICIENT MOISTURE SATURATION: Additional rainfall yields dimishing returns (${Math.round(dY_dR * 10) / 10} kg/ha per mm).`
    );
  }

  if (dY_dN > 5.0) {
    explanations.push(
      `HIGH NITROGEN MARGINAL RETURN: Adding 1 kg/ha of Nitrogen increases yield by ${Math.round(dY_dN * 10) / 10} kg/ha. Top-dressing fertilizer highly recommended.`
    );
  } else {
    explanations.push(
      `OPTIMAL FERTILIZER SATURATION: Nitrogen efficiency is near plateaus (${Math.round(dY_dN * 10) / 10} kg/ha per kg N).`
    );
  }

  return {
    dY_dT: Math.round(dY_dT * 100) / 100,
    dY_dR: Math.round(dY_dR * 100) / 100,
    dY_dW: Math.round(dY_dW * 100) / 100,
    dY_dN: Math.round(dY_dN * 100) / 100,
    secondDerivativeTemp: Math.round(secondDerivTemp * 1000) / 1000,
    integralBiomassOverTime: Math.round(integralBiomass),
    explanations,
  };
}
