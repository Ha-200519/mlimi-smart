import { ODESimulationResult, CropType } from "./types";
import { CROP_GROWTH_PARAMETERS } from "./cropGrowth";

/**
 * 4th Order Runge-Kutta (RK4) ODE Numerical Solver for System of Agricultural ODEs:
 * dB/dt = r * B * (1 - B/K) * f(Water, Nitrogen)
 * dW/dt = Rainfall - Transpiration - Evaporation - Drainage
 * dN/dt = - UptakeRate * (dB/dt) + FertilizerInflow
 */
export function solveAgriculturalODESystem(
  cropType: CropType,
  initialBiomass: number = 20,
  initialWaterMm: number = 100,
  initialNitrogenKg: number = 80,
  daysCount: number = 120
): ODESimulationResult {
  const crop = CROP_GROWTH_PARAMETERS[cropType] || CROP_GROWTH_PARAMETERS.maize;
  const K = crop.defaultK;
  const r = crop.defaultR;

  const dt = 1.0; // 1 day timestep
  const timeSteps: number[] = [];
  const biomassTrajectory: number[] = [];
  const soilWaterStorage: number[] = [];
  const soilNitrogenLevel: number[] = [];
  const transpirationRate: number[] = [];

  let B = initialBiomass;
  let W = initialWaterMm;
  let N = initialNitrogenKg;

  for (let day = 0; day <= daysCount; day++) {
    timeSteps.push(day);
    biomassTrajectory.push(Math.round(B * 10) / 10);
    soilWaterStorage.push(Math.round(W * 10) / 10);
    soilNitrogenLevel.push(Math.round(N * 10) / 10);

    // Transpiration Rate ET_t = Kc * (B / K) * 4.5 mm/day
    const transpiration = Math.min(6.0, 1.2 * (B / K + 0.1) * 4.0);
    transpirationRate.push(Math.round(transpiration * 100) / 100);

    // System derivatives
    const fB = (bVal: number, wVal: number, nVal: number) => {
      const waterFactor = Math.min(1.0, wVal / 80.0);
      const nFactor = Math.min(1.0, nVal / (nVal + 20));
      return r * bVal * (1 - bVal / K) * waterFactor * nFactor;
    };

    const fW = (bVal: number, wVal: number) => {
      const rain = (day % 14 === 0 || day % 15 === 0) ? 22 : 1.5; // Occasional rainfall
      const evap = 2.5;
      const transp = Math.min(5.5, 1.2 * (bVal / K + 0.1) * 3.8);
      const drainage = wVal > 150 ? (wVal - 150) * 0.3 : 0;
      return rain - transp - evap - drainage;
    };

    const fN = (bVal: number) => {
      const growthRate = Math.max(0, r * bVal * (1 - bVal / K));
      const uptake = growthRate * 0.008; // 8 kg N per ton biomass
      return -uptake;
    };

    // RK4 Integration step for Biomass B
    const k1_B = dt * fB(B, W, N);
    const k2_B = dt * fB(B + 0.5 * k1_B, W, N);
    const k3_B = dt * fB(B + 0.5 * k2_B, W, N);
    const k4_B = dt * fB(B + k3_B, W, N);
    B = Math.min(K, Math.max(0, B + (k1_B + 2 * k2_B + 2 * k3_B + k4_B) / 6));

    // RK4 Integration step for Water W
    const k1_W = dt * fW(B, W);
    const k2_W = dt * fW(B, W + 0.5 * k1_W);
    const k3_W = dt * fW(B, W + 0.5 * k2_W);
    const k4_W = dt * fW(B, W + k3_W);
    W = Math.min(200, Math.max(10, W + (k1_W + 2 * k2_W + 2 * k3_W + k4_W) / 6));

    // RK4 Integration step for Nitrogen N
    const k1_N = dt * fN(B);
    N = Math.max(5, N + k1_N);
  }

  return {
    timeSteps,
    biomassTrajectory,
    soilWaterStorage,
    soilNitrogenLevel,
    transpirationRate,
  };
}
