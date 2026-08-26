import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// File-based Storage
const DATA_FILE = path.join(process.cwd(), "farmers_db.json");

interface CropAssignment {
  cropType: "maize" | "beans" | "groundnuts" | "rice";
  growthStage: "seedling" | "vegetative" | "flowering" | "maturity" | "harvested";
  plantingDate: string;
  farmSize: number; // in hectares
  expectedYieldBaseline: number; // kg/ha
  predictedYield: number; // kg calculated by ML model
  fertilizerUsage: number; // kg
}

interface Farmer {
  id: string;
  name: string;
  phoneNumber: string;
  password?: string;
  age: number;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  crops: CropAssignment[];
  registeredAt: string;
  isVerified?: boolean;
  boundaryPoints?: any[];
}

// Predefined village-based coordinates for remote area support
const VILLAGE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  njuli: { lat: -15.75, lon: 35.10 },
  mbulumbuzi: { lat: -15.60, lon: 35.05 },
  chiradzulu: { lat: -15.67, lon: 35.15 },
  other: { lat: -15.78, lon: 35.00 },
};

const DISTRICT_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  Lilongwe: { lat: -13.962, lon: 33.774 },
  Salima: { lat: -13.784, lon: 34.451 },
  Zomba: { lat: -15.388, lon: 35.322 },
  Blantyre: { lat: -15.782, lon: 35.008 },
  Karonga: { lat: -9.933, lon: 33.931 },
  Mzimba: { lat: -11.902, lon: 33.603 },
  Chiradzulu: { lat: -15.67, lon: 35.15 },
};

// Initial Sample Data Generation with password security
const DEFAULT_FARMERS: Farmer[] = [
  {
    id: "f-1",
    name: "Chifundo Phiri",
    phoneNumber: "+265888123450",
    password: "password123",
    age: 42,
    district: "Lilongwe",
    village: "Lilongwe West",
    latitude: -13.962,
    longitude: 33.774,
    crops: [
      {
        cropType: "maize",
        growthStage: "flowering",
        plantingDate: "2026-02-15",
        farmSize: 2.5,
        expectedYieldBaseline: 2500,
        predictedYield: 6250,
        fertilizerUsage: 150,
      }
    ],
    registeredAt: "2026-01-10T08:30:00Z",
  },
  {
    id: "f-2",
    name: "Mercy Banda",
    phoneNumber: "+265888123451",
    password: "password123",
    age: 35,
    district: "Salima",
    village: "Lakeshore Rural",
    latitude: -13.784,
    longitude: 34.451,
    crops: [
      {
        cropType: "rice",
        growthStage: "vegetative",
        plantingDate: "2026-03-01",
        farmSize: 1.8,
        expectedYieldBaseline: 3000,
        predictedYield: 5400,
        fertilizerUsage: 120,
      }
    ],
    registeredAt: "2026-01-12T10:15:00Z",
  },
  {
    id: "f-3",
    name: "John Chilima",
    phoneNumber: "+265888123452",
    password: "password123",
    age: 51,
    district: "Zomba",
    village: "Njuli",
    latitude: -15.75,
    longitude: 35.10,
    crops: [
      {
        cropType: "beans",
        growthStage: "seedling",
        plantingDate: "2026-04-10",
        farmSize: 3.2,
        expectedYieldBaseline: 1200,
        predictedYield: 3840,
        fertilizerUsage: 80,
      }
    ],
    registeredAt: "2026-01-20T14:45:00Z",
  },
  {
    id: "f-4",
    name: "Agness Chimwaza",
    phoneNumber: "+265888123453",
    password: "password123",
    age: 29,
    district: "Chiradzulu",
    village: "Mbulumbuzi",
    latitude: -15.60,
    longitude: 35.05,
    crops: [
      {
        cropType: "maize",
        growthStage: "maturity",
        plantingDate: "2026-01-20",
        farmSize: 1.2,
        expectedYieldBaseline: 2400,
        predictedYield: 2880,
        fertilizerUsage: 90,
      },
      {
        cropType: "groundnuts",
        growthStage: "maturity",
        plantingDate: "2026-01-22",
        farmSize: 0.8,
        expectedYieldBaseline: 1500,
        predictedYield: 1200,
        fertilizerUsage: 40,
      }
    ],
    registeredAt: "2026-01-25T09:00:00Z",
  },
];

// Phase 1 - 10 Support Types in Backend
interface FieldInspectionReport {
  id: string;
  officerName: string;
  farmerId: string;
  farmerName: string;
  village: string;
  inspectionDate: string;
  cropHealthStatus: "Excellent" | "Good" | "Average" | "Poor";
  soilMoistureLevel: "Dry" | "Moderate" | "Sufficient";
  weedingStatus: "Clean" | "Needs Weeding" | "Overgrown";
  notes: string;
}

interface DiseaseReport {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  diseaseName: "Fall Armyworm" | "Rust" | "Leaf Blight" | "Streak Virus" | "None";
  confidenceScore: number;
  growthStage: string;
  verificationStatus: "Pending" | "Verified" | "Investigating";
  treatmentRecommended: string;
  reportedAt: string;
  uploadedPhotoUrl?: string;
}

interface MarketPrice {
  id: string;
  cropType: string;
  marketName: "Blantyre" | "Lilongwe" | "Mzuzu" | "Zomba";
  pricePerBag: number; // Malawian Kwacha (MWK) per 50kg bag
  priceTrend: "up" | "stable" | "down";
  updatedAt: string;
}

interface CooperativeGroup {
  id: string;
  name: string;
  village: string;
  district: string;
  memberCount: number;
  collectiveTonnageGoal: number; // tonnes of crops expected
  fertilizerDistributedBags: number; // 50kg bags
  seedsDistributedKg: number; // kg of seed
}

// Separate Storage Files
const INSPECTIONS_FILE = path.join(process.cwd(), "inspections_db.json");
const DISEASES_FILE = path.join(process.cwd(), "diseases_db.json");
const COOPERATIVES_FILE = path.join(process.cwd(), "cooperatives_db.json");
const MARKETS_FILE = path.join(process.cwd(), "markets_db.json");

// Default Data Seeds
const DEFAULT_INSPECTIONS: FieldInspectionReport[] = [
  {
    id: "insp-1",
    officerName: "Officer John Banda",
    farmerId: "f-3",
    farmerName: "John Chilima",
    village: "Njuli",
    inspectionDate: "2026-06-05",
    cropHealthStatus: "Excellent",
    soilMoistureLevel: "Moderate",
    weedingStatus: "Clean",
    notes: "Njuli fields are highly fertile. Beans are developing healthy pods. Recommended small application of organic trace booster before heavy winter moisture decreases."
  },
  {
    id: "insp-2",
    officerName: "Officer Agness Moyo",
    farmerId: "f-2",
    farmerName: "Mercy Banda",
    village: "Lakeshore Rural",
    inspectionDate: "2026-06-10",
    cropHealthStatus: "Good",
    soilMoistureLevel: "Sufficient",
    weedingStatus: "Needs Weeding",
    notes: "Rice crop is healthy, but weeder spacing rules must be enforced around standard bounds. Water saturation levels are optimal."
  }
];

const DEFAULT_DISEASES: DiseaseReport[] = [
  {
    id: "dis-1",
    farmerId: "f-1",
    farmerName: "Chifundo Phiri",
    cropType: "maize",
    diseaseName: "Fall Armyworm",
    confidenceScore: 0.92,
    growthStage: "flowering",
    verificationStatus: "Verified",
    treatmentRecommended: "Apply Cypermethrin or Deltamethrin immediately in safe levels. Monitor neighboring plots to limit spreading.",
    reportedAt: "2026-06-02T11:20:00Z"
  },
  {
    id: "dis-2",
    farmerId: "f-3",
    farmerName: "John Chilima",
    cropType: "beans",
    diseaseName: "Leaf Blight",
    confidenceScore: 0.85,
    growthStage: "seedling",
    verificationStatus: "Pending",
    treatmentRecommended: "Remove and burn infested leaves. Spray copper-based organic fungicides to protect surrounding acreage.",
    reportedAt: "2026-06-10T15:40:00Z"
  }
];

const DEFAULT_COOPERATIVES: CooperativeGroup[] = [
  {
    id: "coop-1",
    name: "Chiradzulu Smallholders Cooperative",
    village: "Njuli",
    district: "Chiradzulu",
    memberCount: 45,
    collectiveTonnageGoal: 120,
    fertilizerDistributedBags: 250,
    seedsDistributedKg: 500
  },
  {
    id: "coop-2",
    name: "Mbulumbuzi Legume Association",
    village: "Mbulumbuzi",
    district: "Chiradzulu",
    memberCount: 32,
    collectiveTonnageGoal: 65,
    fertilizerDistributedBags: 120,
    seedsDistributedKg: 350
  },
  {
    id: "coop-3",
    name: "Lilongwe West Maize Syndicate",
    village: "Lilongwe West",
    district: "Lilongwe",
    memberCount: 88,
    collectiveTonnageGoal: 280,
    fertilizerDistributedBags: 500,
    seedsDistributedKg: 1100
  }
];

const DEFAULT_MARKET_PRICES: MarketPrice[] = [
  { id: "p-1", cropType: "maize", marketName: "Lilongwe", pricePerBag: 24500, priceTrend: "stable", updatedAt: "2026-06-11" },
  { id: "p-2", cropType: "maize", marketName: "Blantyre", pricePerBag: 26000, priceTrend: "up", updatedAt: "2026-06-11" },
  { id: "p-3", cropType: "maize", marketName: "Zomba", pricePerBag: 25500, priceTrend: "up", updatedAt: "2026-06-11" },
  { id: "p-4", cropType: "maize", marketName: "Mzuzu", pricePerBag: 23500, priceTrend: "down", updatedAt: "2026-06-11" },
  
  { id: "p-5", cropType: "beans", marketName: "Lilongwe", pricePerBag: 38000, priceTrend: "up", updatedAt: "2026-06-11" },
  { id: "p-6", cropType: "beans", marketName: "Blantyre", pricePerBag: 42000, priceTrend: "up", updatedAt: "2026-06-11" },
  { id: "p-7", cropType: "beans", marketName: "Zomba", pricePerBag: 39500, priceTrend: "stable", updatedAt: "2026-06-11" },
  { id: "p-8", cropType: "beans", marketName: "Mzuzu", pricePerBag: 37000, priceTrend: "stable", updatedAt: "2026-06-11" },

  { id: "p-9", cropType: "groundnuts", marketName: "Blantyre", pricePerBag: 34000, priceTrend: "down", updatedAt: "2026-06-11" },
  { id: "p-10", cropType: "groundnuts", marketName: "Lilongwe", pricePerBag: 32500, priceTrend: "stable", updatedAt: "2026-06-11" },
  { id: "p-11", cropType: "rice", marketName: "Blantyre", pricePerBag: 48000, priceTrend: "up", updatedAt: "2026-06-11" },
  { id: "p-12", cropType: "rice", marketName: "Lilongwe", pricePerBag: 45000, priceTrend: "stable", updatedAt: "2026-06-11" },
  { id: "p-13", cropType: "soybeans", marketName: "Blantyre", pricePerBag: 29000, priceTrend: "stable", updatedAt: "2026-06-11" },
  { id: "p-14", cropType: "soybeans", marketName: "Lilongwe", pricePerBag: 27500, priceTrend: "down", updatedAt: "2026-06-11" }
];

// Database CRUD operations
function readInspections(): FieldInspectionReport[] {
  try {
    if (!fs.existsSync(INSPECTIONS_FILE)) {
      fs.writeFileSync(INSPECTIONS_FILE, JSON.stringify(DEFAULT_INSPECTIONS, null, 2), "utf8");
      return DEFAULT_INSPECTIONS;
    }
    return JSON.parse(fs.readFileSync(INSPECTIONS_FILE, "utf8"));
  } catch {
    return DEFAULT_INSPECTIONS;
  }
}

function writeInspections(data: FieldInspectionReport[]) {
  fs.writeFileSync(INSPECTIONS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function readDiseases(): DiseaseReport[] {
  try {
    if (!fs.existsSync(DISEASES_FILE)) {
      fs.writeFileSync(DISEASES_FILE, JSON.stringify(DEFAULT_DISEASES, null, 2), "utf8");
      return DEFAULT_DISEASES;
    }
    return JSON.parse(fs.readFileSync(DISEASES_FILE, "utf8"));
  } catch {
    return DEFAULT_DISEASES;
  }
}

function writeDiseases(data: DiseaseReport[]) {
  fs.writeFileSync(DISEASES_FILE, JSON.stringify(data, null, 2), "utf8");
}

function readCooperatives(): CooperativeGroup[] {
  try {
    if (!fs.existsSync(COOPERATIVES_FILE)) {
      fs.writeFileSync(COOPERATIVES_FILE, JSON.stringify(DEFAULT_COOPERATIVES, null, 2), "utf8");
      return DEFAULT_COOPERATIVES;
    }
    return JSON.parse(fs.readFileSync(COOPERATIVES_FILE, "utf8"));
  } catch {
    return DEFAULT_COOPERATIVES;
  }
}

function writeCooperatives(data: CooperativeGroup[]) {
  fs.writeFileSync(COOPERATIVES_FILE, JSON.stringify(data, null, 2), "utf8");
}

function readMarketPrices(): MarketPrice[] {
  try {
    if (!fs.existsSync(MARKETS_FILE)) {
      fs.writeFileSync(MARKETS_FILE, JSON.stringify(DEFAULT_MARKET_PRICES, null, 2), "utf8");
      return DEFAULT_MARKET_PRICES;
    }
    return JSON.parse(fs.readFileSync(MARKETS_FILE, "utf8"));
  } catch {
    return DEFAULT_MARKET_PRICES;
  }
}

function writeMarketPrices(data: MarketPrice[]) {
  fs.writeFileSync(MARKETS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function readDatabase(): Farmer[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_FARMERS, null, 2), "utf8");
      return DEFAULT_FARMERS;
    }
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Database reading warning, falling back to default:", error);
    return DEFAULT_FARMERS;
  }
}

function writeDatabase(data: Farmer[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Database writing error:", error);
    return false;
  }
}

// Machine Learning yield simulator (RandomForestRegressor style emulator)
function predictYieldML(
  cropType: string,
  farmSize: number,
  fertilizerUsage: number,
  district: string,
  village: string
): number {
  const baseYields: Record<string, number> = { maize: 2500, beans: 1200, groundnuts: 1500, rice: 3400 };
  const base = baseYields[cropType.toLowerCase()] || 2000;

  // Fertilizer ratio helper (optimal 100-150kg/ha)
  const fertilizerRatio = farmSize > 0 ? (fertilizerUsage / farmSize) : 50;
  let fertilizerMultiplier = 1.0;
  if (fertilizerRatio < 40) {
    fertilizerMultiplier = 0.75;
  } else if (fertilizerRatio >= 40 && fertilizerRatio < 100) {
    fertilizerMultiplier = 1.10;
  } else {
    fertilizerMultiplier = 1.35;
  }

  // Predefined village-based soil fertility factors
  let villageMultiplier = 1.0;
  const villName = (village || "").toLowerCase();
  if (villName.includes("njuli")) {
    villageMultiplier = 1.25; // Rich soil profile
  } else if (villName.includes("mbulumbuzi")) {
    villageMultiplier = 1.12; // Well-drained soil
  } else if (villName.includes("chiradzulu")) {
    villageMultiplier = 1.18; // Mountainous microclimate
  }

  // Rainfall coefficient based on district averages
  let districtMultiplier = 1.0;
  if (/salima|karonga/i.test(district)) {
    districtMultiplier = 1.05; // warm coastal heat boosts rice
  } else if (/zomba|chiradzulu/i.test(district)) {
    districtMultiplier = 1.10; // high precip beneficial for root growth
  }

  const result = farmSize * base * fertilizerMultiplier * villageMultiplier * districtMultiplier;
  return Math.round(result);
}

// REST APIs

// AUTH: Login Endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Admin Check
  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      role: "admin",
      user: {
        id: "admin",
        name: "Administrator Console",
        district: "System Oversight",
        village: "HQ",
      }
    });
  }

  // Extension Officer Check
  if (username === "officer" && password === "officer123") {
    return res.json({
      success: true,
      role: "officer",
      user: {
        id: "officer-1",
        name: "Officer John Banda",
        district: "Chiradzulu",
        village: "Njuli",
      }
    });
  }

  // Cooperative Manager Check
  if (username === "manager" && password === "manager123") {
    return res.json({
      success: true,
      role: "manager",
      user: {
        id: "manager-1",
        name: "Manager Agness Moyo",
        district: "Chiradzulu",
        village: "Mbulumbuzi",
      }
    });
  }

  // Agronomist Check
  if (username === "agronomist" && password === "agronomist123") {
    return res.json({
      success: true,
      role: "officer",
      user: {
        id: "agronomist-1",
        name: "Dr. Lameck Kanyama (Chief Agronomist)",
        district: "Zomba & Chiradzulu",
        village: "Chiradzulu Boma",
      }
    });
  }

  // System Analyst Check
  if (username === "analyst" && password === "analyst123") {
    return res.json({
      success: true,
      role: "analyst",
      user: {
        id: "analyst-1",
        name: "Analyst Chifundo Phiri",
        district: "Lilongwe",
        village: "HQ",
      }
    });
  }

  // Farmer Check (by phone number)
  const db = readDatabase();
  const farmer = db.find(
    (f) => f.phoneNumber === username || f.phoneNumber.replace(/[\s+]/g, "") === username.replace(/[\s+]/g, "")
  );

  if (farmer && (farmer.password === password || (!farmer.password && password === "password123"))) {
    return res.json({
      success: true,
      role: "farmer",
      user: farmer,
    });
  }

  return res.status(401).json({ error: "Invalid phone number or password credentials." });
});

// AUTH: Register Endpoint (Self-registration)
app.post("/api/auth/register", (req, res) => {
  const db = readDatabase();
  const { name, phoneNumber, password, age, district, village, farmSize, cropType, latitude, longitude } = req.body;

  if (!name || !phoneNumber || !password) {
    return res.status(400).json({ error: "Full Name, Phone Number, and Password are required." });
  }

  // Check if phone number already registered
  const ex = db.find((f) => f.phoneNumber === phoneNumber);
  if (ex) {
    return res.status(400).json({ error: "A farmer is already registered with this phone number." });
  }

  // Resolve village GPS coordinates fallback
  let latVal = Number(latitude);
  let lonVal = Number(longitude);

  if (!latVal || !lonVal) {
    const villLower = (village || "").toLowerCase();
    if (villLower.includes("njuli")) {
      latVal = VILLAGE_COORDINATES.njuli.lat;
      lonVal = VILLAGE_COORDINATES.njuli.lon;
    } else if (villLower.includes("mbulumbuzi")) {
      latVal = VILLAGE_COORDINATES.mbulumbuzi.lat;
      lonVal = VILLAGE_COORDINATES.mbulumbuzi.lon;
    } else if (villLower.includes("chiradzulu")) {
      latVal = VILLAGE_COORDINATES.chiradzulu.lat;
      lonVal = VILLAGE_COORDINATES.chiradzulu.lon;
    } else {
      // District Centroid Fallback
      const dCent = DISTRICT_CENTROIDS[district as keyof typeof DISTRICT_CENTROIDS] || DISTRICT_CENTROIDS["Chiradzulu"];
      latVal = dCent.lat + (Math.random() * 0.04 - 0.02); // Add a small jitter so markers don't overlap perfectly
      lonVal = dCent.lon + (Math.random() * 0.04 - 0.02);
    }
  }

  // Initial Crop setup
  const selectedCrop = (cropType || "maize").toLowerCase() as "maize" | "beans" | "groundnuts" | "rice";
  const selectedSize = Number(farmSize) || 1.0;
  const fertilizer = selectedCrop === "maize" ? 100 : selectedCrop === "rice" ? 120 : 40;
  
  // Calculate Initial ML yield
  const baselineYieldRate = selectedCrop === "maize" ? 2500 : selectedCrop === "rice" ? 3400 : selectedCrop === "beans" ? 1200 : 1500;
  const predicted = predictYieldML(selectedCrop, selectedSize, fertilizer, district || "Chiradzulu", village || "General");

  const newFarmer: Farmer = {
    id: "f-" + Date.now(),
    name,
    phoneNumber,
    password,
    age: Number(age) || 35,
    district: district || "Chiradzulu",
    village: village || "Njuli",
    latitude: latVal,
    longitude: lonVal,
    crops: [
      {
        cropType: selectedCrop,
        growthStage: "seedling",
        plantingDate: new Date().toISOString().split("T")[0],
        farmSize: selectedSize,
        expectedYieldBaseline: baselineYieldRate,
        predictedYield: predicted,
        fertilizerUsage: fertilizer,
      }
    ],
    registeredAt: new Date().toISOString(),
  };

  db.push(newFarmer);
  writeDatabase(db);
  res.status(201).json({ success: true, user: newFarmer });
});

app.get("/api/farmers", (req, res) => {
  const data = readDatabase();
  res.json(data);
});

app.post("/api/farmers", (req, res) => {
  const db = readDatabase();
  const farmerData = req.body;

  // Coordinates fallback if missing
  let latVal = Number(farmerData.latitude);
  let lonVal = Number(farmerData.longitude);
  if (!latVal || !lonVal) {
    const villLower = (farmerData.village || "").toLowerCase();
    if (villLower.includes("njuli")) {
      latVal = VILLAGE_COORDINATES.njuli.lat;
      lonVal = VILLAGE_COORDINATES.njuli.lon;
    } else if (villLower.includes("mbulumbuzi")) {
      latVal = VILLAGE_COORDINATES.mbulumbuzi.lat;
      lonVal = VILLAGE_COORDINATES.mbulumbuzi.lon;
    } else if (villLower.includes("chiradzulu")) {
      latVal = VILLAGE_COORDINATES.chiradzulu.lat;
      lonVal = VILLAGE_COORDINATES.chiradzulu.lon;
    } else {
      const dCent = DISTRICT_CENTROIDS[farmerData.district as keyof typeof DISTRICT_CENTROIDS] || DISTRICT_CENTROIDS["Lilongwe"];
      latVal = dCent.lat + (Math.random() * 0.04 - 0.02);
      lonVal = dCent.lon + (Math.random() * 0.04 - 0.02);
    }
  }

  // Clean and predict crops
  const rawCrops = farmerData.crops || [];
  const processedCrops = rawCrops.map((crop: any) => {
    const baseline = crop.cropType === "maize" ? 2500 : crop.cropType === "rice" ? 3400 : crop.cropType === "beans" ? 1200 : 1500;
    return {
      ...crop,
      expectedYieldBaseline: crop.expectedYieldBaseline || baseline,
      predictedYield: predictYieldML(
        crop.cropType,
        Number(crop.farmSize) || 1.0,
        Number(crop.fertilizerUsage) || 50,
        farmerData.district || "Chiradzulu",
        farmerData.village || "Njuli"
      )
    };
  });

  const newFarmer: Farmer = {
    id: "f-" + Date.now(),
    name: farmerData.name || "Unknown Farmer",
    phoneNumber: farmerData.phoneNumber || "+265" + Math.floor(100000000 + Math.random() * 900000000),
    password: farmerData.password || "password123",
    age: Number(farmerData.age) || 35,
    district: farmerData.district || "Lilongwe",
    village: farmerData.village || "General",
    latitude: latVal,
    longitude: lonVal,
    crops: processedCrops,
    registeredAt: new Date().toISOString(),
  };

  db.push(newFarmer);
  writeDatabase(db);
  res.status(201).json(newFarmer);
});

app.put("/api/farmers/:id", (req, res) => {
  const db = readDatabase();
  const index = db.findIndex((f) => f.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Farmer not found" });
  }

  const updatedData = req.body;
  if (updatedData.crops) {
    updatedData.crops = updatedData.crops.map((crop: any) => {
      const baseline = crop.cropType === "maize" ? 2500 : crop.cropType === "rice" ? 3400 : crop.cropType === "beans" ? 1200 : 1500;
      return {
        ...crop,
        expectedYieldBaseline: crop.expectedYieldBaseline || baseline,
        predictedYield: predictYieldML(
          crop.cropType,
          Number(crop.farmSize) || 1.0,
          Number(crop.fertilizerUsage) || 50,
          updatedData.district || db[index].district,
          updatedData.village || db[index].village
        )
      };
    });
  }

  const updatedFarmer = { ...db[index], ...updatedData, id: db[index].id };
  db[index] = updatedFarmer;
  writeDatabase(db);
  res.json(updatedFarmer);
});

app.delete("/api/farmers/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.filter((f) => f.id !== req.params.id);
  writeDatabase(filtered);
  res.json({ success: true, message: "Farmer deleted" });
});

// INSPECTIONS REST
app.get("/api/inspections", (req, res) => {
  res.json(readInspections());
});

app.post("/api/inspections", (req, res) => {
  const reports = readInspections();
  const newReport = {
    id: "insp-" + Date.now(),
    officerName: req.body.officerName || "Field Agent",
    farmerId: req.body.farmerId,
    farmerName: req.body.farmerName || "Registered Farmer",
    village: req.body.village || "Njuli",
    inspectionDate: new Date().toISOString().split("T")[0],
    cropHealthStatus: req.body.cropHealthStatus || "Good",
    soilMoistureLevel: req.body.soilMoistureLevel || "Moderate",
    weedingStatus: req.body.weedingStatus || "Clean",
    notes: req.body.notes || ""
  };
  reports.push(newReport);
  writeInspections(reports);

  // Set verified flag on the farmer's account
  if (req.body.farmerId) {
    const farmers = readDatabase();
    const idx = farmers.findIndex(f => f.id === req.body.farmerId);
    if (idx !== -1) {
      farmers[idx].isVerified = true;
      writeDatabase(farmers);
    }
  }

  res.status(201).json(newReport);
});

// DISEASES REST
app.get("/api/diseases", (req, res) => {
  res.json(readDiseases());
});

app.post("/api/diseases", async (req, res) => {
  const reports = readDiseases();
  const { farmerId, farmerName, cropType, diseaseName, confidenceScore, growthStage, uploadedPhotoUrl } = req.body;
  
  // Set up default advisor outcomes
  const treatments: Record<string, string> = {
    "Fall Armyworm": "Apply Cypermethrin or Deltamethrin inside safe baseline margins. Check leaf undersides daily and spray early morning.",
    "Rust": "Dampen spread using sulfur-based organic fungicides or resistant crop hybrids. Remove dead leaves cleanly.",
    "Leaf Blight": "Spray copper oxychloride boosters and implement crop rotation. Ensure perfect soil oxygenation.",
    "Streak Virus": "Controlling the leafhopper vector is vital. Apply localized imidacloprid; uproot and destroy stunted hosts."
  };

  const nameSelected = diseaseName && diseaseName !== "None" ? diseaseName : "Leaf Blight";
  const solution = treatments[nameSelected] || "Practice crop separation, ensure high ventilation, and keep field weeds clear.";

  const newReport: DiseaseReport = {
    id: "dis-" + Date.now(),
    farmerId: farmerId || "f-guest",
    farmerName: farmerName || "Anonymous Farmer",
    cropType: cropType || "maize",
    diseaseName: nameSelected,
    confidenceScore: confidenceScore || 0.88,
    growthStage: growthStage || "vegetative",
    verificationStatus: "Pending",
    treatmentRecommended: solution,
    reportedAt: new Date().toISOString(),
    uploadedPhotoUrl: uploadedPhotoUrl || ""
  };

  reports.push(newReport);
  writeDiseases(reports);
  res.status(201).json(newReport);
});

// COOPERATIVES REST
app.get("/api/cooperatives", (req, res) => {
  res.json(readCooperatives());
});

app.post("/api/cooperatives", (req, res) => {
  const coops = readCooperatives();
  const newCoop: CooperativeGroup = {
    id: "coop-" + Date.now(),
    name: req.body.name || "Unnamed Group",
    village: req.body.village || "General",
    district: req.body.district || "Chiradzulu",
    memberCount: Number(req.body.memberCount) || 10,
    collectiveTonnageGoal: Number(req.body.collectiveTonnageGoal) || 30,
    fertilizerDistributedBags: Number(req.body.fertilizerDistributedBags) || 50,
    seedsDistributedKg: Number(req.body.seedsDistributedKg) || 120
  };
  coops.push(newCoop);
  writeCooperatives(coops);
  res.status(201).json(newCoop);
});

// MARKET PRICES REST
app.get("/api/market-prices", (req, res) => {
  res.json(readMarketPrices());
});

app.put("/api/market-prices/:id", (req, res) => {
  const prices = readMarketPrices();
  const idx = prices.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    prices[idx] = { ...prices[idx], ...req.body, updatedAt: new Date().toISOString().split("T")[0] };
    writeMarketPrices(prices);
    return res.json(prices[idx]);
  }
  res.status(404).json({ error: "Market record not found" });
});

// OFFLINE SMS GATEWAY SIMULATION
app.post("/api/sms-sandbox", (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command string is required." });
  }

  const parts = command.trim().split(/\s+/);
  const keyword = parts[0].toUpperCase();

  const farmers = readDatabase();
  const now = new Date().toISOString();

  let reply = "";

  switch (keyword) {
    case "REG": {
      // Format: REG Name Village FarmSize Crop
      // Example: REG John Njuli 2.5 Maize
      if (parts.length < 5) {
        reply = "Mlimi AI SMS Err: Invalid REG format. Use REG <Name> <Village> <Hectares> <Crop>";
        break;
      }
      const name = parts[1];
      const village = parts[2];
      const size = Number(parts[3]) || 1.0;
      const crop = parts[4].toLowerCase();

      // Simple coordinates mapping
      let lat = -15.67;
      let lon = 35.15;
      if (village.toLowerCase().includes("njuli")) { lat = -15.75; lon = 35.10; }
      else if (village.toLowerCase().includes("mbulumbuzi")) { lat = -15.60; lon = 35.05; }

      const newId = "f-" + Math.floor(1000 + Math.random() * 9000);
      const phoneNum = "+265" + Math.floor(880000000 + Math.random() * 9999999);
      const pYield = predictYieldML(crop, size, 80, "Chiradzulu", village);

      const fRecord: Farmer = {
        id: newId,
        name,
        phoneNumber: phoneNum,
        password: "password123",
        age: 35,
        district: "Chiradzulu",
        village,
        latitude: lat,
        longitude: lon,
        crops: [{
          cropType: crop as any,
          growthStage: "seedling",
          plantingDate: now.split("T")[0],
          farmSize: size,
          expectedYieldBaseline: 2400,
          predictedYield: pYield,
          fertilizerUsage: 80
        }],
        registeredAt: now
      };
      
      farmers.push(fRecord);
      writeDatabase(farmers);

      reply = `SIFMS Msg: Successfully registered ${name} [ID: ${newId}] under Village: ${village}. Primary Crop: ${crop.toUpperCase()} (${size}ha). Temp password: password123. Dial status anytime.`;
      break;
    }

    case "STATUS": {
      // STATUS FarmerID
      // Example: STATUS f-1
      if (parts.length < 2) {
        reply = "Mlimi AI SMS Err: Please specify Farmer ID. Example: STATUS f-1";
        break;
      }
      const id = parts[1];
      const found = farmers.find(f => f.id === id || f.id.toLowerCase() === id.toLowerCase());
      if (!found) {
        reply = `SIFMS Msg: Farmer ID [${id}] not registered in Chiradzulu/Malawi database nodes. Verify code and retry.`;
      } else {
        const crop = found.crops[0];
        reply = `FMR STATUS (${found.id}): ${found.name} of ${found.village}. Active Seed: ${crop?.cropType.toUpperCase()} at ${crop?.growthStage.toUpperCase()} stage. Predicted harvest target: ${(crop?.predictedYield || 0).toLocaleString()} kg.`;
      }
      break;
    }

    case "WEATHER": {
      // WEATHER VillageName
      // Example: WEATHER Njuli
      if (parts.length < 2) {
        reply = "Mlimi AI SMS Err: Name of village is required. Example: WEATHER Njuli";
        break;
      }
      const vill = parts[1].toLowerCase();
      let temp = 22;
      let desc = "Tropical Sun / Sunny winter skies";
      if (vill.includes("njuli")) { temp = 21; desc = "Clear / Heavy Morning Dew (optimal for legumes)"; }
      else if (vill.includes("mbulumbuzi")) { temp = 23; desc = "Fine & Hazy / Soil moisture level optimal"; }

      reply = `MAL MET DEPT: Weather in ${parts[1]} is ${temp}°C, ${desc}. Expected rainfall start in 12 days. Prepare seed distribution slots safely.`;
      break;
    }

    case "ADVICE": {
      // ADVICE FarmerID
      // Example: ADVICE f-1
      if (parts.length < 2) {
        reply = "Mlimi AI SMS Err: Please specify Farmer ID. Example: ADVICE f-1";
        break;
      }
      const id = parts[1];
      const found = farmers.find(f => f.id === id || f.id.toLowerCase() === id.toLowerCase());
      if (!found) {
        reply = `SIFMS Msg: Farmer record not found for ADVICE. Register first via REG commands.`;
      } else {
        const crop = found.crops[0];
        const advice = crop?.cropType === "maize" 
          ? "Njuli maize advises: Planting window 15-30 Nov. Heavy rain predicted. DELAY chemical fertilizer by 3 days."
          : "Beans advises: Standard compost weeding is clean. Soil nitrogen level sufficient. Avoid spraying copper on dry days.";
        reply = `MLIMI SYSTEM ADVICE for ${found.name}: ${advice}`;
      }
      break;
    }

    default: {
      reply = "SIFMS Msg: Unknown command. Supported keys: REG <Name> <Village> <Ha> <Crop>, STATUS <ID>, WEATHER <Village>, ADVICE <ID>.";
      break;
    }
  }

  res.json({ reply });
});

// Weather API Endpoint with OpenWeatherMap proxy or fallback simulation
app.get("/api/weather", async (req, res) => {
  const { lat, lon, district } = req.query;
  const latitude = Number(lat) || -13.96;
  const longitude = Number(lon) || 33.77;
  const targetDistrict = (district as string) || "Lilongwe";

  // Rainfall/temp seasonal approximations (June is the dry winter season in Malawi)
  const districtDefaults: Record<string, { temp: number; humidity: number; rain: number; status: string; ndvi: number }> = {
    Lilongwe: { temp: 21, humidity: 55, rain: 2, status: "Sunny & Cool", ndvi: 0.58 },
    Salima: { temp: 25, humidity: 65, rain: 5, status: "Warm & Clear", ndvi: 0.61 },
    Zomba: { temp: 20, humidity: 60, rain: 8, status: "Partly Cloudy", ndvi: 0.65 },
    Blantyre: { temp: 19, humidity: 58, rain: 6, status: "Chilly & Clear", ndvi: 0.54 },
    Karonga: { temp: 27, humidity: 62, rain: 1, status: "Hot & Clear", ndvi: 0.48 },
    Mzimba: { temp: 20, humidity: 52, rain: 0, status: "Dry & Hazy", ndvi: 0.45 },
  };

  const localVal = districtDefaults[targetDistrict] || districtDefaults["Lilongwe"];

  try {
    const owmKey = process.env.OPENWEATHER_API_KEY;
    if (owmKey && owmKey !== "YOUR_API_KEY") {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${owmKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return res.json({
          source: "OpenWeatherMap API",
          temperature: data.main?.temp,
          humidity: data.main?.humidity,
          rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
          description: data.weather?.[0]?.description,
          ndvi: localVal.ndvi, // keep mock NDVI as OWM free doesn't supply satellite indexes
        });
      }
    }
  } catch (err) {
    console.warn("Weather API call failed, using simulation: ", err);
  }

  // Realistic seasonal simulations for Malawi in winter (June)
  res.json({
    source: "Farming Simulation Meteorological Engine",
    temperature: localVal.temp + (Math.random() * 2 - 1),
    humidity: localVal.humidity + Math.floor(Math.random() * 6 - 3),
    rainfall: localVal.rain,
    description: localVal.status,
    ndvi: localVal.ndvi,
  });
});

// Dynamic AI Recommendation using server-side Gemini 3.5 Flash
app.post("/api/ai-recommendation", async (req, res) => {
  const { farmerName, cropType, district, growthStage, weather, soilSize, fertilizerUsage } = req.body;

  const isChiradzulu = district.toLowerCase().includes("chiradzulu") || district.toLowerCase() === "njuli" || district.toLowerCase() === "mbulumbuzi";
  
  // Custom proactive agronomy alert string as explicitly requested by user guidelines
  const proactiveAdvisory = `⚠️ PROACTIVE SENSOR ALERT: Our analysis shows crop has reached flowering stage, but there is a 35% chance of a dry spell in Chiradzulu district starting Dec 12. Recommend applying potash fertilizer to promote drought resistance.`;

  if (!ai) {
    return res.json({
      success: false,
      isMocked: true,
      text: `### 🌾 Offline Smart Recommendation for **${farmerName}** (${district})
* **Advisor Code**: LOCAL_RULES_BASE
* **Active Status**: 🟢 Synced with MwachTech Agro-Sensing

${isChiradzulu || growthStage === "flowering" ? `💡 **Proactive Agronomy Advisory**:
> **"${proactiveAdvisory}"**` : ""}

* **Recommended Actions** for **${cropType}** at **${growthStage}** stage:
  1. **Crop Health**: Keep monitoring the crop's root zone. ${growthStage === "seedling" ? "Ensure optimal soil moisture and shield emerging sprouts from harsh winds." : ""}
  2. **Water Management**: Under the current dry, clear weather (${weather?.temperature || 21}°C), provide irrigation of approx ${cropType === "rice" ? "8-10mm daily to maintain standing water." : "3-5mm every 2 days."}
  3. **Fertilization**: Scheduled fertilizer application should use NPK blends. Current input indicates ${fertilizerUsage} kg is applied. Maintain nitrogen supplements at flowering stage.
  4. **Pest Risk**: Keep watch for Fall Armyworm (maize) or stem borers.
  
*Please configure a Gemini API Key in the Secrets Panel to unlock the fully dynamic AI-Agent Recommendation Engine.*`,
    });
  }

  try {
    const prompt = `
You are the Senior Agronomist and Chief AI Advisor of the Malawi Smart Integrated Farming Management System (SIFMS).
Provide precise, localized, professional farming recommendations for:
Farmer: ${farmerName}
District of Malawi: ${district}
Crop Type: ${cropType}
Current Growth Stage: ${growthStage}
Farm Size: ${soilSize} Hectares
Fertilizer usage: ${fertilizerUsage} kg
Current Meteorological Metrics: Temperature ${weather?.temperature}°C, Humidity ${weather?.humidity}%, Recent Rainfall: ${weather?.rainfall}mm, Sky/Conditions: "${weather?.description}".

*IMPORTANT CRITICAL GUIDELINE*: If the farmer is in Chradzulu/Chiradzulu or crop is near flowering stage, you MUST prominently display this advisory sentence verbatim in your advisory header or dynamic highlights:
"${proactiveAdvisory}"

Please structure your response beautifully with markdown:
1. **👨‍🌾 Proactive Advisor Highlights**: Make sure to lead with any critical alerts such as the Chiradzulu dry spell warning if applicable.
2. **🌱 Growth Stage Optimization**: What is critical for ${cropType} during ${growthStage}?
3. **🌦️ Weather-Adaptive Irrigation**: Provide clear guidelines based on the current temperature (${weather?.temperature}°C) and precipitation.
4. **🧪 Nutrition & Fertilizer Tuning**: Give directions on fertilization. Is ${fertilizerUsage} kg adequate or should they apply more of specific blends (e.g., Urea, CAN, NPK)?
5. **⚠️ Local Agronomic Risk Advisory**: Identify regional pests or climate hurdles (e.g., dry spell/drought sensitivity for maize, flood safety for lakeshore rice).
6. **📅 Action Timeline**: A bulleted timeline of what to do in the next 7 days, 14 days, and 30 days.

Use a professional, warm, yet authoritative tone suitable for supporting farmers and agricultural extension workers in sub-Saharan Africa. Use bullet points and appropriate markdown headers.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master agriculture scientist specializing in Malawian and Southern African smallholder and commercial farming, agroecology, and climatology.",
      }
    });

    res.json({
      success: true,
      isMocked: false,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Gemini execution error",
      details: error.message,
    });
  }
});

// Dedicated Market AI Advisor route
app.post("/api/market-ai", async (req, res) => {
  const { commodity, market, weather, season, recentTrend } = req.body;

  if (!ai) {
    return res.json({
      success: false,
      isMocked: true,
      text: `### 🔮 Technical Price Intelligence Report (Offline Mode)
* **Commodity**: **${commodity || "Maize"}**
* **Analysis Criteria**: Weather: ${weather || "Normal"} | Season: ${season || "Harvest"} | Spot Trend: ${recentTrend || "stable"}
* **Active Status**: Fallback Offline Engine Active (SIFMS 2.0 Local Predictive Matrices)

#### 📉 Current Market Overview & Shortage Indicators:
1. **Strategic Hub Deficit**: ${commodity === "maize" ? "Due to standard seasonal consumption profiles, white maize remains highly sought after in Limbe (Blantyre) and Lilongwe. Southern urban hubs face a deficit of 12%." : "General supply constraints persist across regional capitals. Groundnut prices are stable but Rice demand is surging."}
2. **Climate Influence**: Under **${weather}** weather conditions, agricultural transits face minor changes. ${weather === "drought" ? "Alert: Active drought triggers a high price panic (+35% spikes projected). Smallholders should store grains!" : ""}
3. **Transport Optimization Advisory**: Shipping to Blantyre from central or rural nodes costs an estimated MWK 15,000 to MWK 22,000 per MT. Cooperative bulking is highly recommended to neutralize haulage costs.
4. **Inflation Indicators**: Smallholder fertilizer access barriers (AIP price variance) keep prices high. Expect crop wholesale indices to hover 15%-25% above historic baselines.

*Please configure your official Gemini API Key in AI Studio Secrets to unlock the live, geo-grounded deep-learning pricing forecasting agent.*`
    });
  }

  try {
    const prompt = `
You are the Lead Agricultural Economist and Chief AI Price Advisor of SIFMS (Mlimi Smart AI Platform) in Malawi.
Produce a thorough, strategic Market Price Intelligence Report for:
- Commodity: ${commodity}
- Selected Market Context: ${market || "All major capitals"}
- Climate/Weather Condition: ${weather}
- Season Interval: ${season}
- Spot Trend: ${recentTrend}

Analyze:
1. **Supply and Demand dynamics in Malawi**: (Blantyre, Lilongwe, Mzuzu, Zomba)
2. **Seasonal Variation & Inflation**: How does the ${season} affect price gluts/spikes?
3. **Weather Impact**: How does the current ${weather} influence harvesting delays and market prices?
4. **Transport Haulage Cost**: How transport cost affects net profit from rural collection hubs (Njuli, Mbulumbuzi)?
5. **Cooperative Strategic Action Plans**: Recommended cooperative network buying tactics or purchasing thresholds.

Please structure your response with elegant markdown headings and bullet points. Be informative, objective, and highly precise regarding Malawian crop economics.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite market analyst specializing in SSA agricultural commodities, logistics, private storage networks, and pricing optimization platforms.",
      }
    });

    res.json({
      success: true,
      isMocked: false,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Market Gemini API Error:", error);
    res.status(500).json({
      error: "Gemini execution error during price analysis",
      details: error.message,
    });
  }
});

// ==========================================
// AGRICULTURAL MATHEMATICS & MATLAB REST APIs
// ==========================================
import { getMathematicsEngine, setMathematicsEngine } from "./src/mathematics/engine";

app.get("/api/matlab/status", (req, res) => {
  const engine = getMathematicsEngine();
  res.json({
    matlabConfigured: true,
    activeEngine: engine.engineType,
    isMatlabAvailable: engine.isMatlabAvailable,
    supportedFunctions: [
      "crop_growth_model.m",
      "yield_prediction.m",
      "irrigation_optimization.m",
      "farm_profit_optimization.m",
      "monte_carlo_simulation.m",
      "ode_water_balance.m",
      "sensitivity_analysis.m",
    ],
  });
});

app.post("/api/matlab/toggle", (req, res) => {
  const { enableMatlab } = req.body;
  setMathematicsEngine(Boolean(enableMatlab));
  const engine = getMathematicsEngine();
  res.json({
    success: true,
    activeEngine: engine.engineType,
    isMatlabAvailable: engine.isMatlabAvailable,
  });
});

app.post("/api/math/crop-growth", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runCropGrowthModel(req.body);
    res.json({ success: true, engineUsed: engine.engineType, data: result });
  } catch (err: any) {
    res.status(400).json({ error: "Crop growth math execution error", details: err.message });
  }
});

app.post("/api/math/yield", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runYieldPrediction(req.body);
    res.json({ success: true, engineUsed: engine.engineType, result });
  } catch (err: any) {
    res.status(400).json({ error: "Yield math execution error", details: err.message });
  }
});

app.post("/api/math/calculus-sensitivity", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runCalculusSensitivities(req.body);
    res.json({ success: true, engineUsed: engine.engineType, sensitivities: result });
  } catch (err: any) {
    res.status(400).json({ error: "Calculus math execution error", details: err.message });
  }
});

app.post("/api/math/irrigation", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runIrrigationModel(req.body);
    res.json({ success: true, engineUsed: engine.engineType, irrigation: result });
  } catch (err: any) {
    res.status(400).json({ error: "Irrigation math execution error", details: err.message });
  }
});

app.post("/api/math/optimization", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runOptimization(req.body);
    res.json({ success: true, engineUsed: engine.engineType, optimization: result });
  } catch (err: any) {
    res.status(400).json({ error: "Optimization math execution error", details: err.message });
  }
});

app.post("/api/math/profit", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runEconomicsModel(req.body);
    res.json({ success: true, engineUsed: engine.engineType, economics: result });
  } catch (err: any) {
    res.status(400).json({ error: "Economics math execution error", details: err.message });
  }
});

app.post("/api/math/risk", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runMonteCarloSimulation(req.body);
    res.json({ success: true, engineUsed: engine.engineType, risk: result });
  } catch (err: any) {
    res.status(400).json({ error: "Monte Carlo risk execution error", details: err.message });
  }
});

app.post("/api/math/sensitivity", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runSensitivityAnalysis(req.body.cropType || "maize");
    res.json({ success: true, engineUsed: engine.engineType, curve: result });
  } catch (err: any) {
    res.status(400).json({ error: "Sensitivity math execution error", details: err.message });
  }
});

app.post("/api/math/simulation", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const result = engine.runWhatIfSimulator(req.body);
    res.json({ success: true, engineUsed: engine.engineType, scenario: result });
  } catch (err: any) {
    res.status(400).json({ error: "What-If simulation execution error", details: err.message });
  }
});

app.get("/api/math/statistics", (req, res) => {
  try {
    const engine = getMathematicsEngine();
    const sampleData = [2400, 2800, 3100, 1900, 3500, 2900, 3200, 2200, 2700, 3300];
    const stats = engine.runStatisticalSummary(sampleData);
    const pca = engine.runPCAAnalysis();
    res.json({ success: true, engineUsed: engine.engineType, statistics: stats, pca });
  } catch (err: any) {
    res.status(400).json({ error: "Statistics math execution error", details: err.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIFMS Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
