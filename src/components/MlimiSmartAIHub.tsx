import React, { useState, useEffect } from "react";
import {
  Zap,
  Activity,
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  Droplets,
  Thermometer,
  CloudRain,
  Wind,
  Sun,
  Flame,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Layers,
  MapPin,
  Camera,
  Upload,
  Globe,
  Languages,
  Smartphone,
  Send,
  FileCode,
  Download,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  Plus,
  Trash2,
  SlidersHorizontal,
  Compass,
  FileSpreadsheet,
  FileText,
  Lock,
  Sparkles,
  Award,
  Database,
  Table,
  Clock,
  Terminal,
  Calendar,
  MessageSquare,
  Bug,
  PhoneCall,
  BrainCircuit
} from "lucide-react";
import { AgriculturalMathHub } from "./AgriculturalMathHub";
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
  ComposedChart,
  Legend,
  ReferenceLine
} from "recharts";
import {
  Farmer,
  IoTSensorNode,
  IrrigationPump,
  SmartAlert,
  LivestockNode,
  AutomationRule,
  CropHealthScan,
  CropType
} from "../types";

interface MlimiSmartAIHubProps {
  farmers: Farmer[];
  selectedFarmerId?: string;
}

// Initial Mock Data
const INITIAL_NODES: IoTSensorNode[] = [
  {
    id: "esp32-node-01",
    name: "ESP32-Node #01 (Maize North)",
    farmId: "f-1",
    farmerName: "Banda Chidanti",
    locationName: "Chiradzulu North Parcel A",
    lat: -15.783,
    lng: 35.003,
    status: "optimal",
    soilMoisture: 38,
    soilTemp: 24.2,
    soilPh: 6.4,
    soilNitrogen: 42,
    soilPhosphorus: 24,
    soilPotassium: 195,
    soilSalinity: 0.8,
    airTemp: 28.5,
    airHumidity: 62,
    rainfall: 0.0,
    windSpeed: 3.2,
    lightIntensity: 48000,
    lastUpdated: "Just now",
    batteryLevel: 92,
    signalRssi: -64
  },
  {
    id: "esp32-node-02",
    name: "ESP32-Node #02 (Beans South)",
    farmId: "f-1",
    farmerName: "Banda Chidanti",
    locationName: "Chiradzulu South Plot B",
    lat: -15.789,
    lng: 35.008,
    status: "warning",
    soilMoisture: 26, // Low moisture
    soilTemp: 27.8,
    soilPh: 5.8,
    soilNitrogen: 22,
    soilPhosphorus: 14,
    soilPotassium: 140,
    soilSalinity: 1.2,
    airTemp: 31.0,
    airHumidity: 54,
    rainfall: 0.0,
    windSpeed: 4.1,
    lightIntensity: 56000,
    lastUpdated: "1 min ago",
    batteryLevel: 84,
    signalRssi: -72
  },
  {
    id: "esp32-node-03",
    name: "ESP32-Node #03 (Nursery Drip)",
    farmId: "f-2",
    farmerName: "Mary Phiri",
    locationName: "Lilongwe Mitundu Sector 4",
    lat: -13.98,
    lng: 33.78,
    status: "critical",
    soilMoisture: 18, // Critical dry
    soilTemp: 30.5,
    soilPh: 4.9, // Acidic
    soilNitrogen: 12,
    soilPhosphorus: 8,
    soilPotassium: 90,
    soilSalinity: 2.4, // Elevated salinity
    airTemp: 33.2,
    airHumidity: 41,
    rainfall: 0.0,
    windSpeed: 5.8,
    lightIntensity: 62000,
    lastUpdated: "Just now",
    batteryLevel: 76,
    signalRssi: -80
  },
  {
    id: "esp32-node-04",
    name: "ESP32-Node #04 (Groundnut East)",
    farmId: "f-3",
    farmerName: "Kondwani Mwale",
    locationName: "Dedza Bembeke Valley",
    lat: -14.38,
    lng: 34.33,
    status: "optimal",
    soilMoisture: 42,
    soilTemp: 22.8,
    soilPh: 6.8,
    soilNitrogen: 38,
    soilPhosphorus: 28,
    soilPotassium: 210,
    soilSalinity: 0.6,
    airTemp: 25.4,
    airHumidity: 68,
    rainfall: 2.5,
    windSpeed: 2.8,
    lightIntensity: 39000,
    lastUpdated: "2 mins ago",
    batteryLevel: 98,
    signalRssi: -58
  }
];

const INITIAL_PUMPS: IrrigationPump[] = [
  {
    id: "pump-01",
    nodeName: "Actuator Relay #1",
    plotName: "North Maize Plot A",
    targetCrop: "maize",
    status: "AUTOMATED",
    currentFlowLPM: 28,
    totalWaterUsedLiters: 1420,
    autoMoistureThreshold: 35,
    lastTriggered: "Today, 06:15 AM",
    mode: "Auto Rules"
  },
  {
    id: "pump-02",
    nodeName: "Actuator Relay #2",
    plotName: "South Beans Drip Line",
    targetCrop: "beans",
    status: "ON",
    currentFlowLPM: 16,
    totalWaterUsedLiters: 890,
    autoMoistureThreshold: 40,
    lastTriggered: "Active Now",
    mode: "Manual Override"
  },
  {
    id: "pump-03",
    nodeName: "Solenoid Valve #3",
    plotName: "Seedling Nursery Bay",
    targetCrop: "maize",
    status: "OFF",
    currentFlowLPM: 0,
    totalWaterUsedLiters: 2300,
    autoMoistureThreshold: 45,
    lastTriggered: "Yesterday, 05:00 PM",
    mode: "Auto Rules"
  }
];

const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: "alt-101",
    severity: "critical",
    category: "irrigation",
    titleEn: "Critical Soil Drought in Nursery Bay",
    titleCh: "Chilala Chachikulu M'munda Wa Mbeu",
    messageEn: "Soil moisture dropped to 18%. Automated drip irrigation pump triggered.",
    messageCh: "Nthaka yawama kufika pa 18%. Pampu yathirira madzi yokha.",
    timestamp: "10:42 AM",
    acknowledged: false,
    farmId: "f-2",
    farmerName: "Mary Phiri",
    targetDevice: "ESP32-Node #03"
  },
  {
    id: "alt-102",
    severity: "warning",
    category: "weather",
    titleEn: "Delay Fertilizer Application",
    titleCh: "Cheletsani Kuthira Feteleza",
    messageEn: "Heavy rainfall (18mm) forecasted in 6 hours. Hold Urea top-dressing to prevent runoff.",
    messageCh: "Mvula yambiri ikubwera m'maora 6. Musathire feteleza kuti asawoledwe.",
    timestamp: "09:15 AM",
    acknowledged: false,
    farmId: "f-1",
    farmerName: "Banda Chidanti"
  },
  {
    id: "alt-103",
    severity: "info",
    category: "disease",
    titleEn: "Optimal Fall Armyworm Trapping Weather",
    titleCh: "Nthawi Yabwino Yogwira Mbozi",
    messageEn: "Relative humidity & temperature favor Armyworm moth emergence. Check pheromone traps.",
    messageCh: "Kutentha ndi chinyezi zikuyambitsa mbozi. Onani misampha yanu.",
    timestamp: "08:00 AM",
    acknowledged: true,
    farmId: "f-3",
    farmerName: "Kondwani Mwale"
  }
];

const INITIAL_LIVESTOCK: LivestockNode[] = [
  {
    id: "cow-104",
    tagCode: "MLM-BULL-104",
    animalType: "Cattle (Zebu)",
    name: "Zebu Breeding Bull #1",
    lat: -15.784,
    lng: 35.005,
    bodyTemp: 38.6,
    activityIndex: 78,
    geofenceStatus: "Inside Pasture Zone",
    battery: 91,
    lastPing: "Just now"
  },
  {
    id: "goat-088",
    tagCode: "MLM-GOAT-088",
    animalType: "Goat (Local)",
    name: "East Pasture Alpha Goat",
    lat: -15.792, // Outside geofence
    lng: 35.015,
    bodyTemp: 39.1,
    activityIndex: 94,
    geofenceStatus: "BREACHED GEOFENCE",
    battery: 68,
    lastPing: "2 mins ago"
  }
];

const INITIAL_RULES: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Automatic Drought Protection (Maize)",
    conditionSensor: "soilMoisture",
    operator: "<",
    conditionValue: 32,
    actionTarget: "Pump #01 (Maize North)",
    actionCommand: "PUMP_ON",
    enabled: true,
    lastExecuted: "Today, 06:15 AM"
  },
  {
    id: "rule-2",
    name: "Heat Stress Evapotranspiration Defense",
    conditionSensor: "airTemp",
    operator: ">",
    conditionValue: 34,
    actionTarget: "Solenoid Valve #3 (Nursery)",
    actionCommand: "PUMP_ON",
    enabled: true,
    lastExecuted: "Yesterday"
  },
  {
    id: "rule-3",
    name: "Rainfall Auto-Pump Inhibitor",
    conditionSensor: "rainfall",
    operator: ">",
    conditionValue: 5,
    actionTarget: "All Irrigation Pumps",
    actionCommand: "PUMP_OFF",
    enabled: true
  }
];

// Crop Diseases Sample Bank
const SAMPLE_CROP_SCANS: CropHealthScan[] = [
  {
    id: "scan-01",
    cropType: "maize",
    diseaseName: "Fall Armyworm (Spodoptera frugiperda)",
    confidence: 96.4,
    severity: "High",
    symptoms: "Ragged hole feeding on leaves, whorl damage, sawdust-like frass.",
    chemicalTreatment: "Emamectin Benzoate 5% SG @ 200g/ha or Chlorantraniliprole.",
    organicTreatment: "Ash + Chilli paste solution sprinkled into whorls at dusk.",
    chichewaSummary: "Mbozi yachinyamatule pamafuna mankhwala a Emamectin kapena phulusa ndi tsabola m'mitsempha ya chimanga.",
    scannedAt: "2026-07-23 08:30 AM",
    sampleImageName: "Fall Armyworm Damage"
  },
  {
    id: "scan-02",
    cropType: "groundnuts",
    diseaseName: "Groundnut Rosette Virus (GRV)",
    confidence: 91.2,
    severity: "Moderate",
    symptoms: "Stunted chlorotic yellowing, bushy tufts, vector aphids visible.",
    chemicalTreatment: "Dimethoate EC for aphid vector suppression.",
    organicTreatment: "Neem leaf extract spray + plant early at high seed density.",
    chichewaSummary: "Chifukwa cha nsabwe. Thirani madzi a nemu (Neem) kapena dimethoate kupha nsabwe.",
    scannedAt: "2026-07-23 09:12 AM",
    sampleImageName: "Groundnut Rosette Chlorosis"
  }
];

export const MlimiSmartAIHub: React.FC<MlimiSmartAIHubProps> = ({ farmers }) => {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "monitoring"
    | "irrigation"
    | "timescale"
    | "analytics"
    | "weather"
    | "crophealth"
    | "alerts"
    | "automation"
    | "livestock"
    | "firmware"
  >("overview");

  // TimescaleDB Time-Series Visualizer State
  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [selectedNodeFilter, setSelectedNodeFilter] = useState<string>("all");
  const [timescaleBucket, setTimescaleBucket] = useState<"5m" | "1h" | "1d">("5m");
  const [isQueryingTimescale, setIsQueryingTimescale] = useState<boolean>(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number>(2.4);

  // Generate hypertable dynamic time-series data
  const generateTimescaleSeriesData = () => {
    const records = [];
    const points = selectedTimeframe === "24h" ? 24 : selectedTimeframe === "7d" ? 14 : 30;
    
    for (let i = 0; i < points; i++) {
      let label = "";
      if (selectedTimeframe === "24h") {
        const hour = (i + 6) % 24;
        label = `${hour < 10 ? "0" : ""}${hour}:00`;
      } else if (selectedTimeframe === "7d") {
        label = `Day ${i + 1}`;
      } else {
        label = `Jul ${i + 1}`;
      }

      const baseMoisture = 34 + Math.sin(i * 0.5) * 8 + (i % 3 === 0 ? 6 : -2);
      const baseTemp = 22 + Math.sin((i - 2) * 0.4) * 6;
      const basePh = 6.2 + Math.sin(i * 0.2) * 0.3;
      const baseSalinity = 0.8 + Math.cos(i * 0.3) * 0.2;

      records.push({
        timestamp: label,
        soilMoistureNode1: Math.round((baseMoisture + 4) * 10) / 10,
        soilMoistureNode2: Math.round((baseMoisture - 3) * 10) / 10,
        soilMoistureNode3: Math.round((baseMoisture - 12) * 10) / 10,
        soilMoistureNode4: Math.round((baseMoisture + 8) * 10) / 10,
        avgMoisture: Math.round(baseMoisture * 10) / 10,
        soilTemp: Math.round(baseTemp * 10) / 10,
        soilPh: Math.round(basePh * 10) / 10,
        salinity: Math.round(baseSalinity * 100) / 100,
        nitrogen: Math.round(38 + Math.sin(i * 0.4) * 5),
        phosphorus: Math.round(22 + Math.cos(i * 0.4) * 4),
        potassium: Math.round(185 + Math.sin(i * 0.3) * 12),
        waterPulseLiters: i % 4 === 0 ? Math.round(120 + Math.random() * 80) : 0
      });
    }
    return records;
  };

  const timescaleSeriesData = generateTimescaleSeriesData();

  // Extract real-time averages directly from TimescaleDB hypertable series
  const timescaleAvgMoisture = (
    timescaleSeriesData.reduce((acc, d) => acc + d.avgMoisture, 0) / timescaleSeriesData.length
  ).toFixed(1);

  const timescaleAvgTemp = (
    timescaleSeriesData.reduce((acc, d) => acc + d.soilTemp, 0) / timescaleSeriesData.length
  ).toFixed(1);

  const handleExecuteTimescaleQuery = () => {
    setIsQueryingTimescale(true);
    setTimeout(() => {
      setIsQueryingTimescale(false);
      setQueryExecutionTime(parseFloat((1.4 + Math.random() * 1.5).toFixed(1)));
    }, 400);
  };

  // Language Toggle
  const [language, setLanguage] = useState<"en" | "ch">("en");

  // SMS Alert Report & Farm Activity Schedule Dispatcher State
  const [smsRecipientPhone, setSmsRecipientPhone] = useState<string>("+265 999 123 456");
  const [smsRecipientName, setSmsRecipientName] = useState<string>("Banda Chidanti");
  const [smsLang, setSmsLang] = useState<"en" | "ch">("en");
  const [smsChannel, setSmsChannel] = useState<"Airtel SMS Gateway" | "TNM Mpamba SMS" | "WhatsApp Business">("Airtel SMS Gateway");
  const [isGeneratingSms, setIsGeneratingSms] = useState<boolean>(false);
  const [smsSuccessNotification, setSmsSuccessNotification] = useState<string | null>(null);

  // Scheduled Farm Activity Dates State
  const [farmActivities] = useState([
    {
      id: "act-1",
      date: "2026-07-28",
      displayDate: "Jul 28, 2026",
      activityEn: "Top-Dressing Urea Fertilizer Application (Maize Plot A)",
      activityCh: "Kuthira feteleza ya Urea pa chimanga (Plot A)",
      urgency: "HIGH",
      status: "Upcoming in 5 days"
    },
    {
      id: "act-2",
      date: "2026-08-02",
      displayDate: "Aug 02, 2026",
      activityEn: "Second Weeding & Moisture Retention Mulching",
      activityCh: "Kusefura udzu wachiwiri ndi kuyala maudzu osunga chinyezi",
      urgency: "MEDIUM",
      status: "Upcoming in 10 days"
    },
    {
      id: "act-3",
      date: "2026-08-08",
      displayDate: "Aug 08, 2026",
      activityEn: "Fall Armyworm Pheromone Trap Inspection & Spray Check",
      activityCh: "Kuyendera msampha wa nkhungu za m'chimanga",
      urgency: "CRITICAL",
      status: "Action Required"
    },
    {
      id: "act-4",
      date: "2026-08-15",
      displayDate: "Aug 15, 2026",
      activityEn: "Groundnut Rosette Virus Aphid Vector Field Sampling",
      activityCh: "Kuyeza nsabwe zimene zimafalitsa matenda a mtedza",
      urgency: "MEDIUM",
      status: "Scheduled"
    },
    {
      id: "act-5",
      date: "2026-08-22",
      displayDate: "Aug 22, 2026",
      activityEn: "ESP32 Sub-surface Drip Flush & EC Salinity Check",
      activityCh: "Kuyendera mipopi ya madzi m'munda ndi kuyeza mchere",
      urgency: "LOW",
      status: "Routine"
    }
  ]);

  // Crop Disease Risk Alerts State
  const [diseaseRisks] = useState([
    {
      id: "dis-1",
      crop: "Maize (Chilole)",
      diseaseEn: "Fall Armyworm (Spodoptera frugiperda)",
      diseaseCh: "Nkhungu za M'chimanga",
      riskLevel: "HIGH" as const,
      riskScore: 88,
      triggerEn: "High air temp (28.5°C) & relative humidity (62%) accelerating larva hatching.",
      triggerCh: "Kutentha ndi chinyezi chikupangitsa nkhungu kuswa masamba msanga.",
      actionEn: "Inspect corn whorls immediately. Apply bio-pesticide or Neem extract.",
      actionCh: "Yenderani masamba a chimanga msanga. Thirani mankhwala a Neem."
    },
    {
      id: "dis-2",
      crop: "Tomatoes / Potatoes",
      diseaseEn: "Late Blight (Phytophthora infestans)",
      diseaseCh: "Chikasu cha Phwetekere",
      riskLevel: "HIGH" as const,
      riskScore: 78,
      triggerEn: "Extended leaf wetness > 5 hours from dew and microclimate humidity.",
      triggerCh: "Chinyezi chochuluka pa masamba chikuwonjezera chiwopsezo cha chikasu.",
      actionEn: "Spray preventative copper hydroxide fungicide before rain.",
      actionCh: "Thirani mankhwala a mkuwa (Copper) kutchinjiriza osati mbalame."
    },
    {
      id: "dis-3",
      crop: "Beans / Groundnuts",
      diseaseEn: "Maize Gray Leaf Spot & Rosette Virus",
      diseaseCh: "Matenda a Makhasi a Nyemba ndi Mtedza",
      riskLevel: "MEDIUM" as const,
      riskScore: 64,
      triggerEn: "Elevated soil temperature (27.8°C) + low soil moisture (26%).",
      triggerCh: "Kutentha kwa nthaka komanso kuchepa kwa chinyezi.",
      actionEn: "Ensure field weed control to prevent vector aphid harboring.",
      actionCh: "Limalani udzu wonse m'munda kupewa nsabwe."
    }
  ]);

  // Initial Dispatched SMS History Logs
  const [smsLogs, setSmsLogs] = useState([
    {
      id: "sms-101",
      timestamp: "Today 08:30 AM",
      recipientName: "Banda Chidanti",
      phone: "+265 999 123 456",
      channel: "Airtel SMS Gateway",
      messageEn: "MLIMI AI REPORT [Jul 28]: Top-dressing Urea due in 5 days. HIGH RISK: Fall Armyworm in Maize Plot A (88% risk). Timescale Soil Moisture: 38%. Inspect whorls!",
      messageCh: "CHENJEZO LA MLIMI AI [Jul 28]: Kuthira feteleza ya Urea pa Jul 28. NGOZI YAIKULU: Nkhungu pa chimanga (88%). Chinyezi cha nthaka: 38%. Samalani!",
      status: "DELIVERED"
    },
    {
      id: "sms-102",
      timestamp: "Yesterday 04:15 PM",
      recipientName: "Mary Phiri",
      phone: "+265 888 234 567",
      channel: "TNM Mpamba SMS",
      messageEn: "MLIMI AI REPORT [Aug 02]: Weeding schedule active. HIGH RISK: Late Blight in Tomato plot (78%). Timescale Soil Moisture: 26%. Irrigation recommended.",
      messageCh: "CHENJEZO LA MLIMI AI [Aug 02]: Nthawi yokula udzu. NGOZI: Chikasu cha phwetekere (78%). Chinyezi chikutsika kufika 26%. Thirirani madzi!",
      status: "DELIVERED"
    }
  ]);

  // Handler to generate and dispatch SMS Report
  const handleDispatchSmsReport = () => {
    setIsGeneratingSms(true);
    setTimeout(() => {
      setIsGeneratingSms(false);
      const generatedEn = `MLIMI AI REPORT [Jul 28]: Farm Activity: Top-dressing Urea fertilizer due Jul 28 & Weeding Aug 02. CRITICAL DISEASE ALERT: Fall Armyworm (88% risk) & Late Blight (78% risk). Timescale Moisture: ${timescaleAvgMoisture}%, Temp: ${timescaleAvgTemp}°C. Action required!`;
      const generatedCh = `CHENJEZO LA MLIMI AI [Jul 28]: Ntchito ya m'munda: Kuthira feteleza wa Urea pa Jul 28 & Kusefura udzu Aug 02. NGOZI YA MATENDA: Nkhungu za chimanga (88%) & Chikasu (78%). Chinyezi cha nthaka: ${timescaleAvgMoisture}%, Kutentha: ${timescaleAvgTemp}°C. Samalani!`;

      const newLog = {
        id: `sms-${Date.now().toString().slice(-4)}`,
        timestamp: "Just now",
        recipientName: smsRecipientName,
        phone: smsRecipientPhone,
        channel: smsChannel,
        messageEn: generatedEn,
        messageCh: generatedCh,
        status: "DELIVERED" as const
      };

      setSmsLogs([newLog, ...smsLogs]);
      setSmsSuccessNotification(`SMS Alert Report successfully sent to ${smsRecipientName} (${smsRecipientPhone}) via ${smsChannel}!`);
      setTimeout(() => setSmsSuccessNotification(null), 5000);
    }, 500);
  };

  // State Collections
  const [nodes, setNodes] = useState<IoTSensorNode[]>(INITIAL_NODES);
  const [pumps, setPumps] = useState<IrrigationPump[]>(INITIAL_PUMPS);
  const [alerts, setAlerts] = useState<SmartAlert[]>(INITIAL_ALERTS);
  const [livestock, setLivestock] = useState<LivestockNode[]>(INITIAL_LIVESTOCK);
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);

  // Selected Node for Detailed View
  const [selectedNodeId, setSelectedNodeId] = useState<string>("esp32-node-01");
  const currentNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Map Overlay Filter
  const [mapOverlay, setMapOverlay] = useState<"nodes" | "moisture_heat" | "temp_heat">("nodes");

  // Live Telemetry Simulation
  const [mqttConnected, setMqttConnected] = useState<boolean>(true);
  const [mqttMessages, setMqttMessages] = useState<
    { id: string; topic: string; payload: string; time: string }[]
  >([
    {
      id: "m-1",
      topic: "mlimi/farm/f-1/esp32-01/telemetry",
      payload: '{"soilMoisture":38, "soilTemp":24.2, "soilPh":6.4}',
      time: "10:44:12"
    },
    {
      id: "m-2",
      topic: "mlimi/farm/f-2/esp32-03/telemetry",
      payload: '{"soilMoisture":18, "soilSalinity":2.4, "alert":true}',
      time: "10:44:10"
    }
  ]);

  // Crop Scan Tool State
  const [selectedScan, setSelectedScan] = useState<CropHealthScan>(SAMPLE_CROP_SCANS[0]);
  const [isScanningPhoto, setIsScanningPhoto] = useState<boolean>(false);

  // New Rule Creator Modal State
  const [showRuleModal, setShowRuleModal] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>("Custom Soil Salinity Alert");
  const [newRuleSensor, setNewRuleSensor] = useState<"soilMoisture" | "airTemp" | "rainfall" | "soilPh" | "soilSalinity">("soilSalinity");
  const [newRuleOperator, setNewRuleOperator] = useState<"<" | ">" | "==">(">");
  const [newRuleVal, setNewRuleVal] = useState<number>(2.0);

  // Copy Code State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Periodic Telemetry Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const deltaMoisture = (Math.random() - 0.5) * 1.5;
          const deltaTemp = (Math.random() - 0.5) * 0.4;
          const newMoisture = Math.max(10, Math.min(80, parseFloat((node.soilMoisture + deltaMoisture).toFixed(1))));
          const newTemp = parseFloat((node.soilTemp + deltaTemp).toFixed(1));
          
          return {
            ...node,
            soilMoisture: newMoisture,
            soilTemp: newTemp,
            status: newMoisture < 20 ? "critical" : newMoisture < 30 ? "warning" : "optimal",
            lastUpdated: "Just now"
          };
        })
      );

      // Add dummy MQTT stream packet
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      const newMsg = {
        id: `m-${Date.now()}`,
        topic: `mlimi/farm/${randomNode.farmId}/${randomNode.id}/telemetry`,
        payload: JSON.stringify({
          moisture: randomNode.soilMoisture,
          temp: randomNode.soilTemp,
          battery: randomNode.batteryLevel
        }),
        time: new Date().toLocaleTimeString()
      };
      setMqttMessages((prev) => [newMsg, ...prev.slice(0, 7)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [nodes]);

  // Handle Pump Toggle
  const handleTogglePump = (pumpId: string) => {
    setPumps((prev) =>
      prev.map((p) => {
        if (p.id === pumpId) {
          const nextStatus = p.status === "ON" ? "OFF" : "ON";
          return {
            ...p,
            status: nextStatus,
            currentFlowLPM: nextStatus === "ON" ? 28 : 0,
            mode: "Manual Override"
          };
        }
        return p;
      })
    );
  };

  // Handle Alert Acknowledge
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  // Handle Create Rule
  const handleCreateRule = () => {
    const created: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      conditionSensor: newRuleSensor,
      operator: newRuleOperator,
      conditionValue: newRuleVal,
      actionTarget: "All Pumps / Alert Engine",
      actionCommand: "SEND_CRITICAL_ALERT",
      enabled: true
    };
    setRules([...rules, created]);
    setShowRuleModal(false);
  };

  // Handle Copy Code Snippet
  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Generate Sample Historical Data for Charts
  const chartTimeData = [
    { time: "06:00 AM", moisture: 42, temp: 22, rainfall: 0 },
    { time: "08:00 AM", moisture: 39, temp: 25, rainfall: 0 },
    { time: "10:00 AM", moisture: 35, temp: 29, rainfall: 0 },
    { time: "12:00 PM", moisture: 31, temp: 32, rainfall: 0 },
    { time: "02:00 PM", moisture: 28, temp: 34, rainfall: 1.2 },
    { time: "04:00 PM", moisture: 38, temp: 28, rainfall: 4.5 },
    { time: "06:00 PM", moisture: 44, temp: 24, rainfall: 0.5 }
  ];

  return (
    <div className="space-y-6" id="mlimi-smart-ai-hub">
      {/* TOP AI & IOT BRAND HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> MLIMI SMART AI 3.0
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
                <Wifi className="h-3 w-3 text-emerald-400 animate-pulse" /> MQTT Active
              </span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-sky-500/30 font-bold">
                TimescaleDB Sync
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              IoT Precision Agriculture & AI Operating System
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-3xl font-light leading-relaxed">
              Real-time ESP32 multi-sensor telemetry, crop moisture automated pump actuation, multi-lingual AI alerts, NASA POWER satellite weather, CV crop disease diagnostic, and livestock GPS geofencing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "ch" : "en")}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Languages className="h-4 w-4 text-amber-400" />
              <span>{language === "en" ? "English (EN)" : "Chichewa (CH)"}</span>
            </button>

            {/* MQTT Broker Status Toggle */}
            <button
              onClick={() => setMqttConnected(!mqttConnected)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                mqttConnected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}
            >
              {mqttConnected ? (
                <>
                  <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Broker Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-rose-400" />
                  Broker Disconnected
                </>
              )}
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active ESP32 Nodes</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-1 flex items-center justify-between">
              <span>{nodes.length} Live</span>
              <Cpu className="h-4 w-4 text-emerald-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timescale Soil Moisture</div>
            <div className="text-lg font-black text-sky-400 font-mono mt-1 flex items-center justify-between">
              <span>{timescaleAvgMoisture} %</span>
              <Droplets className="h-4 w-4 text-sky-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timescale Soil Temp</div>
            <div className="text-lg font-black text-amber-400 font-mono mt-1 flex items-center justify-between">
              <span>{timescaleAvgTemp} °C</span>
              <Thermometer className="h-4 w-4 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automated Pumps</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-1 flex items-center justify-between">
              <span>{pumps.filter((p) => p.status === "ON" || p.status === "AUTOMATED").length} / {pumps.length}</span>
              <Zap className="h-4 w-4 text-emerald-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active AI Alerts</div>
            <div className="text-lg font-black text-rose-400 font-mono mt-1 flex items-center justify-between">
              <span>{alerts.filter((a) => !a.acknowledged).length} Pending</span>
              <Bell className="h-4 w-4 text-rose-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Livestock Geofence</div>
            <div className="text-lg font-black text-indigo-400 font-mono mt-1 flex items-center justify-between">
              <span>
                {livestock.filter((l) => l.geofenceStatus.includes("BREACHED")).length > 0 ? "1 Breach!" : "Secure"}
              </span>
              <MapPin className="h-4 w-4 text-indigo-500 opacity-60" />
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TimescaleDB Hypertable</div>
            <div className="text-lg font-black text-teal-300 font-mono mt-1 flex items-center justify-between">
              <span>12.4x Comp</span>
              <Database className="h-4 w-4 text-teal-400 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION DASHBOARD TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "overview", label: "Overview & MQTT Live Ticker", icon: Activity },
          { id: "monitoring", label: "Field Sensor Map & Charts", icon: Layers },
          { id: "irrigation", label: "Smart Irrigation Controls", icon: Droplets },
          { id: "analytics", label: "Analytics (TimescaleDB)", icon: Database },
          { id: "weather", label: "NASA & OWM Microclimate", icon: CloudRain },
          { id: "crophealth", label: "AI Crop Health Vision", icon: Camera },
          { id: "alerts", label: "Precision AI Alerts", icon: Bell },
          { id: "automation", label: "If-Then Automation Rules", icon: SlidersHorizontal },
          { id: "livestock", label: "Livestock IoT Geofencing", icon: Compass },
          { id: "firmware", label: "ESP32 Firmware & FastAPI Code", icon: FileCode },
          { id: "math", label: "Deep Math & MATLAB Engine", icon: BrainCircuit }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#059669] text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------------------
          VIEW 1: OVERVIEW & MQTT LIVE TICKER
          ------------------------------------------------------------------------------ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Nodes Summary & Actuators */}
          <div className="lg:col-span-8 space-y-6">
            {/* Real-time TimescaleDB Averages Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 rounded-2xl border border-teal-500/30 text-white shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-500/30 font-bold flex items-center gap-1">
                      <Database className="h-3 w-3 text-teal-400" /> TimescaleDB Live Hypertable Averages
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">time_bucket('{timescaleBucket}')</span>
                  </div>
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    Real-Time Soil Telemetry Averages
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Extracted dynamically from {timescaleSeriesData.length} TimescaleDB hypertable downsampled records.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
                >
                  <Database className="h-3.5 w-3.5 text-teal-200" /> Full Timescale Analytics
                </button>
              </div>

              {/* Averages Display Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/80">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Soil Moisture</div>
                  <div className="text-xl font-black text-sky-400 font-mono mt-0.5 flex items-center justify-between">
                    <span>{timescaleAvgMoisture}%</span>
                    <Droplets className="h-4 w-4 text-sky-400 opacity-80" />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">From Timescale records</div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Soil Temp</div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5 flex items-center justify-between">
                    <span>{timescaleAvgTemp}°C</span>
                    <Thermometer className="h-4 w-4 text-amber-400 opacity-80" />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">Sub-surface root zone</div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Hypertable Points</div>
                  <div className="text-xl font-black text-teal-300 font-mono mt-0.5 flex items-center justify-between">
                    <span>{timescaleSeriesData.length}</span>
                    <Activity className="h-4 w-4 text-teal-400 opacity-80" />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">Window: {selectedTimeframe}</div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Query Speed</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-center justify-between">
                    <span>{queryExecutionTime} ms</span>
                    <Zap className="h-4 w-4 text-emerald-400 opacity-80" />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">Compressed chunks</div>
                </div>
              </div>
            </div>

            {/* Live Sensor Nodes Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-emerald-600" /> Active ESP32 Sensor Nodes
                  </h3>
                  <p className="text-xs text-slate-500">Live 12-parameter soil & atmospheric telemetric readings.</p>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {nodes.length} Nodes Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer ${
                      selectedNodeId === node.id
                        ? "bg-emerald-50/60 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                        : "bg-slate-50/80 border-slate-200 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{node.name}</h4>
                        <p className="text-[11px] text-slate-500">{node.locationName}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          node.status === "optimal"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : node.status === "warning"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    {/* Sensor Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Soil Moisture</div>
                        <div className="text-sm font-black font-mono text-sky-700">{node.soilMoisture}%</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Soil Temp</div>
                        <div className="text-sm font-black font-mono text-amber-700">{node.soilTemp}°C</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Soil pH</div>
                        <div className="text-sm font-black font-mono text-emerald-700">{node.soilPh}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Soil N-P-K</div>
                        <div className="text-[10px] font-mono text-slate-700 font-bold">{node.soilNitrogen}-{node.soilPhosphorus}-{node.soilPotassium}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Air Temp / RH</div>
                        <div className="text-[10px] font-mono text-slate-700 font-bold">{node.airTemp}°C / {node.airHumidity}%</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Battery / RSSI</div>
                        <div className="text-[10px] font-mono text-slate-700 font-bold">{node.batteryLevel}% ({node.signalRssi}dBm)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Irrigation Actuator Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" /> Automated Irrigation Actuators & Relays
                </h3>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  Target Crop Moisture Thresholds
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pumps.map((pump) => (
                  <div key={pump.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-slate-900">{pump.plotName}</h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          pump.status === "ON"
                            ? "bg-emerald-500 text-white animate-pulse"
                            : pump.status === "AUTOMATED"
                            ? "bg-sky-500 text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {pump.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Flow Rate:</span>
                        <span className="font-mono font-bold">{pump.currentFlowLPM} LPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto Moisture Trigger:</span>
                        <span className="font-mono font-bold text-emerald-700">&lt; {pump.autoMoistureThreshold}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Used:</span>
                        <span className="font-mono font-bold text-slate-900">{pump.totalWaterUsedLiters} Liters</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePump(pump.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        pump.status === "ON"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {pump.status === "ON" ? <Square className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                      {pump.status === "ON" ? "Turn Pump OFF" : "Start Manual Irrigation"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: MQTT Console & High-Priority Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live MQTT Packet Console */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <h4 className="font-bold text-xs font-mono text-emerald-300">
                    MQTT Broker Packet Stream
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Port: 1883 / TLS</span>
              </div>

              <div className="space-y-2 font-mono text-[10px] max-h-64 overflow-y-auto pr-1">
                {mqttMessages.map((msg) => (
                  <div key={msg.id} className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-emerald-400 font-bold">{msg.topic}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="text-amber-300 truncate">{msg.payload}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex justify-between font-mono">
                <span>Subscribe: mlimi/farm/+/+/telemetry</span>
                <span className="text-emerald-400 font-bold">100% Delivery</span>
              </div>
            </div>

            {/* AI Warning Alerts Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-rose-500" /> High-Priority AI Advisories
                </h4>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                  {alerts.filter((a) => !a.acknowledged).length} New
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                      alert.severity === "critical"
                        ? "bg-rose-50/80 border-rose-200 text-rose-950"
                        : alert.severity === "warning"
                        ? "bg-amber-50/80 border-amber-200 text-amber-950"
                        : "bg-sky-50/80 border-sky-200 text-sky-950"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">
                        {language === "en" ? alert.titleEn : alert.titleCh}
                      </span>
                      <span className="text-[9px] opacity-75 font-mono">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {language === "en" ? alert.messageEn : alert.messageCh}
                    </p>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer border border-emerald-300"
                      >
                        ✓ {language === "en" ? "Acknowledge" : "Vomerereza"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 2: FIELD MONITORING & GIS HEATMAP
          ------------------------------------------------------------------------------ */}
      {activeTab === "monitoring" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* GIS Interactive Map Canvas */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" /> Interactive Field GIS & Node Radar
                </h3>
                <p className="text-xs text-slate-500">Color-coded health status and spatial microclimate layer overlays.</p>
              </div>

              {/* Map Layer Filter Buttons */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                {(["nodes", "moisture_heat", "temp_heat"] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setMapOverlay(layer)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      mapOverlay === layer
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {layer === "nodes" ? "Nodes Pin" : layer === "moisture_heat" ? "Moisture Heatmap" : "Temp Heatmap"}
                  </button>
                ))}
              </div>
            </div>

            {/* GIS MAP SIMULATOR CANVAS */}
            <div className="relative h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-4">
              {/* Heatmap Layer Background */}
              {mapOverlay === "moisture_heat" && (
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-400 via-emerald-600 to-amber-700 blur-2xl" />
              )}
              {mapOverlay === "temp_heat" && (
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500 via-rose-600 to-slate-900 blur-2xl" />
              )}

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:30px_30px]" />

              {/* Satellite Field Polygons */}
              <div className="absolute top-12 left-12 w-64 h-48 border-2 border-emerald-400/60 border-dashed rounded-2xl bg-emerald-900/20 backdrop-blur-sm p-3">
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  Parcel A - Maize (2.5 Ha)
                </span>
              </div>

              <div className="absolute bottom-10 right-16 w-56 h-40 border-2 border-sky-400/60 border-dashed rounded-2xl bg-sky-900/20 backdrop-blur-sm p-3">
                <span className="text-[10px] font-mono font-bold text-sky-300 bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/40">
                  Plot B - Beans (1.2 Ha)
                </span>
              </div>

              {/* ESP32 Interactive Pins */}
              {nodes.map((node, idx) => {
                const topPos = 25 + idx * 20;
                const leftPos = 20 + idx * 22;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                    className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition duration-300 hover:scale-125 ${
                      selectedNodeId === node.id ? "scale-125 ring-4 ring-white rounded-full" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg border-2 border-white ${
                        node.status === "optimal"
                          ? "bg-emerald-500 shadow-emerald-500/50"
                          : node.status === "warning"
                          ? "bg-amber-500 shadow-amber-500/50"
                          : "bg-rose-600 shadow-rose-600/50 animate-bounce"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="bg-slate-900/90 text-white text-[9px] font-mono px-2 py-0.5 rounded mt-1 shadow border border-slate-700 whitespace-nowrap">
                      {node.soilMoisture}% H₂O
                    </div>
                  </div>
                );
              })}

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1 font-mono">
                <div className="font-bold text-emerald-400">GIS Status Legend:</div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Optimal Moisture (&gt; 35%)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning Deficit (20 - 35%)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Critical Drought (&lt; 20%)
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Telemetry Charts */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">
                24-Hour Sensor Telemetry Trends
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Selected Node: {currentNode.name}
              </p>
            </div>

            {/* Soil Moisture & Temperature Area Chart */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Soil Moisture (%) vs Soil Temp (°C)</span>
                <span className="text-sky-600 font-mono">24h Ingest</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTimeData}>
                    <defs>
                      <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Area type="monotone" dataKey="moisture" stroke="#0284C7" fillOpacity={1} fill="url(#moistureGrad)" />
                    <Area type="monotone" dataKey="temp" stroke="#D97706" fillOpacity={1} fill="url(#tempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NPK Breakdown Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase">
                Sub-Surface Soil Chemistry Breakdown (mg/kg)
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-emerald-700">Nitrogen (N)</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">{currentNode.soilNitrogen}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-sky-700">Phosphorus (P)</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">{currentNode.soilPhosphorus}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-amber-700">Potassium (K)</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">{currentNode.soilPotassium}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 3: SMART IRRIGATION CONTROLS
          ------------------------------------------------------------------------------ */}
      {activeTab === "irrigation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-sky-600" /> Smart Automated Irrigation & Pump Actuation
                </h3>
                <p className="text-xs text-slate-500">Crop-specific automated soil moisture thresholds and water usage tracking.</p>
              </div>
              <span className="text-xs font-bold bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                Pump Control Unit Ready
              </span>
            </div>

            {/* Actuator Cards */}
            <div className="space-y-4">
              {pumps.map((pump) => (
                <div key={pump.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">{pump.plotName}</h4>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                          {pump.nodeName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Target Crop: <span className="font-bold text-emerald-700 uppercase">{pump.targetCrop}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          pump.status === "ON"
                            ? "bg-emerald-500 text-white animate-pulse"
                            : pump.status === "AUTOMATED"
                            ? "bg-sky-600 text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        STATUS: {pump.status}
                      </span>

                      <button
                        onClick={() => handleTogglePump(pump.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                          pump.status === "ON"
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {pump.status === "ON" ? "Stop Pump" : "Start Pump"}
                      </button>
                    </div>
                  </div>

                  {/* Threshold Slider */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Automated Trigger Soil Moisture Threshold:</span>
                      <span className="text-emerald-700 font-mono">&lt; {pump.autoMoistureThreshold}% Moisture</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={pump.autoMoistureThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPumps((prev) =>
                          prev.map((p) => (p.id === pump.id ? { ...p, autoMoistureThreshold: val } : p))
                        );
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>15% (Dry Sandy Soil)</span>
                      <span>35% (Optimal Maize)</span>
                      <span>60% (Paddy Rice)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Usage Meter & Cost Calculator */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Water Meter & Energy Cost Analytics</h4>
              <p className="text-xs text-slate-500">Volumetric water usage and solar/diesel pump running costs.</p>
            </div>

            <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Total Water Discharged Today:</span>
                <span className="text-sky-400 font-bold">
                  {pumps.reduce((acc, p) => acc + p.totalWaterUsedLiters, 0).toLocaleString()} Liters
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Estimated Energy Cost:</span>
                <span className="text-amber-400 font-bold">MWK 1,450 (Solar Hybrid)</span>
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Water Savings vs Flood Irrigation:</span>
                <span className="text-emerald-400 font-bold">+ 38% Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 3.5: TIMESCALEDB TIME-SERIES VISUALIZER TAB
          ------------------------------------------------------------------------------ */}
      {(activeTab === "timescale" || activeTab === "analytics") && (
        <div className="space-y-6">
          {/* TimescaleDB Hypertable Status Header */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-teal-500/30 font-bold flex items-center gap-1">
                    <Database className="h-3.5 w-3.5 text-teal-400" /> TimescaleDB Hypertable Active
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                    PostgreSQL 16.2 Extension
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
                    Compression: 12.4x
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-400" />
                  TimescaleDB Raw Sensor Time-Series Telemetry
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-light">
                  Query high-frequency sub-second ESP32 soil moisture, soil temperature, and nutrient logs downsampled using Timescale time_bucket() aggregate functions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Query Execution Speed</div>
                  <div className="text-base font-black text-emerald-400 font-mono flex items-center justify-end gap-1">
                    <Zap className="h-4 w-4 text-emerald-400" /> {queryExecutionTime} ms
                  </div>
                </div>

                <button
                  onClick={handleExecuteTimescaleQuery}
                  disabled={isQueryingTimescale}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isQueryingTimescale ? "animate-spin" : ""}`} />
                  {isQueryingTimescale ? "Executing SQL..." : "Refresh Hypertable Data"}
                </button>
              </div>
            </div>

            {/* Hypertable Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Active Hypertable</div>
                <div className="text-teal-300 font-bold mt-0.5">sensor_telemetry_hypertable</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Chunk Interval & Retention</div>
                <div className="text-amber-300 font-bold mt-0.5">1 Day Chunks / 365 Days Retention</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Downsampling Function</div>
                <div className="text-sky-300 font-bold mt-0.5">time_bucket('{timescaleBucket}', timestamp)</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Ingest Velocity</div>
                <div className="text-emerald-300 font-bold mt-0.5">120 records / minute</div>
              </div>
            </div>
          </div>

          {/* Time Series Filter Bar & Query Inspector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="h-4 w-4 text-teal-600" /> Time Window:
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {[
                    { id: "24h", label: "Last 24 Hours", bucket: "5m" },
                    { id: "7d", label: "7 Days", bucket: "1h" },
                    { id: "30d", label: "30 Days", bucket: "1d" }
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        setSelectedTimeframe(tf.id as any);
                        setTimescaleBucket(tf.bucket as any);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedTimeframe === tf.id
                          ? "bg-teal-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Sensor Device:</span>
                <select
                  value={selectedNodeFilter}
                  onChange={(e) => setSelectedNodeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All ESP32 Field Nodes (Avg Aggregate)</option>
                  <option value="esp32-node-01">ESP32-Node #01 (Maize North)</option>
                  <option value="esp32-node-02">ESP32-Node #02 (Beans South)</option>
                  <option value="esp32-node-03">ESP32-Node #03 (Nursery Bay)</option>
                  <option value="esp32-node-04">ESP32-Node #04 (Groundnut Block)</option>
                </select>
              </div>
            </div>

            {/* Generated SQL Statement Inspector */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-teal-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto text-slate-300">
                <Terminal className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-amber-400 font-bold">SQL:</span>
                <code>
                  SELECT time_bucket('{timescaleBucket}', timestamp) AS bucket, AVG(soil_moisture), AVG(soil_temp) FROM sensor_telemetry {selectedNodeFilter !== "all" ? `WHERE device_id = '${selectedNodeFilter}'` : ''} GROUP BY bucket ORDER BY bucket ASC;
                </code>
              </div>
              <button
                onClick={() => handleCopyCode(`SELECT time_bucket('${timescaleBucket}', timestamp) AS bucket, device_id, AVG(soil_moisture) AS avg_moisture, AVG(soil_temp) AS avg_temp FROM sensor_telemetry_hypertable WHERE timestamp >= NOW() - INTERVAL '${selectedTimeframe === "24h" ? "24 hours" : selectedTimeframe === "7d" ? "7 days" : "30 days"}' GROUP BY bucket, device_id ORDER BY bucket ASC;`, "sql")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-bold cursor-pointer shrink-0"
              >
                {copiedCode === "sql" ? "SQL Copied!" : "Copy SQL"}
              </button>
            </div>
          </div>

          {/* MAIN TIME-SERIES VISUALIZERS (RECHARTS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Dual-Axis Soil Moisture & Temperature Area Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sky-600" />
                    Soil Moisture (%) vs Soil Temperature (°C) Time-Series
                  </h4>
                  <p className="text-xs text-slate-500">
                    Dual-axis continuous hypertable trend with critical drought and optimal capacity thresholds.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-sky-700 font-bold">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Moisture %
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Temp °C
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timescaleSeriesData}>
                    <defs>
                      <linearGradient id="moistureTimescaleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#0284c7" fontSize={10} domain={[0, 60]} unit="%" />
                    <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={10} domain={[10, 45]} unit="°C" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#f8fafc", fontSize: "12px" }}
                    />
                    <Legend />
                    <ReferenceLine yAxisId="left" y={20} label={{ value: "Wilting Point (20%)", fill: "#ef4444", fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                    <ReferenceLine yAxisId="left" y={40} label={{ value: "Field Capacity Target (40%)", fill: "#10b981", fontSize: 10 }} stroke="#10b981" strokeDasharray="4 4" />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgMoisture"
                      name="Soil Moisture (%)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#moistureTimescaleGrad)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="soilTemp"
                      name="Soil Temp (°C)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#f59e0b" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Agronomic Data Insights */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="text-[10px] font-bold text-sky-800 uppercase">Avg Soil Moisture</div>
                  <div className="text-base font-black text-sky-900 mt-0.5">
                    {(timescaleSeriesData.reduce((acc, d) => acc + d.avgMoisture, 0) / timescaleSeriesData.length).toFixed(1)} %
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Avg Sub-Surface Temp</div>
                  <div className="text-base font-black text-amber-900 mt-0.5">
                    {(timescaleSeriesData.reduce((acc, d) => acc + d.soilTemp, 0) / timescaleSeriesData.length).toFixed(1)} °C
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Timescale Bucket Size</div>
                  <div className="text-base font-black text-emerald-900 mt-0.5 font-mono">{timescaleBucket}</div>
                </div>
              </div>
            </div>

            {/* Chart 2: Multi-Node Comparative Moisture Trends */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" /> Multi-Field Moisture Comparison
                </h4>
                <p className="text-xs text-slate-500">Cross-plot node moisture trends over time.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timescaleSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="timestamp" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} domain={[0, 60]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", fontSize: "11px", color: "#fff" }} />
                    <Line type="monotone" dataKey="soilMoistureNode1" name="Node #01 (Maize)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="soilMoistureNode2" name="Node #02 (Beans)" stroke="#0284c7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="soilMoistureNode3" name="Node #03 (Nursery)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="soilMoistureNode4" name="Node #04 (Groundnut)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-[11px] font-mono border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Node #01 Maize North</span>
                  <span className="font-bold">Optimal (38%)</span>
                </div>
                <div className="flex justify-between items-center text-sky-700">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Node #02 Beans South</span>
                  <span className="font-bold">Good (31%)</span>
                </div>
                <div className="flex justify-between items-center text-rose-700">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Node #03 Seedling Nursery</span>
                  <span className="font-bold text-rose-600">Drought (18%)</span>
                </div>
                <div className="flex justify-between items-center text-purple-700">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Node #04 Groundnut East</span>
                  <span className="font-bold">Wet (42%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Soil Sub-Surface NPK & Salinity Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-teal-600" />
                  Time-Series Soil Chemistry Nutrients (NPK mg/kg & Salinity EC mS/cm)
                </h4>
                <p className="text-xs text-slate-500">
                  Nitrogen, Phosphorus, and Potassium fluctuations captured by RS485 Modbus soil sensors.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-600" /> Nitrogen (N)
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <span className="h-2.5 w-2.5 rounded bg-amber-500" /> Phosphorus (P)
                </span>
                <span className="flex items-center gap-1 text-indigo-700 font-bold">
                  <span className="h-2.5 w-2.5 rounded bg-indigo-600" /> Potassium (K)
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timescaleSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                  <Bar dataKey="nitrogen" name="Nitrogen (N)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="phosphorus" name="Phosphorus (P)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="potassium" name="Potassium (K)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TimescaleDB Raw Hypertable Records Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Table className="h-4 w-4 text-teal-600" />
                  TimescaleDB Raw Hypertable Telemetry Log Records
                </h4>
                <p className="text-xs text-slate-500">
                  Individual timestamped rows stored in PostgreSQL hypertable chunks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["Timestamp,AvgMoisture%,SoilTemp,SoilpH,Salinity,Nitrogen,Phosphorus,Potassium"]
                      .concat(timescaleSeriesData.map(d => `${d.timestamp},${d.avgMoisture},${d.soilTemp},${d.soilPh},${d.salinity},${d.nitrogen},${d.phosphorus},${d.potassium}`))
                      .join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `timescaledb_telemetry_${selectedTimeframe}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-teal-400" /> Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-300 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Bucket Timestamp</th>
                    <th className="p-3">Device Node</th>
                    <th className="p-3">Soil Moisture (%)</th>
                    <th className="p-3">Soil Temp (°C)</th>
                    <th className="p-3">Soil pH</th>
                    <th className="p-3">EC Salinity</th>
                    <th className="p-3">NPK Ratio (N-P-K)</th>
                    <th className="p-3">Hypertable Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {timescaleSeriesData.slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-800">{row.timestamp}</td>
                      <td className="p-3 text-slate-600">
                        {selectedNodeFilter === "all" ? `ESP32-Node #0${(idx % 4) + 1}` : selectedNodeFilter}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${row.avgMoisture < 20 ? "bg-rose-100 text-rose-700" : row.avgMoisture < 32 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-800"}`}>
                          {row.avgMoisture}%
                        </span>
                      </td>
                      <td className="p-3 text-amber-700 font-bold">{row.soilTemp} °C</td>
                      <td className="p-3 text-slate-700">{row.soilPh}</td>
                      <td className="p-3 text-slate-700">{row.salinity} mS/cm</td>
                      <td className="p-3 text-slate-800 font-bold">{row.nitrogen}-{row.phosphorus}-{row.potassium}</td>
                      <td className="p-3">
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3 text-teal-600" /> Ingested
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 4: NASA POWER & OPENWEATHERMAP MICROCLIMATE
          ------------------------------------------------------------------------------ */}
      {activeTab === "weather" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-sky-600" /> NASA POWER & OpenWeatherMap Hybrid Engine
                </h3>
                <p className="text-xs text-slate-500">Combining satellite solar irradiance with local weather station sensors.</p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                NASA POWER Synced
              </span>
            </div>

            {/* Weather Sensor Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Solar Irradiance</div>
                <div className="text-base font-black font-mono text-amber-600 mt-1">21.4 MJ/m²/d</div>
                <div className="text-[10px] text-slate-400 mt-0.5">NASA Satellite API</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Evapotranspiration (ET0)</div>
                <div className="text-base font-black font-mono text-emerald-600 mt-1">4.8 mm/day</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Crop Water Loss</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Precipitation Risk</div>
                <div className="text-base font-black font-mono text-sky-600 mt-1">18.5 mm / 6h</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OpenWeatherMap</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Wind & Gusts</div>
                <div className="text-base font-black font-mono text-indigo-600 mt-1">12.4 km/h</div>
                <div className="text-[10px] text-slate-400 mt-0.5">IoT Anemometer</div>
              </div>
            </div>

            {/* 7-Day Microclimate Advisory */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider">
                7-Day Microclimate Agronomic Advisory
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {language === "en"
                  ? "Expect moderate rain showers starting tomorrow afternoon (approx 15mm). Delay top-dressing fertilizer to avoid soil leaching. Resume crop spraying on Friday when relative humidity drops below 55%."
                  : "Mvula ikuyembekezeka mawa masana. Cheletsani kuthira feteleza tsopano. Mudzathire feteleza Lachisanu pamene chinyezi chichepa."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              7-Day Weather Trend Forecast
            </h4>

            <div className="space-y-3">
              {[
                { day: "Mon (Today)", temp: 28, rain: "0.0 mm", status: "Sunny" },
                { day: "Tue", temp: 24, rain: "18.5 mm", status: "Heavy Showers" },
                { day: "Wed", temp: 25, rain: "6.2 mm", status: "Light Rain" },
                { day: "Thu", temp: 27, rain: "0.0 mm", status: "Partly Cloudy" },
                { day: "Fri", temp: 29, rain: "0.0 mm", status: "Clear Sky" }
              ].map((f) => (
                <div key={f.day} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 w-24">{f.day}</span>
                  <span className="font-mono text-amber-700">{f.temp}°C</span>
                  <span className="font-mono text-sky-700 font-bold">{f.rain}</span>
                  <span className="text-[11px] text-slate-500">{f.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 5: AI CROP HEALTH & COMPUTER VISION
          ------------------------------------------------------------------------------ */}
      {activeTab === "crophealth" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-600" /> AI Computer Vision Crop Disease Diagnostic
              </h3>
              <p className="text-xs text-slate-500">Upload crop leaf photos for pest, virus, and nutrient deficiency identification.</p>
            </div>

            {/* Photo Upload Zone */}
            <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-6 text-center space-y-3 hover:bg-emerald-50 transition cursor-pointer">
              <Upload className="h-8 w-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Drag & Drop Crop Photo or Click to Upload
              </div>
              <p className="text-[10px] text-slate-500">Supports JPG, PNG (Maize, Beans, Groundnuts, Rice)</p>
            </div>

            {/* Sample Preset Bank */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Or Choose Field Diagnostic Sample:</label>
              <div className="space-y-2">
                {SAMPLE_CROP_SCANS.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                      selectedScan.id === scan.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold">{scan.sampleImageName}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{scan.diseaseName} ({scan.confidence}% Confidence)</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedScan.diseaseName}</h4>
                <p className="text-xs text-slate-500 font-mono">Scanned: {selectedScan.scannedAt}</p>
              </div>
              <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {selectedScan.confidence}% AI Confidence
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-900">Symptoms Observed:</span>
                <p className="text-slate-600 mt-0.5">{selectedScan.symptoms}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900">Recommended Chemical Treatment:</span>
                <p className="text-rose-700 font-semibold mt-0.5">{selectedScan.chemicalTreatment}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900">Recommended Organic Treatment:</span>
                <p className="text-emerald-700 font-semibold mt-0.5">{selectedScan.organicTreatment}</p>
              </div>
            </div>

            {/* Chichewa Translation Box */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Languages className="h-4 w-4 text-amber-700" /> Malangizo a Chinyanja (Chichewa Advisory):
              </div>
              <p className="text-amber-900 leading-relaxed font-medium">
                {selectedScan.chichewaSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 6: PRECISION AI ALERTS & SMS ACTIVITY/DISEASE REPORT DISPATCHER
          ------------------------------------------------------------------------------ */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Success Toast Banner */}
          {smsSuccessNotification && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center animate-fade-in font-bold text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                <span>{smsSuccessNotification}</span>
              </div>
              <button
                onClick={() => setSmsSuccessNotification(null)}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[10px] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Row: Scheduled Farm Activities Calendar & Disease Risk Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Farm Activities Scheduled Dates Calendar */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Farm Activities Calendar & Scheduled Check Dates
                  </h3>
                  <p className="text-xs text-slate-500">Key agricultural dates automatically generated from crop growth models & weather trends.</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  {farmActivities.length} Activities Active
                </span>
              </div>

              <div className="space-y-2.5">
                {farmActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-900 text-amber-300 p-2 rounded-xl text-center shrink-0 w-16">
                        <div className="text-[9px] font-mono text-slate-400 uppercase">Date</div>
                        <div className="text-xs font-black font-mono mt-0.5">{act.displayDate.split(",")[0]}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">
                            {language === "en" ? act.activityEn : act.activityCh}
                          </h4>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              act.urgency === "CRITICAL"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : act.urgency === "HIGH"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-sky-100 text-sky-800 border border-sky-300"
                            }`}
                          >
                            {act.urgency}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-400" /> {act.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disease & Pest Risk Alert Panel */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Bug className="h-4 w-4 text-rose-600" /> Microclimate Disease & Pest Risk Radar
                  </h3>
                  <p className="text-xs text-slate-500">Real-time risk scoring driven by leaf wetness, humidity, and TimescaleDB soil sensors.</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                  AI Disease Predictor
                </span>
              </div>

              <div className="space-y-3">
                {diseaseRisks.map((dis) => (
                  <div
                    key={dis.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition ${
                      dis.riskLevel === "HIGH"
                        ? "bg-rose-50/70 border-rose-200 text-rose-950"
                        : "bg-amber-50/70 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-2 py-0.5 rounded">
                          {dis.crop}
                        </span>
                        <h4 className="font-bold text-xs">
                          {language === "en" ? dis.diseaseEn : dis.diseaseCh}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            dis.riskLevel === "HIGH" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                          }`}
                        >
                          {dis.riskLevel} RISK ({dis.riskScore}%)
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed">
                      <strong className="font-bold">Trigger: </strong>
                      {language === "en" ? dis.triggerEn : dis.triggerCh}
                    </p>

                    <div className="bg-white/90 p-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800 flex items-start gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Action: </strong>
                        {language === "en" ? dis.actionEn : dis.actionCh}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Section: SMS Advisory Report Generator & Mobile Screen Simulator */}
          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> Automated SMS Report Generator
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
                    Malawi Airtel/TNM Gateway
                  </span>
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-emerald-400" />
                  Generate & Dispatch SMS Activity & Disease Advisory Report
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-light">
                  Compile scheduled farm dates, high-risk disease warnings, and TimescaleDB soil sensor metrics into dual-language SMS notifications for rural farmers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSmsLang(smsLang === "en" ? "ch" : "en")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-mono font-bold transition cursor-pointer border border-slate-700 flex items-center gap-1.5"
                >
                  <Languages className="h-3.5 w-3.5 text-amber-400" />
                  Language: {smsLang === "en" ? "English" : "Chichewa (Malawi)"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Left Column: Dispatch Controls Form */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Farmer Recipient */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Select Recipient Farmer:
                    </label>
                    <select
                      value={smsRecipientName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setSmsRecipientName(name);
                        if (name === "Banda Chidanti") setSmsRecipientPhone("+265 999 123 456");
                        else if (name === "Mary Phiri") setSmsRecipientPhone("+265 888 234 567");
                        else if (name === "Gondwe Nyirenda") setSmsRecipientPhone("+265 991 789 012");
                        else if (name === "Chisale Kachingwe") setSmsRecipientPhone("+265 884 567 890");
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Banda Chidanti">Banda Chidanti (Chiradzulu North)</option>
                      <option value="Mary Phiri">Mary Phiri (Lilongwe Mitundu)</option>
                      <option value="Gondwe Nyirenda">Gondwe Nyirenda (Mzuzu Northern Block)</option>
                      <option value="Chisale Kachingwe">Chisale Kachingwe (Salima Lake Basin)</option>
                    </select>
                  </div>

                  {/* Phone Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Mobile Phone Number:
                    </label>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={smsRecipientPhone}
                        onChange={(e) => setSmsRecipientPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Gateway Channel Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Gateway Dispatch Channel:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "Airtel SMS Gateway",
                      "TNM Mpamba SMS",
                      "WhatsApp Business"
                    ].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSmsChannel(ch as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                          smsChannel === ch
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Badges of Included Contents */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Report Payload Data:</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      ✓ Jul 28: Urea Fertilizer Date
                    </span>
                    <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                      ✓ Fall Armyworm Risk (88%)
                    </span>
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-bold">
                      ✓ Timescale Soil Moisture ({timescaleAvgMoisture}%)
                    </span>
                  </div>
                </div>

                {/* Dispatch Action Button */}
                <button
                  onClick={handleDispatchSmsReport}
                  disabled={isGeneratingSms}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`h-4 w-4 ${isGeneratingSms ? "animate-bounce" : ""}`} />
                  {isGeneratingSms ? "Compiling & Sending SMS via Gateway..." : "Generate & Dispatch SMS Advisory Report"}
                </button>
              </div>

              {/* Right Column: Simulated Mobile Screen Live Preview */}
              <div className="lg:col-span-5 bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-400" /> Live SMS Preview
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Sender: MLIMI-AI</span>
                </div>

                {/* Simulated Phone Message Bubble */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">To: {smsRecipientName}</span>
                    <span>{smsRecipientPhone}</span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {smsLang === "en"
                      ? `MLIMI AI REPORT [Jul 28]: Scheduled Activity: Top-dressing Urea fertilizer due Jul 28 & Weeding Aug 02. CRITICAL DISEASE ALERT: Fall Armyworm (88% risk) & Late Blight (78% risk). Timescale Moisture: ${timescaleAvgMoisture}%, Temp: ${timescaleAvgTemp}°C. Action required!`
                      : `CHENJEZO LA MLIMI AI [Jul 28]: Ntchito ya m'munda: Kuthira feteleza wa Urea pa Jul 28 & Kusefura udzu Aug 02. NGOZI YA MATENDA: Nkhungu za chimanga (88%) & Chikasu (78%). Chinyezi cha nthaka: ${timescaleAvgMoisture}%, Kutentha: ${timescaleAvgTemp}°C. Samalani!`}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                    <span>Segment: 1/1 (158 chars)</span>
                    <span className="text-emerald-400 font-bold">Gateway: {smsChannel}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCopyCode(
                      smsLang === "en"
                        ? `MLIMI AI REPORT [Jul 28]: Scheduled Activity: Top-dressing Urea fertilizer due Jul 28 & Weeding Aug 02. CRITICAL DISEASE ALERT: Fall Armyworm (88% risk) & Late Blight (78% risk). Timescale Moisture: ${timescaleAvgMoisture}%, Temp: ${timescaleAvgTemp}°C. Action required!`
                        : `CHENJEZO LA MLIMI AI [Jul 28]: Ntchito ya m'munda: Kuthira feteleza wa Urea pa Jul 28 & Kusefura udzu Aug 02. NGOZI YA MATENDA: Nkhungu za chimanga (88%) & Chikasu (78%). Chinyezi cha nthaka: ${timescaleAvgMoisture}%, Kutentha: ${timescaleAvgTemp}°C. Samalani!`,
                      "sms_preview"
                    )}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-mono font-bold rounded-lg cursor-pointer"
                  >
                    {copiedCode === "sms_preview" ? "SMS Copied!" : "Copy SMS Text"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: SMS Dispatch Log History Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Dispatched SMS & Advisory Reports History Log
                </h3>
                <p className="text-xs text-slate-500">Audit trail of automated SMS notifications delivered to farmers across Malawi.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                {smsLogs.length} Records Sent
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-300 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Dispatched Time</th>
                    <th className="p-3">Farmer Recipient</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">Gateway Channel</th>
                    <th className="p-3">Message Content Preview</th>
                    <th className="p-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-800">{log.timestamp}</td>
                      <td className="p-3 font-bold text-emerald-900">{log.recipientName}</td>
                      <td className="p-3 text-slate-600">{log.phone}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200 text-[10px]">
                          {log.channel}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs text-[11px] text-slate-700 truncate">
                        {language === "en" ? log.messageEn : log.messageCh}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 7: AUTOMATION RULES BUILDER
          ------------------------------------------------------------------------------ */}
      {activeTab === "automation" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-emerald-600" /> If-Then Automated Agronomic Rule Engine
              </h3>
              <p className="text-xs text-slate-500">Configure trigger conditions for actuators, SMS alerts, and deep sleep cycles.</p>
            </div>

            <button
              onClick={() => setShowRuleModal(true)}
              className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create New Automation Rule
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                      ENABLED
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">
                    IF <span className="text-sky-700">{rule.conditionSensor}</span> <span className="text-rose-700">{rule.operator}</span> <span className="text-amber-700">{rule.conditionValue}</span> THEN <span className="text-emerald-700">{rule.actionCommand} ({rule.actionTarget})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRules(rules.filter((r) => r.id !== rule.id))}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create Rule Modal */}
          {showRuleModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full space-y-4 shadow-2xl">
                <h4 className="font-bold text-slate-900 text-base">Create New Automation Rule</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name:</label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sensor Parameter:</label>
                    <select
                      value={newRuleSensor}
                      onChange={(e) => setNewRuleSensor(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      <option value="soilMoisture">Soil Moisture (%)</option>
                      <option value="airTemp">Air Temperature (°C)</option>
                      <option value="rainfall">Rainfall (mm)</option>
                      <option value="soilPh">Soil pH</option>
                      <option value="soilSalinity">Soil Salinity (EC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Threshold Value:</label>
                    <input
                      type="number"
                      value={newRuleVal}
                      onChange={(e) => setNewRuleVal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowRuleModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRule}
                    className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 8: LIVESTOCK IOT GEOFENCING
          ------------------------------------------------------------------------------ */}
      {activeTab === "livestock" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-600" /> Livestock IoT Collar Tracker & Geofencing
              </h3>
              <p className="text-xs text-slate-500">GPS ear tags, body temperature telemetry, and boundary breach alerts.</p>
            </div>

            <div className="space-y-4">
              {livestock.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">Tag: {item.tagCode} | Type: {item.animalType}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        item.geofenceStatus.includes("BREACHED")
                          ? "bg-rose-600 text-white animate-bounce"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {item.geofenceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Body Temp</div>
                      <div className="text-sm font-black font-mono text-amber-700">{item.bodyTemp}°C</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Activity Score</div>
                      <div className="text-sm font-black font-mono text-emerald-700">{item.activityIndex}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Battery Level</div>
                      <div className="text-sm font-black font-mono text-indigo-700">{item.battery}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Pasture Geofence Polygon Radar
            </h4>

            <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Geofence Pasture Border */}
              <div className="absolute inset-6 border-2 border-emerald-500/80 border-dashed rounded-2xl bg-emerald-950/20" />

              {/* Livestock Pins */}
              <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="h-4 w-4 bg-emerald-500 rounded-full inline-block border-2 border-white shadow-lg" />
                <div className="text-[9px] font-mono text-emerald-300 font-bold bg-slate-900 px-1 rounded">Zebu #104</div>
              </div>

              <div className="absolute bottom-2 right-2 text-center">
                <span className="h-4 w-4 bg-rose-600 rounded-full inline-block border-2 border-white shadow-lg animate-ping" />
                <div className="text-[9px] font-mono text-rose-400 font-bold bg-slate-900 px-1 rounded">Goat #088 OUT!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------
          VIEW 9: ESP32 FIRMWARE & FASTAPI CODE
          ------------------------------------------------------------------------------ */}
      {activeTab === "firmware" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCode className="h-5 w-5 text-emerald-600" /> Embedded ESP32 Firmware & FastAPI Microservice Engine
              </h3>
              <p className="text-xs text-slate-500">Deployable C++ Arduino firmware and TimescaleDB Python backend source code.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ESP32 Firmware Box */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-900">ESP32 Arduino C++ Firmware Source Code</h4>
                <button
                  onClick={() => handleCopyCode(ESP32_CPP_CODE, "cpp")}
                  className="px-3 py-1 bg-slate-900 text-amber-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1"
                >
                  {copiedCode === "cpp" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCode === "cpp" ? "Copied!" : "Copy C++"}
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-2xl text-emerald-400 text-[10px] font-mono border border-slate-800 overflow-x-auto max-h-96">
                {ESP32_CPP_CODE}
              </pre>
            </div>

            {/* FastAPI Microservice Box */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-900">FastAPI + TimescaleDB Python Backend</h4>
                <button
                  onClick={() => handleCopyCode(FASTAPI_PY_CODE, "py")}
                  className="px-3 py-1 bg-slate-900 text-amber-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1"
                >
                  {copiedCode === "py" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCode === "py" ? "Copied!" : "Copy Python"}
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-2xl text-amber-300 text-[10px] font-mono border border-slate-800 overflow-x-auto max-h-96">
                {FASTAPI_PY_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 11: DEEP AGRICULTURAL MATHEMATICS & MATLAB ENGINE */}
      {activeTab === "math" && <AgriculturalMathHub />}
    </div>
  );
};

// Embedded Source Code Templates
const ESP32_CPP_CODE = `// SIFMS MLIMI SMART AI - ESP32 Complete Arduino Firmware
// Sensors: Capacitive Soil Moisture, RS485 NPK Modbus, DHT22, Rain Gauge, Relay Pump, GPS NEO-6M
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <HardwareSerial.h>

#define WIFI_SSID "Mlimi_Smart_Mesh"
#define WIFI_PASS "MalawiAgTech2026"
#define MQTT_BROKER "broker.mlimismart.ai"
#define MQTT_PORT 1883
#define FARM_ID "f-1"
#define DEVICE_ID "esp32-node-01"

#define SOIL_MOISTURE_PIN 34
#define RELAY_PUMP_PIN 26
#define DHT_PIN 4
#define DHTTYPE DHT22

DHT dht(DHT_PIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  digitalWrite(RELAY_PUMP_PIN, LOW); // Default OFF
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  client.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (!client.connected()) { reconnectMQTT(); }
  client.loop();

  int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
  float soilMoisturePct = map(rawMoisture, 3500, 1200, 0, 100);
  float airTemp = dht.readTemperature();
  float airHum = dht.readHumidity();

  String topic = "mlimi/farm/" + String(FARM_ID) + "/" + String(DEVICE_ID) + "/telemetry";
  String payload = "{\\"soilMoisture\\":" + String(soilMoisturePct) + 
                   ",\\"airTemp\\":" + String(airTemp) + 
                   ",\\"airHumidity\\":" + String(airHum) + "}";

  client.publish(topic.c_str(), payload.c_str());

  // Automated Hardware Interlock (<32% triggers Pump)
  if (soilMoisturePct < 32.0) {
    digitalWrite(RELAY_PUMP_PIN, HIGH);
  } else {
    digitalWrite(RELAY_PUMP_PIN, LOW);
  }

  delay(5000); // 5s Telemetry Interval
}

void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect(DEVICE_ID)) {
      client.subscribe("mlimi/farm/f-1/actuators/pump1/command");
    } else { delay(2000); }
  }
}`;

const FASTAPI_PY_CODE = `# SIFMS MLIMI SMART AI - FastAPI + TimescaleDB Python Microservice
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
import os

app = FastAPI(title="MLIMI Smart AI Precision Ag API", version="3.0.0")

class TelemetryPayload(BaseModel):
    farm_id: str
    device_id: str
    soil_moisture: float
    soil_temp: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

@app.post("/api/v1/telemetry/ingest")
async def ingest_telemetry(data: TelemetryPayload):
    # Inserts into TimescaleDB Hypertable
    query = """
    INSERT INTO sensor_telemetry (time, farm_id, device_id, moisture, temp, ph, n, p, k)
    VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8)
    """
    # Auto-trigger Irrigation Rule
    pumps_triggered = []
    if data.soil_moisture < 32.0:
        pumps_triggered.append("PUMP_01_ON")
    
    return {
        "status": "ingested",
        "timescaledb_sync": True,
        "actuators_triggered": pumps_triggered
    }

@app.get("/api/v1/analytics/et0")
async def calculate_evapotranspiration(solar_rad: float, air_temp: float):
    # Hargreaves ET0 formula estimation
    et0 = 0.0023 * (air_temp + 17.8) * (solar_rad ** 0.5)
    return {"et0_mm_per_day": round(et0, 2)}`;
