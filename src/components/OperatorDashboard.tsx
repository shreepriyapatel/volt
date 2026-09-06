import React, { useState } from 'react';
import { ChargingStation, ConnectorPort, ControlIncidentAlert } from '../types';
import { ControlRoomAlertHub } from './ControlRoomAlertHub';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Activity, Zap, Cpu, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, Sliders, Battery, Sun, DollarSign, Power, CheckCircle2, Flame, Wrench, ShieldAlert
} from 'lucide-react';

interface OperatorDashboardProps {
  stations: ChargingStation[];
  incidents: ControlIncidentAlert[];
  onUpdateStationPrice: (stationId: string, multiplier: number) => void;
  onRunDiagnostics: (station: ChargingStation) => void;
  onRemotePortAction: (stationId: string, portId: string, action: 'reboot' | 'pause' | 'available') => void;
  onTakeRemoteAction: (incidentId: string, actionType: string, notes?: string, refundAmount?: number) => void;
  onResolveIncident: (incidentId: string, resolutionNotes: string) => void;
  onDispatchTechFromIncident: (incident: ControlIncidentAlert) => void;
  onSimulateNewIncident: () => void;
  onOpenReportIncidentModal?: (stationId?: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  stations,
  incidents,
  onUpdateStationPrice,
  onRunDiagnostics,
  onRemotePortAction,
  onTakeRemoteAction,
  onResolveIncident,
  onDispatchTechFromIncident,
  onSimulateNewIncident,
  onOpenReportIncidentModal,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');
  const [aiLoadLoading, setAiLoadLoading] = useState(false);
  const [aiLoadResult, setAiLoadResult] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'telemetry'>('incidents');

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Grid Telemetry 24-hour Load Forecast Curve
  const loadCurveData = [
    { time: '00:00', gridLoadKw: 80, solarKw: 0, bessBufferKw: 20, tariffRate: 0.22 },
    { time: '04:00', gridLoadKw: 60, solarKw: 0, bessBufferKw: 10, tariffRate: 0.20 },
    { time: '08:00', gridLoadKw: 180, solarKw: 45, bessBufferKw: 30, tariffRate: 0.32 },
    { time: '12:00', gridLoadKw: 260, solarKw: 120, bessBufferKw: 60, tariffRate: 0.38 },
    { time: '16:00', gridLoadKw: 380, solarKw: 65, bessBufferKw: 110, tariffRate: 0.49 }, // Peak
    { time: '20:00', gridLoadKw: 310, solarKw: 10, bessBufferKw: 80, tariffRate: 0.44 },
    { time: '23:00', gridLoadKw: 140, solarKw: 0, bessBufferKw: 30, tariffRate: 0.26 },
  ];

  // Call AI Load Optimization endpoint
  const handleTriggerAiLoadForecast = async () => {
    setAiLoadLoading(true);
    try {
      const res = await fetch('/api/gemini/load-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: selectedStation?.id,
          currentLoadKw: selectedStation?.gridDemandKw,
          solarGenKw: selectedStation?.solarCapacityKw,
          batteryLevelPct: selectedStation?.bessChargePct,
          gridTariffRate: selectedStation?.basePricePerKwh,
        }),
      });
      const data = await res.json();
      setAiLoadResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoadLoading(false);
    }
  };

  const totalGridDemand = stations.reduce((acc, s) => acc + s.gridDemandKw, 0);
  const totalBessCapacity = stations.reduce((acc, s) => acc + s.bessCapacityKwh, 0);
  const faultedPorts = stations.flatMap((s) => s.ports).filter((p) => p.status === 'faulted' || p.status === 'offline');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F141C] p-4 rounded-lg border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
              Control Room Telemetry & Grid Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time grid demand management, remote port telemetry, dynamic pricing, and AI load balancing.
          </p>
        </div>

        {/* Station Selector Dropdown */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <label className="text-slate-500 whitespace-nowrap uppercase text-[10px] font-bold">Station:</label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
          >
            {stations.map((s) => {
              const uptime = s.uptimePct ?? 99.2;
              const isFaulted = s.status === 'faulted' || s.status === 'offline';
              const isDegraded = s.status === 'degraded' || (s.ports && s.ports.some(p => p.status === 'faulted' || p.status === 'offline'));
              const tag = isFaulted ? '🔴 OFFLINE' : isDegraded ? '🟡 DEGRADED' : '🟢 ONLINE';
              return (
                <option key={s.id} value={s.id}>
                  {tag} {s.name} ({uptime}%)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Operator Sub-Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'incidents'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-[#0F141C] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NOC Live Incidents & SOS Desk</span>
            {incidents.filter((i) => i.status === 'pending_review').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[10px] font-black">
                {incidents.filter((i) => i.status === 'pending_review').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'telemetry'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-[#0F141C] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Grid Curves & Load Optimizer</span>
          </button>
        </div>

        {onOpenReportIncidentModal && (
          <button
            onClick={() => onOpenReportIncidentModal(selectedStationId)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all font-mono"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Send Alert to Control</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: NOC INCIDENT ALERT HUB */}
      {activeSubTab === 'incidents' && (
        <ControlRoomAlertHub
          incidents={incidents}
          stations={stations}
          onTakeRemoteAction={onTakeRemoteAction}
          onResolveIncident={onResolveIncident}
          onDispatchTechFromIncident={onDispatchTechFromIncident}
          onSimulateNewIncident={onSimulateNewIncident}
        />
      )}

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Station Reliability</span>
          <div className="text-2xl font-bold font-mono mt-1 flex items-center gap-2">
            {(() => {
              const uptime = selectedStation.uptimePct ?? 99.2;
              const isFaulted = selectedStation.status === 'faulted' || selectedStation.status === 'offline';
              const isDegraded = selectedStation.status === 'degraded' || (selectedStation.ports && selectedStation.ports.some(p => p.status === 'faulted' || p.status === 'offline'));
              if (isFaulted) return <span className="text-rose-400 font-black">{uptime}% (Offline)</span>;
              if (isDegraded) return <span className="text-amber-400 font-black">{uptime}% (Degraded)</span>;
              return <span className="text-emerald-400 font-black">{uptime}% (Nominal)</span>;
            })()}
          </div>
          <span className="text-[11px] font-mono text-slate-500">30-Day SLA & MTBF Telematics</span>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">BESS Storage Buffer</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" />
            {totalBessCapacity} kWh
          </div>
          <span className="text-[11px] font-mono text-slate-500">Microgrid Storage Capacity</span>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Surge Factor</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {selectedStation.surgePriceMultiplier}x
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={() => onUpdateStationPrice(selectedStation.id, 1.0)}
              className="px-2 py-0.5 rounded bg-[#0A0D12] hover:bg-slate-900 text-slate-300 border border-slate-800"
            >
              1.0x Base
            </button>
            <button
              onClick={() => onUpdateStationPrice(selectedStation.id, 1.25)}
              className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
            >
              1.25x Peak
            </button>
          </div>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Health Status</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${faultedPorts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {faultedPorts.length} Faults
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {faultedPorts.length > 0 ? 'Diagnostic inspection required' : 'System nominal'}
          </span>
        </div>
      </div>

      {/* AI Load Management & Dynamic Pricing Advisor */}
      <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Predictive Load & Dynamic Tariff Engine
            </h3>
            <p className="text-[11px] font-mono text-slate-500">
              Predicts grid demand spikes and optimizes BESS discharge curves.
            </p>
          </div>

          <button
            onClick={handleTriggerAiLoadForecast}
            disabled={aiLoadLoading}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiLoadLoading ? 'Analyzing Grid...' : 'Run AI Load Advisory'}
          </button>
        </div>

        {/* AI Load Recommendation Result Card */}
        {aiLoadResult && (
          <div className="p-3 rounded bg-purple-950/30 border border-purple-500/40 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Optimization Recommendation
              </span>
              <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Suggested Rate: ${aiLoadResult.optimalDynamicPricePerKwh}/kWh
              </span>
            </div>

            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              {aiLoadResult.aiLoadActionRecommendation}
            </p>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-purple-900/60">
              <div>
                <span className="text-slate-500 block">Peak Warning</span>
                <strong className={aiLoadResult.gridPeakWarning ? 'text-rose-400' : 'text-emerald-400'}>
                  {aiLoadResult.gridPeakWarning ? 'Active Grid Spike' : 'Normal Load'}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block">BESS Discharge</span>
                <strong className="text-cyan-400">{aiLoadResult.suggestedBessDischargeKw} kW</strong>
              </div>

              <div>
                <span className="text-slate-500 block">Optimal Tariff</span>
                <strong className="text-amber-400">${aiLoadResult.optimalDynamicPricePerKwh}/kWh</strong>
              </div>
            </div>
          </div>
        )}

        {/* 24-Hour Load Curve Visualization */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={loadCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="gridLoadKw" name="Grid Load (kW)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="solarKw" name="Solar Gen (kW)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="bessBufferKw" name="BESS Discharge (kW)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Station Ports Diagnostics & Remote Control */}
      <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-400" />
              Port Telematics & Remote Controls
            </h3>
            <p className="text-[11px] text-slate-500">
              Live port status for <strong className="text-slate-200">{selectedStation.name}</strong>
            </p>
          </div>

          <button
            onClick={() => onRunDiagnostics(selectedStation)}
            className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" /> AI Diagnostic Audit
          </button>
        </div>

        {/* Ports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {selectedStation.ports.map((port) => (
            <div
              key={port.id}
              className="bg-[#0A0D12] p-3 rounded border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Port #{port.portNumber}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      port.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : port.status === 'charging'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {port.status}
                  </span>
                </div>

                <div className="mt-1 text-[11px]">
                  <div className="font-bold text-slate-300">{port.type}</div>
                  <div className="text-slate-500">Max: {port.maxPowerKw} kW</div>
                </div>

                {port.status === 'charging' && (
                  <div className="mt-2 p-1.5 rounded bg-[#0F141C] border border-slate-800 text-[10px] space-y-0.5">
                    <div className="text-slate-300">{port.vehicleModel}</div>
                    <div className="text-amber-400 font-bold">{port.currentPowerKw} kW • {port.batterySocPct}% SOC</div>
                    <div className="text-slate-500">{port.voltageV}V / {port.currentAmp}A</div>
                  </div>
                )}
              </div>

              {/* Remote Control Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                <button
                  onClick={() => onRemotePortAction(selectedStation.id, port.id, 'reboot')}
                  className="px-2 py-1 rounded bg-[#0F141C] hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-800 transition-colors"
                >
                  Reboot
                </button>

                {port.status === 'charging' ? (
                  <button
                    onClick={() => onRemotePortAction(selectedStation.id, port.id, 'pause')}
                    className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/40 transition-colors"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => onRemotePortAction(selectedStation.id, port.id, 'available')}
                    className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/40 transition-colors"
                  >
                    Set Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
