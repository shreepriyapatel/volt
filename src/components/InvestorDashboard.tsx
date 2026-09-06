import React, { useState } from 'react';
import { ChargingStation } from '../types';
import { INITIAL_EXPANSION_PROPOSALS } from '../data/mockStations';
import { GoogleMapView } from './GoogleMapView';
import { RevenueProjectionEngine } from './RevenueProjectionEngine';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, ShieldCheck, Leaf, Download, PieChart as PieIcon, BarChart3, Building2, Zap, ArrowUpRight, CheckCircle2, MapPin, Compass, Database } from 'lucide-react';

interface InvestorDashboardProps {
  stations: ChargingStation[];
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ stations }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>(undefined);

  // Financial calculations
  const totalCapex = stations.reduce((acc, s) => acc + s.capexUsd, 0);
  const totalMonthlyRevenue = stations.reduce((acc, s) => acc + s.monthlyRevenueUsd, 0);
  const totalAnnualRevenue = totalMonthlyRevenue * 12;
  const avgRoi = (stations.reduce((acc, s) => acc + s.roiPct, 0) / stations.length).toFixed(1);
  const totalCarbonSaved = stations.reduce((acc, s) => acc + s.carbonOffsetTonnesYr, 0);

  // Monthly Revenue & Energy Growth Trend Data (Recharts)
  const monthlyTrendData = [
    { month: 'Mar 2026', revenueUsd: 112000, energyMwh: 280, capexDepreciation: 18000 },
    { month: 'Apr 2026', revenueUsd: 124000, energyMwh: 310, capexDepreciation: 18000 },
    { month: 'May 2026', revenueUsd: 138000, energyMwh: 345, capexDepreciation: 18000 },
    { month: 'Jun 2026', revenueUsd: 145000, energyMwh: 362, capexDepreciation: 18000 },
    { month: 'Jul 2026', revenueUsd: 151000, energyMwh: 378, capexDepreciation: 18000 },
    { month: 'Aug 2026', revenueUsd: totalMonthlyRevenue, energyMwh: 395, capexDepreciation: 18000 },
  ];

  // Connector Port Market Share Pie Chart
  const connectorCounts = stations.flatMap((s) => s.ports).reduce((acc: any, port) => {
    acc[port.type] = (acc[port.type] || 0) + 1;
    return acc;
  }, {});

  const pieColors = ['#10b981', '#f59e0b', '#06b6d4', '#ec4899'];
  const connectorPieData = Object.keys(connectorCounts).map((type) => ({
    name: type,
    value: connectorCounts[type],
  }));

  const handleExportReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F141C] p-4 rounded-lg border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
              Investor Portfolio Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Capital expenditure performance, asset yield tracking, and green infrastructure ROI.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all shrink-0 font-mono"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              Report Downloaded
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Portfolio Yield
            </>
          )}
        </button>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Total CapEx</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            ${(totalCapex / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>5 Active Deployments</span>
          </div>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Monthly Revenue</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            ${totalMonthlyRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>ARR: ${(totalAnnualRevenue / 1000).toFixed(0)}k/yr</span>
          </div>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Asset Yield (ROI)</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {avgRoi}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>Payback: ~22 Mos</span>
          </div>
        </div>

        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest block">CO₂ Offset</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {totalCarbonSaved.toLocaleString()} <span className="text-xs font-normal text-slate-500">t/yr</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>84k Trees Equiv</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-[#0F141C] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Revenue & Energy Growth Trend
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +34% YoY
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="revenueUsd" name="Revenue ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connector Market Share Pie Chart */}
        <div className="bg-[#0F141C] p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-amber-400" /> Connector Standards Share
            </h3>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={connectorPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {connectorPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#334155', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-800">
            {connectorPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                <span className="text-slate-400">{item.name}:</span>
                <strong className="text-slate-200">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12-Month Multi-Stream Revenue Projection Engine */}
      <RevenueProjectionEngine stations={stations} />

      {/* Vahan National & State EV TAM Intelligence for Institutional Investors */}
      <div className="bg-[#0F141C] border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                <Database className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Vahan Dashboard (vahan.parivahan.gov.in) Market Density & EV TAM
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official Indian MoRTH vehicle registry data highlighting addressable fleet market and high-yield expansion targets.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            4.82M+ Cumulative Registered EVs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Top 3 EV Fleet States (TAM)</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span>1. Uttar Pradesh</span>
                <strong className="text-emerald-400">785,900 EVs (+41%)</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>2. Maharashtra</span>
                <strong className="text-emerald-400">642,300 EVs (+52%)</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>3. Karnataka</span>
                <strong className="text-emerald-400">498,200 EVs (+56%)</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">High E-4W Passenger Car Densities</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span>Bengaluru Urban (KA-01)</span>
                <strong className="text-blue-400">44,200 E-4W</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Delhi NCR (DL-03)</span>
                <strong className="text-blue-400">42,600 E-4W</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Mumbai Suburban (MH-02)</span>
                <strong className="text-blue-400">31,200 E-4W</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Severe Infrastructure Deficit Hotspots</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span>Lucknow (UP-32)</span>
                <strong className="text-rose-400">303:1 EV/Gun (98/100)</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Jaipur (RJ-14)</span>
                <strong className="text-rose-400">196:1 EV/Gun (95/100)</strong>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Surat (GJ-05)</span>
                <strong className="text-rose-400">178:1 EV/Gun (93/100)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Google Map Demand Monitor */}
      <div className="bg-[#0F141C] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Regional Asset & Demand Google Map
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Green pins represent operational revenue hubs. Purple pins represent high-demand target expansion sites.
            </p>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-bold w-fit">
            INVESTOR DEMAND MAP
          </span>
        </div>

        <div className="h-[380px] w-full rounded-lg overflow-hidden border border-slate-800 relative">
          <GoogleMapView
            stations={stations}
            proposals={INITIAL_EXPANSION_PROPOSALS}
            selectedStationId={selectedStationId}
            onSelectStation={(stn) => setSelectedStationId(stn.id)}
            isInvestorMode={true}
            height="100%"
          />
        </div>
      </div>

      {/* Station Ranking Table */}
      <div className="bg-[#0F141C] border border-slate-800 rounded-lg p-4 shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" /> Station Asset Performance Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0D12] text-slate-500 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">CapEx</th>
                <th className="py-2.5 px-3">Monthly Rev</th>
                <th className="py-2.5 px-3">ROI</th>
                <th className="py-2.5 px-3">Uptime</th>
                <th className="py-2.5 px-3">CO₂ Offset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {stations.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-100">
                    {s.name}
                    <span className="text-[10px] text-slate-500 font-normal block">{s.city}, {s.state}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#0A0D12] text-slate-400 border border-slate-800 text-[10px]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">${s.capexUsd.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">${s.monthlyRevenueUsd.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{s.roiPct}%</td>
                  <td className="py-2.5 px-3 text-cyan-400">{s.uptimePct}%</td>
                  <td className="py-2.5 px-3 text-emerald-300">{s.carbonOffsetTonnesYr} t/yr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
