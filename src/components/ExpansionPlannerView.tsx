import React, { useState, useEffect } from 'react';
import { ExpansionSiteProposal } from '../types';
import { INITIAL_STATIONS } from '../data/mockStations';
import { GoogleMapView } from './GoogleMapView';
import {
  VAHAN_DISTRICTS_DATA,
  VahanDistrictData,
  calculateVahanDemandScore,
  searchVahanDistricts,
} from '../data/vahanEvData';
import {
  Compass,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Cpu,
  Plus,
  Layers,
  ArrowRight,
  Target,
  Database,
  ShieldCheck,
  Zap,
  Flame,
  Car,
  SlidersHorizontal,
} from 'lucide-react';

interface ExpansionPlannerViewProps {
  proposals: ExpansionSiteProposal[];
  onAddProposal: (proposal: ExpansionSiteProposal) => void;
  preselectedVahanDistrict?: VahanDistrictData | null;
}

export const ExpansionPlannerView: React.FC<ExpansionPlannerViewProps> = ({
  proposals,
  onAddProposal,
  preselectedVahanDistrict,
}) => {
  // Default to Bengaluru Urban or preselected district
  const defaultDistrict = VAHAN_DISTRICTS_DATA.find((d) => d.id === 'KA-BLR') || VAHAN_DISTRICTS_DATA[0];
  const [selectedVahanDistrict, setSelectedVahanDistrict] = useState<VahanDistrictData>(
    preselectedVahanDistrict || defaultDistrict
  );
  const [vahanSearchTerm, setVahanSearchTerm] = useState('');

  const [siteName, setSiteName] = useState(
    preselectedVahanDistrict
      ? `${preselectedVahanDistrict.districtName} EV Mega-Hub`
      : 'Bengaluru Outer Ring Road (ORR) Tech Superhub'
  );
  const [city, setCity] = useState(
    preselectedVahanDistrict ? preselectedVahanDistrict.districtName : 'Bengaluru Urban (KA-01 / KA-51)'
  );
  const [targetChargers, setTargetChargers] = useState(8);
  const [transformerCapacity, setTransformerCapacity] = useState('750 kVA');
  const [nearbyPois, setNearbyPois] = useState('Bellandur EcoSpace, ORR Tech Corridor, Central Mall');
  const [traffic, setTraffic] = useState('32,000 vehicles/day');
  const [investment, setInvestment] = useState(320000);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(
    preselectedVahanDistrict?.coordinates || { lat: 12.9279, lng: 77.6766 }
  );

  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(null);

  // Sync when preselected district prop changes
  useEffect(() => {
    if (preselectedVahanDistrict) {
      setSelectedVahanDistrict(preselectedVahanDistrict);
      setCity(`${preselectedVahanDistrict.districtName} (${preselectedVahanDistrict.stateCode})`);
      setSiteName(`${preselectedVahanDistrict.districtName} High-Density EV Hub`);
      setSelectedCoords(preselectedVahanDistrict.coordinates);
      setNearbyPois(preselectedVahanDistrict.topFleetCorridors.slice(0, 2).join(', '));
    }
  }, [preselectedVahanDistrict]);

  // Live Vahan Demand Metric for current district and target chargers
  const vahanScore = calculateVahanDemandScore(selectedVahanDistrict, targetChargers);

  const handleSelectDistrict = (district: VahanDistrictData) => {
    setSelectedVahanDistrict(district);
    setCity(`${district.districtName} (${district.stateCode})`);
    setSiteName(`${district.districtName} Fast Charging Gateway`);
    setSelectedCoords(district.coordinates);
    setNearbyPois(district.topFleetCorridors.slice(0, 2).join(', '));
    setVahanSearchTerm('');
  };

  const handleMapClickLocation = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setSiteName(`Candidate Hub (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
  };

  const handleRunAiFeasibility = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          city,
          coordinates: { xPct: 35, yPct: 65, lat: selectedCoords.lat, lng: selectedCoords.lng },
          targetChargerCount: targetChargers,
          transformerCapacity,
          nearbyPois,
          estimatedFootTraffic: traffic,
          targetInvestment: investment,
          vahanData: {
            districtId: selectedVahanDistrict.id,
            districtName: selectedVahanDistrict.districtName,
            stateName: selectedVahanDistrict.stateName,
            stateCode: selectedVahanDistrict.stateCode,
            rtoCodes: selectedVahanDistrict.rtoCodes,
            totalEvCount: selectedVahanDistrict.totalEvCount,
            categoryBreakdown: selectedVahanDistrict.categoryBreakdown,
            yoyGrowthPct: selectedVahanDistrict.yoyGrowthPct,
            chargingDeficitScore: selectedVahanDistrict.chargingDeficitScore,
            evToChargerRatio: selectedVahanDistrict.evToChargerRatio,
          },
        }),
      });

      const data = await res.json();
      setActiveAnalysis(data);

      // Create new proposal with Vahan metadata
      const newProp: ExpansionSiteProposal = {
        id: `PROP-${Date.now()}`,
        siteName,
        city,
        coordinates: { xPct: 35, yPct: 65, lat: selectedCoords.lat, lng: selectedCoords.lng },
        targetChargerCount: targetChargers,
        transformerCapacityKva: parseInt(transformerCapacity) || 500,
        nearbyPois,
        estimatedFootTraffic: traffic,
        targetInvestmentUsd: investment,
        feasibilityScore: data.feasibilityScore || vahanScore.demandScore || 88,
        roiMonths: data.roiMonths || 20,
        estimatedDailySessions: data.estimatedDailySessions || targetChargers * vahanScore.estDailySessionsPerPort,
        recommendedConnectors: data.recommendedConnectors,
        gridImpactAssessment: data.gridImpactAssessment,
        capexEstimateUsd: data.capexEstimateUsd,
        opexMonthlyUsd: data.opexMonthlyUsd,
        keyAdvantages: data.keyAdvantages,
        riskFactors: data.riskFactors,
        aiExecutiveSummary: data.aiExecutiveSummary,
        vahanDistrictId: selectedVahanDistrict.id,
        vahanDistrictName: selectedVahanDistrict.districtName,
        vahanRtoCode: selectedVahanDistrict.rtoCodes[0],
        vahanTotalEvCount: selectedVahanDistrict.totalEvCount,
        vahanE4wCount: selectedVahanDistrict.categoryBreakdown.fourWheelerE4W,
        vahanYoyGrowthPct: selectedVahanDistrict.yoyGrowthPct,
        vahanEvToChargerRatio: selectedVahanDistrict.evToChargerRatio,
        vahanDeficitScore: selectedVahanDistrict.chargingDeficitScore,
        vahanDemandScore: vahanScore.demandScore,
        createdAt: new Date().toISOString().split('T')[0],
      };

      onAddProposal(newProp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const searchedDistricts = vahanSearchTerm ? searchVahanDistricts(vahanSearchTerm) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F141C] p-4 rounded-xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                  Smart Network Expansion & Site Feasibility Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 inline-flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" /> Vahan 4.0 Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Evaluates site ROI using real-time Vahan Dashboard EV registration counts, RTO vehicle categories, and charger deficit scores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vahan EV Ownership Density Integration Box */}
      <div className="bg-[#0F141C] border border-emerald-500/40 rounded-xl p-4 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                <Database className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Vahan Dashboard (vahan.parivahan.gov.in) District Registration Telematics
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select or search any official RTO / District to feed authentic EV ownership data into your site feasibility algorithm.
            </p>
          </div>

          <div className="relative min-w-[280px]">
            <input
              type="text"
              value={vahanSearchTerm}
              onChange={(e) => setVahanSearchTerm(e.target.value)}
              placeholder="Quick search district (e.g. Pune, MH-12, Bengaluru)..."
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchedDistricts.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[#0A0D12] border border-slate-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                {searchedDistricts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDistrict(d)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800/80 flex items-center justify-between text-slate-200"
                  >
                    <div>
                      <strong className="text-white">{d.districtName}</strong> ({d.stateCode})
                      <span className="text-[10px] text-slate-400 block">{d.rtoCodes[0]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{d.totalEvCount.toLocaleString()} EVs</span>
                      <span className="text-[10px] text-slate-400 block">Score: {d.chargingDeficitScore}/100</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected District Telematics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">District / State</span>
            <strong className="text-xs text-slate-100 block mt-0.5 truncate" title={selectedVahanDistrict.districtName}>
              {selectedVahanDistrict.districtName}
            </strong>
            <span className="text-[10px] text-slate-400">{selectedVahanDistrict.stateName}</span>
          </div>

          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Total Registered EVs</span>
            <strong className="text-sm text-emerald-400 block mt-0.5">
              {selectedVahanDistrict.totalEvCount.toLocaleString()}
            </strong>
            <span className="text-[10px] text-emerald-500/90 font-semibold">+{selectedVahanDistrict.yoyGrowthPct}% YoY</span>
          </div>

          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">E-4W Electric Cars</span>
            <strong className="text-sm text-blue-400 block mt-0.5">
              {selectedVahanDistrict.categoryBreakdown.fourWheelerE4W.toLocaleString()}
            </strong>
            <span className="text-[10px] text-slate-400">DC Fast Target</span>
          </div>

          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Public EV:Gun Ratio</span>
            <strong className="text-sm text-amber-400 block mt-0.5">
              {selectedVahanDistrict.evToChargerRatio}:1
            </strong>
            <span className="text-[10px] text-slate-400">({selectedVahanDistrict.activePublicChargers} guns)</span>
          </div>

          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Charging Deficit</span>
            <strong className="text-sm text-rose-400 block mt-0.5">
              {selectedVahanDistrict.chargingDeficitScore} / 100
            </strong>
            <span className="text-[10px] text-rose-400/90 font-semibold">Acute Shortage</span>
          </div>

          <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-emerald-500/50 bg-emerald-950/20">
            <span className="text-[9px] uppercase text-emerald-400 block font-bold">Vahan Demand Score</span>
            <strong className="text-base text-emerald-300 block mt-0.5">
              {vahanScore.demandScore} / 100
            </strong>
            <span className="text-[10px] text-emerald-400">~{vahanScore.estDailySessionsPerPort} sess/port/day</span>
          </div>
        </div>
      </div>

      {/* Interactive Google Map Expansion Selector */}
      <div className="bg-[#0F141C] border border-purple-500/30 rounded-xl p-4 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Interactive Site Geo-Targeting & Catchment Map
            </h3>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Click anywhere on the map to place candidate hub coordinates ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}).
            </p>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded font-bold w-fit flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Click Map to Set Lat/Lng
          </span>
        </div>

        <div className="h-[340px] w-full rounded-lg overflow-hidden border border-slate-800 relative">
          <GoogleMapView
            stations={INITIAL_STATIONS}
            proposals={proposals}
            onMapClickSelectLocation={handleMapClickLocation}
            isInvestorMode={true}
            height="100%"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="bg-[#0F141C] p-5 rounded-xl border border-slate-800 space-y-3.5 font-mono shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" /> Site Modeling Parameters
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">Vahan Synced</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Proposed Hub Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Catchment City / RTO District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Target Ports (Guns)</label>
                <input
                  type="number"
                  min="2"
                  max="32"
                  value={targetChargers}
                  onChange={(e) => setTargetChargers(Number(e.target.value))}
                  className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Transformer Cap.</label>
                <input
                  type="text"
                  value={transformerCapacity}
                  onChange={(e) => setTransformerCapacity(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Nearby Anchors & Corridors</label>
              <input
                type="text"
                value={nearbyPois}
                onChange={(e) => setNearbyPois(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">Est. Daily Traffic</label>
                <input
                  type="text"
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-400 block mb-1 font-bold">CapEx Budget ($ USD)</label>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAiFeasibility}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? 'Evaluating Vahan Telematics...' : 'Run Vahan-Powered Feasibility Analysis'}
          </button>
        </div>

        {/* AI Analysis Feasibility Results */}
        <div className="lg:col-span-2 space-y-4">
          {activeAnalysis ? (
            <div className="bg-[#0F141C] border border-purple-500/40 rounded-xl p-5 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" /> Vahan Feasibility Score
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                      RTO: {selectedVahanDistrict.rtoCodes[0]}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{siteName}</h3>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-400 block">
                    {activeAnalysis.feasibilityScore} / 100
                  </span>
                  <span className="text-[10px] text-slate-400">High Investment Viability</span>
                </div>
              </div>

              {/* Vahan Context Highlight Banner */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    Anchored by <strong>{selectedVahanDistrict.totalEvCount.toLocaleString()} registered EVs</strong> in {selectedVahanDistrict.districtName} ({selectedVahanDistrict.categoryBreakdown.fourWheelerE4W.toLocaleString()} E-4W cars).
                  </span>
                </div>
                <span className="text-emerald-400 font-bold shrink-0">
                  {selectedVahanDistrict.evToChargerRatio}:1 Deficit
                </span>
              </div>

              {/* Financial & Operational Projections Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Payback Horizon</span>
                  <strong className="text-base text-amber-400 block mt-0.5">
                    {activeAnalysis.roiMonths} Months
                  </strong>
                </div>

                <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Daily Sessions</span>
                  <strong className="text-base text-cyan-400 block mt-0.5">
                    {activeAnalysis.estimatedDailySessions} / day
                  </strong>
                </div>

                <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">CapEx Estimate</span>
                  <strong className="text-base text-slate-200 block mt-0.5">
                    ${activeAnalysis.capexEstimateUsd?.toLocaleString()}
                  </strong>
                </div>

                <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Monthly OpEx</span>
                  <strong className="text-base text-slate-200 block mt-0.5">
                    ${activeAnalysis.opexMonthlyUsd?.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-[#0A0D12] p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                  AI Investment & Vahan Feasibility Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeAnalysis.aiExecutiveSummary}
                </p>
              </div>

              {/* Grid Impact & Key Advantages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0A0D12] p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Advantages
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] font-sans">
                    {activeAnalysis.keyAdvantages?.map((adv: string, idx: number) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0A0D12] p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors & Mitigation
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] font-sans">
                    {activeAnalysis.riskFactors?.map((risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-8 text-center space-y-3 font-mono shadow-xl">
              <Compass className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-slate-200">Vahan EV Feasibility Model Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Loaded <strong>{selectedVahanDistrict.districtName}</strong> ({selectedVahanDistrict.totalEvCount.toLocaleString()} Vahan EVs). Click "Run Vahan-Powered Feasibility Analysis" to compute instant ROI, port recommendations, and daily demand forecasts.
              </p>
            </div>
          )}

          {/* Historical Proposal Pipeline */}
          <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-5 space-y-3.5 font-mono shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Active Expansion Proposals Pipeline ({proposals.length})
              </h3>
            </div>

            <div className="space-y-2">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{prop.siteName}</h4>
                      {prop.vahanTotalEvCount && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                          {prop.vahanTotalEvCount.toLocaleString()} Vahan EVs
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {prop.city} • {prop.targetChargerCount} Ports • Transformer: {prop.transformerCapacityKva}kVA
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-400 block">
                      {prop.feasibilityScore || 85} / 100 Score
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Payback: ~{prop.roiMonths || 22} mos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
