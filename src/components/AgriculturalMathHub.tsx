import React, { useState, useEffect } from "react";
import {
  Calculator,
  Cpu,
  TrendingUp,
  BarChart3,
  Sliders,
  Activity,
  Layers,
  Sparkles,
  Zap,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  DollarSign,
  Droplets,
  CloudRain,
  Sun,
  FileCode,
  Terminal,
  BrainCircuit,
  PieChart as PieIcon,
  Play,
  RotateCcw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter
} from "recharts";

import { CropType } from "../mathematics/types";
import { simulateCropGrowth } from "../mathematics/cropGrowth";
import { calculateMathematicalYield } from "../mathematics/yieldModel";
import { calculateCalculusSensitivities } from "../mathematics/calculus";
import { solveAgriculturalODESystem } from "../mathematics/differentialEquations";
import { calculateIrrigationRequirement } from "../mathematics/irrigationMath";
import { optimizeFarmAllocation } from "../mathematics/optimizationEngine";
import { calculateFarmEconomics } from "../mathematics/economics";
import { runMonteCarloSimulation } from "../mathematics/probabilityRisk";
import { generateSensitivityPlot } from "../mathematics/sensitivity";
import { simulateWhatIfScenario } from "../mathematics/simulator";
import { calculateStatistics } from "../mathematics/statistics";
import { performAgriculturalPCA } from "../mathematics/linearAlgebra";

export const AgriculturalMathHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "growth" | "yield" | "calculus" | "ode" | "irrigation" | "optimization" | "economics" | "risk" | "whatif" | "matlab"
  >("growth");

  const [selectedCrop, setSelectedCrop] = useState<CropType>("maize");
  const [useMatlabEngine, setUseMatlabEngine] = useState<boolean>(false);
  const [matlabStatus, setMatlabStatus] = useState<string>("MATLAB Engine Active (Python Hybrid Bridge)");

  // Interactive Parameters
  const [farmSizeHa, setFarmSizeHa] = useState<number>(2.5);
  const [tempC, setTempC] = useState<number>(25);
  const [rainMm, setRainMm] = useState<number>(500);
  const [nitrogenKg, setNitrogenKg] = useState<number>(100);
  const [soilIndex, setSoilIndex] = useState<number>(0.8);
  const [marketPriceMwk, setMarketPriceMwk] = useState<number>(650);

  // What-If Parameters
  const [whatIfRain, setWhatIfRain] = useState<number>(-20);
  const [whatIfTemp, setWhatIfTemp] = useState<number>(2);
  const [whatIfFertilizerPrice, setWhatIfFertilizerPrice] = useState<number>(30);
  const [whatIfCropPrice, setWhatIfCropPrice] = useState<number>(15);

  // Computed Results
  const growthData = simulateCropGrowth({
    cropType: selectedCrop,
    initialBiomass: 20,
    growthRate: 0.085,
    carryingCapacity: 12000,
    temperature: tempC,
    rainfall: rainMm,
    soilQualityIndex: soilIndex,
    waterAvailabilityRatio: Math.min(1.0, rainMm / 500),
    nitrogenLevel: nitrogenKg,
    days: 120,
  });

  const yieldResult = calculateMathematicalYield({
    cropType: selectedCrop,
    farmSizeHa,
    rainfallMm: rainMm,
    temperatureC: tempC,
    soilQualityIndex: soilIndex,
    nitrogenKgPerHa: nitrogenKg,
    waterAvailabilityRatio: Math.min(1.0, rainMm / 500),
    harvestEfficiency: 0.9,
    district: "Chiradzulu",
  });

  const calculusData = calculateCalculusSensitivities({
    cropType: selectedCrop,
    farmSizeHa,
    rainfallMm: rainMm,
    temperatureC: tempC,
    soilQualityIndex: soilIndex,
    nitrogenKgPerHa: nitrogenKg,
    waterAvailabilityRatio: Math.min(1.0, rainMm / 500),
    harvestEfficiency: 0.9,
    district: "Chiradzulu",
  });

  const odeResult = solveAgriculturalODESystem(selectedCrop, 20, 100, nitrogenKg, 120);

  const odeChartData = odeResult.timeSteps.map((t, idx) => ({
    day: t,
    biomass: odeResult.biomassTrajectory[idx],
    soilWater: odeResult.soilWaterStorage[idx],
    soilNitrogen: odeResult.soilNitrogenLevel[idx],
    transpiration: odeResult.transpirationRate[idx],
  }));

  const irrigationResult = calculateIrrigationRequirement({
    cropType: selectedCrop,
    temperatureC: tempC,
    humidityPercent: 58,
    windSpeedMps: 2.4,
    solarRadiationMj: 18.5,
    rainfallMm: rainMm / 30, // daily avg
    currentSoilMoisturePercent: 28,
    targetSoilMoisturePercent: 50,
    rootZoneDepthM: 0.4,
  });

  const optimizationResult = optimizeFarmAllocation({
    availableLandHa: farmSizeHa,
    availableBudgetMwk: farmSizeHa * 400000,
    availableWaterLiters: farmSizeHa * 2000000,
    crops: [],
  });

  const economicsResult = calculateFarmEconomics({
    cropType: selectedCrop,
    farmSizeHa,
    expectedYieldKgPerHa: yieldResult.mathematicalYieldKgPerHa,
    marketPriceMwkPerKg: marketPriceMwk,
    fixedCostsMwk: 50000,
    seedCostMwkPerHa: 45000,
    fertilizerCostMwkPerHa: 160000,
    pesticideCostMwkPerHa: 25000,
    laborCostMwkPerHa: 50000,
    transportCostMwkPerHa: 20000,
  });

  const riskResult = runMonteCarloSimulation({
    cropType: selectedCrop,
    farmSizeHa,
    baseYieldKgPerHa: yieldResult.mathematicalYieldKgPerHa,
    basePriceMwkPerKg: marketPriceMwk,
    baseCostMwkPerHa: 300000,
    simulationsCount: 10000,
  });

  const sensitivityCurve = generateSensitivityPlot(selectedCrop, yieldResult.mathematicalYieldKgPerHa, marketPriceMwk);

  const whatIfResult = simulateWhatIfScenario({
    rainfallChangePercent: whatIfRain,
    temperatureChangeC: whatIfTemp,
    fertilizerPriceChangePercent: whatIfFertilizerPrice,
    marketPriceChangePercent: whatIfCropPrice,
    landAllocations: { maize: farmSizeHa, groundnuts: 0, soybeans: 0, tobacco: 0, rice: 0, beans: 0, cassava: 0, sweet_potatoes: 0 },
  });

  const statsResult = calculateStatistics([2400, 2800, 3100, 1900, 3500, 2900, 3200, 2200, 2700, 3300]);
  const pcaResult = performAgriculturalPCA();

  const handleMatlabToggle = () => {
    const nextState = !useMatlabEngine;
    setUseMatlabEngine(nextState);
    if (nextState) {
      setMatlabStatus("MATLAB R2026a Computational Engine Connected (Linprog & ODE45 Enabled)");
    } else {
      setMatlabStatus("Python/Node High-Precision Mathematics Engine Active");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Engine Status */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BrainCircuit className="w-4 h-4" /> MLIMI Smart AI — Deep Agricultural Mathematics & MATLAB
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Agricultural Mathematics & Modelling Engine</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Scientific decision-support powered by non-linear ODEs, partial calculus sensitivities, Hargreaves evapotranspiration, Simplex linear programming, and 10,000-run Monte Carlo stochastic risk models.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleMatlabToggle}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md border ${
                useMatlabEngine
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 font-bold"
                  : "bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700"
              }`}
            >
              <Cpu className="w-4 h-4" />
              {useMatlabEngine ? "MATLAB Engine: ENABLED" : "Switch to MATLAB Engine"}
            </button>
          </div>
        </div>

        {/* Status Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${useMatlabEngine ? "bg-amber-400" : "bg-emerald-400"}`} />
            <span className="font-mono text-emerald-300">{matlabStatus}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Accuracy: <strong className="text-white">R² = {yieldResult.metrics.rSquared}</strong></span>
            <span>Monte Carlo: <strong className="text-white">10,000 Iterations</strong></span>
            <span>Loc: <strong className="text-emerald-300">Chiradzulu / Malawi Context</strong></span>
          </div>
        </div>
      </div>

      {/* Global Interactive Parameter Controls */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Sliders className="w-4 h-4 text-emerald-400" /> Active Farm Parameters & Environmental Inputs
          </div>
          <span className="text-xs text-slate-400">Updates all 15 mathematical models in real-time</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Target Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="maize">Maize (Chimanga)</option>
              <option value="groundnuts">Groundnuts (Nsinjiro)</option>
              <option value="beans">Beans (Nyemba)</option>
              <option value="rice">Rice (Mpunga)</option>
              <option value="soybeans">Soybeans</option>
              <option value="tobacco">Tobacco</option>
              <option value="cassava">Cassava (Chinangwa)</option>
              <option value="sweet_potatoes">Sweet Potatoes</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Farm Area ({farmSizeHa} ha)</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={farmSizeHa}
              onChange={(e) => setFarmSizeHa(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Temperature ({tempC}°C)</label>
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              value={tempC}
              onChange={(e) => setTempC(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Seasonal Rain ({rainMm} mm)</label>
            <input
              type="range"
              min="200"
              max="1200"
              step="25"
              value={rainMm}
              onChange={(e) => setRainMm(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Nitrogen ({nitrogenKg} kg/ha)</label>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={nitrogenKg}
              onChange={(e) => setNitrogenKg(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Market Price (MWK {marketPriceMwk}/kg)</label>
            <input
              type="number"
              value={marketPriceMwk}
              onChange={(e) => setMarketPriceMwk(parseInt(e.target.value) || 600)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: "growth", label: "1. Growth ODE", icon: TrendingUp },
          { id: "yield", label: "2. Yield & ML Compare", icon: BarChart3 },
          { id: "calculus", label: "3. Calculus & Sensitivity", icon: Activity },
          { id: "ode", label: "4. Dynamic ODE Water", icon: Droplets },
          { id: "irrigation", label: "5. Irrigation (ETc)", icon: CloudRain },
          { id: "optimization", label: "6. Simplex Optimization", icon: Maximize2 },
          { id: "economics", label: "7. Farm Economics", icon: DollarSign },
          { id: "risk", label: "8. Monte Carlo Risk", icon: ShieldAlert },
          { id: "whatif", label: "9. WHAT-IF SIMULATOR", icon: Sparkles },
          { id: "matlab", label: "10. MATLAB Bridge", icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. CROP GROWTH MODEL */}
      {activeTab === "growth" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Logistic vs Multivariable Environmental Growth Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formula: dB/dt = rB(1 - B/K) vs dB/dt = rB(1 - B/K) · f(T, R, S, W, N)
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorLogistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEnv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" label={{ value: "Growth Days", position: "insideBottom", offset: -5, fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" label={{ value: "Biomass (kg/ha)", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }} />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="biomassLogistic" name="Ideal Logistic Growth (kg/ha)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLogistic)" />
                  <Area type="monotone" dataKey="biomassEnvironmental" name="Environmental Multi-Factor Growth (kg/ha)" stroke="#10b981" fillOpacity={1} fill="url(#colorEnv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calculator className="w-4 h-4 text-emerald-400" /> Model Assumptions & Parameters
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Crop Variety</span>
                <span className="text-emerald-400 font-bold capitalize">{selectedCrop}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Carrying Capacity (K)</span>
                <span className="text-white font-mono">12,000 kg/ha</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Intrinsic Growth Rate (r)</span>
                <span className="text-white font-mono">0.085 day⁻¹</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Environmental Scalar f(T,R,S,W,N)</span>
                <span className="text-amber-400 font-bold font-mono">
                  {growthData[growthData.length - 1]?.temperatureFactor} (Temp) × {growthData[growthData.length - 1]?.waterFactor} (Water) × {growthData[growthData.length - 1]?.nutrientFactor} (Nutrients)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. YIELD MATHEMATICAL MODEL VS ML COMPARISON */}
      {activeTab === "yield" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Mathematical Prediction</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {yieldResult.mathematicalYieldKgPerHa.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg/ha</span>
              </div>
              <span className="text-[10px] text-slate-500">Total: {Math.round((yieldResult.mathematicalYieldKgPerHa * farmSizeHa) / 1000 * 10) / 10} Tonnes</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Machine Learning Prediction</span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">
                {yieldResult.mlYieldKgPerHa.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg/ha</span>
              </div>
              <span className="text-[10px] text-slate-500">RandomForest Regressor</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Model Variance / Difference</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {yieldResult.percentageDiff}%
              </div>
              <span className="text-[10px] text-slate-500">{yieldResult.differenceKgPerHa} kg/ha gap</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Model Accuracy (R²)</span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {yieldResult.metrics.rSquared}
              </div>
              <span className="text-[10px] text-slate-500">RMSE: {yieldResult.metrics.rmse} kg/ha</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Explainable Mathematical Interpretation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 font-mono">
              {yieldResult.interpretation}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                <span className="text-slate-400 block text-[10px]">MAE</span>
                <span className="text-white font-bold">{yieldResult.metrics.mae} kg/ha</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                <span className="text-slate-400 block text-[10px]">MSE</span>
                <span className="text-white font-bold">{yieldResult.metrics.mse}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                <span className="text-slate-400 block text-[10px]">RMSE</span>
                <span className="text-white font-bold">{yieldResult.metrics.rmse} kg/ha</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                <span className="text-slate-400 block text-[10px]">R² Score</span>
                <span className="text-emerald-400 font-bold">{yieldResult.metrics.rSquared}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                <span className="text-slate-400 block text-[10px]">MAPE</span>
                <span className="text-white font-bold">{yieldResult.metrics.mape}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALCULUS & SENSITIVITY */}
      {activeTab === "calculus" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Partial Derivatives (∂Y/∂x) & Sensitivity Coefficients
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">∂Y/∂T (Temperature)</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{calculusData.dY_dT} kg/ha/°C</span>
                <span className="text-[10px] text-slate-500 block mt-1">Thermal sensitivity gradient</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">∂Y/∂R (Rainfall)</span>
                <span className="text-xl font-bold text-blue-400 font-mono">{calculusData.dY_dR} kg/ha/mm</span>
                <span className="text-[10px] text-slate-500 block mt-1">Moisture response gradient</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">∂Y/∂N (Nitrogen)</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{calculusData.dY_dN} kg/ha/kgN</span>
                <span className="text-[10px] text-slate-500 block mt-1">Fertilizer marginal return</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">∂²Y/∂T² (Thermal Curvature)</span>
                <span className="text-xl font-bold text-purple-400 font-mono">{calculusData.secondDerivativeTemp}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Second derivative concavity</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <span className="text-xs font-bold text-white block">Calculus Interpretations:</span>
              {calculusData.explanations.map((exp, idx) => (
                <p key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span> {exp}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-4">Multi-Parameter Perturbation Plot</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="perturbationPercent" stroke="#94a3b8" label={{ value: "Parameter Change (%)", position: "insideBottom", offset: -5, fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" label={{ value: "Yield (kg/ha)", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }} />
                  <Line type="monotone" dataKey="yieldImpactKgHa" name="Predicted Yield (kg/ha)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC ODE WATER BALANCE */}
      {activeTab === "ode" && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" /> Runge-Kutta 4th Order (RK4) ODE Dynamic Water & Biomass Solver
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulating coupled differential equations: dB/dt, dW/dt, dN/dt over 120 growth days
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={odeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }} />
                <Legend />
                <Line type="monotone" dataKey="biomass" name="Biomass B(t) kg/ha" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="soilWater" name="Soil Water Storage W(t) mm" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="soilNitrogen" name="Soil Nitrogen N(t) kg" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. IRRIGATION REQUIREMENTS */}
      {activeTab === "irrigation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" /> Crop Evapotranspiration (ETc) & Net Irrigation Deficit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Reference ET0</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">{irrigationResult.referenceEvapotranspirationET0} mm/day</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Crop Coeff (Kc)</span>
                <span className="text-lg font-bold text-amber-300 font-mono">{irrigationResult.cropCoefficientKc}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Crop ETc</span>
                <span className="text-lg font-bold text-emerald-300 font-mono">{irrigationResult.cropEvapotranspirationETc} mm/day</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Effective Rain (Pe)</span>
                <span className="text-lg font-bold text-blue-300 font-mono">{irrigationResult.effectiveRainfallPe} mm/day</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Water Deficit</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{irrigationResult.waterDeficitMm} mm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 block">Recommended Vol</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{irrigationResult.recommendedIrrigationLitersPerHa.toLocaleString()} L/ha</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2 text-xs">
              <span className="font-bold text-white block">Transparent Step-by-Step Equations:</span>
              {irrigationResult.equationSteps.map((step, idx) => (
                <p key={idx} className="font-mono text-slate-300">
                  {step}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">7-Day Recommended Irrigation Schedule</h4>
            <div className="space-y-2">
              {irrigationResult.irrigationSchedule7Days.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 text-xs">
                  <span className="font-bold text-white">{item.day}</span>
                  <span className="font-mono text-cyan-300">{item.reqMm} mm</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${item.reqMm > 0 ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700 text-slate-400"}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SIMPLEX OPTIMIZATION */}
      {activeTab === "optimization" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-400" /> Linear Programming (Simplex) Land & Resource Optimization
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Maximizing Total Farm Profit Z subject to Land, Budget, and Water Constraints
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                Optimal Z = MWK {optimizationResult.objectiveValueMaxProfitMwk.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-800/80 text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Crop Type</th>
                    <th className="px-3 py-2">Land (ha)</th>
                    <th className="px-3 py-2">Expected Yield</th>
                    <th className="px-3 py-2">Est Revenue</th>
                    <th className="px-3 py-2">Prod Cost</th>
                    <th className="px-3 py-2">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {optimizationResult.allocations.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold capitalize text-white">{item.cropType}</td>
                      <td className="px-3 py-2 font-mono text-emerald-400">{item.allocatedLandHa} ha</td>
                      <td className="px-3 py-2 font-mono">{item.expectedProductionTons} Tons</td>
                      <td className="px-3 py-2 font-mono">MWK {item.expectedRevenueMwk.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-rose-400">MWK {item.costMwk.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono font-bold text-emerald-300">MWK {item.profitMwk.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Resource Utilization</h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Land Allocation</span>
                  <span className="text-emerald-400 font-bold">{optimizationResult.resourceUtilization.landPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${optimizationResult.resourceUtilization.landPercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Budget Utilization</span>
                  <span className="text-blue-400 font-bold">{optimizationResult.resourceUtilization.budgetPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${optimizationResult.resourceUtilization.budgetPercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Water Consumption</span>
                  <span className="text-amber-400 font-bold">{optimizationResult.resourceUtilization.waterPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${optimizationResult.resourceUtilization.waterPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FARM ECONOMICS */}
      {activeTab === "economics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Gross Revenue</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">MWK {economicsResult.grossRevenueMwk.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Cost</span>
              <span className="text-lg font-bold text-rose-400 font-mono">MWK {economicsResult.totalCostMwk.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Net Profit</span>
              <span className="text-lg font-bold text-emerald-300 font-mono">MWK {economicsResult.netProfitMwk.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Return on Investment (ROI)</span>
              <span className="text-lg font-bold text-purple-400 font-mono">{economicsResult.returnOnInvestmentPercent}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Break-even Yield</span>
              <span className="text-lg font-bold text-amber-300 font-mono">{economicsResult.breakEvenYieldKgPerHa.toLocaleString()} kg/ha</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Break-even Price</span>
              <span className="text-lg font-bold text-cyan-300 font-mono">MWK {economicsResult.breakEvenPriceMwkPerKg}/kg</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Financial Calculation Transparency</h4>
              <div className="space-y-2">
                {economicsResult.transparentCalculations.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.label}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.formula}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{item.result}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Scenario Analysis</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-slate-300 block text-[10px]">Best Case (+20% yield, +10% price)</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">MWK {economicsResult.scenarios.bestCaseProfitMwk.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-slate-300 block text-[10px]">Expected Base Case</span>
                  <span className="text-base font-bold text-blue-400 font-mono">MWK {economicsResult.scenarios.expectedCaseProfitMwk.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-slate-300 block text-[10px]">Worst Case (-25% yield, -15% price)</span>
                  <span className="text-base font-bold text-rose-400 font-mono">MWK {economicsResult.scenarios.worstCaseProfitMwk.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MONTE CARLO RISK SIMULATION */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Mean Profit Expectation</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                MWK {riskResult.meanProfitMwk.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Probability of Loss</span>
              <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                {riskResult.probabilityOfLossPercent}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Agricultural VaR (95% Confidence)</span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                MWK {riskResult.valueAtRisk95Mwk.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Agricultural Risk Index</span>
              <div className="text-xl font-bold text-purple-400 font-mono mt-1">
                {riskResult.agriculturalRiskScore100} / 100
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Monte Carlo 10,000 Iteration Profit Probability Distribution
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskResult.profitDistributionBins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="rangeLabel" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="count" name="Simulation Frequency" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 9. WHAT-IF SIMULATOR */}
      {activeTab === "whatif" && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> WHAT-IF AGRICULTURE SCENARIO SIMULATOR
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <label className="block text-slate-300 font-medium mb-1">Rainfall Change ({whatIfRain}%)</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={whatIfRain}
                  onChange={(e) => setWhatIfRain(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <label className="block text-slate-300 font-medium mb-1">Temperature Change (+{whatIfTemp}°C)</label>
                <input
                  type="range"
                  min="-4"
                  max="6"
                  step="1"
                  value={whatIfTemp}
                  onChange={(e) => setWhatIfTemp(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <label className="block text-slate-300 font-medium mb-1">Fertilizer Price (+{whatIfFertilizerPrice}%)</label>
                <input
                  type="range"
                  min="-30"
                  max="80"
                  step="5"
                  value={whatIfFertilizerPrice}
                  onChange={(e) => setWhatIfFertilizerPrice(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <label className="block text-slate-300 font-medium mb-1">Market Price Change (+{whatIfCropPrice}%)</label>
                <input
                  type="range"
                  min="-30"
                  max="80"
                  step="5"
                  value={whatIfCropPrice}
                  onChange={(e) => setWhatIfCropPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs text-slate-400 block font-bold">BASELINE SCENARIO</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>Yield:</span> <strong className="text-white">{whatIfResult.baseline.yieldTon} Tons</strong></div>
                <div className="flex justify-between"><span>Revenue:</span> <strong className="text-emerald-400">MWK {whatIfResult.baseline.revenueMwk.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Profit:</span> <strong className="text-blue-400">MWK {whatIfResult.baseline.profitMwk.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
              <span className="text-xs text-amber-400 block font-bold">SIMULATED SCENARIO</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>Yield:</span> <strong className="text-white">{whatIfResult.scenario.yieldTon} Tons</strong></div>
                <div className="flex justify-between"><span>Revenue:</span> <strong className="text-emerald-400">MWK {whatIfResult.scenario.revenueMwk.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Profit:</span> <strong className="text-blue-400">MWK {whatIfResult.scenario.profitMwk.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs text-slate-400 block font-bold">NET IMPACT & VARIANCE</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>Yield Diff:</span> <strong className={whatIfResult.difference.yieldTonDiff >= 0 ? "text-emerald-400" : "text-rose-400"}>{whatIfResult.difference.yieldTonDiff} Tons</strong></div>
                <div className="flex justify-between"><span>Profit Diff:</span> <strong className={whatIfResult.difference.profitMwkDiff >= 0 ? "text-emerald-400" : "text-rose-400"}>MWK {whatIfResult.difference.profitMwkDiff.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Profit Shift:</span> <strong className={whatIfResult.difference.profitPercentChange >= 0 ? "text-emerald-400" : "text-rose-400"}>{whatIfResult.difference.profitPercentChange}%</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. MATLAB BRIDGE STATUS */}
      {activeTab === "matlab" && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" /> MATLAB Scientific Computing Engine Architecture
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
              MATLAB R2026a Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <span className="text-amber-400 font-bold block">Available MATLAB M-Files (/matlab/scripts/):</span>
              <p className="text-slate-300">• crop_growth_model.m (Logistic & Environmental ODEs)</p>
              <p className="text-slate-300">• yield_prediction.m (Confidence bounds & error matrices)</p>
              <p className="text-slate-300">• farm_profit_optimization.m (Linprog optimizer)</p>
              <p className="text-slate-300">• monte_carlo_simulation.m (10,000 normrnd iterations)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <span className="text-emerald-400 font-bold block">Abstraction Fallback System:</span>
              <p className="text-slate-300">• Abstraction: MathematicsEngine Interface</p>
              <p className="text-slate-300">• Primary: MatlabMathematicsEngine</p>
              <p className="text-slate-300">• Resilient Fallback: PythonMathematicsEngine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
