import React, { useState } from 'react';
import {
  ChargingStation,
  PredictiveMaintenanceAlert,
  MaintenanceWorkOrder,
  RiskSeverity,
} from '../types';
import {
  INITIAL_PREDICTIVE_ALERTS,
  INITIAL_WORK_ORDERS,
  INITIAL_SENSOR_HISTORIES,
} from '../data/mockMaintenance';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Wrench,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Activity,
  Cpu,
  Clock,
  Send,
  UserCheck,
  ShieldAlert,
  Flame,
  Zap,
  Filter,
  Plus,
  ArrowRight,
  Gauge,
  Thermometer,
  RotateCcw,
} from 'lucide-react';

interface PredictiveMaintenanceViewProps {
  stations: ChargingStation[];
  alerts: PredictiveMaintenanceAlert[];
  workOrders: MaintenanceWorkOrder[];
  onDispatchWorkOrder: (workOrder: MaintenanceWorkOrder) => void;
  onUpdateWorkOrderStatus: (workOrderId: string, status: MaintenanceWorkOrder['status'], notes?: string) => void;
  onUpdateAlertStatus: (alertId: string, status: PredictiveMaintenanceAlert['status']) => void;
}

export const PredictiveMaintenanceView: React.FC<PredictiveMaintenanceViewProps> = ({
  stations,
  alerts,
  workOrders,
  onDispatchWorkOrder,
  onUpdateWorkOrderStatus,
  onUpdateAlertStatus,
}) => {
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlertForDispatch, setSelectedAlertForDispatch] = useState<PredictiveMaintenanceAlert | null>(null);
  
  // Custom AI Prediction Trigger State
  const [aiPredictLoading, setAiPredictLoading] = useState(false);
  const [aiPredictResult, setAiPredictResult] = useState<any>(null);
  const [customStationId, setCustomStationId] = useState<string>(stations[0]?.id || '');
  const [customComponent, setCustomComponent] = useState<string>('Liquid Coolant Pump Loop #2');
  const [stressTemp, setStressTemp] = useState<number>(72);
  const [stressPressure, setStressPressure] = useState<number>(14.2);

  // Dispatch Modal Form State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [assignedTech, setAssignedTech] = useState('Alex Rivera (HV Certified)');
  const [workOrderPriority, setWorkOrderPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('Urgent');
  const [scheduledTime, setScheduledTime] = useState('Today, 2:00 PM - 4:00 PM');
  const [partsInput, setPartsInput] = useState('Coolant Pump Mod 350kW, Viton O-Ring Set, Dielectric Fluid');

  // Filter alerts
  const filteredAlerts = alerts.filter((alt) => {
    if (selectedStationFilter !== 'all' && alt.stationId !== selectedStationFilter) return false;
    if (severityFilter !== 'all' && alt.severity !== severityFilter) return false;
    return true;
  });

  // Execute AI Predictive Hardware Scan endpoint
  const handleRunAiPredictiveScan = async () => {
    setAiPredictLoading(true);
    const targetStation = stations.find((s) => s.id === customStationId) || stations[0];
    try {
      const res = await fetch('/api/gemini/predictive-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationName: targetStation.name,
          portId: 'Port #1',
          component: customComponent,
          junctionTempC: stressTemp,
          coolantPressurePsi: stressPressure,
          vibrationMs2: 3.6,
          currentRipplePct: 5.4,
          failureHistory: 'High operating temperature under peak fast-charging demand',
        }),
      });
      const data = await res.json();
      setAiPredictResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiPredictLoading(false);
    }
  };

  // Submit Work Order Dispatch
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForDispatch) return;

    const newWorkOrder: MaintenanceWorkOrder = {
      id: `WO-${Math.floor(9000 + Math.random() * 1000)}`,
      alertId: selectedAlertForDispatch.id,
      stationId: selectedAlertForDispatch.stationId,
      stationName: selectedAlertForDispatch.stationName,
      portId: selectedAlertForDispatch.portId,
      component: selectedAlertForDispatch.component,
      assignedTechnician: assignedTech,
      priority: workOrderPriority,
      scheduledTime: scheduledTime,
      requiredParts: partsInput.split(',').map((p) => p.trim()),
      status: 'Dispatched',
      createdAt: 'Just now',
    };

    onDispatchWorkOrder(newWorkOrder);
    onUpdateAlertStatus(selectedAlertForDispatch.id, 'dispatched');
    setShowDispatchModal(false);
    setSelectedAlertForDispatch(null);
  };

  const criticalCount = alerts.filter((a) => a.severity === 'Critical' && a.status !== 'resolved').length;
  const highCount = alerts.filter((a) => a.severity === 'High' && a.status !== 'resolved').length;
  const activeDispatches = workOrders.filter((w) => w.status === 'Dispatched' || w.status === 'In Progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Banner & Control Room Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F141C] p-4 rounded-lg border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              AI Predictive Hardware Maintenance & Failure Forecasting
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Continuous multi-sensor telemetry processing, component thermal/vibration anomaly analysis, and field technician dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {criticalCount} Critical Failure Risks
          </span>
        </div>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Sensors Monitored
          </span>
          <div className="text-2xl font-bold text-cyan-400 mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            248 Active
          </div>
          <span className="text-[10px] text-slate-500">Thermal, Vibration, Ripple & Pressure</span>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Active Predictions
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            {alerts.filter((a) => a.status !== 'resolved').length} Alerts
          </div>
          <span className="text-[10px] text-slate-500">{criticalCount} Critical • {highCount} High Risk</span>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Active Dispatches
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            {activeDispatches} Field Techs
          </div>
          <span className="text-[10px] text-slate-500">Scheduled Repair Work Orders</span>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Reliability MTBF
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-400" />
            14,800 Hrs
          </div>
          <span className="text-[10px] text-slate-500">System Availability 99.6%</span>
        </div>
      </div>

      {/* Interactive AI Stress Testing & Hardware Telemetry Simulator */}
      <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-4 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Live AI Multi-Sensor Hardware Failure Simulator
            </h3>
            <p className="text-[11px] text-slate-500">
              Inject live stress parameters (thermal junction °C, coolant pressure PSI) to test the predictive failure model in real time.
            </p>
          </div>

          <button
            onClick={handleRunAiPredictiveScan}
            disabled={aiPredictLoading}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiPredictLoading ? 'Executing AI Stress Scan...' : 'Run Live Predictive Analysis'}
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-1">Target Station</label>
            <select
              value={customStationId}
              onChange={(e) => setCustomStationId(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-1">Hardware Component</label>
            <select
              value={customComponent}
              onChange={(e) => setCustomComponent(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
            >
              <option value="Liquid Coolant Pump Loop #2">Liquid Coolant Pump Loop</option>
              <option value="DC Power Inverter Capacitor Bank">DC Power Inverter Capacitors</option>
              <option value="NACS Connector Latch Lock Solenoid">Connector Latch Solenoid</option>
              <option value="AC Contactor Arc Suppressor">AC Contactor Arc Suppressor</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-1">
              Junction Temp: <span className="text-amber-400 font-bold">{stressTemp}°C</span>
            </label>
            <input
              type="range"
              min={35}
              max={95}
              value={stressTemp}
              onChange={(e) => setStressTemp(+e.target.value)}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-1">
              Coolant Pressure: <span className="text-cyan-400 font-bold">{stressPressure} PSI</span>
            </label>
            <input
              type="range"
              min={8}
              max={35}
              step={0.5}
              value={stressPressure}
              onChange={(e) => setStressPressure(+e.target.value)}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* AI Predictive Result Display Box */}
        {aiPredictResult && (
          <div className="p-4 rounded bg-[#0A0D12] border border-purple-500/40 space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  {aiPredictResult.severity} RISK
                </span>
                <span className="font-bold text-slate-200 text-xs">
                  {aiPredictResult.componentTarget}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">
                  Failure Risk: <strong className="text-rose-400">{aiPredictResult.failureProbabilityPct}%</strong>
                </span>
                <span className="text-slate-400 text-xs">
                  Timeframe: <strong className="text-amber-400">{aiPredictResult.predictedTimeframe}</strong>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Root Cause Telemetry Analysis:</strong> {aiPredictResult.rootCauseAnalysis}
            </p>

            <div className="p-2.5 rounded bg-[#0F141C] border border-slate-800 text-xs font-sans text-emerald-400">
              <strong>Recommended Action:</strong> {aiPredictResult.recommendedAction}
            </div>

            {aiPredictResult.suggestedParts && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 uppercase text-[10px] font-bold font-mono">Suggested Parts:</span>
                <div className="flex flex-wrap gap-1 font-mono">
                  {aiPredictResult.suggestedParts.map((part: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Predictive Maintenance Alerts Stream & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F141C] p-3 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-400 uppercase text-[11px]">Filter Predictive Alerts:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Station Filter */}
            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              className="bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Stations ({alerts.length})</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Moderate">Moderate Only</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-[#0F141C] p-4 rounded-lg border space-y-3 font-mono text-xs shadow-xl transition-all ${
                alert.severity === 'Critical'
                  ? 'border-rose-500/50 hover:border-rose-500'
                  : alert.severity === 'High'
                  ? 'border-amber-500/50 hover:border-amber-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Alert Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : alert.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {alert.severity} ({alert.failureProbabilityPct}% Risk)
                    </span>
                    <span className="text-slate-500 text-[10px]">{alert.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 font-sans mt-1">
                    {alert.stationName} {alert.portNumber ? `• Port #${alert.portNumber}` : ''}
                  </h4>
                  <div className="text-amber-400 font-bold text-xs mt-0.5">{alert.component}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A0D12] text-slate-400 border border-slate-800 block">
                    {alert.predictedTimeframe}
                  </span>
                  <span
                    className={`text-[10px] mt-1 block uppercase font-bold ${
                      alert.status === 'dispatched'
                        ? 'text-emerald-400'
                        : alert.status === 'throttled'
                        ? 'text-amber-400'
                        : alert.status === 'resolved'
                        ? 'text-slate-500'
                        : 'text-rose-400'
                    }`}
                  >
                    Status: {alert.status}
                  </span>
                </div>
              </div>

              {/* Root Cause Technical Summary */}
              <div className="bg-[#0A0D12] p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                  Root Cause Technical Diagnosis:
                </span>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  {alert.rootCauseAnalysis}
                </p>
              </div>

              {/* Live Sensor Telemetry Snapshot */}
              <div className="grid grid-cols-4 gap-2 text-[10px] bg-[#0A0D12] p-2 rounded border border-slate-800 text-center">
                <div>
                  <span className="text-slate-500 block uppercase">Junction Temp</span>
                  <strong className={alert.sensorTelemetrySnapshot.junctionTempC > 65 ? 'text-rose-400' : 'text-slate-200'}>
                    {alert.sensorTelemetrySnapshot.junctionTempC}°C
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Coolant PSI</span>
                  <strong className={alert.sensorTelemetrySnapshot.coolantPressurePsi < 20 ? 'text-amber-400' : 'text-slate-200'}>
                    {alert.sensorTelemetrySnapshot.coolantPressurePsi} PSI
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Vibration</span>
                  <strong className="text-cyan-400">
                    {alert.sensorTelemetrySnapshot.vibrationMs2} m/s²
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Ripple %</span>
                  <strong className="text-purple-400">
                    {alert.sensorTelemetrySnapshot.currentRipplePct}%
                  </strong>
                </div>
              </div>

              {/* Recommended Action & Dispatch Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <span className="text-[11px] font-sans text-slate-400 line-clamp-1">
                  <strong className="text-emerald-400 font-mono">Action:</strong> {alert.recommendedAction}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'throttled')}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3 h-3" /> Auto-Throttle
                    </button>
                  )}

                  {alert.status !== 'dispatched' && alert.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        setSelectedAlertForDispatch(alert);
                        setShowDispatchModal(true);
                      }}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/20"
                    >
                      <Send className="w-3 h-3" /> Dispatch Field Tech
                    </button>
                  )}

                  {alert.status === 'dispatched' && (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Work Order Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Anomaly Line Chart Visualizer */}
      <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            24-Hour Telemetry Sensor Anomaly Curve (Thermal & Coolant Pressure)
          </h3>
          <span className="text-[10px] text-slate-500">I-101 Corridor HyperCharger Sensor Array #3</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={INITIAL_SENSOR_HISTORIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
              <ReferenceLine y={70} label="Temp Threshold" stroke="#f43f5e" strokeDasharray="3 3" />
              <ReferenceLine y={18} label="Pressure Drop Threshold" stroke="#f59e0b" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="tempC" name="Junction Temp (°C)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="coolantPsi" name="Coolant Pressure (PSI)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="vibrationMs2" name="Vibration (m/s²)" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Field Technician Work Orders Section */}
      <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Field Technician Repair Work Orders & Dispatches
            </h3>
            <p className="text-[11px] text-slate-500">
              Assigned technician status, scheduled maintenance windows, and parts inventories.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className="bg-[#0A0D12] p-3 rounded border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-200 font-mono">{wo.id}</strong>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      wo.priority === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : wo.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {wo.priority}
                  </span>
                  <span className="text-slate-400 font-sans font-semibold">{wo.stationName}</span>
                </div>

                <div className="mt-1 text-slate-400 font-sans">
                  Component: <strong className="text-amber-400 font-mono">{wo.component}</strong> • Tech: <strong className="text-slate-200">{wo.assignedTechnician}</strong>
                </div>

                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  Scheduled: {wo.scheduledTime} • Required Parts: {wo.requiredParts.join(', ')}
                </div>

                {wo.resolutionNotes && (
                  <div className="mt-1.5 p-2 rounded bg-[#0F141C] border border-emerald-500/30 text-emerald-400 text-[11px] font-sans">
                    <strong>Resolution Log:</strong> {wo.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    wo.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : wo.status === 'In Progress'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {wo.status}
                </span>

                {wo.status !== 'Resolved' && (
                  <button
                    onClick={() =>
                      onUpdateWorkOrderStatus(
                        wo.id,
                        'Resolved',
                        'Hardware component successfully swapped and tested under full 350kW load.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Work Order Modal */}
      {showDispatchModal && selectedAlertForDispatch && (
        <div className="fixed inset-0 z-50 bg-[#0A0D12]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F141C] border border-slate-800 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-400" />
                Dispatch Field Technician Work Order
              </h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3">
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Target Station & Component</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedAlertForDispatch.stationName} - ${selectedAlertForDispatch.component}`}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Assigned High Voltage Technician</label>
                <select
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="Alex Rivera (HV Certified)">Alex Rivera (Senior HV Certified Specialist)</option>
                  <option value="Samira Patel (Power Electronics)">Samira Patel (Power Electronics Specialist)</option>
                  <option value="Marcus Brody (Grid Integration)">Marcus Brody (Grid Integration Engineer)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Priority</label>
                  <select
                    value={workOrderPriority}
                    onChange={(e) => setWorkOrderPriority(e.target.value as any)}
                    className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="Urgent">Urgent (Within 4 hrs)</option>
                    <option value="High">High (Same Day)</option>
                    <option value="Medium">Medium (Scheduled)</option>
                    <option value="Low">Low (Routine)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Scheduled Window</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Required Replacement Parts</label>
                <input
                  type="text"
                  value={partsInput}
                  onChange={(e) => setPartsInput(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20"
                >
                  Dispatch Work Order Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
