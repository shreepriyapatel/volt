import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ChargingStation, ExpansionSiteProposal } from '../types';
import {
  Zap,
  Navigation,
  Sparkles,
  Layers,
  Settings,
  X,
  BatteryCharging,
  Globe,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LeafletMapView } from './LeafletMapView';

const cleanKey = (raw: any): string => {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/["']/g, '').trim();
};

const isValidKeyFormat = (key: string): boolean => {
  const trimmed = cleanKey(key);
  if (!trimmed) return false;
  if (
    trimmed === 'YOUR_API_KEY' ||
    trimmed.includes('YOUR_KEY') ||
    trimmed === 'MY_MAPS_KEY' ||
    trimmed.includes('PLACEHOLDER')
  ) {
    return false;
  }
  return trimmed.startsWith('AIzaSy') && trimmed.length >= 30;
};

const rawApiKey =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const API_KEY_VALUE = cleanKey(rawApiKey);

interface GoogleMapViewProps {
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
}

// Inner Google Map Controller for panning, place search & route rendering
const MapController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  routeTargetStation: ChargingStation | null;
  onClearRoute: () => void;
}> = ({ center, zoom, routeTargetStation, onClearRoute }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (!routesLib || !map || !routeTargetStation) {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      setRouteInfo(null);
      return;
    }

    const origin = { lat: 37.7749, lng: -122.4194 };
    const destination = {
      lat: routeTargetStation.coordinates.lat,
      lng: routeTargetStation.coordinates.lng,
    };

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const directionsService = new routesLib.DirectionsService();
    directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((result) => {
      if (result.routes && result.routes[0]) {
        const polyline = new google.maps.Polyline({
          path: result.routes[0].overview_path,
          geodesic: true,
          strokeColor: '#10b981',
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });
        polyline.setMap(map);
        polylinesRef.current.push(polyline);

        const leg = result.routes[0].legs[0];
        if (leg) {
          setRouteInfo({
            distance: leg.distance?.text || '3.2 mi',
            duration: leg.duration?.text || '8 mins',
          });
        }
      }
    })
    .catch((err) => {
      console.warn('Google directions calculation error:', err);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
    };
  }, [routesLib, map, routeTargetStation]);

  if (!routeInfo || !routeTargetStation) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-[#0F141C]/95 border border-emerald-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 font-mono text-xs">
      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
        <Navigation className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <div className="font-bold text-slate-100">{routeTargetStation.name}</div>
        <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
          {routeInfo.distance} • ~{routeInfo.duration} drive
        </div>
      </div>
      <button
        onClick={onClearRoute}
        className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px]"
      >
        Clear Route
      </button>
    </div>
  );
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  showHeatmap = true,
  proposals = [],
  onSelectProposal,
  onMapClickSelectLocation,
  isInvestorMode = false,
  onStartSession,
  height = '100%',
}) => {
  const [authFailed, setAuthFailed] = useState(false);
  const [manualKey, setManualKey] = useState<string>(() => {
    return localStorage.getItem('gmaps_user_key') || '';
  });
  const [inputKey, setInputKey] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const effectiveKey = cleanKey(manualKey || API_KEY_VALUE);
  const hasValidGoogleKey = isValidKeyFormat(effectiveKey);

  // Preferred engine state: default to 'leaflet' (OpenStreetMap) so it works 100% out of the box with zero API key required
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google'>(() => {
    return hasValidGoogleKey && !authFailed ? 'google' : 'leaflet';
  });

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(() => {
    if (stations && stations.length > 0) {
      return { lat: stations[0].coordinates.lat, lng: stations[0].coordinates.lng };
    }
    return { lat: 12.9716, lng: 77.5946 };
  });
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);
  const [routeTargetStation, setRouteTargetStation] = useState<ChargingStation | null>(null);

  // Auth failure listener for Google Maps API key errors
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('Google Maps Authentication failed (InvalidKeyMapError). Switching automatically to OpenStreetMap (Leaflet).');
      setAuthFailed(true);
      setMapEngine('leaflet');
    };

    (window as any).__handleGmapsAuthFailure = handleAuthFailure;
    (window as any).gm_authFailure = handleAuthFailure;

    const handleWindowError = (e: ErrorEvent) => {
      if (
        e.message &&
        (e.message.includes('InvalidKeyMapError') ||
          e.message.includes('Google Maps JavaScript API error') ||
          e.message.includes('ApiNotActivatedMapError'))
      ) {
        setAuthFailed(true);
        setMapEngine('leaflet');
      }
    };

    window.addEventListener('error', handleWindowError);

    return () => {
      (window as any).__handleGmapsAuthFailure = null;
      window.removeEventListener('error', handleWindowError);
    };
  }, [effectiveKey]);

  // Sync selected station
  useEffect(() => {
    if (selectedStationId) {
      const target = stations.find((s) => s.id === selectedStationId);
      if (target) {
        setMapCenter({ lat: target.coordinates.lat, lng: target.coordinates.lng });
        setMapZoom(12);
        setActiveInfoWindowId(target.id);
      }
    }
  }, [selectedStationId, stations]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleApplyManualKey = () => {
    const cleaned = cleanKey(inputKey);
    if (cleaned) {
      if (!cleaned.startsWith('AIzaSy')) {
        setStatusMessage('Note: Google Maps API keys start with "AIzaSy...". OpenStreetMap remains active without any key.');
      } else {
        localStorage.setItem('gmaps_user_key', cleaned);
        setManualKey(cleaned);
        setAuthFailed(false);
        setMapEngine('google');
        setShowSettingsModal(false);
        setInputKey('');
        setStatusMessage(null);
      }
    }
  };

  const handleClearManualKey = () => {
    localStorage.removeItem('gmaps_user_key');
    setManualKey('');
    setAuthFailed(false);
    setMapEngine('leaflet');
  };

  const handleStationClick = (station: ChargingStation) => {
    onSelectStation(station);
    setActiveInfoWindowId(station.id);
    setMapCenter({ lat: station.coordinates.lat, lng: station.coordinates.lng });
  };

  const handleProposalClick = (proposal: ExpansionSiteProposal) => {
    if (onSelectProposal) onSelectProposal(proposal);
    setActiveInfoWindowId(proposal.id);
    setMapCenter({ lat: proposal.coordinates.lat, lng: proposal.coordinates.lng });
  };

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng && onMapClickSelectLocation) {
      onMapClickSelectLocation(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  // If mapEngine is leaflet or Google key is invalid/failed, render LeafletMapView
  if (mapEngine === 'leaflet' || !hasValidGoogleKey || authFailed) {
    return (
      <div className="relative w-full h-full">
        <LeafletMapView
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
          proposals={proposals}
          onSelectProposal={onSelectProposal}
          onMapClickSelectLocation={onMapClickSelectLocation}
          isInvestorMode={isInvestorMode}
          onStartSession={onStartSession}
          height={height}
          providerName="OpenStreetMap Engine (CartoDB Dark)"
          onToggleProvider={() => setShowSettingsModal(true)}
        />

        {/* Map API Configuration Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md bg-[#0F141C] border border-slate-800 rounded-2xl p-5 shadow-2xl text-xs font-mono text-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Globe className="w-4 h-4" /> Map Engine & API Settings
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 font-bold">Active Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMapEngine('leaflet')}
                    className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
                      mapEngine === 'leaflet'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Globe className="w-3.5 h-3.5" /> OpenStreetMap
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active • 100% Free & Fast</span>
                  </button>

                  <button
                    onClick={() => {
                      if (hasValidGoogleKey && !authFailed) {
                        setMapEngine('google');
                        setShowSettingsModal(false);
                      } else {
                        setStatusMessage('Enter a Google Maps API Key starting with "AIzaSy..." below to enable Google Maps, or keep OpenStreetMap active.');
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
                      mapEngine === 'google'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Layers className="w-3.5 h-3.5" /> Google Maps
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {hasValidGoogleKey ? 'Ready' : 'Requires API Key'}
                    </span>
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                  {statusMessage}
                </div>
              )}

              {/* Key Input Section */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-[11px] text-slate-300 font-bold flex items-center justify-between">
                  <span>Google Maps Platform API Key</span>
                  {hasValidGoogleKey && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Key Loaded</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-[#0A0D12] text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyManualKey}
                    disabled={!inputKey.trim()}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shrink-0"
                  >
                    Save Key
                  </button>
                </div>
                {manualKey && (
                  <button
                    onClick={handleClearManualKey}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline pt-1"
                  >
                    Remove Saved Key
                  </button>
                )}
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                  Note: Google Maps API keys strictly start with <code className="text-emerald-400">AIzaSy...</code>. OpenStreetMap requires zero keys and is fully active.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Google Maps View when valid key is selected
  return (
    <div className="relative w-full overflow-hidden bg-[#0A0D12]" style={{ height }}>
      {/* Provider Switch Header */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-emerald-400 backdrop-blur-md hover:bg-slate-800 shadow-xl"
        >
          <Settings className="w-3.5 h-3.5" /> Map Engine: Google Maps
        </button>
      </div>

      <APIProvider apiKey={effectiveKey} version="weekly">
        <Map
          defaultCenter={{ lat: 12.9716, lng: 77.5946 }}
          defaultZoom={11}
          mapId="DEMO_MAP_ID"
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController
            center={mapCenter}
            zoom={mapZoom}
            routeTargetStation={routeTargetStation}
            onClearRoute={() => setRouteTargetStation(null)}
          />

          {stations.map((station) => {
            const uptime = station.uptimePct ?? 99.2;
            const isFaulted = station.status === 'faulted' || station.status === 'offline';
            const isDegraded = station.status === 'degraded' || (station.ports && station.ports.some(p => p.status === 'faulted' || p.status === 'offline'));
            
            const pinBg = isFaulted ? '#ef4444' : isDegraded ? '#f59e0b' : '#10b981';
            const statusLabel = isFaulted ? 'OFFLINE' : isDegraded ? 'DEGRADED' : 'ONLINE';

            return (
              <React.Fragment key={station.id}>
                <AdvancedMarker
                  position={{ lat: station.coordinates.lat, lng: station.coordinates.lng }}
                  onClick={() => handleStationClick(station)}
                  title={`${station.name} (${statusLabel} • ${uptime}% Uptime)`}
                >
                  <Pin background={pinBg} borderColor="#0f172a" glyphColor="#ffffff">
                    <Zap className="w-3.5 h-3.5 text-white fill-current" />
                  </Pin>
                </AdvancedMarker>

                {activeInfoWindowId === station.id && (
                  <InfoWindow
                    position={{ lat: station.coordinates.lat, lng: station.coordinates.lng }}
                    onCloseClick={() => setActiveInfoWindowId(null)}
                  >
                    <div className="p-1.5 font-mono text-xs text-slate-900 max-w-xs space-y-2">
                      <div className="flex items-center justify-between gap-2 border-b pb-1 border-slate-200">
                        <span className="font-bold text-sm text-slate-900">{station.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isFaulted
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isDegraded
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {statusLabel} • {uptime}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p>{station.address}, {station.city}</p>
                        <p className="font-bold text-emerald-700">
                          {station.availablePorts}/{station.totalPorts} Ports Active • {station.maxPowerKw} kW DC
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => setRouteTargetStation(station)}
                          className="flex-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow"
                        >
                          <Navigation className="w-3 h-3" /> Get Directions
                        </button>
                        {onStartSession && station.availablePorts > 0 && !isFaulted && (
                          <button
                            onClick={() => onStartSession(station)}
                            className="py-1 px-2 rounded bg-slate-900 text-amber-300 font-bold text-[11px] flex items-center gap-1"
                          >
                            <BatteryCharging className="w-3 h-3" /> Charge
                          </button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            );
          })}

          {isInvestorMode &&
            proposals.map((prop) => (
              <React.Fragment key={prop.id}>
                <AdvancedMarker
                  position={{ lat: prop.coordinates.lat, lng: prop.coordinates.lng }}
                  onClick={() => handleProposalClick(prop)}
                  title={`Candidate Site: ${prop.siteName}`}
                >
                  <Pin background="#8b5cf6" borderColor="#ffffff" glyphColor="#ffffff">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </Pin>
                </AdvancedMarker>

                {activeInfoWindowId === prop.id && (
                  <InfoWindow
                    position={{ lat: prop.coordinates.lat, lng: prop.coordinates.lng }}
                    onCloseClick={() => setActiveInfoWindowId(null)}
                  >
                    <div className="p-1 font-mono text-xs text-slate-900 max-w-xs space-y-1.5">
                      <div className="flex items-center justify-between border-b pb-1 border-purple-200">
                        <span className="font-bold text-purple-900">{prop.siteName}</span>
                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          Score: {prop.feasibilityScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{prop.city} • Est. Foot Traffic: {prop.estimatedFootTraffic}</p>
                      <div className="text-[11px] font-bold text-emerald-700">
                        CapEx: ${(prop.targetInvestmentUsd / 1000).toFixed(0)}k • ROI: {prop.roiMonths} mo
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            ))}
        </Map>
      </APIProvider>
    </div>
  );
};
