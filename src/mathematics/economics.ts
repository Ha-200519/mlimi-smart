import { EconomicAnalysisResult, CropType } from "./types";

export interface EconomicInputParams {
  cropType: CropType;
  farmSizeHa: number;
  expectedYieldKgPerHa: number;
  marketPriceMwkPerKg: number;
  fixedCostsMwk: number; // E.g. equipment depreciation, land lease
  seedCostMwkPerHa: number;
  fertilizerCostMwkPerHa: number;
  pesticideCostMwkPerHa: number;
  laborCostMwkPerHa: number;
  transportCostMwkPerHa: number;
}

/**
 * Transparent Agricultural Economics & Financial Calculations Engine
 */
export function calculateFarmEconomics(params: EconomicInputParams): EconomicAnalysisResult {
  const ha = Math.max(0.1, params.farmSizeHa || 1.0);
  const fixed = params.fixedCostsMwk || 50000;

  const seed = (params.seedCostMwkPerHa || 45000) * ha;
  const fertilizer = (params.fertilizerCostMwkPerHa || 160000) * ha;
  const pesticide = (params.pesticideCostMwkPerHa || 25000) * ha;
  const labor = (params.laborCostMwkPerHa || 50000) * ha;
  const transport = (params.transportCostMwkPerHa || 20000) * ha;

  const variableCost = seed + fertilizer + pesticide + labor + transport;
  const totalCost = fixed + variableCost;

  const yieldKg = (params.expectedYieldKgPerHa || 2800) * ha;
  const priceKg = params.marketPriceMwkPerKg || 650; // MWK per kg

  const grossRevenue = yieldKg * priceKg;
  const grossMargin = grossRevenue - variableCost;
  const netProfit = grossRevenue - totalCost;

  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // Break-even Yield = Total Cost / Price per kg (in kg/ha)
  const breakEvenYieldKgHa = priceKg > 0 ? totalCost / (priceKg * ha) : 0;

  // Break-even Price = Total Cost / Total Yield (in MWK/kg)
  const breakEvenPriceMwkKg = yieldKg > 0 ? totalCost / yieldKg : 0;

  const costPerHectare = totalCost / ha;

  // Scenarios: Best Case (+20% yield, +10% price), Expected Case, Worst Case (-25% yield, -15% price)
  const bestRevenue = yieldKg * 1.2 * (priceKg * 1.1);
  const bestProfit = bestRevenue - totalCost;

  const worstRevenue = yieldKg * 0.75 * (priceKg * 0.85);
  const worstProfit = worstRevenue - totalCost;

  const transparentCalculations = [
    { label: "Gross Revenue", formula: `Yield (${yieldKg.toLocaleString()} kg) × Price (MWK ${priceKg}/kg)`, result: `MWK ${Math.round(grossRevenue).toLocaleString()}` },
    { label: "Variable Costs", formula: `Seed (${seed.toLocaleString()}) + Fertilizer (${fertilizer.toLocaleString()}) + Labor (${labor.toLocaleString()}) + Inputs`, result: `MWK ${Math.round(variableCost).toLocaleString()}` },
    { label: "Total Cost", formula: `Fixed Costs (${fixed.toLocaleString()}) + Variable Costs (${variableCost.toLocaleString()})`, result: `MWK ${Math.round(totalCost).toLocaleString()}` },
    { label: "Net Profit", formula: `Gross Revenue (${grossRevenue.toLocaleString()}) - Total Cost (${totalCost.toLocaleString()})`, result: `MWK ${Math.round(netProfit).toLocaleString()}` },
    { label: "Return on Investment (ROI)", formula: `(Net Profit / Total Cost) × 100`, result: `${Math.round(roi * 10) / 10}%` },
    { label: "Break-even Yield", formula: `Total Cost / Price = MWK ${Math.round(totalCost).toLocaleString()} / MWK ${priceKg}/kg`, result: `${Math.round(breakEvenYieldKgHa).toLocaleString()} kg/ha` },
  ];

  return {
    totalCostMwk: Math.round(totalCost),
    fixedCostMwk: Math.round(fixed),
    variableCostMwk: Math.round(variableCost),
    grossRevenueMwk: Math.round(grossRevenue),
    grossMarginMwk: Math.round(grossMargin),
    netProfitMwk: Math.round(netProfit),
    profitMarginPercent: Math.round(profitMargin * 10) / 10,
    returnOnInvestmentPercent: Math.round(roi * 10) / 10,
    breakEvenYieldKgPerHa: Math.round(breakEvenYieldKgHa),
    breakEvenPriceMwkPerKg: Math.round(breakEvenPriceMwkKg),
    costPerHectareMwk: Math.round(costPerHectare),
    scenarios: {
      bestCaseProfitMwk: Math.round(bestProfit),
      expectedCaseProfitMwk: Math.round(netProfit),
      worstCaseProfitMwk: Math.round(worstProfit),
    },
    transparentCalculations,
  };
}
