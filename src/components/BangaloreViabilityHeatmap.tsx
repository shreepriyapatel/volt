import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BANGALORE_MICRO_ZONES,
  BangaloreMicroZone,
} from '../data/bangaloreViabilityData';
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
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  Flame,
  Zap,
  TrendingUp,
  MapPin,
  Compass,
  Building2,
  ShieldCheck,
  Sparkles,
  Database,
  Layers,
  Search,
  Sliders,
  DollarSign,
  Cpu,
  Sun,
  BatteryCharging,
  ArrowUpRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Filter,
} from 'lucide-react';

interface BangaloreViabilityHeatmapProps {
  onSelectZoneForExpansion?: (zone: BangaloreMicroZone) => void;
}

export const BangaloreViabilityHeatmap: React.FC<BangaloreViabilityHeatmapProps> = ({
  onSelectZoneForExpansion,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedZoneId, setSelectedZoneId] = useState<string>('BLR-ECITY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heatmapMetric, setHeatmapMetric] = useState<'viability' | 'deficit' | 'e4w' | 'grid' | 'roi'>('viability');
  const [heatOpacity, setHeatOpacity] = useState<number>(0.55);
  const [tileTheme, setTileTheme] = useState<'dark' | 'street'>('dark');
  const [showRings, setShowRings] = useState<boolean>(true);

  // Filtered zones
  const filteredZones = useMemo(() => {
    return BANGALORE_MICRO_ZONES.filter((zone) => {
      const matchCategory = selectedCategory === 'all' || zone.zoneType === selectedCategory;
      const matchSearch =
        zone.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.rtoZone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.primaryCorridors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        zone.keyDemandDrivers.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    }).sort((a, b) => b.viabilityScore - a.viabilityScore);
  }, [searchQuery, selectedCategory]);

  const selectedZone = useMemo(() => {
    return BANGALORE_MICRO_ZONES.find((z) => z.id === selectedZoneId) || filteredZones[0] || BANGALORE_MICRO_ZONES[0];
  }, [selectedZoneId, filteredZones]);

  // Aggregate metrics
  const totalFleetInZones = useMemo(() => {
    return BANGALORE_MICRO_ZONES.reduce((acc, z) => acc + z.vahanEvFleetCount, 0);
  }, []);

  const totalE4WInZones = useMemo(() => {
    return BANGALORE_MICRO_ZONES.reduce((acc, z) => acc + z.e4wPassengerCars, 0);
  }, []);

  const avgViability = useMemo(() => {
    return Math.round(
      BANGALORE_MICRO_ZONES.reduce((acc, z) => acc + z.viabilityScore, 0) / BANGALORE_MICRO_ZONES.length
    );
  }, []);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bangalore (approx 12.9716, 77.5946)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        className: tileTheme === 'dark' ? 'dark-tiles' : '',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    baseTileLayer.addTo(map);

    mapInstanceRef.current = map;
    heatmapLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile Theme Switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      className: tileTheme === 'dark' ? 'dark-tiles' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }, [tileTheme]);

  // 3. Render Viability Heatmap Gradient Circles & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const heatGroup = heatmapLayerGroupRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !heatGroup || !markersGroup) return;

    heatGroup.clearLayers();
    markersGroup.clearLayers();

    BANGALORE_MICRO_ZONES.forEach((zone) => {
      const isSelected = zone.id === selectedZone.id;

      // Determine color and radius based on chosen heatmap metric
      let color = '#ef4444'; // Red default
      let metricValue = `${zone.viabilityScore}/100`;

      if (heatmapMetric === 'viability') {
        if (zone.viabilityScore >= 95) color = '#ef4444'; // Crimson Extreme
        else if (zone.viabilityScore >= 90) color = '#f97316'; // Orange High
        else if (zone.viabilityScore >= 85) color = '#3b82f6'; // Blue Moderate
        else color = '#10b981'; // Emerald
        metricValue = `${zone.viabilityScore} Viability`;
      } else if (heatmapMetric === 'deficit') {
        if (zone.chargingDeficitScore >= 95) color = '#dc2626';
        else if (zone.chargingDeficitScore >= 90) color = '#ea580c';
        else color = '#0284c7';
        metricValue = `${zone.chargingDeficitScore}/100 Deficit (${zone.evToChargerRatio}:1)`;
      } else if (heatmapMetric === 'e4w') {
        if (zone.e4wPassengerCars >= 8000) color = '#3b82f6';
        else if (zone.e4wPassengerCars >= 4000) color = '#06b6d4';
        else color = '#8b5cf6';
        metricValue = `${zone.e4wPassengerCars.toLocaleString()} E-4Ws`;
      } else if (heatmapMetric === 'grid') {
        if (zone.gridHeadroomMw >= 6.0) color = '#10b981';
        else if (zone.gridHeadroomMw >= 4.0) color = '#06b6d4';
        else color = '#eab308';
        metricValue = `${zone.gridHeadroomMw} MW Headroom`;
      } else if (heatmapMetric === 'roi') {
        if (zone.paybackHorizonMonths <= 18) color = '#10b981';
        else if (zone.paybackHorizonMonths <= 20) color = '#f59e0b';
        else color = '#f97316';
        metricValue = `${zone.paybackHorizonMonths} mos Payback`;
      }

      // Outer Heat Intensity Circle (Fuzzy halo)
      const outerHeatCircle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radiusMeters * 1.35,
        color: color,
        fillColor: color,
        fillOpacity: heatOpacity * 0.45,
        weight: 0,
      });
      outerHeatCircle.addTo(heatGroup);

      // Core Viability Heat Circle
      const coreHeatCircle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radiusMeters,
        color: isSelected ? '#ffffff' : color,
        fillColor: color,
        fillOpacity: isSelected ? Math.min(0.9, heatOpacity + 0.25) : heatOpacity,
        weight: isSelected ? 3 : 1.5,
        dashArray: isSelected ? undefined : '4, 4',
      });

      coreHeatCircle.on('click', () => {
        setSelectedZoneId(zone.id);
      });
      coreHeatCircle.addTo(heatGroup);

      // Inner concentrated epicentre circle
      if (showRings) {
        const epicenterCircle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
          radius: zone.radiusMeters * 0.45,
          color: '#ffffff',
          fillColor: color,
          fillOpacity: Math.min(1.0, heatOpacity + 0.35),
          weight: 1,
        });
        epicenterCircle.addTo(heatGroup);
      }

      // HTML Marker with Viability Badge
      const markerHtml = `
        <div style="transform: translate(-50%, -50%); cursor: pointer;">
          <div style="
            background: ${isSelected ? '#ffffff' : '#0F141C'};
            color: ${isSelected ? '#0F141C' : '#ffffff'};
            border: 2px solid ${color};
            box-shadow: 0 0 16px ${color}88, 0 4px 12px rgba(0,0,0,0.8);
            border-radius: 8px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            transition: all 0.2s ease;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${color};
              display: inline-block;
              box-shadow: 0 0 8px ${color};
            "></span>
            <span>${zone.zoneName.split(' ')[0]}</span>
            <span style="
              background: ${isSelected ? '#0F141C' : color};
              color: #ffffff;
              padding: 1px 4px;
              border-radius: 4px;
              font-size: 9px;
            ">${zone.viabilityScore}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-viability-marker',
        iconSize: [0, 0],
      });

      const marker = L.marker([zone.coordinates.lat, zone.coordinates.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedZoneId(zone.id);
      });
      marker.addTo(markersGroup);
    });
  }, [heatmapMetric, heatOpacity, showRings, selectedZone.id]);

  // Pan to selected zone when changed
  useEffect(() => {
    if (mapInstanceRef.current && selectedZone) {
      mapInstanceRef.current.panTo([selectedZone.coordinates.lat, selectedZone.coordinates.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedZone.id]);

  // Donut data for selected zone vehicle distribution
  const zoneVehicleBreakdownData = useMemo(() => {
    return [
      { name: 'E-2W Commuters', value: selectedZone.e2wTwoWheelers, color: '#10b981' },
      { name: 'E-4W Private/Cabs', value: selectedZone.e4wPassengerCars, color: '#3b82f6' },
      { name: 'E-3W Cargo/Auto', value: selectedZone.e3wCommercial, color: '#f59e0b' },
      { name: 'E-Bus / LCV Fleets', value: selectedZone.eBusAndLcv, color: '#8b5cf6' },
    ];
  }, [selectedZone]);

  // Leaderboard chart data
  const zoneComparisonData = useMemo(() => {
    return BANGALORE_MICRO_ZONES.map((z) => ({
      name: z.zoneName.split(' ')[0],
      fullName: z.zoneName,
      viability: z.viabilityScore,
      deficit: z.chargingDeficitScore,
      e4w: z.e4wPassengerCars,
      payback: z.paybackHorizonMonths,
    })).sort((a, b) => b.viability - a.viability);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Telematics Overview */}
      <div className="bg-[#0F141C] border border-rose-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden font-mono">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Flame className="w-5 h-5 animate-pulse text-rose-500" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                    Bengaluru Metropolitan & Satellite Corridors EV Viability Heatmap
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/60 text-rose-300 inline-flex items-center gap-1">
                    <Radio className="w-3 h-3 text-rose-400" /> Vahan 4.0 & BESCOM Isochrones
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Micro-zone spatial analysis factoring in registered fleet density, BESCOM substation headroom, commercial traffic dwell times, and charger deficit scores.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Target Region:</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Bengaluru Urban & Tier-2 Corridors (KA)
            </span>
          </div>
        </div>

        {/* Aggregate Metros Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Total EVs in Catchment</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(totalFleetInZones / 1000).toFixed(1)}k+ EVs
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> 12 High-Density Micro-Zones
            </span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">High-Power 4W Target Fleet</span>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {totalE4WInZones.toLocaleString()} Cars
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">DC Fast Charging Vehicles</span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Average Viability Score</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {avgViability} / 100
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-bold">
              ★ Prime Commercial Feasibility
            </span>
          </div>

          <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Mean Payback Horizon</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              ~19.3 Months
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">High IRR for DC Fast Hubs</span>
          </div>
        </div>
      </div>

      {/* Heatmap Control Toolbar */}
      <div className="bg-[#0F141C] p-4 rounded-xl border border-slate-800 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Heatmap Metric Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-rose-400" /> Heat Layer:
            </span>
            <div className="inline-flex rounded-lg bg-[#0A0D12] p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setHeatmapMetric('viability')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  heatmapMetric === 'viability'
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Viability Score (0-100)
              </button>
              <button
                onClick={() => setHeatmapMetric('deficit')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  heatmapMetric === 'deficit'
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Charging Deficit Index
              </button>
              <button
                onClick={() => setHeatmapMetric('e4w')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  heatmapMetric === 'e4w'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                E-4W Fleet Density
              </button>
              <button
                onClick={() => setHeatmapMetric('grid')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  heatmapMetric === 'grid'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BESCOM Grid Headroom (MW)
              </button>
              <button
                onClick={() => setHeatmapMetric('roi')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  heatmapMetric === 'roi'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Payback Horizon (Months)
              </button>
            </div>
          </div>

          {/* Opacity & Tile Mode Controls */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-[#0A0D12] px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Heat Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={heatOpacity}
                onChange={(e) => setHeatOpacity(parseFloat(e.target.value))}
                className="w-20 accent-rose-500 cursor-pointer"
              />
              <span className="text-slate-300 font-bold text-[10px]">{(heatOpacity * 100).toFixed(0)}%</span>
            </div>

            <button
              onClick={() => setShowRings(!showRings)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                showRings
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                  : 'bg-[#0A0D12] border-slate-800 text-slate-500'
              }`}
            >
              {showRings ? 'Isochrones: ON' : 'Isochrones: OFF'}
            </button>

            <button
              onClick={() => setTileTheme(tileTheme === 'dark' ? 'street' : 'dark')}
              className="px-2.5 py-1.5 rounded-lg bg-[#0A0D12] border border-slate-800 text-slate-300 hover:text-white text-xs transition-all"
            >
              {tileTheme === 'dark' ? 'CartoDB Dark' : 'OSM Street'}
            </button>
          </div>
        </div>

        {/* Search & Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search zone (e.g. Electronic City, Bellandur, Devanahalli)..."
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Zone Archetypes ({BANGALORE_MICRO_ZONES.length} Zones)</option>
              <option value="Tier-2/3 Satellite Corridor">Tier-2/3 Satellite & Highway Corridors</option>
              <option value="Tech Belt">Major Tech Corridors</option>
              <option value="Industrial & Logistics">Industrial & Logistics Hubs</option>
              <option value="Airport Transit">Airport Transit & Highway Nodes</option>
              <option value="Urban Commercial">Urban Commercial & Start-up Centers</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-[#0A0D12] rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Viable Micro-Zones:</span>
            <span className="text-rose-400 font-bold">{filteredZones.length} Hotspots Active</span>
          </div>

          {/* Heat Intensity Legend */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#0A0D12] rounded-lg border border-slate-800 text-[10px]">
            <span className="text-slate-400 font-bold">Heat Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" /> 95+
              </span>
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 90-94
              </span>
              <span className="flex items-center gap-1 text-blue-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 85-89
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Zone Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Leaflet Viability Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F141C] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono flex flex-col h-[680px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Bengaluru Viability Isochrone & Substation Heatmap
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Click any zone circle to inspect</span>
          </div>

          <div className="flex-1 w-full rounded-lg overflow-hidden border border-slate-800 relative">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>
              Selected Zone: <strong className="text-slate-100">{selectedZone.zoneName}</strong>
            </span>
            <span className="text-emerald-400 font-bold">
              {selectedZone.coordinates.lat.toFixed(4)}° N, {selectedZone.coordinates.lng.toFixed(4)}° E
            </span>
          </div>
        </div>

        {/* Selected Micro-Zone Detailed Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4 font-mono">
          <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    {selectedZone.zoneType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    RTO: {selectedZone.rtoZone}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{selectedZone.zoneName}</h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-rose-400 block">
                  {selectedZone.viabilityScore} / 100
                </span>
                <span className="text-[9px] text-slate-400">Viability Score</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Active EV Fleet</span>
                <strong className="text-sm text-emerald-400 block mt-0.5">
                  {selectedZone.vahanEvFleetCount.toLocaleString()}
                </strong>
                <span className="text-[9px] text-emerald-500/90 font-semibold">+{selectedZone.yoyGrowthPct}% YoY</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">E-4W Cars</span>
                <strong className="text-sm text-blue-400 block mt-0.5">
                  {selectedZone.e4wPassengerCars.toLocaleString()}
                </strong>
                <span className="text-[9px] text-slate-400">DC Fast Demand</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">EV:Gun Deficit</span>
                <strong className="text-sm text-rose-400 block mt-0.5">
                  {selectedZone.evToChargerRatio}:1
                </strong>
                <span className="text-[9px] text-amber-400 font-semibold">Acute Gap</span>
              </div>

              <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Payback Horizon</span>
                <strong className="text-sm text-amber-400 block mt-0.5">
                  {selectedZone.paybackHorizonMonths} Mos
                </strong>
                <span className="text-[9px] text-slate-400">~{selectedZone.estDailySessions} sess/day</span>
              </div>
            </div>

            {/* BESCOM Grid Power & Substation Telematics */}
            <div className="bg-[#0A0D12] p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> BESCOM Grid Substation Telematics
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {selectedZone.transformerFeasibility}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 font-sans">
                <p>
                  <strong>Substation Node:</strong> {selectedZone.bescomSubstation}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Available Headroom</span>
                    <strong className="text-emerald-400">{selectedZone.gridHeadroomMw} MW Grid Capacity</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Solar Canopy Feasibility</span>
                    <strong className="text-amber-400">{selectedZone.solarCanopyPotentialKw} kW Potential</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Projection & CapEx */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Projected Economics & Revenue
                </span>
                <span className="text-emerald-300 font-bold">
                  ${selectedZone.estMonthlyRevenueUsd.toLocaleString()} / mo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Est. CapEx</span>
                  <strong className="text-slate-200">${selectedZone.estCapexUsd.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Daily Dispensed</span>
                  <strong className="text-slate-200">{selectedZone.projectedDailyKwh.toLocaleString()} kWh</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg Tariff</span>
                  <strong className="text-slate-200">${selectedZone.avgTariffPerKwh}/kWh</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
                {selectedZone.executiveSummary}
              </p>
            </div>

            {/* Recommended Gun Configuration */}
            <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recommended Charger Gun Mix for This Zone
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">CCS2 150kW</span>
                  <strong className="text-blue-400 text-sm">{selectedZone.recommendedGunMix.ccs2Fast150Kw} Ports</strong>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">NACS 250kW</span>
                  <strong className="text-purple-400 text-sm">{selectedZone.recommendedGunMix.nacs250Kw} Ports</strong>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">Type 2 AC</span>
                  <strong className="text-emerald-400 text-sm">{selectedZone.recommendedGunMix.type2Ac22Kw} Ports</strong>
                </div>
              </div>
            </div>

            {/* 1-Click Action into Expansion Planner */}
            {onSelectZoneForExpansion && (
              <button
                onClick={() => onSelectZoneForExpansion(selectedZone)}
                className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Model AI Expansion Site in {selectedZone.zoneName.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zone Leaderboard Comparison & Recharts Visualizer */}
      <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Bengaluru Micro-Zone Viability & Payback Leaderboard
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comparative benchmark across Tech Parks, Satellite Corridors, Airport Highway, and Logistics Zones.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ranked by Viability Index</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[70, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F141C',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any, name: string) => [
                  name === 'viability' ? `${value}/100 Viability` : `${value} months`,
                  name === 'viability' ? 'Viability Score' : 'Payback Horizon',
                ]}
              />
              <Bar dataKey="viability" fill="#ef4444" radius={[4, 4, 0, 0]} name="viability" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Zone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {BANGALORE_MICRO_ZONES.map((zone) => {
            const isCurrent = zone.id === selectedZone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-[#0A0D12] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{zone.zoneName}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{zone.rtoZone}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      zone.viabilityScore >= 95
                        ? 'bg-rose-500 text-white'
                        : zone.viabilityScore >= 90
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {zone.viabilityScore}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">EV Fleet</span>
                    <strong className="text-emerald-400">{(zone.vahanEvFleetCount / 1000).toFixed(1)}k</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Deficit</span>
                    <strong className="text-rose-400">{zone.chargingDeficitScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payback</span>
                    <strong className="text-amber-400">~{zone.paybackHorizonMonths}m</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
