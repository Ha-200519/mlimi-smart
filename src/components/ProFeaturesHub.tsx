import React, { useState } from "react";
import {
  Zap,
  ShieldCheck,
  Activity,
  Award,
  TrendingUp,
  BarChart3,
  Download,
  Globe,
  FileSpreadsheet,
  Cpu,
  Sparkles,
  CheckCircle2,
  Droplets,
  Truck,
  DollarSign,
  Sliders,
  Eye,
  RefreshCw,
  FileText,
  Lock,
  ArrowRight,
  Flame,
  Check,
  SlidersHorizontal,
  Compass,
  PieChart
} from "lucide-react";
import { Farmer, CropType } from "../types";

interface ProFeaturesHubProps {
  farmers: Farmer[];
  selectedFarmerId?: string;
}

export const ProFeaturesHub: React.FC<ProFeaturesHubProps> = ({ farmers, selectedFarmerId }) => {
  // Plan Tier State
  const [activePlan, setActivePlan] = useState<"Pro Farmer" | "Cooperative Fleet" | "Enterprise Agribusiness">("Enterprise Agribusiness");
  const [proActive, setProActive] = useState<boolean>(true);

  // Active Tool Tab inside Pro Hub
  const [activeProTool, setActiveProTool] = useState<"satellite" | "arbitrage" | "soil" | "insurance" | "exports">("satellite");

  // Satellite Scanner State
  const [targetFarmerId, setTargetFarmerId] = useState<string>(selectedFarmerId || (farmers[0]?.id || "f-1"));
  const [scanBand, setScanBand] = useState<"NDVI" | "NDWI" | "Thermal" | "Chlorophyll">("NDVI");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<{
    ndvi: number;
    ndwi: number;
    healthScore: number;
    nitrogenLevel: string;
    waterStress: string;
    biomassDensity: string;
    anomaliesDetected: number;
  }>({
    ndvi: 0.78,
    ndwi: 0.62,
    healthScore: 92,
    nitrogenLevel: "Optimal (42 mg/kg)",
    waterStress: "Low Stress (Safe)",
    biomassDensity: "High (3.8 kg/m²)",
    anomaliesDetected: 0
  });

  // Arbitrage Calculator State
  const [cropType, setCropType] = useState<CropType>("maize");
  const [tonnage, setTonnage] = useState<number>(10);
  const [originDistrict, setOriginDistrict] = useState<string>("Chiradzulu");
  const [storageDays, setStorageDays] = useState<number>(30);

  // Soil Scanner State
  const [soilPh, setSoilPh] = useState<number>(6.2);
  const [nitrogenN, setNitrogenN] = useState<number>(35);
  const [phosphorusP, setPhosphorusP] = useState<number>(22);
  const [potassiumK, setPotassiumK] = useState<number>(180);

  // Insurance Estimator State
  const [insuredHectares, setInsuredHectares] = useState<number>(5);
  const [droughtSeverity, setDroughtSeverity] = useState<"Moderate" | "Severe" | "Extreme">("Severe");

  // Export State
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Trigger Satellite Scan Simulation
  const handleRunSatelliteScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const selectedFarmer = farmers.find((f) => f.id === targetFarmerId) || farmers[0];
      const baseNdvi = 0.65 + Math.random() * 0.25;
      const baseNdwi = 0.45 + Math.random() * 0.35;
      const score = Math.min(99, Math.round(baseNdvi * 110));

      setScanResults({
        ndvi: parseFloat(baseNdvi.toFixed(2)),
        ndwi: parseFloat(baseNdwi.toFixed(2)),
        healthScore: score,
        nitrogenLevel: score > 85 ? "Optimal (44 mg/kg)" : "Slight Deficiency (28 mg/kg)",
        waterStress: baseNdwi > 0.6 ? "Optimal Hydration" : "Moderate Water Stress",
        biomassDensity: `${(baseNdvi * 4.2).toFixed(1)} kg/m²`,
        anomaliesDetected: score < 75 ? 2 : 0
      });
      setIsScanning(false);
    }, 800);
  };

  // Arbitrage Computations
  const getMarketPrices = (crop: CropType) => {
    const baseRates: Record<CropType, number> = {
      maize: 380, // MWK/kg
      beans: 950,
      groundnuts: 850,
      rice: 1200,
      soybeans: 700
    };
    const base = baseRates[crop] || 400;
    return {
      Lilongwe: Math.round(base * 1.12),
      Blantyre: Math.round(base * 1.25),
      Mzuzu: Math.round(base * 1.05),
      Zomba: Math.round(base * 1.18)
    };
  };

  const prices = getMarketPrices(cropType);
  const kgAmount = tonnage * 1000;
  const highestPriceMarket = Object.entries(prices).reduce((max, curr) => (curr[1] > max[1] ? curr : max));
  const grossRevenue = kgAmount * highestPriceMarket[1];
  const estTransportCost = tonnage * 45000; // 45,000 MWK per tonne
  const estStorageCost = tonnage * storageDays * 1200; // 1,200 MWK per tonne per day
  const netProfit = grossRevenue - estTransportCost - estStorageCost;

  // Export Trigger
  const handleTriggerExport = (type: string) => {
    setExportNotice(`Generating ${type} report... Download started!`);
    setTimeout(() => {
      setExportNotice(null);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="sifms-pro-hub">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" /> SIFMS 2.0 Pro Suite
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                Enterprise AgTech
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Precision Agricultural Intelligence <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-light">
              High-resolution multi-spectral satellite sensing, market arbitrage optimization, automated soil chemistry analysis, and parametric climate risk insurance models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1">
              {(["Pro Farmer", "Cooperative Fleet", "Enterprise Agribusiness"] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setActivePlan(plan)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 ${
                    activePlan === plan
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            <button
              onClick={() => setProActive(!proActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 border ${
                proActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {proActive ? "Pro Status Active" : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        {/* PRO CAPABILITIES METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Satellite Resolution</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">3.5m Sentinel-2 / Landsat</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Price Arbitrage Engine</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">4 Major Hubs Live</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Soil Diagnostic Precision</div>
            <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">N-P-K & pH Saturation</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Parametric Insurance</div>
            <div className="text-sm font-bold text-teal-300 font-mono mt-0.5">Automated Drought Claims</div>
          </div>
        </div>
      </div>

      {/* TOOL NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveProTool("satellite")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
            activeProTool === "satellite"
              ? "bg-[#059669] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Globe className="h-4 w-4" />
          Multi-Spectral Satellite Scanner (NDVI)
        </button>

        <button
          onClick={() => setActiveProTool("arbitrage")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
            activeProTool === "arbitrage"
              ? "bg-[#059669] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Wholesale Market Arbitrage & Logistics
        </button>

        <button
          onClick={() => setActiveProTool("soil")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
            activeProTool === "soil"
              ? "bg-[#059669] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Droplets className="h-4 w-4" />
          N-P-K Soil Diagnostics & Fertilizer AI
        </button>

        <button
          onClick={() => setActiveProTool("insurance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
            activeProTool === "insurance"
              ? "bg-[#059669] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Parametric Drought Insurance Engine
        </button>

        <button
          onClick={() => setActiveProTool("exports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
            activeProTool === "exports"
              ? "bg-[#059669] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Download className="h-4 w-4" />
          Pro Commercial Export Center
        </button>
      </div>

      {/* TOOL 1: MULTI-SPECTRAL SATELLITE SCANNER */}
      {activeProTool === "satellite" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" /> Satellite Parcel Scanner
              </h3>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Sentinel-2 L2A
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Farmer Parcel:</label>
              <select
                value={targetFarmerId}
                onChange={(e) => setTargetFarmerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.district} ({f.village}) [{f.crops[0]?.cropType || "Maize"}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Spectral Band Filter:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["NDVI", "NDWI", "Thermal", "Chlorophyll"] as const).map((band) => (
                  <button
                    key={band}
                    onClick={() => setScanBand(band)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-between border ${
                      scanBand === band
                        ? "bg-slate-900 text-white border-slate-900 shadow"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{band}</span>
                    <span className="text-[9px] opacity-75 font-mono">
                      {band === "NDVI" ? "Vegetation" : band === "NDWI" ? "Water" : band === "Thermal" ? "Heat" : "Nitrogen"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunSatelliteScan}
              disabled={isScanning}
              className="w-full py-3 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Imagery...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-amber-300" /> Execute Satellite Spectral Diagnostic
                </>
              )}
            </button>

            {/* BAND EXPLANATION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">
                {scanBand === "NDVI" && "🌿 NDVI (Normalized Difference Vegetation Index)"}
                {scanBand === "NDWI" && "💧 NDWI (Normalized Difference Water Index)"}
                {scanBand === "Thermal" && "🔥 Thermal Stress Radar"}
                {scanBand === "Chlorophyll" && "🧪 Chlorophyll Canopy Density"}
              </p>
              <p className="text-[11px] leading-relaxed">
                {scanBand === "NDVI" && "Measures chlorophyll absorption at 665nm and near-infrared reflectance at 842nm to assess crop health."}
                {scanBand === "NDWI" && "Detects liquid water molecule absorption in plant canopies to identify drought stress days before wilting."}
                {scanBand === "Thermal" && "Captures thermal infrared emissions to pinpoint evapotranspiration deficits across farm parcels."}
                {scanBand === "Chlorophyll" && "Estimates leaf nitrogen content to guide precise top-dressing fertilizer applications."}
              </p>
            </div>
          </div>

          {/* Results Visualizer */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Parcel Satellite Heatmap Preview
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Target: {farmers.find((f) => f.id === targetFarmerId)?.name || "Selected Farm"} | Band: {scanBand}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Health Score: {scanResults.healthScore}/100
              </span>
            </div>

            {/* SIMULATED SATELLITE CANVAS MAP */}
            <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              {/* Heatmap background grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    scanBand === "NDVI"
                      ? "radial-gradient(circle at 40% 40%, #10B981 10%, #059669 35%, #047857 60%, #064E3B 80%)"
                      : scanBand === "NDWI"
                      ? "radial-gradient(circle at 50% 50%, #38BDF8 10%, #0284C7 40%, #0369A1 70%, #0C4A6E 90%)"
                      : scanBand === "Thermal"
                      ? "radial-gradient(circle at 60% 30%, #F59E0B 10%, #D97706 40%, #B45309 70%, #78350F 90%)"
                      : "radial-gradient(circle at 30% 60%, #A855F7 10%, #7E22CE 40%, #581C87 70%, #3B0764 90%)",
                  filter: "blur(12px)"
                }}
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Polygon border */}
              <div className="relative z-10 w-3/4 h-3/4 border-2 border-emerald-400/80 border-dashed rounded-xl p-4 flex flex-col justify-between bg-slate-900/40 backdrop-blur-sm">
                <div className="flex justify-between items-start text-[10px] font-mono text-emerald-300">
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    LAT: -15.783, LON: 35.003
                  </span>
                  <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                    PARCEL BOUNDARY ACTIVE
                  </span>
                </div>

                <div className="text-center space-y-1 my-auto">
                  <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                    {scanBand === "NDVI"
                      ? scanResults.ndvi
                      : scanBand === "NDWI"
                      ? scanResults.ndwi
                      : scanBand === "Thermal"
                      ? "28.4 °C"
                      : "84 %"}
                  </div>
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                    {scanBand} Index Value
                  </div>
                </div>

                <div className="flex justify-between items-end text-[10px] font-mono text-slate-300">
                  <span>AREA: 2.5 HECTARES</span>
                  <span className="text-emerald-400 font-bold">ACCURACY: 99.2%</span>
                </div>
              </div>
            </div>

            {/* DIAGNOSTIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">NDVI Biomass</div>
                <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{scanResults.ndvi}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">NDWI Canopy Moisture</div>
                <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{scanResults.ndwi}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Nitrogen Level</div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">{scanResults.nitrogenLevel}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Water Stress Status</div>
                <div className="text-xs font-bold text-sky-600 mt-0.5">{scanResults.waterStress}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: WHOLESALE MARKET ARBITRAGE & LOGISTICS */}
      {activeProTool === "arbitrage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" /> Arbitrage & Transport Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Calculate net revenue after transport haulage and warehouse storage degradation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type:</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value as CropType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="maize">Maize (Nkhokwe / White)</option>
                <option value="beans">Beans (Sugar Beans / Nchemba)</option>
                <option value="groundnuts">Groundnuts (CG7 / Nsinjiro)</option>
                <option value="rice">Rice (Kilombero / Nkhotakota)</option>
                <option value="soybeans">Soybeans (Makwacha)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Tonnes):</label>
                <input
                  type="number"
                  value={tonnage}
                  onChange={(e) => setTonnage(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hold Storage (Days):</label>
                <input
                  type="number"
                  value={storageDays}
                  onChange={(e) => setStorageDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Origin Rural Hub:</label>
              <select
                value={originDistrict}
                onChange={(e) => setOriginDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="Chiradzulu">Chiradzulu (Njuli Hub)</option>
                <option value="Lilongwe">Lilongwe (Mitundu Hub)</option>
                <option value="Dedza">Dedza (Bembeke Hub)</option>
                <option value="Mzimba">Mzimba (Jenda Hub)</option>
              </select>
            </div>

            {/* WHOLESALE MATCHMAKER */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Truck className="h-4 w-4 text-emerald-600" /> Institutional Buyer Matchmaker
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                Matched with 3 institutional processors accepting bulk {cropType} shipments in Blantyre & Lilongwe.
              </p>
            </div>
          </div>

          {/* Arbitrage Breakdowns */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Market Spot Comparison</h4>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Volume: {tonnage} Metric Tonnes ({kgAmount.toLocaleString()} kg)
              </span>
            </div>

            {/* SPOT PRICE CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(prices).map(([mkt, priceKg]) => {
                const isBest = mkt === highestPriceMarket[0];
                return (
                  <div
                    key={mkt}
                    className={`p-3 rounded-xl border transition ${
                      isBest ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{mkt} Hub</div>
                    <div className="text-base font-black text-slate-900 font-mono mt-1">
                      MWK {priceKg} <span className="text-[10px] font-normal text-slate-500">/kg</span>
                    </div>
                    {isBest && (
                      <span className="inline-block mt-1 text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        ★ Optimal Destination
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FINANCIAL SUMMARY TABLE */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300">Optimal Destination Market:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{highestPriceMarket[0]}</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Sales Value ({tonnage}T @ MWK {highestPriceMarket[1]}/kg):</span>
                  <span className="text-emerald-400 font-bold">MWK {grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Freight Transport Haulage ({originDistrict} → {highestPriceMarket[0]}):</span>
                  <span className="text-rose-400">- MWK {estTransportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pest Control & Warehouse Storage ({storageDays} days):</span>
                  <span className="text-rose-400">- MWK {estStorageCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Estimated Net Profit Margin:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">MWK {netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: N-P-K SOIL DIAGNOSTICS */}
      {activeProTool === "soil" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-emerald-600" /> N-P-K & Soil Diagnostics Engine
              </h3>
              <p className="text-xs text-slate-500">Adjust soil test parameters to calculate custom fertilizer blending advice.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Soil pH Level:</span>
                <span className="font-mono text-emerald-600">{soilPh}</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="8.5"
                step="0.1"
                value={soilPh}
                onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Nitrogen (N) - mg/kg:</span>
                <span className="font-mono text-emerald-600">{nitrogenN}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={nitrogenN}
                onChange={(e) => setNitrogenN(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Phosphorus (P) - mg/kg:</span>
                <span className="font-mono text-emerald-600">{phosphorusP}</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={phosphorusP}
                onChange={(e) => setPhosphorusP(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Potassium (K) - mg/kg:</span>
                <span className="font-mono text-emerald-600">{potassiumK}</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                value={potassiumK}
                onChange={(e) => setPotassiumK(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              AI Agronomist Blending Recommendation
            </h4>

            <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">Soil Acidity Status:</span>
                <span className="text-xs font-black text-emerald-700 font-mono">
                  {soilPh < 5.5 ? "Slightly Acidic (Requires Agricultural Lime)" : soilPh > 7.5 ? "Alkaline" : "Optimal for Cereals"}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {nitrogenN < 25
                  ? "Nitrogen levels are deficient. Apply NPK 23:21:0+4S basal fertilizer at planting (100kg/ha) followed by Urea top-dressing at 3 weeks."
                  : "Nitrogen levels are balanced. Maintain standard application rate of 50kg/ha Urea."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Basal NPK Needed</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-1">150 <span className="text-xs font-normal">kg/ha</span></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Urea Top-Dressing</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-1">100 <span className="text-xs font-normal">kg/ha</span></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Lime Requirement</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-1">{soilPh < 5.5 ? "250" : "0"} <span className="text-xs font-normal">kg/ha</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: PARAMETRIC INSURANCE */}
      {activeProTool === "insurance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Climate Risk Insurance Estimator
              </h3>
              <p className="text-xs text-slate-500">Automated parametric policy evaluation triggered by satellite rainfall deficits.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Insured Area (Hectares):</label>
              <input
                type="number"
                value={insuredHectares}
                onChange={(e) => setInsuredHectares(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Satellite Drought Severity Index:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Moderate", "Severe", "Extreme"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setDroughtSeverity(sev)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                      droughtSeverity === sev
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Parametric Insurance Claim Summary
            </h4>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Insured Hectares:</span>
                <span className="font-mono text-white font-bold">{insuredHectares} Ha</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Satellite Rainfall Anomaly:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {droughtSeverity === "Moderate" ? "-35% Deficit" : droughtSeverity === "Severe" ? "-55% Deficit" : "-75% Extreme Deficit"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Estimated Claim Payout:</span>
                <span className="font-mono text-emerald-400 text-lg font-black">
                  MWK {(insuredHectares * (droughtSeverity === "Moderate" ? 180000 : droughtSeverity === "Severe" ? 320000 : 500000)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 5: EXPORTS */}
      {activeProTool === "exports" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-600" /> Commercial Agribusiness Data Export Suite
            </h3>
            <p className="text-xs text-slate-500">
              Download structured SIFMS datasets, audit certificates, and API payload definitions for external systems.
            </p>
          </div>

          {exportNotice && (
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-xs font-bold animate-pulse flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {exportNotice}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Full Farmer Registry (CSV)</h4>
              <p className="text-xs text-slate-500">Complete database of verified farmers, boundary coordinates, and crop yields.</p>
              <button
                onClick={() => handleTriggerExport("Farmer Registry CSV")}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-sm">Executive Yield Audit (PDF)</h4>
              <p className="text-xs text-slate-500 font-normal">Formatted district agricultural oversight audit report with satellite metrics.</p>
              <button
                onClick={() => handleTriggerExport("Executive Audit PDF")}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF Report
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Globe className="h-6 w-6 text-sky-600" />
              <h4 className="font-bold text-slate-900 text-sm">REST API Webhooks</h4>
              <p className="text-xs text-slate-500">Real-time webhook endpoints for ERPs, banks, and grain processors.</p>
              <button
                onClick={() => handleTriggerExport("API Webhooks Documentation")}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" /> View API Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
