import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000;

// Initialize Gemini SDK with User-Agent header as required
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Expansion Site Feasibility Endpoint with Vahan EV Density Integration
app.post("/api/gemini/analyze-site", async (req, res) => {
  try {
    const {
      siteName,
      city,
      coordinates,
      targetChargerCount,
      transformerCapacity,
      nearbyPois,
      estimatedFootTraffic,
      targetInvestment,
      vahanData,
    } = req.body;
    const ai = getGeminiClient();

    // Compute baseline metrics factoring in Vahan EV data if present
    const evCount = vahanData?.totalEvCount || 95000;
    const e4wCount = vahanData?.categoryBreakdown?.fourWheelerE4W || vahanData?.vahanE4wCount || 18000;
    const yoyGrowth = vahanData?.yoyGrowthPct || 54.0;
    const deficitScore = vahanData?.chargingDeficitScore || 88;
    const evToChargerRatio = vahanData?.evToChargerRatio || 145;

    const baseFeasibility = Math.min(98, Math.max(70, Math.round(75 + (deficitScore * 0.15) + (yoyGrowth * 0.1))));
    const baseDailySessions = Math.min(65, Math.max(20, Math.round((targetChargerCount || 4) * (8 + (deficitScore > 85 ? 4 : 2)))));
    const baseRoi = Math.max(16, Math.round(34 - (deficitScore > 85 ? 8 : 4) - (yoyGrowth > 50 ? 4 : 2)));

    if (!ai) {
      // Return structured fallback response factoring in Vahan registry metrics
      return res.json({
        success: true,
        isDemo: true,
        feasibilityScore: baseFeasibility,
        roiMonths: baseRoi,
        estimatedDailySessions: baseDailySessions,
        recommendedConnectors: [
          { type: "CCS2 (150kW Ultra-Fast)", count: Math.ceil((targetChargerCount || 4) * 0.6) },
          { type: "NACS / Type 2 (Fast Combo)", count: Math.max(1, Math.floor((targetChargerCount || 4) * 0.4)) }
        ],
        gridImpactAssessment: `Moderate upgrade recommended. ${transformerCapacity || '500 kVA'} transformer with 120kWh Battery Energy Storage System (BESS) buffer to support ${targetChargerCount || 4} simultaneous DC fast charging ports.`,
        capexEstimateUsd: Math.round((targetChargerCount || 4) * 42000 + 32000),
        opexMonthlyUsd: Math.round((targetChargerCount || 4) * 1100 + 750),
        keyAdvantages: [
          vahanData ? `High Vahan registered EV fleet: ${evCount.toLocaleString()} EVs in district (${yoyGrowth}% YoY growth)` : "High EV registration growth in target corridor (+52% YoY)",
          vahanData ? `Severe public charging deficit: ${evToChargerRatio}:1 EV-to-charger ratio in RTO zone` : "Substantial public fast charging shortage across commercial zone",
          `Strong local anchor demand with ${e4wCount.toLocaleString()} registered 4W electric cars in catchment area`,
          "Proximity to high-density arterial transport corridors and retail amenities"
        ],
        riskFactors: [
          "Peak demand grid charge tariffs during evening rush window (5 PM - 9 PM)",
          "High transformer lead time for >500kVA grid interconnection upgrades"
        ],
        aiExecutiveSummary: `The proposed site at ${siteName || 'Selected Location'} in ${city || 'Urban Catchment'} demonstrates exceptional commercial viability (${baseFeasibility}/100 Feasibility Score) anchored by official Vahan 4.0 vehicle registry data showing ${evCount.toLocaleString()} active EVs and a ${evToChargerRatio}:1 vehicle-to-charger ratio. The high density of electric 4-wheelers (${e4wCount.toLocaleString()} units) and strong ${yoyGrowth}% YoY adoption trajectory supports an accelerated payback horizon of ~${baseRoi} months with an estimated ${baseDailySessions} daily charging sessions.`
      });
    }

    const prompt = `You are a world-class EV Charging Infrastructure Site Planner and Financial Analyst specializing in Vahan Dashboard (vahan.parivahan.gov.in) EV density modeling.
Analyze this proposed charging station site and provide structured feasibility results based on the provided parameters and Vahan EV registration metrics.

Site & Vahan Telematics:
- Location Name: ${siteName || 'Proposed Location'}
- City/District: ${city || 'Metropolitan Area'}
- Coordinates: ${coordinates ? JSON.stringify(coordinates) : 'Not specified'}
- Planned Chargers: ${targetChargerCount || 4} ports
- Local Grid Transformer Capacity: ${transformerCapacity || '500 kVA'}
- Nearby Points of Interest: ${nearbyPois || 'Shopping Mall, Transit Junction, IT corridor'}
- Daily Foot/Vehicle Traffic: ${estimatedFootTraffic || '14,000 vehicles/day'}
- Target Investment Budget: $${targetInvestment || 200000}
- Official Vahan 4.0 EV Registrations:
  * Total Registered EVs in District: ${evCount.toLocaleString()}
  * E-4W (Electric Cars / Fleets): ${e4wCount.toLocaleString()}
  * YoY EV Growth Rate: ${yoyGrowth}%
  * EV-to-Public-Charger Ratio: ${evToChargerRatio}:1
  * Charging Deficit Index: ${deficitScore}/100

Respond ONLY with JSON matching this structure:
{
  "feasibilityScore": number (0-100),
  "roiMonths": number,
  "estimatedDailySessions": number,
  "recommendedConnectors": [
    {"type": "CCS2 (150kW)", "count": number},
    {"type": "NACS (250kW)", "count": number}
  ],
  "gridImpactAssessment": "string concise evaluation",
  "capexEstimateUsd": number,
  "opexMonthlyUsd": number,
  "keyAdvantages": ["string advantage mentioning Vahan density", "string advantage 2", "string advantage 3"],
  "riskFactors": ["string risk 1", "string risk 2"],
  "aiExecutiveSummary": "Detailed multi-sentence investment executive summary highlighting Vahan EV density and market opportunity"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Gemini Site Feasibility Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze site feasibility" });
  }
});

// AI Predictive Load & Dynamic Pricing Forecast
app.post("/api/gemini/load-forecast", async (req, res) => {
  try {
    const { stationId, currentLoadKw, solarGenKw, batteryLevelPct, gridTariffRate } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isDemo: true,
        gridPeakWarning: currentLoadKw > 250,
        suggestedBessDischargeKw: Math.round((currentLoadKw || 180) * 0.3),
        optimalDynamicPricePerKwh: gridTariffRate ? +(gridTariffRate * 1.35).toFixed(2) : 0.48,
        aiLoadActionRecommendation: "Discharge BESS storage by 40kW to cap peak grid demand. Increase high-speed port rate by $0.06/kWh during peak 5PM-8PM window to balance queue length."
      });
    }

    const prompt = `You are an AI Grid Energy Optimization & Dynamic Tariff Engine for EV Charging Networks.
Given current live station telematics:
- Station ID: ${stationId || 'STATION-01'}
- Current Active Load: ${currentLoadKw || 180} kW
- Solar Generation: ${solarGenKw || 25} kW
- Battery Storage (BESS) SoC: ${batteryLevelPct || 65}%
- Current Grid Wholesale Tariff: $${gridTariffRate || 0.32}/kWh

Provide load management recommendations in JSON:
{
  "gridPeakWarning": boolean,
  "suggestedBessDischargeKw": number,
  "optimalDynamicPricePerKwh": number,
  "aiLoadActionRecommendation": "Actionable string advice for grid operator"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json({ success: true, ...JSON.parse(response.text || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Predictive Hardware Maintenance & Failure Forecasting Endpoint
app.post("/api/gemini/predictive-maintenance", async (req, res) => {
  try {
    const { stationName, portId, component, junctionTempC, coolantPressurePsi, vibrationMs2, currentRipplePct, failureHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isDemo: true,
        failureProbabilityPct: 86,
        predictedTimeframe: "Within 24-48 Hours",
        severity: "Critical",
        componentTarget: component || "Liquid Coolant Pump Loop #2",
        rootCauseAnalysis: "Coolant pump pressure dropped to 14.2 PSI (nominal 28 PSI) accompanied by elevated high-frequency vibration spikes (3.8 m/s²). Internal impeller cavitation likely.",
        recommendedAction: "Auto-throttle charger output to 150kW immediately. Dispatch Field Tech to replace coolant pump assembly and flush thermal fluid.",
        sensorTelemetrySnapshot: {
          junctionTempC: junctionTempC || 72,
          coolantPressurePsi: coolantPressurePsi || 14.2,
          vibrationMs2: vibrationMs2 || 3.8,
          voltageFluctuationPct: 4.2,
          currentRipplePct: currentRipplePct || 5.8
        },
        suggestedParts: ["Coolant Pump Mod 350kW", "O-Ring Seal Kit", "Glycol Fluid 5L"]
      });
    }

    const prompt = `You are a Senior EV High-Voltage Infrastructure Reliability Engineer and Predictive Maintenance Specialist.
Analyze the following multi-sensor hardware telemetry and historical failure logs to predict hardware breakdown:
- Station: ${stationName || 'VoltGrid Station'}
- Port ID: ${portId || 'Port #1'}
- Target Hardware Component: ${component || 'DC Power Module Inverter'}
- Junction Temperature: ${junctionTempC || 68}°C (Threshold: 75°C)
- Coolant Loop Pressure: ${coolantPressurePsi || 16} PSI (Nominal: 28 PSI)
- Vibration Level: ${vibrationMs2 || 2.8} m/s² (Threshold: 1.5 m/s²)
- Current Ripple: ${currentRipplePct || 4.5}%
- Historical Failure Context: ${failureHistory || 'Occasional thermal throttle during peak summer load'}

Provide a JSON response with high-precision failure prediction:
{
  "failureProbabilityPct": number (0 to 100),
  "predictedTimeframe": "string (e.g. Within 24-48 Hours)",
  "severity": "Critical" | "High" | "Moderate" | "Low" | "Nominal",
  "componentTarget": "string component name",
  "rootCauseAnalysis": "Detailed technical root cause string explaining physical failure mode",
  "recommendedAction": "Actionable step for field technician or automated control system",
  "sensorTelemetrySnapshot": {
    "junctionTempC": number,
    "coolantPressurePsi": number,
    "vibrationMs2": number,
    "voltageFluctuationPct": number,
    "currentRipplePct": number
  },
  "suggestedParts": ["part 1", "part 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json({ success: true, ...JSON.parse(response.text || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Station Maintenance & Fault Diagnostic Endpoint
app.post("/api/gemini/diagnostics", async (req, res) => {
  try {
    const { stationName, chargerId, errorLogs, temperatureC, voltageDropPct } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isDemo: true,
        healthStatus: "Degraded",
        faultCode: "ERR-TEMP-THERMAL-THROTTLE",
        probableCause: "Liquid coolant pump flow restriction causing power module over-temperature under 300A load.",
        recommendedAction: "Schedule technician for coolant loop pressure check. Automatically cap maximum current to 180A to prevent thermal trip.",
        urgency: "Medium"
      });
    }

    const prompt = `You are an EV Fast-Charger Diagnostics & Predictive Maintenance Specialist.
Analyze the following charger telemetry log:
- Station: ${stationName || 'Central FastHub'}
- Charger ID: ${chargerId || 'PORT-03 (350kW)'}
- Error Logs / Symptoms: ${errorLogs || 'High junction temperature alarm, current throttled from 300A to 160A'}
- Operating Temperature: ${temperatureC || 68}°C
- Voltage Drop: ${voltageDropPct || 3.8}%

Respond with JSON:
{
  "healthStatus": "Healthy" | "Degraded" | "Critical",
  "faultCode": "string",
  "probableCause": "string detail",
  "recommendedAction": "string actionable maintenance step",
  "urgency": "Low" | "Medium" | "High" | "Immediate"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json({ success: true, ...JSON.parse(response.text || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Route & EV Charging Assistant Endpoint
app.post("/api/gemini/route-advisor", async (req, res) => {
  try {
    const { startLocation, destination, evModel, currentBatteryPct } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        isDemo: true,
        totalDistanceMiles: 210,
        estimatedTripMinutes: 235,
        suggestedStops: [
          {
            stationName: "VoltGrid Highway Oasis - Mile 84",
            arrivalSoCPct: 22,
            chargeDurationMin: 18,
            targetSoCPct: 80,
            connector: "NACS / CCS2 Ultra Fast (250kW)",
            amenities: "Starbucks, Restroom, High-speed Wi-Fi"
          }
        ],
        drivingEfficiencyTips: "Maintain 68 mph cruising speed to optimize range across elevation gain."
      });
    }

    const prompt = `You are a Smart EV Trip & Charging Planner.
User Details:
- Origin: ${startLocation || 'Downtown Metro'}
- Destination: ${destination || 'Mountain Resort Hub'}
- Vehicle Model: ${evModel || 'Tesla Model Y / Hyundai Ioniq 5'}
- Current Battery SoC: ${currentBatteryPct || 45}%

Provide a recommended charging itinerary in JSON:
{
  "totalDistanceMiles": number,
  "estimatedTripMinutes": number,
  "suggestedStops": [
    {
      "stationName": "string",
      "arrivalSoCPct": number,
      "chargeDurationMin": number,
      "targetSoCPct": number,
      "connector": "string",
      "amenities": "string"
    }
  ],
  "drivingEfficiencyTips": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json({ success: true, ...JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.warn("Gemini route advisor fallback triggered:", error?.message);
    res.json({
      success: true,
      isDemo: true,
      totalDistanceMiles: 210,
      estimatedTripMinutes: 235,
      suggestedStops: [
        {
          stationName: "VoltGrid Highway Oasis - Mile 84",
          arrivalSoCPct: 22,
          chargeDurationMin: 18,
          targetSoCPct: 80,
          connector: "NACS / CCS2 Ultra Fast (250kW)",
          amenities: "Starbucks, Restroom, High-speed Wi-Fi"
        }
      ],
      drivingEfficiencyTips: "Maintain 68 mph cruising speed to optimize range across elevation gain."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VoltGrid EV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
