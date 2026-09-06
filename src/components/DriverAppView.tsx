import React, { useState } from 'react';
import { ActiveChargingSession, ChargingStation, PaymentReceipt, UserWallet, ControlIncidentAlert } from '../types';
import { CarbonReductionD3Chart } from './CarbonReductionD3Chart';
import {
  Car, BatteryCharging, Zap, Wallet, Navigation, Clock, ShieldCheck, Sparkles, MapPin, CreditCard, ArrowRight, CheckCircle2, Download, Play, Square, RefreshCcw, QrCode, Leaf, AlertTriangle, ShieldAlert, PhoneCall, Unlock
} from 'lucide-react';

interface DriverAppViewProps {
  stations: ChargingStation[];
  activeSession: ActiveChargingSession | null;
  userWallet: UserWallet;
  paymentReceipts: PaymentReceipt[];
  activeIncidents?: ControlIncidentAlert[];
  onStopActiveSession: () => void;
  onTopUpWallet: (amount: number) => void;
  onSelectStation: (station: ChargingStation) => void;
  onOpenQrPaymentModal?: () => void;
  onOpenReportIncident?: (stationId?: string, portNumber?: number) => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  stations,
  activeSession,
  userWallet,
  paymentReceipts,
  activeIncidents = [],
  onStopActiveSession,
  onTopUpWallet,
  onSelectStation,
  onOpenQrPaymentModal,
  onOpenReportIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'charging' | 'planner' | 'wallet'>('charging');

  // Route Planner State
  const [origin, setOrigin] = useState('Bengaluru (Electronic City)');
  const [destination, setDestination] = useState('Mysuru (NH-275 Expressway)');
  const [evModel, setEvModel] = useState('Tata Nexon EV Max');
  const [currentSoc, setCurrentSoc] = useState(38);
  const [aiRouteLoading, setAiRouteLoading] = useState(false);
  const [aiRouteResult, setAiRouteResult] = useState<any>(null);

  // Call AI Route Planner Endpoint
  const handlePlanRoute = async () => {
    setAiRouteLoading(true);
    try {
      const res = await fetch('/api/gemini/route-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLocation: origin,
          destination,
          evModel,
          currentBatteryPct: currentSoc,
        }),
      });
      const data = await res.json();
      setAiRouteResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiRouteLoading(false);
    }
  };

  // Generate & download CSV of payment receipts
  const handleDownloadReceiptsCsv = () => {
    if (!paymentReceipts || paymentReceipts.length === 0) return;

    const headers = [
      'Receipt ID',
      'Session ID',
      'Station Name',
      'Date',
      'Energy (kWh)',
      'Duration (Mins)',
      'Rate ($/kWh)',
      'Session Fee ($)',
      'Tax ($)',
      'Total ($)',
      'Payment Method',
      'Vehicle Model',
      'Carbon Saved (kg)',
    ];

    const rows = paymentReceipts.map((r) => [
      `"${r.id || ''}"`,
      `"${r.sessionId || ''}"`,
      `"${(r.stationName || '').replace(/"/g, '""')}"`,
      `"${r.date || ''}"`,
      r.kwhDelivered ?? 0,
      r.durationMinutes ?? 0,
      r.ratePerKwh ?? 0,
      r.sessionFeeUsd ?? 0,
      r.taxUsd ?? 0,
      r.totalUsd ?? 0,
      `"${r.paymentMethod || ''}"`,
      `"${(r.vehicleModel || '').replace(/"/g, '""')}"`,
      r.carbonSavedKg ?? 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `charging_payment_receipts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation Tabs for EV Driver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            <Car className="w-5 h-5 text-emerald-400" /> Driver Telematics & Charging Portal
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time charging telematics, route planner, and digital wallet payment history.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          {onOpenReportIncident && (
            <button
              onClick={() => onOpenReportIncident(activeSession?.stationId)}
              className="px-3 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>SOS / Report Issue</span>
            </button>
          )}

          <div className="bg-[#0F141C] p-1 rounded border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('charging')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'charging'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>Active Session</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'planner'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'wallet'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet & Receipts</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ACTIVE CHARGING SESSION SCREEN */}
      {activeTab === 'charging' && (
        <div className="space-y-4">
          {/* Active Control Incident Feedback Banner */}
          {activeIncidents.filter((i) => i.status !== 'resolved').length > 0 && (
            <div className="bg-rose-950/40 border border-rose-500/60 rounded-xl p-4 space-y-2 font-mono text-xs text-rose-200 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>Live Incident Transmitted to NOC Control Room</span>
                </div>
                <span className="text-[10px] bg-rose-950 border border-rose-500/40 px-2 py-0.5 rounded uppercase font-bold text-rose-300">
                  NOC Active
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                {activeIncidents[0].title}
              </p>
              {activeIncidents[0].remoteActionsTaken && activeIncidents[0].remoteActionsTaken.length > 0 && (
                <div className="bg-[#0A0D12]/80 p-2.5 rounded-lg border border-emerald-500/40 text-emerald-300 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Remote Remediation from Control Room:
                  </span>
                  {activeIncidents[0].remoteActionsTaken.map((act, idx) => (
                    <div key={idx} className="text-slate-200 pl-4">
                      • {act}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSession ? (
            <div className="bg-[#0F141C] border border-emerald-500/50 rounded-lg p-5 shadow-2xl space-y-4 font-mono">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Ultra-Fast Charge Active
                  </span>
                  <h3 className="text-xl font-bold text-slate-100">{activeSession.stationName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connector: <strong className="text-slate-200">{activeSession.connectorType}</strong> ({activeSession.maxPowerKw} kW) • Vehicle: <strong className="text-slate-200">{activeSession.vehicleModel}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenReportIncident && (
                    <button
                      onClick={() => onOpenReportIncident(activeSession.stationId)}
                      className="px-3 py-2 rounded bg-slate-900 hover:bg-rose-950 border border-rose-500/40 hover:border-rose-500 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Issue / Gun Stuck</span>
                    </button>
                  )}
                  <button
                    onClick={onStopActiveSession}
                    className="px-4 py-2 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 fill-slate-950" /> Stop Charge & Complete Payment
                  </button>
                </div>
              </div>

              {/* Battery Progress & Telemetry Ring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                {/* Visual SoC Bar */}
                <div className="bg-[#0A0D12] p-4 rounded border border-slate-800 text-center space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">State of Charge</span>
                  <div className="text-3xl font-bold text-emerald-400">
                    {activeSession.currentSocPct}%
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded transition-all duration-500"
                      style={{ width: `${activeSession.currentSocPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 block">
                    Target: {activeSession.targetSocPct}% • ~12 mins remaining
                  </span>
                </div>

                {/* Delivered Power Metrics */}
                <div className="bg-[#0A0D12] p-4 rounded border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Charge Speed</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {activeSession.currentPowerKw} kW
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Energy Consumed</span>
                    <span className="font-bold text-cyan-400">
                      {activeSession.energyConsumedKwh.toFixed(1)} kWh
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Tariff Rate</span>
                    <span className="font-bold text-slate-200">
                      ${activeSession.pricePerKwh}/kWh
                    </span>
                  </div>
                </div>

                {/* Cost Ticker */}
                <div className="bg-[#0A0D12] p-4 rounded border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Accumulated Cost</span>
                  <div className="text-3xl font-bold text-slate-100">
                    ${activeSession.currentCostUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-400 block">
                    Paying via {activeSession.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F141C] border border-slate-800 rounded-lg p-6 text-center space-y-3 font-mono">
              <div className="w-10 h-10 rounded bg-[#0A0D12] border border-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">No Active Charging Session</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select an available station on the interactive map or route planner to plug in and initiate charging.
              </p>

              <div className="pt-1">
                <button
                  onClick={() => onSelectStation(stations[0])}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" /> Simulate Plug-In & Start Charge
                </button>
              </div>
            </div>
          )}

          {/* D3 Carbon Reduction Chart */}
          <CarbonReductionD3Chart receipts={paymentReceipts} />
        </div>
      )}

      {/* TAB 2: AI ROUTE CHARGING PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Long-Distance Trip & Charging Planner
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Vehicle Model</label>
                <input
                  type="text"
                  value={evModel}
                  onChange={(e) => setEvModel(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-0.5">Battery SoC (%)</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={currentSoc}
                  onChange={(e) => setCurrentSoc(Number(e.target.value))}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handlePlanRoute}
              disabled={aiRouteLoading}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aiRouteLoading ? 'Planning Route...' : 'Generate Smart Itinerary'}
            </button>
          </div>

          {/* AI Route Results */}
          {aiRouteResult && (
            <div className="bg-[#0F141C] border border-purple-500/30 rounded-lg p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended Trip Itinerary
                </h4>
                <div className="text-[11px] text-slate-400">
                  Distance: <strong className="text-emerald-400">{aiRouteResult.totalDistanceMiles} mi</strong> • Duration: <strong className="text-amber-400">{aiRouteResult.estimatedTripMinutes} mins</strong>
                </div>
              </div>

              <div className="space-y-2">
                {aiRouteResult.suggestedStops?.map((stop: any, idx: number) => (
                  <div key={idx} className="p-3 rounded bg-[#0A0D12] border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> Stop #{idx + 1}: {stop.stationName}
                      </span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {stop.chargeDurationMin} mins
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                      <div>Arrival: <strong className="text-emerald-400">{stop.arrivalSoCPct}%</strong></div>
                      <div>Target: <strong className="text-cyan-400">{stop.targetSoCPct}%</strong></div>
                      <div>Plug: <strong className="text-slate-200">{stop.connector}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WALLET & RECEIPTS */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono">
          {/* Digital Wallet Balance */}
          <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Digital Wallet
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RFID ACTIVE
              </span>
            </div>

            <div className="bg-[#0A0D12] p-4 rounded border border-slate-800 text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block">Balance</span>
              <div className="text-2xl font-bold text-emerald-400">
                ${userWallet.balanceUsd.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                RFID: {userWallet.rfidTagNumber}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold block">Quick Top-Up</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => onTopUpWallet(amt)}
                    className="py-1.5 rounded bg-[#0A0D12] hover:bg-slate-900 text-emerald-400 font-bold text-xs border border-slate-800 transition-colors"
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            {onOpenQrPaymentModal && (
              <button
                onClick={onOpenQrPaymentModal}
                className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <QrCode className="w-4 h-4" /> Scan QR Code to Pay
              </button>
            )}
          </div>

          {/* Payment Receipts History */}
          <div className="lg:col-span-2 bg-[#0F141C] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Receipts & Payment Log
              </h3>
              <button
                onClick={handleDownloadReceiptsCsv}
                disabled={!paymentReceipts || paymentReceipts.length === 0}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                title="Export payment receipts history as CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Download CSV
              </button>
            </div>

            <div className="space-y-2">
              {paymentReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="bg-[#0A0D12] p-3 rounded border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-200">{receipt.stationName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {receipt.date} • {receipt.kwhDelivered} kWh ({receipt.durationMinutes} mins)
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400 block">
                      ${receipt.totalUsd.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase block">
                      {receipt.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
