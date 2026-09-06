import React from 'react';
import { RolePersona } from '../types';
import { Zap, ShieldCheck, TrendingUp, Compass, Activity, Car, RefreshCw, Layers, Wrench, Shield, QrCode, Database, Flame, ShieldAlert } from 'lucide-react';

interface HeaderNavbarProps {
  currentRole: RolePersona;
  onSelectRole: (role: RolePersona) => void;
  totalStations: number;
  availablePorts: number;
  totalPorts: number;
  networkUptime: number;
  activeRevenue: number;
  showHeatmap: boolean;
  activeIncidentsCount?: number;
  onToggleHeatmap: () => void;
  onSimulateTelemetryUpdate: () => void;
  onOpenPermissionsModal: () => void;
  onOpenQrPaymentModal?: () => void;
  onOpenIncidentModal?: () => void;
  onOpenDiagramsModal?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  onSelectRole,
  totalStations,
  availablePorts,
  totalPorts,
  networkUptime,
  activeRevenue,
  showHeatmap,
  activeIncidentsCount = 0,
  onToggleHeatmap,
  onSimulateTelemetryUpdate,
  onOpenPermissionsModal,
  onOpenQrPaymentModal,
  onOpenIncidentModal,
  onOpenDiagramsModal,
}) => {
  return (
    <header className="bg-[#0F141C] border-b border-slate-800 text-slate-300 sticky top-0 z-40 shadow-2xl">
      {/* Top Banner: Real-time network telematics ticker */}
      <div className="bg-[#0A0D12] px-4 py-1.5 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              v4.2.0-LIVE
            </span>
            {activeIncidentsCount > 0 ? (
              <button
                onClick={onOpenIncidentModal}
                className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 border border-rose-500/80 text-rose-300 font-mono flex items-center gap-1.5 animate-pulse hover:bg-rose-900"
              >
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                <span>{activeIncidentsCount} ACTIVE NOC ALERTS</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                SYSTEM NOMINAL
              </span>
            )}
          </div>

          <span className="text-slate-700">|</span>
          <span>
            Stations: <strong className="text-white font-bold">{totalStations}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Ports Open: <strong className="text-emerald-400 font-bold">{availablePorts}</strong>/{totalPorts}
          </span>
          <span className="text-slate-700">|</span>
          <span>
            SLA Uptime: <strong className="text-cyan-400 font-bold">{networkUptime}%</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Revenue Today: <strong className="text-amber-400 font-bold">${activeRevenue.toLocaleString()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHeatmap}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            {showHeatmap ? 'Heatmap: ON' : 'Heatmap'}
          </button>

          <button
            onClick={onSimulateTelemetryUpdate}
            title="Simulate live grid load & vehicle telemetry pulses"
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Pulse
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shadow-emerald-500/20">
            EV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white font-sans">
                VOLT<span className="text-emerald-500">CORE</span> OPS
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">High Density Grid Operations & EV Infrastructure</p>
          </div>
        </div>

        {/* Role Persona Switcher & RBAC Matrix Inspector Button */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <div className="bg-[#0A0D12] p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => onSelectRole('driver')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'driver'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driver App</span>
            </button>

            <button
              onClick={() => onSelectRole('operator')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'operator'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Control Room</span>
            </button>

            <button
              onClick={() => onSelectRole('maintenance')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'maintenance'
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Predictive Maint</span>
            </button>

            <button
              onClick={() => onSelectRole('investor')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'investor'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investor Portal</span>
            </button>

            <button
              onClick={() => onSelectRole('planner')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'planner'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Site Expansion</span>
            </button>

            <button
              onClick={() => onSelectRole('vahan')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'vahan'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/30'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-900 border border-emerald-500/30'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>Vahan EV Density</span>
            </button>

            <button
              onClick={() => onSelectRole('blr_heatmap')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentRole === 'blr_heatmap'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                  : 'text-rose-400/90 hover:text-rose-300 hover:bg-slate-900 border border-rose-500/30'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Bengaluru Viability Heatmap</span>
            </button>
          </div>

          {onOpenDiagramsModal && (
            <button
              onClick={onOpenDiagramsModal}
              title="View Visual System Architecture & NOC Workflow Diagrams"
              className="px-2.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition-all shrink-0"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>HD Diagrams</span>
            </button>
          )}

          {onOpenIncidentModal && (
            <button
              onClick={onOpenIncidentModal}
              title="Report Emergency Malfunction or Send Alert to Control Room"
              className="px-2.5 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-all shrink-0"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>SOS / Alert Control</span>
            </button>
          )}

          {onOpenQrPaymentModal && (
            <button
              onClick={onOpenQrPaymentModal}
              title="Scan Charger QR Code or Pay via UPI/Wallet"
              className="px-2.5 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 border border-emerald-400 text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Pay</span>
            </button>
          )}

          <button
            onClick={onOpenPermissionsModal}
            title="Inspect Role Permissions & Capability Matrix"
            className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">RBAC Roles</span>
          </button>
        </div>
      </div>
    </header>
  );
};

