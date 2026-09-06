import React, { useState } from 'react';
import { ControlIncidentAlert, ChargingStation, MaintenanceWorkOrder } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Zap,
  Lock,
  CreditCard,
  MonitorX,
  Car,
  RotateCcw,
  Unlock,
  Wrench,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Clock,
  Radio,
  Filter,
  Sparkles,
  PhoneCall,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ControlRoomAlertHubProps {
  incidents: ControlIncidentAlert[];
  stations: ChargingStation[];
  onTakeRemoteAction: (incidentId: string, actionType: string, notes?: string, refundAmount?: number) => void;
  onResolveIncident: (incidentId: string, resolutionNotes: string) => void;
  onDispatchTechFromIncident: (incident: ControlIncidentAlert) => void;
  onSimulateNewIncident: () => void;
}

export const ControlRoomAlertHub: React.FC<ControlRoomAlertHubProps> = ({
  incidents,
  stations,
  onTakeRemoteAction,
  onResolveIncident,
  onDispatchTechFromIncident,
  onSimulateNewIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const pendingCount = incidents.filter((i) => i.status === 'pending_review').length;
  const criticalCount = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'resolved').length;

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    return true;
  });

  const triggerActionFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gun_stuck':
        return Lock;
      case 'thermal_overheat':
        return Flame;
      case 'power_surge':
        return Zap;
      case 'payment_glitch':
        return CreditCard;
      case 'hardware_lockout':
        return MonitorX;
      case 'emergency_stop':
        return ShieldAlert;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="bg-[#0F141C] border border-slate-800 rounded-2xl p-5 shadow-2xl font-mono text-slate-200 space-y-5">
      {/* Control Room Top Telematics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-center shadow-lg shadow-rose-950">
              <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0F141C] animate-bounce">
                {criticalCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                NOC Central Control Incident & SOS Alert Desk
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live NOC Stream Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time driver distress signals, hardware anomaly alarms, and remote OCPP override controls.
            </p>
          </div>
        </div>

        {/* Quick Summary Counts & Simulation Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Pending Alerts</span>
              <span className="text-rose-400 font-bold">{pendingCount} Active</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block">Avg Response Time</span>
              <span className="text-emerald-400 font-bold">18 seconds</span>
            </div>
          </div>

          <button
            onClick={onSimulateNewIncident}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Live Anomaly</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 uppercase">OCPP 2.0.1 Confirmed</span>
        </div>
      )}

      {/* Main Split: Left Incident Queue, Right Incident Diagnostics & Command Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Incident Stream List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="flex-1 bg-[#0A0D12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-bold focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="Critical">🔴 Critical Only</option>
              <option value="High">🟠 High Only</option>
              <option value="Medium">🔵 Medium</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-[#0A0D12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-bold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="remotely_actioned">Remotely Actioned</option>
              <option value="technician_dispatched">Tech Dispatched</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Incidents Scrollable List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-[#0A0D12] border border-slate-800 rounded-xl text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                <p className="font-bold text-slate-400">Zero Active Malfunctions</p>
                <p className="text-[11px] mt-1">All charging network nodes operating at nominal SLA.</p>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const Icon = getCategoryIcon(inc.category);
                const isCritical = inc.severity === 'Critical';
                const isResolved = inc.status === 'resolved';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500'
                        : isResolved
                        ? 'bg-[#0A0D12]/60 hover:bg-[#0A0D12] border-slate-850 opacity-70'
                        : 'bg-[#0A0D12] hover:bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCritical
                              ? 'bg-rose-950 border border-rose-500/80 text-rose-400'
                              : 'bg-amber-950 border border-amber-500/80 text-amber-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-bold">{inc.id}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                isCritical
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                              }`}
                            >
                              {inc.severity}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-100 line-clamp-1 mt-0.5">
                            {inc.title}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{inc.reportedAt}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-850">
                      <span className="truncate max-w-[180px]">{inc.stationName} (Port #{inc.portNumber || 1})</span>
                      <span
                        className={`font-bold uppercase ${
                          inc.status === 'pending_review'
                            ? 'text-rose-400'
                            : inc.status === 'resolved'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {inc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Incident Detail Inspector & Remote Command Center (7 cols) */}
        <div className="lg:col-span-7 bg-[#0A0D12] border border-slate-800 rounded-xl p-4 space-y-4">
          {selectedIncident ? (
            <>
              {/* Incident Header & Live Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">{selectedIncident.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50 uppercase">
                      Source: {selectedIncident.source.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">• {selectedIncident.reportedAt}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    {selectedIncident.title}
                  </h3>
                </div>

                <div className="shrink-0">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border inline-flex items-center gap-1.5 ${
                      selectedIncident.status === 'pending_review'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                        : selectedIncident.status === 'resolved'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {selectedIncident.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Station, Vehicle & Port Diagnostics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#0F141C] p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Station Node</span>
                  <span className="font-bold text-slate-200 truncate block mt-0.5">
                    {selectedIncident.stationName}
                  </span>
                </div>
                <div className="bg-[#0F141C] p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Connector Port</span>
                  <span className="font-bold text-amber-400 block mt-0.5">
                    Port #{selectedIncident.portNumber || 1}
                  </span>
                </div>
                <div className="bg-[#0F141C] p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Driver / Vehicle</span>
                  <span className="font-bold text-slate-200 block mt-0.5 truncate">
                    {selectedIncident.vehicleModel || selectedIncident.driverName || 'N/A'}
                  </span>
                </div>
                <div className="bg-[#0F141C] p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Active Session</span>
                  <span className="font-bold text-cyan-400 block mt-0.5">
                    {selectedIncident.sessionId || 'SES-8820'}
                  </span>
                </div>
              </div>

              {/* Malfunction Telematics & Driver Narrative */}
              <div className="bg-[#0F141C] p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Incident Description & On-Site Observation
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedIncident.description}
                </p>

                {selectedIncident.remoteActionsTaken && selectedIncident.remoteActionsTaken.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      Executed Control Room Actions:
                    </span>
                    <ul className="text-[11px] text-slate-300 space-y-0.5">
                      {selectedIncident.remoteActionsTaken.map((act, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* REMOTE REMEDIATION COMMAND DECK */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                  <span>Remote Control Remediation Commands (OCPP 2.0.1)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Encrypted TLS Link</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Command 1: Force Unlock Connector */}
                  <button
                    onClick={() => {
                      onTakeRemoteAction(
                        selectedIncident.id,
                        `Sent OCPP 'UnlockConnector' pulse to Port #${selectedIncident.portNumber || 1}. Solenoid disengaged.`
                      );
                      triggerActionFeedback(`Remote Force Unlock pulse transmitted to Port #${selectedIncident.portNumber || 1}`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Force Unlock Gun</div>
                      <div className="text-[10px] text-slate-500">OCPP UnlockConnector pulse</div>
                    </div>
                  </button>

                  {/* Command 2: Hard Remote Power Cycle */}
                  <button
                    onClick={() => {
                      onTakeRemoteAction(
                        selectedIncident.id,
                        `Initiated hard OCPP 'Reset (Hard)' to ${selectedIncident.stationName}. Controller rebooting.`
                      );
                      triggerActionFeedback(`Hardware Reset initiated for ${selectedIncident.stationName}`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Hard Reboot Station</div>
                      <div className="text-[10px] text-slate-500">Cycle contactors & OS board</div>
                    </div>
                  </button>

                  {/* Command 3: Auto-Dispatch Priority Tech */}
                  <button
                    onClick={() => {
                      onDispatchTechFromIncident(selectedIncident);
                      triggerActionFeedback(`Field technician Alex Rivera auto-dispatched with replacement parts.`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Dispatch Priority Tech</div>
                      <div className="text-[10px] text-slate-500">Generate urgent Work Order</div>
                    </div>
                  </button>

                  {/* Command 4: Issue $10 Wallet Credit & Refund */}
                  <button
                    onClick={() => {
                      onTakeRemoteAction(
                        selectedIncident.id,
                        `Issued $10.00 goodwill credit to driver wallet and waived session fee.`,
                        undefined,
                        10.00
                      );
                      triggerActionFeedback(`$10.00 Goodwill credit deposited to driver wallet.`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Issue $10 Refund</div>
                      <div className="text-[10px] text-slate-500">Instant goodwill wallet credit</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolve Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NOC Direct Line Connected</span>
                </div>

                {selectedIncident.status !== 'resolved' ? (
                  <button
                    onClick={() => {
                      onResolveIncident(selectedIncident.id, 'Incident confirmed resolved via remote telemetry diagnostic.');
                      triggerActionFeedback(`Incident ${selectedIncident.id} closed and marked Resolved.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Confirm Resolved & Close Ticket</span>
                  </button>
                ) : (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ticket Closed & Archived
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select an incident from the queue to view telemetry and remote control options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
