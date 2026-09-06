export type RolePersona = 'driver' | 'operator' | 'investor' | 'planner' | 'maintenance' | 'vahan' | 'blr_heatmap';

export type PermissionKey =
  | 'telemetry:read'
  | 'station:write'
  | 'pricing:manage'
  | 'maintenance:dispatch'
  | 'maintenance:execute'
  | 'financials:view'
  | 'remote:control'
  | 'wallet:manage'
  | 'expansion:plan';

export interface UserRoleProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  role: RolePersona;
  permissions: PermissionKey[];
  restrictedFeatures: string[];
}

export type IncidentCategory =
  | 'gun_stuck'
  | 'thermal_overheat'
  | 'power_surge'
  | 'payment_glitch'
  | 'hardware_lockout'
  | 'vandalism_iceing'
  | 'emergency_stop'
  | 'other';

export interface ControlIncidentAlert {
  id: string;
  source: 'driver_sos' | 'sensor_telemetry' | 'field_technician' | 'grid_operator';
  stationId: string;
  stationName: string;
  portId?: string;
  portNumber?: number;
  category: IncidentCategory;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  driverName?: string;
  vehicleModel?: string;
  sessionId?: string;
  reportedAt: string;
  status: 'pending_review' | 'remotely_actioned' | 'technician_dispatched' | 'resolved';
  remoteActionsTaken?: string[];
  operatorNotes?: string;
  refundIssuedUsd?: number;
}

export type RiskSeverity = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Nominal';

export interface PredictiveMaintenanceAlert {
  id: string;
  stationId: string;
  stationName: string;
  portId?: string;
  portNumber?: number;
  component: string;
  failureProbabilityPct: number;
  predictedTimeframe: string;
  severity: RiskSeverity;
  rootCauseAnalysis: string;
  sensorTelemetrySnapshot: {
    junctionTempC: number;
    coolantPressurePsi: number;
    vibrationMs2: number;
    voltageFluctuationPct: number;
    currentRipplePct: number;
  };
  recommendedAction: string;
  suggestedParts?: string[];
  status: 'active' | 'throttled' | 'dispatched' | 'resolved';
  createdAt: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  alertId?: string;
  stationId: string;
  stationName: string;
  portId?: string;
  component: string;
  assignedTechnician: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  scheduledTime: string;
  requiredParts: string[];
  status: 'Open' | 'Dispatched' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
  createdAt: string;
}

export interface SensorTelemetryHistoryPoint {
  timestamp: string;
  tempC: number;
  coolantPsi: number;
  vibrationMs2: number;
  currentRipplePct: number;
  inverterEfficiencyPct: number;
}

export interface RoleAuditLog {
  id: string;
  timestamp: string;
  userRole: RolePersona;
  userName: string;
  action: string;
  resource: string;
  granted: boolean;
}

export type StationStatus = 'operational' | 'busy' | 'degraded' | 'offline' | 'maintenance' | 'faulted';

export type ConnectorType = 'CCS2' | 'NACS' | 'Type 2' | 'CHAdeMO';

export type StationCategory = 'Highway Superhub' | 'Urban Mall' | 'Commercial Office' | 'Fleet Depot' | 'Residential Hub';

export interface ConnectorPort {
  id: string;
  portNumber: number;
  type: ConnectorType;
  maxPowerKw: number;
  status: 'available' | 'charging' | 'reserved' | 'faulted' | 'offline';
  pricePerKwh: number;
  currentPowerKw?: number;
  voltageV?: number;
  currentAmp?: number;
  temperatureC?: number;
  activeSessionId?: string;
  vehicleModel?: string;
  batterySocPct?: number;
  sessionStartTime?: string;
  energyDispensedKwh?: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  category: StationCategory;
  coordinates: {
    xPct: number; // For interactive SVG/Canvas positioning
    yPct: number;
    lat: number;
    lng: number;
  };
  status: StationStatus;
  totalPorts: number;
  availablePorts: number;
  maxPowerKw: number; // e.g., 350
  basePricePerKwh: number;
  surgePriceMultiplier: number;
  solarCapacityKw: number;
  bessCapacityKwh: number;
  bessChargePct: number;
  gridDemandKw: number;
  amenities: string[];
  ports: ConnectorPort[];
  operatorName: string;
  investorGroup: string;
  roiPct: number;
  capexUsd: number;
  monthlyRevenueUsd: number;
  monthlySessionsCount: number;
  avgChargingTimeMinutes: number;
  uptimePct: number;
  carbonOffsetTonnesYr: number;
  rating: number;
}

export interface ActiveChargingSession {
  sessionId: string;
  stationId: string;
  stationName: string;
  portId: string;
  connectorType: ConnectorType;
  vehicleModel: string;
  maxPowerKw: number;
  startTime: string;
  initialSocPct: number;
  currentSocPct: number;
  targetSocPct: number;
  currentPowerKw: number;
  energyConsumedKwh: number;
  currentCostUsd: number;
  pricePerKwh: number;
  paymentMethod: 'Wallet' | 'Credit Card' | 'RFID Card' | 'Apple Pay';
  status: 'charging' | 'paused' | 'completed';
}

export interface UserWallet {
  balanceUsd: number;
  rfidTagNumber: string;
  autoTopUp: boolean;
  savedCards: {
    id: string;
    brand: string;
    last4: string;
  }[];
}

export interface ExpansionSiteProposal {
  id: string;
  siteName: string;
  city: string;
  coordinates: { xPct: number; yPct: number; lat: number; lng: number };
  targetChargerCount: number;
  transformerCapacityKva: number;
  nearbyPois: string;
  estimatedFootTraffic: string;
  targetInvestmentUsd: number;
  feasibilityScore?: number;
  roiMonths?: number;
  estimatedDailySessions?: number;
  recommendedConnectors?: { type: string; count: number }[];
  gridImpactAssessment?: string;
  capexEstimateUsd?: number;
  opexMonthlyUsd?: number;
  keyAdvantages?: string[];
  riskFactors?: string[];
  aiExecutiveSummary?: string;
  vahanDistrictId?: string;
  vahanDistrictName?: string;
  vahanRtoCode?: string;
  vahanTotalEvCount?: number;
  vahanE4wCount?: number;
  vahanYoyGrowthPct?: number;
  vahanEvToChargerRatio?: number;
  vahanDeficitScore?: number;
  vahanDemandScore?: number;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  sessionId: string;
  stationName: string;
  date: string;
  kwhDelivered: number;
  durationMinutes: number;
  ratePerKwh: number;
  sessionFeeUsd: number;
  taxUsd: number;
  totalUsd: number;
  paymentMethod: string;
  vehicleModel: string;
  carbonSavedKg: number;
}
