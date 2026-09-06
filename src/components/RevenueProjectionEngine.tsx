import React, { useState, useMemo } from 'react';
import { ChargingStation } from '../types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  MapPin,
  Sliders,
  Zap,
  Tv,
  RefreshCw,
  Car,
  CreditCard,
  Building2,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface RevenueProjectionEngineProps {
  stations: ChargingStation[];
}

export const RevenueProjectionEngine: React.FC<RevenueProjectionEngineProps> = ({ stations }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [growthRateMoM, setGrowthRateMoM] = useState<number>(2.5); // % compound monthly growth
  const [adTrafficFactor, setAdTrafficFactor] = useState<number>(1.2); // Foot traffic multiplier for ads
  const [memberPlanAdoption, setMemberPlanAdoption] = useState<number>(15); // % driver membership plan adoption

  // Location multiplier rules based on StationCategory or lat/lng location profile
  const getLocationStreamWeights = (station: ChargingStation) => {
    switch (station.category) {
      case 'Highway Superhub':
        return {
          chargingWeight: 1.35,
          adWeight: 1.1,
          batterySwapWeight: 1.6, // High long-distance fleet/battery swap demand
          parkingWeight: 0.7,
          membershipWeight: 1.2,
        };
      case 'Urban Mall':
        return {
          chargingWeight: 1.1,
          adWeight: 1.8, // Maximum DOOH screen foot traffic
          batterySwapWeight: 0.5,
          parkingWeight: 1.5, // High parking demand & overstay charges
          membershipWeight: 1.4,
        };
      case 'Commercial Office':
        return {
          chargingWeight: 1.0,
          adWeight: 1.2,
          batterySwapWeight: 0.6,
          parkingWeight: 1.4,
          membershipWeight: 1.6, // Corporate monthly memberships
        };
      case 'Fleet Depot':
        return {
          chargingWeight: 1.5,
          adWeight: 0.4,
          batterySwapWeight: 2.2, // Massive commercial fleet battery swapping
          parkingWeight: 0.9,
          membershipWeight: 1.1,
        };
      case 'Residential Hub':
      default:
        return {
          chargingWeight: 0.9,
          adWeight: 0.8,
          batterySwapWeight: 0.4,
          parkingWeight: 1.1,
          membershipWeight: 1.3,
        };
    }
  };

  // Compute 12-month projections
  const projectionData = useMemo(() => {
    const activeStations = selectedLocationId === 'ALL'
      ? stations
      : stations.filter((s) => s.id === selectedLocationId);

    const monthNames = [
      'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
      'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027',
      'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027'
    ];

    // Base monthly calculations per station
    const stationBaseStreams = activeStations.map((station) => {
      const weights = getLocationStreamWeights(station);
      const baseMonthly = station.monthlyRevenueUsd;

      // Split total monthly baseline revenue into the 5 revenue streams
      const chargingBase = baseMonthly * 0.58 * weights.chargingWeight;
      const adBase = Math.round((baseMonthly * 0.12) * weights.adWeight * adTrafficFactor);
      const batterySwapBase = Math.round((baseMonthly * 0.14) * weights.batterySwapWeight);
      const parkingBase = Math.round((baseMonthly * 0.08) * weights.parkingWeight);
      const memberPlanBase = Math.round((baseMonthly * 0.08) * weights.membershipWeight * (memberPlanAdoption / 15));

      return {
        station,
        chargingBase,
        adBase,
        batterySwapBase,
        parkingBase,
        memberPlanBase,
        totalBase: chargingBase + adBase + batterySwapBase + parkingBase + memberPlanBase,
      };
    });

    const monthlyBreakdown = monthNames.map((month, idx) => {
      // Compound growth factor for month idx (0..11)
      const growthFactor = Math.pow(1 + growthRateMoM / 100, idx);

      let charging = 0;
      let advertising = 0;
      let batterySwap = 0;
      let parking = 0;
      let memberPlans = 0;

      stationBaseStreams.forEach((stream) => {
        charging += Math.round(stream.chargingBase * growthFactor);
        advertising += Math.round(stream.adBase * growthFactor);
        batterySwap += Math.round(stream.batterySwapBase * growthFactor);
        parking += Math.round(stream.parkingBase * growthFactor);
        memberPlans += Math.round(stream.memberPlanBase * growthFactor);
      });

      const total = charging + advertising + batterySwap + parking + memberPlans;

      return {
        month,
        charging,
        advertising,
        batterySwap,
        parking,
        memberPlans,
        total,
      };
    });

    // 12-month totals per stream
    const totalCharging = monthlyBreakdown.reduce((sum, m) => sum + m.charging, 0);
    const totalAd = monthlyBreakdown.reduce((sum, m) => sum + m.advertising, 0);
    const totalBatterySwap = monthlyBreakdown.reduce((sum, m) => sum + m.batterySwap, 0);
    const totalParking = monthlyBreakdown.reduce((sum, m) => sum + m.parking, 0);
    const totalMemberPlans = monthlyBreakdown.reduce((sum, m) => sum + m.memberPlans, 0);
    const grandTotal = totalCharging + totalAd + totalBatterySwap + totalParking + totalMemberPlans;

    // Station performance projections table data
    const stationProjections = stationBaseStreams.map((item) => {
      let stn12MoTotal = 0;
      let stnCharging = 0;
      let stnAd = 0;
      let stnSwap = 0;
      let stnParking = 0;
      let stnMember = 0;

      for (let i = 0; i < 12; i++) {
        const gf = Math.pow(1 + growthRateMoM / 100, i);
        const c = item.chargingBase * gf;
        const a = item.adBase * gf;
        const s = item.batterySwapBase * gf;
        const p = item.parkingBase * gf;
        const m = item.memberPlanBase * gf;

        stnCharging += c;
        stnAd += a;
        stnSwap += s;
        stnParking += p;
        stnMember += m;
        stn12MoTotal += (c + a + s + p + m);
      }

      return {
        station: item.station,
        stn12MoTotal: Math.round(stn12MoTotal),
        stnCharging: Math.round(stnCharging),
        stnAd: Math.round(stnAd),
        stnSwap: Math.round(stnSwap),
        stnParking: Math.round(stnParking),
        stnMember: Math.round(stnMember),
      };
    });

    return {
      monthlyBreakdown,
      totalCharging,
      totalAd,
      totalBatterySwap,
      totalParking,
      totalMemberPlans,
      grandTotal,
      stationProjections,
    };
  }, [stations, selectedLocationId, growthRateMoM, adTrafficFactor, memberPlanAdoption]);

  return (
    <div className="bg-[#0F141C] border border-slate-800 rounded-lg p-5 shadow-2xl space-y-6 font-mono">
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              12-Month Multi-Stream Revenue Projection Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial location trends & 5-channel monetization forecasting (Charging, Advertising, Battery Swap, Parking, Subscriptions)
          </p>
        </div>

        {/* Location Filter Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#0A0D12] text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Portfolio Locations ({stations.length} Hubs)</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city}, {s.state}) - {s.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Growth Trend Control Sliders */}
      <div className="bg-[#0A0D12] p-4 rounded-lg border border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* MoM Compound Growth Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sliders className="w-3.5 h-3.5" /> Compound Monthly Growth Rate (MoM)
            </span>
            <strong className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {growthRateMoM}% MoM
            </strong>
          </div>
          <input
            type="range"
            min="0.5"
            max="6.0"
            step="0.5"
            value={growthRateMoM}
            onChange={(e) => setGrowthRateMoM(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Translates to ~{((Math.pow(1 + growthRateMoM / 100, 12) - 1) * 100).toFixed(0)}% annualized revenue growth.
          </p>
        </div>

        {/* Location Foot Traffic & DOOH Ad Multiplier */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Tv className="w-3.5 h-3.5" /> Location Foot-Traffic Ad Factor
            </span>
            <strong className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {adTrafficFactor}x Index
            </strong>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={adTrafficFactor}
            onChange={(e) => setAdTrafficFactor(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Adjusts digital screen advertising CPM yield based on station location foot traffic.
          </p>
        </div>

        {/* Member Plan Driver Adoption % */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-pink-400 font-bold">
              <CreditCard className="w-3.5 h-3.5" /> EV Pass Member Plan Adoption
            </span>
            <strong className="text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">
              {memberPlanAdoption}%
            </strong>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={memberPlanAdoption}
            onChange={(e) => setMemberPlanAdoption(Number(e.target.value))}
            className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Recurring $14.99/mo EV Pass driver subscription penetration rate in station radius.
          </p>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#0A0D12] p-3 rounded-lg border border-emerald-500/30">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Projected 12-Mo Total</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">
            ${(projectionData.grandTotal / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-emerald-500/90 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Combined 5 Streams
          </div>
        </div>

        <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">1. EV Charging</span>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">
            ${(projectionData.totalCharging / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {((projectionData.totalCharging / projectionData.grandTotal) * 100).toFixed(0)}% of total revenue
          </div>
        </div>

        <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">2. DOOH Screen Ads</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            ${(projectionData.totalAd / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {((projectionData.totalAd / projectionData.grandTotal) * 100).toFixed(0)}% of total revenue
          </div>
        </div>

        <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">3. Battery Swap</span>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">
            ${(projectionData.totalBatterySwap / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {((projectionData.totalBatterySwap / projectionData.grandTotal) * 100).toFixed(0)}% of total revenue
          </div>
        </div>

        <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">4. Parking + 5. Subs</span>
          <div className="text-lg font-bold text-pink-400 mt-0.5">
            ${((projectionData.totalParking + projectionData.totalMemberPlans) / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {(((projectionData.totalParking + projectionData.totalMemberPlans) / projectionData.grandTotal) * 100).toFixed(0)}% of total revenue
          </div>
        </div>
      </div>

      {/* Stacked Area Recharts Projection Chart */}
      <div className="bg-[#0A0D12] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> 12-Month Multi-Channel Revenue Growth
          </h4>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            MoM Growth: +{growthRateMoM}%
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F141C',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="charging"
                name="EV Charging"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="advertising"
                name="DOOH Screen Ads"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="batterySwap"
                name="Battery Swap Charges"
                stackId="1"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="parking"
                name="Parking & Overstay"
                stackId="1"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="memberPlans"
                name="EV Pass Memberships"
                stackId="1"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location-Specific Revenue Channel Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" /> Location-Based 12-Month Revenue Stream Breakdown
          </h4>
          <span className="text-[10px] text-slate-500">
            Calculated via foot traffic density, station type, & local demand profile
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0A0D12]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A0F] text-slate-500 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Location & Station</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-emerald-400">Charging</th>
                <th className="py-2.5 px-3 text-amber-400">DOOH Ads</th>
                <th className="py-2.5 px-3 text-cyan-400">Battery Swap</th>
                <th className="py-2.5 px-3 text-purple-400">Parking/Idle</th>
                <th className="py-2.5 px-3 text-pink-400">EV Pass Subs</th>
                <th className="py-2.5 px-3 text-emerald-300 font-bold">12-Mo Projected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {projectionData.stationProjections.map((sp) => (
                <tr key={sp.station.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-100">
                    {sp.station.name}
                    <span className="text-[10px] text-slate-500 font-normal block">
                      {sp.station.city}, {sp.station.state}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#0F141C] text-slate-400 border border-slate-800 text-[10px]">
                      {sp.station.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">${sp.stnCharging.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-amber-400">${sp.stnAd.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-cyan-400">${sp.stnSwap.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-purple-400">${sp.stnParking.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-pink-400">${sp.stnMember.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-300">
                    ${sp.stn12MoTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
