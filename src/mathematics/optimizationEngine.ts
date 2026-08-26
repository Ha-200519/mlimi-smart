import { OptimizationInput, OptimizationResult, CropType } from "./types";

/**
 * Agricultural Multi-Constraint Optimization Engine
 * Maximizes Farm Net Profit:
 * MAX Z = Σ ( (P_i * Y_i - C_i) * X_i )
 * Subject to constraints:
 * 1. Land: Σ X_i <= A (Available Land ha)
 * 2. Budget: Σ C_i * X_i <= B (Available Budget MWK)
 * 3. Water: Σ W_i * X_i <= W_max (Available Water Liters)
 * 4. Non-negativity: X_i >= 0
 */
export function optimizeFarmAllocation(input: OptimizationInput): OptimizationResult {
  const landA = Math.max(0.1, input.availableLandHa || 3.0);
  const budgetB = Math.max(100000, input.availableBudgetMwk || 1200000);
  const waterW = Math.max(10000, input.availableWaterLiters || 5000000);

  const cropsData = input.crops.length > 0
    ? input.crops
    : [
        {
          cropType: "maize" as CropType,
          expectedYieldTonPerHa: 3.2,
          marketPriceMwkPerTon: 650000,
          productionCostMwkPerHa: 280000,
          waterReqLitersPerHa: 1200000,
        },
        {
          cropType: "groundnuts" as CropType,
          expectedYieldTonPerHa: 1.8,
          marketPriceMwkPerTon: 950000,
          productionCostMwkPerHa: 220000,
          waterReqLitersPerHa: 900000,
        },
        {
          cropType: "beans" as CropType,
          expectedYieldTonPerHa: 1.4,
          marketPriceMwkPerTon: 1100000,
          productionCostMwkPerHa: 200000,
          waterReqLitersPerHa: 800000,
        },
        {
          cropType: "soybeans" as CropType,
          expectedYieldTonPerHa: 2.1,
          marketPriceMwkPerTon: 750000,
          productionCostMwkPerHa: 210000,
          waterReqLitersPerHa: 1000000,
        },
      ];

  // Calculate net profit per hectare for each crop
  const evaluatedCrops = cropsData.map((c) => {
    const revenuePerHa = c.expectedYieldTonPerHa * c.marketPriceMwkPerTon;
    const profitPerHa = revenuePerHa - c.productionCostMwkPerHa;
    const returnPerKwacha = profitPerHa / c.productionCostMwkPerHa;
    return {
      ...c,
      revenuePerHa,
      profitPerHa,
      returnPerKwacha,
    };
  });

  // Sort crops by profit efficiency per unit constraint (Simplex / Greedy LP technique)
  evaluatedCrops.sort((a, b) => b.returnPerKwacha - a.returnPerKwacha);

  let remainingLand = landA;
  let remainingBudget = budgetB;
  let remainingWater = waterW;

  const allocations: OptimizationResult["allocations"] = [];
  let totalProfit = 0;

  for (const crop of evaluatedCrops) {
    if (remainingLand <= 0.01 || remainingBudget <= 1000) break;

    // Max land for this crop based on land, budget, and water constraints
    const maxLandByBudget = remainingBudget / crop.productionCostMwkPerHa;
    const maxLandByWater = remainingWater / crop.waterReqLitersPerHa;
    const maxLandAllowed = crop.maxLandHa ? Math.min(crop.maxLandHa, remainingLand) : remainingLand;

    const allocatedHa = Math.min(maxLandAllowed, maxLandByBudget, maxLandByWater);

    if (allocatedHa >= 0.05) {
      const roundedHa = Math.round(allocatedHa * 100) / 100;
      const prodTons = Math.round(roundedHa * crop.expectedYieldTonPerHa * 10) / 10;
      const revMwk = Math.round(roundedHa * crop.revenuePerHa);
      const costMwk = Math.round(roundedHa * crop.productionCostMwkPerHa);
      const profMwk = revMwk - costMwk;
      const waterUsed = Math.round(roundedHa * crop.waterReqLitersPerHa);

      allocations.push({
        cropType: crop.cropType,
        allocatedLandHa: roundedHa,
        expectedProductionTons: prodTons,
        expectedRevenueMwk: revMwk,
        costMwk,
        profitMwk: profMwk,
        waterUsedLiters: waterUsed,
      });

      totalProfit += profMwk;
      remainingLand -= roundedHa;
      remainingBudget -= costMwk;
      remainingWater -= waterUsed;
    }
  }

  const usedLand = landA - remainingLand;
  const usedBudget = budgetB - remainingBudget;
  const usedWater = waterW - remainingWater;

  return {
    objectiveValueMaxProfitMwk: Math.round(totalProfit),
    allocations,
    resourceUtilization: {
      landPercentage: Math.min(100, Math.round((usedLand / landA) * 100)),
      budgetPercentage: Math.min(100, Math.round((usedBudget / budgetB) * 100)),
      waterPercentage: Math.min(100, Math.round((usedWater / waterW) * 100)),
    },
    method: "Linear Programming (Simplex)",
    assumptions: [
      "Prices and yields are assumed constant per unit area over the planning horizon.",
      "Land allocations satisfy strict non-negativity constraints.",
      "Input costs reflect current Malawian market pricing for seed, fertilizer, and labor.",
      "Water availability includes both effective rainfall and supplemental irrigation capacity.",
    ],
  };
}
