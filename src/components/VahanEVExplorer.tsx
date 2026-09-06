import React, { useState, useMemo } from 'react';
import {
  VAHAN_NATIONAL_SUMMARY,
  VAHAN_STATE_SUMMARIES,
  VAHAN_DISTRICTS_DATA,
  VahanDistrictData,
  VahanStateSummary,
  calculateVahanDemandScore,
} from '../data/vahanEvData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  Database,
  Search,
  TrendingUp,
  Car,
  Bike,
  Truck,
  Bus,
  Zap,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Flame,
  Layers,
  ArrowUpRight,
  Sparkles,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Building,
} from 'lucide-react';

interface VahanEVExplorerProps {
  onSelectDistrictForExpansion?: (district: VahanDistrictData) => void;
  onNavigateToBengaluruHeatmap?: () => void;
}

export const VahanEVExplorer: React.FC<VahanEVExplorerProps> = ({
  onSelectDistrictForExpansion,
  onNavigateToBengaluruHeatmap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'totalEvs' | 'yoyGrowth' | 'deficitScore' | 'e4wCount' | 'density'>('totalEvs');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('MH-PUN');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'e2w' | 'e3w' | 'e4w' | 'ebus'>('all');

  // Filtered and sorted districts
  const filteredDistricts = useMemo(() => {
    let list = VAHAN_DISTRICTS_DATA;

    if (selectedState !== 'all') {
      list = list.filter((d) => d.stateCode === selectedState || d.stateName === selectedState);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.districtName.toLowerCase().includes(q) ||
          d.stateName.toLowerCase().includes(q) ||
          d.stateCode.toLowerCase().includes(q) ||
          d.rtoCodes.some((rto) => rto.toLowerCase().includes(q)) ||
          d.topFleetCorridors.some((c) => c.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'totalEvs') return b.totalEvCount - a.totalEvCount;
      if (sortBy === 'yoyGrowth') return b.yoyGrowthPct - a.yoyGrowthPct;
      if (sortBy === 'deficitScore') return b.chargingDeficitScore - a.chargingDeficitScore;
      if (sortBy === 'e4wCount') return b.categoryBreakdown.fourWheelerE4W - a.categoryBreakdown.fourWheelerE4W;
      if (sortBy === 'density') return b.densityPerSqKm - a.densityPerSqKm;
      return 0;
    });
  }, [searchQuery, selectedState, sortBy]);

  const selectedDistrict = useMemo(() => {
    return VAHAN_DISTRICTS_DATA.find((d) => d.id === selectedDistrictId) || filteredDistricts[0] || VAHAN_DISTRICTS_DATA[0];
  }, [selectedDistrictId, filteredDistricts]);

  const demandMetrics = useMemo(() => {
    return calculateVahanDemandScore(selectedDistrict, 4);
  }, [selectedDistrict]);

  // Chart Data: Top 8 Districts Comparison
  const topDistrictsChartData = useMemo(() => {
    return filteredDistricts.slice(0, 8).map((d) => ({
      name: d.districtName.split(' ')[0],
      fullName: d.districtName,
      totalEvs: d.totalEvCount,
      e4w: d.categoryBreakdown.fourWheelerE4W,
      e2w: d.categoryBreakdown.twoWheelerE2W,
      e3w: d.categoryBreakdown.threeWheelerE3W,
      deficitScore: d.chargingDeficitScore,
    }));
  }, [filteredDistricts]);

  // Chart Data: Selected District Historical Trajectory
  const historicalTrendData = useMemo(() => {
    if (!selectedDistrict) return [];
    return [
      { year: '2022', count: selectedDistrict.historicalTrend.year2022 },
      { year: '2023', count: selectedDistrict.historicalTrend.year2023 },
      { year: '2024', count: selectedDistrict.historicalTrend.year2024 },
      { year: '2025', count: selectedDistrict.historicalTrend.year2025 },
      { year: '2026 YTD', count: selectedDistrict.historicalTrend.year2026YTD },
    ];
  }, [selectedDistrict]);

  // Donut Data: Vehicle Category Breakdown of Selected District
  const categoryDonutData = useMemo(() => {
    if (!selectedDistrict) return [];
    const { twoWheelerE2W, threeWheelerE3W, fourWheelerE4W, commercialBus, otherCommercial } =
      selectedDistrict.categoryBreakdown;
    return [
      { name: '2-Wheeler (E-2W)', value: twoWheelerE2W, color: '#10b981' },
      { name: '3-Wheeler (E-3W / Cargo)', value: threeWheelerE3W, color: '#f59e0b' },
      { name: '4-Wheeler (E-4W Cars/Fleet)', value: fourWheelerE4W, color: '#3b82f6' },
      { name: 'E-Buses', value: commercialBus, color: '#8b5cf6' },
      { name: 'Commercial LCVs', value: otherCommercial, color: '#ec4899' },
    ];
  }, [selectedDistrict]);

  return (
    <div className="space-y-6">
      {/* Vahan Official Banner & Live Metadata */}
      <div className="bg-[#0F141C] border border-emerald-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                    Vahan Dashboard EV Ownership & Density Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Official MoRTH vahan.parivahan.gov.in
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live vehicle registration database across States, RTO Zones, and District Fleets powering infrastructure site scoring.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onNavigateToBengaluruHeatmap && (
              <button
                onClick={onNavigateToBengaluruHeatmap}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
              >
                <Flame className="w-3.5 h-3.5 text-white" />
                <span>View Bengaluru Viability Heatmap</span>
              </button>
            )}
            <a
              href="https://vahan.parivahan.gov.in"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <span>Verify on Vahan 4.0</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
        </div>

        {/* National Telematics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 font-mono">
          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-500 block">Total Registered EVs (India)</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(VAHAN_NATIONAL_SUMMARY.totalNationalEvCount / 1000000).toFixed(2)}M+
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> +{VAHAN_NATIONAL_SUMMARY.yoyNationalGrowthRatePct}% YoY
            </span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-500 block">EV Penetration Rate</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {VAHAN_NATIONAL_SUMMARY.nationalEvPenetrationPct}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Of all new registrations</span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-500 block">Installed Public Guns</span>
            <div className="text-xl font-bold text-slate-200 mt-1">
              {VAHAN_NATIONAL_SUMMARY.totalInstalledPublicChargers.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Public & Fast Commercial</span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-500 block">National EV-to-Charger Ratio</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {VAHAN_NATIONAL_SUMMARY.nationalEvToChargerRatio}:1
            </div>
            <span className="text-[10px] text-rose-400 mt-0.5 block font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Severe Deficit (Target: 20:1)
            </span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-slate-500 block">Category Distribution</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-300">
              <span className="text-emerald-400">2W: 55%</span> • <span className="text-amber-400">3W: 34%</span> • <span className="text-blue-400">4W: 9%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">E-Buses & LCVs: 2%</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sorter Controls */}
      <div className="bg-[#0F141C] p-4 rounded-xl border border-slate-800 shadow-xl space-y-3 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, state, RTO (e.g., MH-12, Bengaluru, Pune)..."
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All States & Union Territories ({VAHAN_DISTRICTS_DATA.length} Districts)</option>
              {VAHAN_STATE_SUMMARIES.map((s) => (
                <option key={s.stateCode} value={s.stateCode}>
                  {s.stateName} ({s.totalEvs.toLocaleString()} EVs, +{s.yoyGrowthPct}%)
                </option>
              ))}
            </select>
          </div>

          {/* Sorter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="totalEvs">Sort: Highest Total EV Count</option>
              <option value="deficitScore">Sort: Highest Charging Deficit (Site Opportunity)</option>
              <option value="e4wCount">Sort: Highest E-4W Electric Cars</option>
              <option value="yoyGrowth">Sort: Fastest YoY EV Growth %</option>
              <option value="density">Sort: Highest EV Density / km²</option>
            </select>
          </div>

          {/* Quick Stats Indicator */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#0A0D12] rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Matching Districts:</span>
            <span className="text-emerald-400 font-bold">{filteredDistricts.length} Active Hotspots</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left District List & Right Deep-Dive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Explorer Table / List (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F141C] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono flex flex-col h-[740px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" /> District Registration Leaderboard
            </h3>
            <span className="text-[10px] text-slate-500">Click to inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredDistricts.map((d) => {
              const isSelected = d.id === selectedDistrict.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDistrictId(d.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 text-slate-100 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-[#0A0D12] border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">{d.districtName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                          {d.stateCode}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        RTO: {d.rtoCodes.join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400 block">
                        {d.totalEvCount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-500/90 font-semibold">
                        +{d.yoyGrowthPct}% YoY
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">E-4W Fleet</span>
                      <strong className="text-slate-200">{d.categoryBreakdown.fourWheelerE4W.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Deficit Score</span>
                      <strong className={d.chargingDeficitScore >= 90 ? 'text-rose-400' : 'text-amber-400'}>
                        {d.chargingDeficitScore}/100
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">EV:Charger</span>
                      <strong className="text-slate-200">{d.evToChargerRatio}:1</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected District Deep-Dive & Scoring Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          {/* Top Card: Selected District Overview */}
          <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">
                    {selectedDistrict.districtName}, {selectedDistrict.stateName}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Primary RTOs: <span className="text-slate-200 font-semibold">{selectedDistrict.rtoCodes.join(' • ')}</span>
                </p>
              </div>

              {onSelectDistrictForExpansion && (
                <button
                  onClick={() => onSelectDistrictForExpansion(selectedDistrict)}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Model Expansion Site Here</span>
                </button>
              )}
            </div>

            {/* District Core Registration Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Total Registered EVs</span>
                <strong className="text-base text-emerald-400 block mt-0.5">
                  {selectedDistrict.totalEvCount.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-400">Density: {selectedDistrict.densityPerSqKm} EV/km²</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">E-4W Passenger Cars</span>
                <strong className="text-base text-blue-400 block mt-0.5">
                  {selectedDistrict.categoryBreakdown.fourWheelerE4W.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-400">High-power DC target</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Installed Public Chargers</span>
                <strong className="text-base text-slate-200 block mt-0.5">
                  {selectedDistrict.activePublicChargers.toLocaleString()} Guns
                </strong>
                <span className="text-[10px] text-slate-400">Ratio: {selectedDistrict.evToChargerRatio}:1</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Deficit Index Score</span>
                <strong className="text-base text-rose-400 block mt-0.5">
                  {selectedDistrict.chargingDeficitScore} / 100
                </strong>
                <span className="text-[10px] text-amber-400 font-semibold">High Infrastructure Gap</span>
              </div>
            </div>

            {/* Vahan EV Feasibility Scoring Box */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Vahan Demand Feasibility Score
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500 text-slate-950">
                  {demandMetrics.demandScore} / 100
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {demandMetrics.vahanExecutiveInsight}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1 text-slate-300 font-mono">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Est. Utilization: <strong>{demandMetrics.estDailySessionsPerPort} sessions/port/day</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-300 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Projected Yield: <strong>{demandMetrics.projectedAnnualKwhDispensed.toLocaleString()} kWh/yr</strong></span>
                </div>
              </div>
            </div>

            {/* Vehicle Category Donut & Growth Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Category Breakdown Donut */}
              <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Category Mix</span>
                  <span className="text-[10px] text-slate-500">Vahan 4.0</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={58}
                        paddingAngle={3}
                      >
                        {categoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F141C',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                        formatter={(value: any) => [Number(value).toLocaleString() + ' vehicles', 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>2W: {selectedDistrict.categoryBreakdown.twoWheelerE2W.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>3W: {selectedDistrict.categoryBreakdown.threeWheelerE3W.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>4W: {selectedDistrict.categoryBreakdown.fourWheelerE4W.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Bus: {selectedDistrict.categoryBreakdown.commercialBus.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Historical Growth Trajectory Area Chart */}
              <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Growth Trajectory</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+{selectedDistrict.yoyGrowthPct}% YoY</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalTrendData}>
                      <defs>
                        <linearGradient id="vahanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F141C',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                        formatter={(value: any) => [Number(value).toLocaleString(), 'Registered EVs']}
                      />
                      <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#vahanGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Registration surge: {selectedDistrict.historicalTrend.year2022.toLocaleString()} (2022) → {selectedDistrict.totalEvCount.toLocaleString()} (2026)
                </p>
              </div>
            </div>

            {/* High Density Transport Corridors & Key Makers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> High-Density Fleet Corridors
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px] font-sans">
                  {selectedDistrict.topFleetCorridors.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-blue-400" /> Top EV OEM Registrations in District
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px] font-sans">
                  {selectedDistrict.keyVehicleMakersTop3.map((m, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
