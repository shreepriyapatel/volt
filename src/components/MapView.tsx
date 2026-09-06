import React, { useState, useMemo } from 'react';
import { ChargingStation, ConnectorType, StationCategory, StationStatus } from '../types';
import { Search, Filter, Zap, MapPin, ShieldAlert, CheckCircle2, BatteryCharging, Flame, Navigation, Clock, Star, Info, Layers, Map as MapIcon } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';

interface MapViewProps {
  stations: ChargingStation[];
  selectedStationId?: string;
  onSelectStation: (station: ChargingStation) => void;
  showHeatmap: boolean;
  onStartSession?: (station: ChargingStation) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  showHeatmap,
  onStartSession,
}) => {
  const [mapProvider, setMapProvider] = useState<'google' | 'vector'>('google');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedConnector, setSelectedConnector] = useState<string>('All');
  const [minPowerKw, setMinPowerKw] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filtered stations logic
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Search
      const matchesSearch =
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory = selectedCategory === 'All' || station.category === selectedCategory;

      // Status
      const matchesStatus = selectedStatus === 'All' || station.status === selectedStatus;

      // Power
      const matchesPower = station.maxPowerKw >= minPowerKw;

      // Connector
      const matchesConnector =
        selectedConnector === 'All' ||
        station.ports.some((p) => p.type === selectedConnector);

      return matchesSearch && matchesCategory && matchesStatus && matchesPower && matchesConnector;
    });
  }, [stations, searchQuery, selectedCategory, selectedStatus, minPowerKw, selectedConnector]);

  const activeSelectedStation = stations.find((s) => s.id === selectedStationId);

  return (
    <div className="relative w-full h-[calc(100vh-110px)] bg-[#0A0D12] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls & Station List */}
      <div className="w-full md:w-96 bg-[#0F141C] border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        {/* Search & Filters */}
        <div className="p-3 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Live Network Stations</h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              {filteredStations.length} ACTIVE
            </span>
          </div>

          {/* Map Provider Selector */}
          <div className="bg-[#0A0D12] p-1 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px]">
            <button
              onClick={() => setMapProvider('google')}
              className={`flex-1 py-1 px-2 rounded text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                mapProvider === 'google'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => setMapProvider('vector')}
              className={`flex-1 py-1 px-2 rounded text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                mapProvider === 'vector'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vector Canvas</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter station name, city, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0D12] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Category Filter */}
            <div>
              <label className="text-[9px] uppercase text-slate-500 font-bold block mb-0.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Categories</option>
                <option value="Highway Superhub">Highway Superhub</option>
                <option value="Urban Mall">Urban Mall</option>
                <option value="Commercial Office">Commercial Office</option>
                <option value="Fleet Depot">Fleet Depot</option>
              </select>
            </div>

            {/* Connector Filter */}
            <div>
              <label className="text-[9px] uppercase text-slate-500 font-bold block mb-0.5">Connector</label>
              <select
                value={selectedConnector}
                onChange={(e) => setSelectedConnector(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Plugs</option>
                <option value="NACS">NACS (Tesla)</option>
                <option value="CCS2">CCS2 (Ultra Fast)</option>
                <option value="Type 2">Type 2 (AC)</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5 font-mono text-[11px]">
            <div className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Speed Filter:</span>
            </div>
            <button
              onClick={() => setMinPowerKw(minPowerKw === 150 ? 0 : 150)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                minPowerKw >= 150
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              ≥150 kW Supercharge
            </button>
          </div>
        </div>

        {/* Station Cards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-[11px]">
          {filteredStations.map((station) => {
            const isSelected = station.id === selectedStationId;
            const uptime = station.uptimePct ?? 99.2;
            const isFaulted = station.status === 'faulted' || station.status === 'offline';
            const isDegraded = station.status === 'degraded' || (station.ports && station.ports.some(p => p.status === 'faulted' || p.status === 'offline'));

            const statusText = isFaulted ? 'OFFLINE' : isDegraded ? 'DEGRADED' : 'ONLINE';
            const statusColor = isFaulted
              ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
              : isDegraded
              ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-[#0A0D12] hover:bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-bold truncate">{station.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor} shrink-0`}>
                    {statusText} • {uptime}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>{station.city}, {station.state}</span>
                  <span className="text-slate-200 font-bold">
                    {station.availablePorts}/{station.totalPorts} Ports Avail
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-semibold">{station.maxPowerKw} kW DC Fast</span>
                  <span className="text-amber-400 font-bold">
                    ${(station.basePricePerKwh * (station.surgePriceMultiplier || 1)).toFixed(2)}/kWh
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden min-h-[400px]">
        {mapProvider === 'google' ? (
          <GoogleMapView
            stations={filteredStations}
            selectedStationId={selectedStationId}
            onSelectStation={onSelectStation}
            showHeatmap={showHeatmap}
            onStartSession={onStartSession}
            height="100%"
          />
        ) : (
          <>
            {/* Map Vector Graphic Canvas Background */}
            <div className="absolute inset-0 bg-slate-950">
          {/* Simulated Regional Map Background (roads, topography, bay) */}
          <svg className="w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
              <radialGradient id="bayGradient" cx="20%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid */}
            <rect width="100%" height="100%" fill="url(#gridPattern)" />

            {/* Bay / Water contours */}
            <path
              d="M 0,200 Q 150,120 300,220 T 600,180 T 900,300 L 900,0 L 0,0 Z"
              fill="url(#bayGradient)"
              stroke="#0369a1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Major Highway Corridors */}
            <path
              d="M 50,50 Q 300,300 850,750"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeOpacity="0.4"
            />
            <path
              d="M 50,50 Q 300,300 850,750"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            <path
              d="M 200,800 Q 450,400 800,100"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeOpacity="0.3"
            />

            {/* Urban Center Concentric Zones */}
            <circle cx="30%" cy="35%" r="120" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="62%" cy="62%" r="140" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />
          </svg>
        </div>

        {/* Congestion Heatmaps Layer */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500">
            {stations.map((station) => {
              const occupancyRatio = (station.totalPorts - station.availablePorts) / station.totalPorts;
              const sizePx = Math.max(140, occupancyRatio * 280);
              return (
                <div
                  key={`heatmap-${station.id}`}
                  style={{
                    left: `${station.coordinates.xPct}%`,
                    top: `${station.coordinates.yPct}%`,
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute rounded-full blur-2xl opacity-60 transition-all duration-700 ${
                    occupancyRatio > 0.75
                      ? 'bg-rose-500/40 animate-pulse'
                      : occupancyRatio > 0.4
                      ? 'bg-amber-500/30'
                      : 'bg-emerald-500/20'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Map Legend & Status Controls Overlay */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-2">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>Map Legend</span>
            {showHeatmap && (
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 animate-bounce" /> Heatmap Active
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
              Operational (&gt;50% Free)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
              High Demand / Busy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
              Fault / Maintenance
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3 h-3" />
              350kW Ultra Fast
            </span>
          </div>
        </div>

        {/* Station Markers on Map Canvas */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {filteredStations.map((station) => {
            const isSelected = station.id === selectedStationId;
            const occupancyPct = Math.round(((station.totalPorts - station.availablePorts) / station.totalPorts) * 100);

            return (
              <div
                key={station.id}
                style={{
                  left: `${station.coordinates.xPct}%`,
                  top: `${station.coordinates.yPct}%`,
                }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300"
                onClick={() => onSelectStation(station)}
              >
                {/* Ping animation if selected */}
                {isSelected && (
                  <span className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping" />
                )}

                {/* Marker Pin Icon */}
                <div
                  className={`relative p-2 rounded-2xl shadow-xl flex items-center gap-1.5 border transition-all duration-300 transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-400 ring-4 ring-emerald-500/30 scale-110'
                      : station.status === 'operational'
                      ? 'bg-slate-900 border-emerald-500/80 text-emerald-400'
                      : station.status === 'busy'
                      ? 'bg-slate-900 border-amber-500/80 text-amber-400'
                      : 'bg-slate-900 border-rose-500/80 text-rose-400'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl ${
                      station.status === 'operational'
                        ? 'bg-emerald-500 text-slate-950'
                        : station.status === 'busy'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-rose-500 text-slate-950'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                  </div>

                  <div className="pr-1 text-left">
                    <p className="text-xs font-bold text-slate-100 whitespace-nowrap">{station.name.split(' ')[0]}</p>
                    <p className="text-[10px] font-mono text-slate-300 font-semibold">
                      {station.availablePorts}/{station.totalPorts} free • {station.maxPowerKw}kW
                    </p>
                  </div>
                </div>

                {/* Hover Quick Card Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs z-30">
                  <div className="font-semibold text-slate-100">{station.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{station.address}</div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-emerald-400 font-bold">{station.availablePorts} Ports Open</span>
                    <span className="text-amber-300">${(station.basePricePerKwh * station.surgePriceMultiplier).toFixed(2)}/kWh</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Floating Quick Action Banner when a station is selected */}
        {activeSelectedStation && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-[90%] max-w-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{activeSelectedStation.name}</h4>
                <p className="text-xs text-slate-400">
                  {activeSelectedStation.city} • {activeSelectedStation.category} • Max {activeSelectedStation.maxPowerKw} kW
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectStation(activeSelectedStation)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Inspect Station
              </button>

              {onStartSession && activeSelectedStation.availablePorts > 0 && (
                <button
                  onClick={() => onStartSession(activeSelectedStation)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <BatteryCharging className="w-4 h-4" />
                  Start Charge
                </button>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};
