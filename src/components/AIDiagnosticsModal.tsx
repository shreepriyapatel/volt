import React, { useState, useEffect } from 'react';
import { ChargingStation } from '../types';
import { X, Sparkles, Wrench, AlertTriangle, CheckCircle2, ShieldAlert, Activity, Cpu } from 'lucide-react';

interface AIDiagnosticsModalProps {
  station: ChargingStation | null;
  onClose: () => void;
}

export const AIDiagnosticsModal: React.FC<AIDiagnosticsModalProps> = ({ station, onClose }) => {
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [errorSymptoms, setErrorSymptoms] = useState('High junction temperature alarm under 300A load, current throttled');
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  useEffect(() => {
    if (station && station.ports.length > 0) {
      setSelectedPortId(station.ports[0].id);
    }
  }, [station]);

  if (!station) return null;

  const selectedPort = station.ports.find((p) => p.id === selectedPortId) || station.ports[0];

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationName: station.name,
          chargerId: `Port #${selectedPort?.portNumber} (${selectedPort?.type} ${selectedPort?.maxPowerKw}kW)`,
          errorLogs: errorSymptoms,
          temperatureC: selectedPort?.temperatureC || 62,
          voltageDropPct: 3.2,
        }),
      });

      const data = await res.json();
      setDiagnosticResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D12]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F141C] border border-slate-800 rounded-lg w-full max-w-xl shadow-2xl overflow-hidden font-mono my-8">
        {/* Header */}
        <div className="bg-[#0A0D12] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                AI Fast-Charger Diagnostics
              </h3>
              <p className="text-[10px] text-slate-500">{station.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0F141C] text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Target Charger Selector */}
          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Target Charger Port</label>
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {station.ports.map((p) => (
                <option key={p.id} value={p.id}>
                  Port #{p.portNumber} - {p.type} ({p.maxPowerKw}kW) - {p.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Observed Symptoms Input */}
          <div>
            <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Telemetry Logs / Fault Symptoms</label>
            <textarea
              rows={3}
              value={errorSymptoms}
              onChange={(e) => setErrorSymptoms(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            {loading ? 'Analyzing Telemetry...' : 'Execute AI Fault Audit'}
          </button>

          {/* Diagnostic Result */}
          {diagnosticResult && (
            <div className="p-3 rounded bg-[#0A0D12] border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5 text-xs">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Finding
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    diagnosticResult.healthStatus === 'Healthy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {diagnosticResult.healthStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-slate-500">Fault Code:</span> <strong className="text-amber-400">{diagnosticResult.faultCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Probable Cause:</span> <span className="text-slate-200">{diagnosticResult.probableCause}</span>
                </div>
                <div>
                  <span className="text-slate-500">Action:</span> <span className="text-emerald-400 font-semibold">{diagnosticResult.recommendedAction}</span>
                </div>
                <div>
                  <span className="text-slate-500">Urgency:</span> <strong className="text-rose-400">{diagnosticResult.urgency}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
