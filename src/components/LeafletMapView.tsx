import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChargingStation, ExpansionSiteProposal } from '../types';
import {
  Zap,
  Navigation,
  BatteryCharging,
  Sparkles,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  Wrench,
  TrendingUp,
} from 'lucide-react';

interface LeafletMapViewProps {
  stations: ChargingStation[];
  selectedStationId?: string;
  onSelectStation: (station: ChargingStation) => void;
  showHeatmap?: boolean;
  proposals?: ExpansionSiteProposal[];
  onSelectProposal?: (proposal: ExpansionSiteProposal) => void;
  onMapClickSelectLocation?: (lat: number, lng: number, address?: string) => void;
  isInvestorMode?: boolean;
  onStartSession?: (station: ChargingStation) => void;
  height?: string;
  providerName?: string;
  onToggleProvider?: () => void;
}

export type StationReliabilityStatus = 'online' | 'degraded' | 'offline';

export const getStationReliability = (station: ChargingStation): {
  status: StationReliabilityStatus;
  statusLabel: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  uptime: number;
} => {
  const uptime = station.uptimePct ?? 99.2;
  const isFaulted = station.status === 'faulted';
  const isOffline = station.status === 'offline';
  const isDegraded = station.status === 'degraded' || (station.ports && station.ports.some(p => p.status === 'faulted' || p.status === 'offline'));

  if (isFaulted || isOffline || uptime < 70) {
    return {
      status: 'offline',
      statusLabel: 'OFFLINE / OUTAGE',
      colorHex: '#ef4444', // Crimson Red
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-400',
      badgeBorder: 'border-rose-500/50',
      uptime,
    };
  }

  if (isDegraded || uptime < 96) {
    return {
      status: 'degraded',
      statusLabel: 'DEGRADED',
      colorHex: '#f59e0b', // Amber Orange
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-500/50',
      uptime,
    };
  }

  return {
    status: 'online',
    statusLabel: 'ONLINE (HEALTHY)',
    colorHex: '#10b981', // Emerald Green
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/50',
    uptime,
  };
};

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  proposals = [],
  onSelectProposal,
  onMapClickSelectLocation,
  isInvestorMode = false,
  onStartSession,
  height = '100%',
  providerName = 'OpenStreetMap (CartoDB Dark)',
  onToggleProvider,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [activeStation, setActiveStation] = useState<ChargingStation | null>(null);
  const [activeProposal, setActiveProposal] = useState<ExpansionSiteProposal | null>(null);
  const [routeTarget, setRouteTarget] = useState<ChargingStation | null>(null);
  const [tileMode, setTileMode] = useState<'dark' | 'street'>('dark');
  const [reliabilityFilter, setReliabilityFilter] = useState<'all' | 'online' | 'degraded' | 'offline'>('all');

  // Filter stations based on selected reliability filter
  const displayedStations = useMemo(() => {
    if (reliabilityFilter === 'all') return stations;
    return stations.filter((s) => {
      const { status } = getStationReliability(s);
      return status === reliabilityFilter;
    });
  }, [stations, reliabilityFilter]);

  // Reliability Telematics Aggregates
  const counts = useMemo(() => {
    let online = 0;
    let degraded = 0;
    let offline = 0;
    let sumUptime = 0;

    stations.forEach((s) => {
      const { status, uptime } = getStationReliability(s);
      sumUptime += uptime;
      if (status === 'online') online++;
      else if (status === 'degraded') degraded++;
      else offline++;
    });

    const avgUptime = stations.length > 0 ? (sumUptime / stations.length).toFixed(1) : '99.0';
    return { online, degraded, offline, avgUptime, total: stations.length };
  }, [stations]);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use initial station center or Bangalore coordinates
    const initialCenter: [number, number] = stations.length > 0
      ? [stations[0].coordinates.lat, stations[0].coordinates.lng]
      : [12.9716, 77.5946];

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: tileMode === 'dark' ? 'dark-tiles' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    streetLayer.addTo(map);

    map.on('click', (e) => {
      if (onMapClickSelectLocation) {
        onMapClickSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    });

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer on tileMode change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: tileMode === 'dark' ? 'dark-tiles' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }, [tileMode]);

  // Sync selected station center
  useEffect(() => {
    if (!selectedStationId) return;
    const found = stations.find((s) => s.id === selectedStationId);
    if (found) {
      setActiveStation(found);
      setActiveProposal(null);
      if (mapRef.current) {
        mapRef.current.panTo([found.coordinates.lat, found.coordinates.lng], { animate: true });
      }
    }
  }, [selectedStationId, stations]);

  // Render station markers & proposal markers with FRONT & CENTER reliability status
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Render Station Markers
    displayedStations.forEach((station) => {
      const isSelected = station.id === selectedStationId;
      const { status, statusLabel, colorHex, uptime } = getStationReliability(station);

      const isBusy = station.status === 'busy';
      const isCharging = isBusy || station.availablePorts < station.totalPorts;

      // Status text badge for marker
      const statusPillText = status === 'online'
        ? `${uptime}% UPTIME`
        : status === 'degraded'
        ? `DEGRADED ${uptime}%`
        : `OFFLINE 0%`;

      const customHtml = `
        <div style="transform: translate(-50%, -100%); cursor: pointer; position: relative;">
          <!-- Pin Container -->
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #0F141C;
            border: 2px solid ${colorHex};
            box-shadow: 0 0 ${isSelected ? '20px' : '10px'} ${colorHex}99, 0 8px 16px rgba(0,0,0,0.8);
            border-radius: 20px;
            padding: 4px 10px 4px 6px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            color: #ffffff;
            white-space: nowrap;
            transition: all 0.2s ease;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            z-index: ${isSelected ? 100 : 10};
          ">
            <!-- Status Glow Dot -->
            <span style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${colorHex};
              box-shadow: 0 0 8px ${colorHex};
              display: inline-block;
              flex-shrink: 0;
            "></span>

            <!-- Station Short Name -->
            <span style="color: #f8fafc; font-weight: 700;">${station.name.split(' ')[0]}</span>

            <!-- Live Reliability Status Pill -->
            <span style="
              background: ${colorHex}22;
              color: ${colorHex};
              border: 1px solid ${colorHex}66;
              padding: 2px 6px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.5px;
            ">${statusPillText}</span>

            <!-- Available Ports Counter -->
            <span style="
              background: #1e293b;
              color: ${station.availablePorts > 0 ? '#38bdf8' : '#94a3b8'};
              padding: 1px 5px;
              border-radius: 4px;
              font-size: 9px;
            ">${station.availablePorts}/${station.totalPorts}</span>
          </div>

          <!-- Bottom Pin Arrow Point -->
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: #0F141C;
            border-right: 2px solid ${colorHex};
            border-bottom: 2px solid ${colorHex};
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-station-reliability-marker',
        iconSize: [0, 0],
      });

      const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon });

      marker.on('click', () => {
        onSelectStation(station);
        setActiveStation(station);
        setActiveProposal(null);
      });

      group.addLayer(marker);
    });

    // Render Investor Proposals
    if (isInvestorMode) {
      proposals.forEach((prop) => {
        const customHtml = `
          <div style="transform: translate(-50%, -50%); cursor: pointer;">
            <div style="
              background: #581c87;
              color: #fde047;
              border: 2px solid #c084fc;
              box-shadow: 0 0 12px #a855f7;
              border-radius: 8px;
              padding: 4px 8px;
              font-family: monospace;
              font-size: 10px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>✦ PROP: ${prop.siteName.split(' ')[0]}</span>
              <span style="background: #3b0764; color: #fde047; padding: 1px 4px; border-radius: 4px;">${prop.feasibilityScore}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-proposal-marker',
          iconSize: [0, 0],
        });

        const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon });

        marker.on('click', () => {
          if (onSelectProposal) onSelectProposal(prop);
          setActiveProposal(prop);
          setActiveStation(null);
        });

        group.addLayer(marker);
      });
    }
  }, [displayedStations, proposals, selectedStationId, isInvestorMode]);

  // Route drawing logic
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeTarget) {
      const origin: [number, number] = stations.length > 0
        ? [stations[0].coordinates.lat, stations[0].coordinates.lng]
        : [37.7749, -122.4194];
      const destination: [number, number] = [routeTarget.coordinates.lat, routeTarget.coordinates.lng];

      const polyline = L.polyline([origin, destination], {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routePolylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeTarget, stations]);

  return (
    <div className="relative w-full overflow-hidden bg-[#0A0D12]" style={{ height }}>
      {/* Leaflet Map DOM Container */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Front-and-Center Reliability Status Filter & HUD Banner */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none font-mono">
        {/* Left: Reliability Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0F141C]/95 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-2xl pointer-events-auto">
          <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Station Health:
          </span>

          <button
            onClick={() => setReliabilityFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              reliabilityFilter === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({counts.total})
          </button>

          <button
            onClick={() => setReliabilityFilter('online')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              reliabilityFilter === 'online'
                ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online ({counts.online})</span>
          </button>

          <button
            onClick={() => setReliabilityFilter('degraded')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              reliabilityFilter === 'degraded'
                ? 'bg-amber-950 border border-amber-500/60 text-amber-300 shadow-md shadow-amber-950'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Degraded ({counts.degraded})</span>
          </button>

          <button
            onClick={() => setReliabilityFilter('offline')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              reliabilityFilter === 'offline'
                ? 'bg-rose-950 border border-rose-500/60 text-rose-300 shadow-md shadow-rose-950'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Offline ({counts.offline})</span>
          </button>
        </div>

        {/* Right: Map Controls & Tile Theme */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#0F141C]/95 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Avg Uptime:</span>
            <span className="text-emerald-400 font-bold">{counts.avgUptime}%</span>
          </div>

          <button
            onClick={() => setTileMode(tileMode === 'dark' ? 'street' : 'dark')}
            className="px-3 py-1.5 rounded-xl bg-[#0F141C]/95 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-colors shadow-lg"
          >
            {tileMode === 'dark' ? 'Street Map' : 'Dark Map'}
          </button>

          {onToggleProvider && (
            <button
              onClick={onToggleProvider}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 shadow-xl backdrop-blur-md transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Change Map View
            </button>
          )}
        </div>
      </div>

      {/* Station Active Popup Card with Front & Center Reliability Gauge */}
      {activeStation && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-[#0F141C]/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getStationReliability(activeStation).colorHex,
                  boxShadow: `0 0 10px ${getStationReliability(activeStation).colorHex}`,
                }}
              />
              <div>
                <p className="font-bold text-sm text-slate-100">{activeStation.name}</p>
                <p className="text-[10px] text-slate-400">{activeStation.address}, {activeStation.city}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveStation(null)}
              className="text-slate-500 hover:text-slate-300 text-lg font-bold px-1.5"
            >
              ×
            </button>
          </div>

          {/* Front-and-Center Live Reliability & Uptime Telematics Box */}
          {(() => {
            const rel = getStationReliability(activeStation);
            return (
              <div className={`p-3 rounded-xl border ${rel.badgeBg} ${rel.badgeBorder} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Station Reliability Health
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rel.badgeText} bg-black/40 border ${rel.badgeBorder}`}>
                    {rel.statusLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-black ${rel.badgeText}`}>
                      {rel.uptime}%
                    </div>
                    <span className="text-[9px] text-slate-400">30-Day Mean Availability</span>
                  </div>

                  <div className="text-right text-[10px]">
                    <div className="text-slate-300 font-bold">
                      {activeStation.availablePorts} of {activeStation.totalPorts} Ports Active
                    </div>
                    <span className="text-slate-400">
                      Grid Demand: {activeStation.gridDemandKw || 0} kW
                    </span>
                  </div>
                </div>

                {/* Individual Port Health Dots */}
                <div className="pt-1 border-t border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block mb-1">Connector Telematics:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeStation.ports?.map((p, idx) => {
                      const isPortHealthy = p.status === 'available' || p.status === 'charging' || p.status === 'reserved';
                      const isPortCharging = p.status === 'charging';
                      const portColor = p.status === 'faulted'
                        ? 'bg-rose-500 border-rose-400'
                        : p.status === 'offline'
                        ? 'bg-slate-600 border-slate-500'
                        : isPortCharging
                        ? 'bg-blue-400 border-blue-300'
                        : 'bg-emerald-400 border-emerald-300';

                      return (
                        <div
                          key={p.id || idx}
                          title={`Port ${p.portNumber}: ${p.type} (${p.status.toUpperCase()})`}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-slate-950 border ${portColor}`}
                        >
                          {p.portNumber}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick Technical Specs */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <p className="text-slate-400 text-[10px]">Max Power</p>
              <p className="font-bold text-emerald-400 text-xs mt-0.5">{activeStation.maxPowerKw} kW DC</p>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <p className="text-slate-400 text-[10px]">Active Tariff</p>
              <p className="font-bold text-amber-400 text-xs mt-0.5">
                ${(activeStation.basePricePerKwh * (activeStation.surgePriceMultiplier || 1)).toFixed(2)} / kWh
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setRouteTarget(activeStation);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 fill-current text-emerald-400" /> Route Here
            </button>
            {onStartSession && activeStation.availablePorts > 0 && activeStation.status !== 'faulted' && (
              <button
                onClick={() => onStartSession(activeStation)}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <BatteryCharging className="w-4 h-4" /> Start Charge
              </button>
            )}
          </div>
        </div>
      )}

      {/* Proposal Active Popup Card */}
      {activeProposal && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-[#0F141C]/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-bold text-sm text-purple-300">{activeProposal.siteName}</p>
                <p className="text-[10px] text-slate-400">{activeProposal.city}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveProposal(null)}
              className="text-slate-500 hover:text-slate-300 text-base font-bold px-1"
            >
              ×
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Feasibility Score</span>
            <span className="font-bold text-amber-400">{activeProposal.feasibilityScore}/100</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Est. Investment</span>
            <span className="font-bold text-emerald-400">${(activeProposal.targetInvestmentUsd / 1000).toFixed(0)}k</span>
          </div>
        </div>
      )}
    </div>
  );
};
