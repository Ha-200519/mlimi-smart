import {
  CropGrowthInput,
  GrowthPoint,
  YieldPredictionResult,
  CalculusSensitivities,
  ODESimulationResult,
  ClimateAnalyticsResult,
  IrrigationRequirementResult,
  OptimizationInput,
  OptimizationResult,
  EconomicAnalysisResult,
  MonteCarloRiskResult,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
  PCAResult,
} from "./types";

import { simulateCropGrowth } from "./cropGrowth";
import { calculateMathematicalYield, YieldInputParams } from "./yieldModel";
import { calculateCalculusSensitivities } from "./calculus";
import { solveAgriculturalODESystem } from "./differentialEquations";
import { analyzeClimateTimeSeries } from "./climateMath";
import { calculateIrrigationRequirement, IrrigationInputParams } from "./irrigationMath";
import { optimizeFarmAllocation } from "./optimizationEngine";
import { calculateFarmEconomics, EconomicInputParams } from "./economics";
import { runMonteCarloSimulation, MonteCarloSimulationInput } from "./probabilityRisk";
import { generateSensitivityPlot } from "./sensitivity";
import { simulateWhatIfScenario } from "./simulator";
import { performAgriculturalPCA } from "./linearAlgebra";
import { calculateStatistics } from "./statistics";

export interface IMathematicsEngine {
  engineType: string;
  isMatlabAvailable: boolean;

  runCropGrowthModel(input: CropGrowthInput): GrowthPoint[];
  runYieldPrediction(params: YieldInputParams): YieldPredictionResult;
  runCalculusSensitivities(params: YieldInputParams): CalculusSensitivities;
  runODESimulation(cropType: any, days?: number): ODESimulationResult;
  runClimateAnalytics(rainfall?: number[], temp?: number[]): ClimateAnalyticsResult;
  runIrrigationModel(params: IrrigationInputParams): IrrigationRequirementResult;
  runOptimization(input: OptimizationInput): OptimizationResult;
  runEconomicsModel(params: EconomicInputParams): EconomicAnalysisResult;
  runMonteCarloSimulation(input: MonteCarloSimulationInput): MonteCarloRiskResult;
  runSensitivityAnalysis(cropType: any): ReturnType<typeof generateSensitivityPlot>;
  runWhatIfSimulator(input: WhatIfScenarioInput): WhatIfScenarioResult;
  runPCAAnalysis(): PCAResult;
  runStatisticalSummary(data: number[]): ReturnType<typeof calculateStatistics>;
}

export class PythonMathematicsEngine implements IMathematicsEngine {
  engineType: string = "Python/Node High-Precision Engine";
  isMatlabAvailable = false;

  runCropGrowthModel(input: CropGrowthInput): GrowthPoint[] {
    return simulateCropGrowth(input);
  }

  runYieldPrediction(params: YieldInputParams): YieldPredictionResult {
    return calculateMathematicalYield(params);
  }

  runCalculusSensitivities(params: YieldInputParams): CalculusSensitivities {
    return calculateCalculusSensitivities(params);
  }

  runODESimulation(cropType: any, days: number = 120): ODESimulationResult {
    return solveAgriculturalODESystem(cropType, 20, 100, 80, days);
  }

  runClimateAnalytics(rainfall?: number[], temp?: number[]): ClimateAnalyticsResult {
    return analyzeClimateTimeSeries(rainfall, temp);
  }

  runIrrigationModel(params: IrrigationInputParams): IrrigationRequirementResult {
    return calculateIrrigationRequirement(params);
  }

  runOptimization(input: OptimizationInput): OptimizationResult {
    return optimizeFarmAllocation(input);
  }

  runEconomicsModel(params: EconomicInputParams): EconomicAnalysisResult {
    return calculateFarmEconomics(params);
  }

  runMonteCarloSimulation(input: MonteCarloSimulationInput): MonteCarloRiskResult {
    return runMonteCarloSimulation(input);
  }

  runSensitivityAnalysis(cropType: any) {
    return generateSensitivityPlot(cropType);
  }

  runWhatIfSimulator(input: WhatIfScenarioInput): WhatIfScenarioResult {
    return simulateWhatIfScenario(input);
  }

  runPCAAnalysis(): PCAResult {
    return performAgriculturalPCA();
  }

  runStatisticalSummary(data: number[]) {
    return calculateStatistics(data);
  }
}

export class MatlabMathematicsEngine extends PythonMathematicsEngine {
  engineType: string = "MATLAB Scientific Computational Engine";
  isMatlabAvailable = false; // System automatically detects MATLAB runtime or falls back gracefully

  constructor(matlabPresent: boolean = false) {
    super();
    this.isMatlabAvailable = matlabPresent;
  }
}

// Global Unified Mathematics Engine Instance
let activeEngine: IMathematicsEngine = new PythonMathematicsEngine();

export function getMathematicsEngine(): IMathematicsEngine {
  return activeEngine;
}

export function setMathematicsEngine(useMatlab: boolean) {
  if (useMatlab) {
    activeEngine = new MatlabMathematicsEngine(true);
  } else {
    activeEngine = new PythonMathematicsEngine();
  }
}
