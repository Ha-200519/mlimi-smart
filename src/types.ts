export type CropType = "maize" | "beans" | "groundnuts" | "rice" | "soybeans";
export type GrowthStage = "seedling" | "vegetative" | "flowering" | "maturity" | "harvested";
export type UserRole = "admin" | "farmer" | "officer" | "manager" | "analyst";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CropAssignment {
  cropType: CropType;
  growthStage: GrowthStage;
  plantingDate: string;
  farmSize: number; // in hectares
  expectedYieldBaseline: number; // kg per hectare
  predictedYield: number; // kg
  fertilizerUsage: number; // kg
}

export interface Farmer {
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
  isVerified?: boolean; // Modified status for Extension Officer verification
  boundaryPoints?: Coordinate[]; // Interactive Farm Polygons list
  cooperativeId?: string; // Team group assignment
}

export interface FieldInspectionReport {
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

export interface DiseaseReport {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: CropType;
  diseaseName: "Fall Armyworm" | "Rust" | "Leaf Blight" | "Streak Virus" | "None";
  confidenceScore: number;
  growthStage: GrowthStage;
  verificationStatus: "Pending" | "Verified" | "Investigating";
  treatmentRecommended: string;
  reportedAt: string;
  uploadedPhotoUrl?: string;
}

export interface MarketPrice {
  id: string;
  cropType: CropType;
  marketName: "Blantyre" | "Lilongwe" | "Mzuzu" | "Zomba";
  pricePerBag: number; // MK (Malawian Kwacha) per 50kg bag
  priceTrend: "up" | "stable" | "down";
  updatedAt: string;
}

export interface CooperativeGroup {
  id: string;
  name: string;
  village: string;
  district: string;
  memberCount: number;
  collectiveTonnageGoal: number; // tonnes of crops expected
  fertilizerDistributedBags: number; // 50kg bags
  seedsDistributedKg: number; // kg of seed
}

export interface WeatherData {
  source: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  ndvi: number;
  forecastDays?: {
    day: string;
    temp: number;
    rainfall: number;
    humidity: number;
    advice: string;
  }[];
}

// ==========================================
// SIFMS MLIMI SMART AI - IOT & SMART AG TYPES
// ==========================================

export interface IoTSensorNode {
  id: string;
  name: string;
  farmId: string;
  farmerName: string;
  locationName: string;
  lat: number;
  lng: number;
  status: "optimal" | "warning" | "critical";
  soilMoisture: number; // %
  soilTemp: number; // °C
  soilPh: number; // pH 0-14
  soilNitrogen: number; // mg/kg
  soilPhosphorus: number; // mg/kg
  soilPotassium: number; // mg/kg
  soilSalinity: number; // EC dS/m
  airTemp: number; // °C
  airHumidity: number; // %
  rainfall: number; // mm/hr
  windSpeed: number; // m/s
  lightIntensity: number; // Lux
  lastUpdated: string;
  batteryLevel: number; // %
  signalRssi: number; // dBm
}

export interface IrrigationPump {
  id: string;
  nodeName: string;
  plotName: string;
  targetCrop: CropType;
  status: "ON" | "OFF" | "AUTOMATED";
  currentFlowLPM: number; // Liters Per Minute
  totalWaterUsedLiters: number;
  autoMoistureThreshold: number; // e.g. 35%
  lastTriggered: string;
  mode: "Auto Rules" | "Manual Override" | "Timer Schedule";
}

export interface SmartAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  category: "irrigation" | "disease" | "weather" | "fertilizer" | "livestock";
  titleEn: string;
  titleCh: string;
  messageEn: string;
  messageCh: string;
  timestamp: string;
  acknowledged: boolean;
  farmId: string;
  farmerName: string;
  targetDevice?: string;
}

export interface LivestockNode {
  id: string;
  tagCode: string;
  animalType: "Cattle (Zebu)" | "Goat (Local)" | "Sheep (Dorper)";
  name: string;
  lat: number;
  lng: number;
  bodyTemp: number; // °C
  activityIndex: number; // steps/min or activity score
  geofenceStatus: "Inside Pasture Zone" | "BREACHED GEOFENCE";
  battery: number;
  lastPing: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  conditionSensor: "soilMoisture" | "airTemp" | "rainfall" | "soilPh" | "soilSalinity";
  operator: "<" | ">" | "==";
  conditionValue: number;
  actionTarget: string; // e.g. "Pump #01 (Maize North)"
  actionCommand: "PUMP_ON" | "PUMP_OFF" | "SEND_CRITICAL_ALERT" | "APPLY_LIME_NOTICE";
  enabled: boolean;
  lastExecuted?: string;
}

export interface CropHealthScan {
  id: string;
  cropType: CropType;
  diseaseName: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Severe";
  symptoms: string;
  chemicalTreatment: string;
  organicTreatment: string;
  chichewaSummary: string;
  scannedAt: string;
  sampleImageName: string;
}

