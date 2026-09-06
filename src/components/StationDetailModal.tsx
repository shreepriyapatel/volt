import React, { useState } from 'react';
import { ChargingStation, ConnectorPort } from '../types';
import { X, Zap, Battery, Sun, Cpu, CheckCircle2, ShieldAlert, DollarSign, Clock, Star, MapPin, Activity, Navigation, Play, Lock, QrCode } from 'lucide-react';

interface StationDetailModalProps {
  station: ChargingStation | null;
  onClose: () => void;
  onStartSession?: (station: ChargingStation, port: ConnectorPort) => void;
  onReservePort?: (station: ChargingStation, port: ConnectorPort) => void;
  onRemoteDiagnostics?: (station: ChargingStation) => void;
  onOpenQrPayment?: (station: ChargingStation, port?: ConnectorPort) => void;
  onReportIncident?: (station: ChargingStation, port?: ConnectorPort) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onStartSession,
  onReservePort,
  onRemoteDiagnostics,
  onOpenQrPayment,
  onReportIncident,
}) => {
  const [selectedPort, setSelectedPort] = useState<ConnectorPort | null>(null);

  if (!station) return null;

  const currentRate = (station.basePricePerKwh * station.surgePriceMultiplier).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D12]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F141C] border border-slate-800 rounded-lg w-full max-w-3xl shadow-2xl overflow-hidden my-8 font-mono">
        {/* Header */}
        <div className="bg-[#0A0D12] px-4 py-3 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{station.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    station.status === 'operational'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : station.status === 'busy'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {station.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-sans">
                <MapPin className="w-3 h-3 text-slate-500" />
                {station.address}, {station.city}, {station.state}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0F141C] text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#0A0D12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Available Ports</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {station.availablePorts} / {station.totalPorts}
              </div>
              <span className="text-[10px] text-slate-500">Ready</span>
            </div>

            <div className="bg-[#0A0D12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Max Output</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {station.maxPowerKw} kW
              </div>
              <span className="text-[10px] text-slate-500">Ultra-Fast</span>
            </div>

            <div className="bg-[#0A0D12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Dynamic Tariff</span>
              <div className="text-base font-bold text-slate-100 mt-0.5">
                ${currentRate} / kWh
              </div>
              <span className="text-[10px] text-slate-500">
                {station.surgePriceMultiplier > 1 ? `Surge ${station.surgePriceMultiplier}x` : 'Off-Peak'}
              </span>
            </div>

            <div className="bg-[#0A0D12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">SLA & Rating</span>
              <div className="text-base font-bold text-cyan-400 mt-0.5">
                {station.uptimePct}%
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {station.rating} Score
              </span>
            </div>
          </div>

          {/* Microgrid Infrastructure Specs (Solar & Battery) */}
          <div className="bg-[#0A0D12] p-3 rounded border border-slate-800 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Microgrid Telematics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded bg-[#0F141C] border border-slate-800">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Solar Array</span>
                  <span className="font-bold text-slate-200">{station.solarCapacityKw} kW Peak</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded bg-[#0F141C] border border-slate-800">
                <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">BESS Battery</span>
                  <span className="font-bold text-slate-200">
                    {station.bessCapacityKwh} kWh ({station.bessChargePct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded bg-[#0F141C] border border-slate-800">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Grid Draw</span>
                  <span className="font-bold text-slate-200">{station.gridDemandKw} kW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Ports Live Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Ports Telematics
              </h3>

              {onRemoteDiagnostics && (
                <button
                  onClick={() => onRemoteDiagnostics(station)}
                  className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Activity className="w-3 h-3" /> Diagnostic Audit
                </button>
              )}
            </div>

            <div className="bg-[#0A0D12] border border-slate-800 rounded divide-y divide-slate-800">
              {station.ports.map((port) => (
                <div
                  key={port.id}
                  className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-[#0F141C] border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      #{port.portNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{port.type}</span>
                        <span className="px-1 py-0.5 rounded text-[9px] bg-[#0F141C] text-amber-300 border border-slate-800">
                          {port.maxPowerKw} kW
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {port.status === 'charging' ? (
                          <span className="text-amber-400">
                            Charging: {port.vehicleModel || 'EV'} • {port.currentPowerKw}kW ({port.batterySocPct}% SOC)
                          </span>
                        ) : (
                          <span>Rate: ${port.pricePerKwh}/kWh</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        port.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : port.status === 'charging'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : port.status === 'reserved'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {port.status}
                    </span>

                    {port.status === 'available' && onStartSession && (
                      <button
                        onClick={() => onStartSession(station, port)}
                        className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-slate-950" /> Start
                      </button>
                    )}

                    {port.status === 'available' && onOpenQrPayment && (
                      <button
                        onClick={() => onOpenQrPayment(station, port)}
                        className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-[10px] flex items-center gap-1 transition-all"
                        title="Scan or Pay via QR Code"
                      >
                        <QrCode className="w-3 h-3" /> QR Pay
                      </button>
                    )}

                    {port.status === 'available' && onReservePort && (
                      <button
                        onClick={() => onReservePort(station, port)}
                        className="px-2.5 py-1 rounded bg-[#0F141C] hover:bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3 text-slate-400" /> Reserve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities & Operator Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#0A0D12] p-3 rounded border border-slate-800">
              <h4 className="font-bold text-slate-300 mb-1.5 text-[11px] uppercase">Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {station.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#0F141C] text-slate-400 rounded border border-slate-800 text-[10px]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0D12] p-3 rounded border border-slate-800 text-[11px]">
              <h4 className="font-bold text-slate-300 mb-1.5 uppercase">Network Info</h4>
              <p className="text-slate-500">
                Operator: <strong className="text-slate-300">{station.operatorName}</strong>
              </p>
              <p className="text-slate-500 mt-0.5">
                Investor: <strong className="text-slate-300">{station.investorGroup}</strong>
              </p>
              <p className="text-slate-500 mt-0.5">
                Carbon Offset: <strong className="text-emerald-400">{station.carbonOffsetTonnesYr} tonnes CO₂/yr</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0A0D12] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[10px]">ID: {station.id}</span>
            {onReportIncident && (
              <button
                onClick={() => onReportIncident(station, selectedPort || undefined)}
                className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold text-[10px] flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Report Issue to Control</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#0F141C] hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
