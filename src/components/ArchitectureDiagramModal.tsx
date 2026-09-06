import React, { useState } from 'react';
import { X, Download, Maximize2, Layers, Cpu, Activity, Share2, Check, FileText } from 'lucide-react';

interface ArchitectureDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDiagramModal: React.FC<ArchitectureDiagramModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'workflow' | 'specs'>('architecture');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopySpec = () => {
    const specText = `VOLTGRID OS - ARCHITECTURE & NOC WORKFLOW SPECIFICATION
1. Platform Core: Cloud Ingestion (OCPP 2.0.1, WebSocket Telematics, Edge Diagnostics)
2. Three Persona Modules:
   - Driver Super-App (QR Pay, Verified Health HUD, 1-Tap SOS Incident Alert)
   - Reliability NOC Control Room (Real-time Telemetry, 1-Click Remote Remediation, Auto Work Orders)
   - CleanTech Investor Analytics (VAHAN District Heatmaps, CapEx / ROI Modeling)
3. Emergency SLA: 45-Minute Field Technician Auto-Dispatch with Parts Kit Mapping`;
    navigator.clipboard.writeText(specText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="architecture-illustrations-modal" 
        className="bg-[#0B0F17] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F141F]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-mono">
                  VoltGrid OS — System Architecture & Workflow Visuals
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
                  HD DIAGRAMS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official technical architecture and 5-step NOC incident remediation diagrams for presentations & documentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySpec}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied Specs' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0A0D14] px-4 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-2 font-semibold ${
              activeTab === 'architecture'
                ? 'bg-[#0B0F17] border-cyan-500/50 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>1. Multi-Tier System Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-2 font-semibold ${
              activeTab === 'workflow'
                ? 'bg-[#0B0F17] border-cyan-500/50 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>2. 5-Step Incident & NOC Remediation Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-2 font-semibold ${
              activeTab === 'specs'
                ? 'bg-[#0B0F17] border-cyan-500/50 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>3. Technical Components & Schemas</span>
          </button>
        </div>

        {/* Modal Body / Diagram Viewport */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#090C12]">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-xl group">
                <img
                  src="/src/assets/images/voltgrid_architecture_diagram_1787243847112.jpg"
                  alt="VoltGrid OS Multi-Tier Architecture Diagram"
                  className="w-full h-auto object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Figure 1.0: End-to-End IoT & Cloud Ingestion Architecture</span>
                </div>
              </div>

              {/* Architectural Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="text-cyan-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    DRIVER SUPER-APP TIER
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Verified real-time uptime HUD, dynamic QR code charging unlock, in-app digital wallet top-up, and 1-tap SOS emergency incident reporting.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    24/7 RELIABILITY NOC
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Real-time telematics stream (OCPP 2.0.1), 1-click remote pin actuator unlock pulse, dynamic power derating, and automated 45-min SLA field tech dispatch.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    VAHAN & INVESTOR ENGINE
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    District-level EV density analytics from VAHAN datasets, deficit scoring, CapEx/OpEx payback period simulation, and grid headroom optimization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-xl">
                <img
                  src="/src/assets/images/voltgrid_workflow_diagram_1787243866591.jpg"
                  alt="VoltGrid OS 5-Step Incident Remediation Workflow"
                  className="w-full h-auto object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Figure 2.0: Automated 5-Step NOC Recovery Sequence</span>
                </div>
              </div>

              {/* 5-Step Sequence Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-rose-400 font-bold block mb-1">01. SOS ALARM</span>
                  <p className="text-[11px] text-slate-400">Driver signals stuck gun or sensor detects overheat &gt; 65°C.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">02. NOC TRIAGE</span>
                  <p className="text-[11px] text-slate-400">Live sensor snapshot linked with telemetry diagnostics.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">03. 1-CLICK FIX</span>
                  <p className="text-[11px] text-slate-400">OCPP remote solenoid pulse (3000ms) or cold reboot sent.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">04. AUTO-REFUND</span>
                  <p className="text-[11px] text-slate-400">Session goodwill credit instantly added to driver wallet.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-1">05. DISPATCH</span>
                  <p className="text-[11px] text-slate-400">If unresolved, field specialist auto-dispatched with parts kit.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Key Protocol & Data Models
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The system relies on strict JSON schemas implementing <strong>OCPP 2.0.1</strong> for smart charging, bi-directional telemetry streams, and hardware actuator control.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-slate-300 space-y-1">
                    <strong className="text-cyan-400">Telemetry Payload (MeterValues)</strong>
                    <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                      <li>Active Power Import (kW)</li>
                      <li>State of Charge SoC (%)</li>
                      <li>Thermocouple Junction Temp (°C)</li>
                      <li>Ground Fault Loop Resistance (kΩ)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-slate-300 space-y-1">
                    <strong className="text-amber-400">NOC Remote Commands (OCPP Messages)</strong>
                    <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                      <li><code>UnlockConnector.req (PortId)</code></li>
                      <li><code>Reset.req (type: "Hard" | "Soft")</code></li>
                      <li><code>SetChargingProfile.req (Derated kW)</code></li>
                      <li><code>TriggerMessage.req (Diagnostics)</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F141F] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">●</span>
            <span>VoltGrid OS Architecture v4.2.0 Specification Document</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold transition-all"
          >
            Close Diagrams
          </button>
        </div>
      </div>
    </div>
  );
};
