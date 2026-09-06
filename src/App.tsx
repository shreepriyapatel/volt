import React, { useState, useEffect } from 'react';
import {
  RolePersona,
  ChargingStation,
  ConnectorPort,
  ActiveChargingSession,
  UserWallet,
  PaymentReceipt,
  ExpansionSiteProposal,
  PredictiveMaintenanceAlert,
  MaintenanceWorkOrder,
  ControlIncidentAlert,
} from './types';
import { INITIAL_STATIONS, INITIAL_EXPANSION_PROPOSALS } from './data/mockStations';
import { INITIAL_PREDICTIVE_ALERTS, INITIAL_WORK_ORDERS } from './data/mockMaintenance';
import { INITIAL_CONTROL_INCIDENTS } from './data/mockIncidents';
import { HeaderNavbar } from './components/HeaderNavbar';
import { MapView } from './components/MapView';
import { StationDetailModal } from './components/StationDetailModal';
import { InvestorDashboard } from './components/InvestorDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { DriverAppView } from './components/DriverAppView';
import { ExpansionPlannerView } from './components/ExpansionPlannerView';
import { AIDiagnosticsModal } from './components/AIDiagnosticsModal';
import { PredictiveMaintenanceView } from './components/PredictiveMaintenanceView';
import { RolePermissionsModal } from './components/RolePermissionsModal';
import { QrPaymentModal } from './components/QrPaymentModal';
import { IncidentAlertModal } from './components/IncidentAlertModal';
import { ArchitectureDiagramModal } from './components/ArchitectureDiagramModal';
import { VahanEVExplorer } from './components/VahanEVExplorer';
import { BangaloreViabilityHeatmap } from './components/BangaloreViabilityHeatmap';
import { VahanDistrictData, VAHAN_DISTRICTS_DATA } from './data/vahanEvData';
import { BangaloreMicroZone } from './data/bangaloreViabilityData';

export default function App() {
  const [currentRole, setCurrentRole] = useState<RolePersona>('driver');
  const [selectedVahanDistrictForPlanner, setSelectedVahanDistrictForPlanner] = useState<VahanDistrictData | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>(INITIAL_STATIONS[0].id);
  const [showStationModal, setShowStationModal] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Live Incident Alerts & Control Room Dispatch State
  const [incidents, setIncidents] = useState<ControlIncidentAlert[]>(INITIAL_CONTROL_INCIDENTS);
  const [showIncidentAlertModal, setShowIncidentAlertModal] = useState<boolean>(false);
  const [showDiagramsModal, setShowDiagramsModal] = useState<boolean>(false);
  const [incidentStationId, setIncidentStationId] = useState<string | undefined>();
  const [incidentPortNumber, setIncidentPortNumber] = useState<number | undefined>();

  // Predictive Maintenance Alerts & Field Tech Work Orders State
  const [alerts, setAlerts] = useState<PredictiveMaintenanceAlert[]>(INITIAL_PREDICTIVE_ALERTS);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_WORK_ORDERS);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);

  // QR Code Payment Modal State
  const [showQrPaymentModal, setShowQrPaymentModal] = useState<boolean>(false);
  const [qrTargetStation, setQrTargetStation] = useState<ChargingStation | null>(null);
  const [qrTargetPort, setQrTargetPort] = useState<ConnectorPort | null>(null);

  // Active Driver Charging Session State
  const [activeSession, setActiveSession] = useState<ActiveChargingSession | null>({
    sessionId: 'SES-9821',
    stationId: 'STN-ECITY-01',
    stationName: 'VoltGrid Electronic City Phase 1 Superhub',
    portId: 'P1',
    connectorType: 'CCS2',
    vehicleModel: 'Tata Nexon EV Max',
    maxPowerKw: 350,
    startTime: '14 mins ago',
    initialSocPct: 22,
    currentSocPct: 62,
    targetSocPct: 80,
    currentPowerKw: 210,
    energyConsumedKwh: 28.5,
    currentCostUsd: 13.68,
    pricePerKwh: 0.48,
    paymentMethod: 'Wallet',
    status: 'charging',
  });

  // User Wallet State
  const [userWallet, setUserWallet] = useState<UserWallet>({
    balanceUsd: 84.50,
    rfidTagNumber: 'VG-8829-9021',
    autoTopUp: true,
    savedCards: [{ id: 'c1', brand: 'Visa', last4: '4242' }],
  });

  // Payment Receipts History
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([
    {
      id: 'RCP-1082',
      sessionId: 'SES-8820',
      stationName: 'Outer Ring Road Bellandur Eco-Gateway',
      date: 'Yesterday, 4:15 PM',
      kwhDelivered: 42.0,
      durationMinutes: 22,
      ratePerKwh: 0.45,
      sessionFeeUsd: 18.90,
      taxUsd: 1.51,
      totalUsd: 20.41,
      paymentMethod: 'VoltGrid Wallet',
      vehicleModel: 'Tata Nexon EV Max',
      carbonSavedKg: 38,
    },
    {
      id: 'RCP-1081',
      sessionId: 'SES-8750',
      stationName: 'Whitefield ITPL Tech Corridor Superhub',
      date: 'Aug 07, 2026, 11:20 AM',
      kwhDelivered: 35.5,
      durationMinutes: 28,
      ratePerKwh: 0.38,
      sessionFeeUsd: 13.49,
      taxUsd: 1.08,
      totalUsd: 14.57,
      paymentMethod: 'VoltGrid Wallet',
      vehicleModel: 'Tata Nexon EV Max',
      carbonSavedKg: 32,
    },
  ]);

  // Expansion Proposals Pipeline
  const [proposals, setProposals] = useState<ExpansionSiteProposal[]>(INITIAL_EXPANSION_PROPOSALS);

  // Diagnostics Modal State
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState<boolean>(false);
  const [diagnosticStation, setDiagnosticStation] = useState<ChargingStation | null>(null);

  // Network Level Totals
  const totalStations = stations.length;
  const totalPorts = stations.reduce((acc, s) => acc + s.totalPorts, 0);
  const availablePorts = stations.reduce((acc, s) => acc + s.availablePorts, 0);
  const networkUptime = 99.4;
  const activeRevenue = stations.reduce((acc, s) => acc + s.monthlyRevenueUsd, 0) / 30;

  // Pulse simulation timer to advance live charging session telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSession && activeSession.status === 'charging') {
        setActiveSession((prev) => {
          if (!prev) return null;
          const nextSoc = Math.min(100, prev.currentSocPct + 1);
          const nextEnergy = prev.energyConsumedKwh + 0.5;
          const nextCost = nextEnergy * prev.pricePerKwh;
          return {
            ...prev,
            currentSocPct: nextSoc,
            energyConsumedKwh: nextEnergy,
            currentCostUsd: nextCost,
          };
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Handlers
  const handleSelectStation = (station: ChargingStation) => {
    setSelectedStationId(station.id);
    setShowStationModal(true);
  };

  const handleStartSession = (station: ChargingStation, port?: ConnectorPort) => {
    const targetPort = port || station.ports.find((p) => p.status === 'available') || station.ports[0];
    const newSession: ActiveChargingSession = {
      sessionId: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
      stationId: station.id,
      stationName: station.name,
      portId: targetPort.id,
      connectorType: targetPort.type,
      vehicleModel: 'Tesla Model Y',
      maxPowerKw: targetPort.maxPowerKw,
      startTime: 'Just started',
      initialSocPct: 25,
      currentSocPct: 25,
      targetSocPct: 80,
      currentPowerKw: Math.round(targetPort.maxPowerKw * 0.85),
      energyConsumedKwh: 1.2,
      currentCostUsd: 1.2 * station.basePricePerKwh,
      pricePerKwh: station.basePricePerKwh * station.surgePriceMultiplier,
      paymentMethod: 'Wallet',
      status: 'charging',
    };

    setActiveSession(newSession);
    setCurrentRole('driver');
    setShowStationModal(false);

    // Update station port status
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === station.id) {
          return {
            ...s,
            availablePorts: Math.max(0, s.availablePorts - 1),
            ports: s.ports.map((p) => (p.id === targetPort.id ? { ...p, status: 'charging' } : p)),
          };
        }
        return s;
      })
    );
  };

  const handleStopActiveSession = () => {
    if (!activeSession) return;

    const totalCost = activeSession.currentCostUsd;
    // Deduct wallet
    setUserWallet((prev) => ({
      ...prev,
      balanceUsd: Math.max(0, prev.balanceUsd - totalCost),
    }));

    // Create receipt
    const newReceipt: PaymentReceipt = {
      id: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId: activeSession.sessionId,
      stationName: activeSession.stationName,
      date: 'Just now',
      kwhDelivered: +activeSession.energyConsumedKwh.toFixed(1),
      durationMinutes: 18,
      ratePerKwh: activeSession.pricePerKwh,
      sessionFeeUsd: totalCost,
      taxUsd: +(totalCost * 0.08).toFixed(2),
      totalUsd: +(totalCost * 1.08).toFixed(2),
      paymentMethod: 'VoltGrid Wallet',
      vehicleModel: activeSession.vehicleModel,
      carbonSavedKg: Math.round(activeSession.energyConsumedKwh * 0.9),
    };

    setPaymentReceipts((prev) => [newReceipt, ...prev]);

    // Free port
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.stationId) {
          return {
            ...s,
            availablePorts: Math.min(s.totalPorts, s.availablePorts + 1),
            ports: s.ports.map((p) => (p.id === activeSession.portId ? { ...p, status: 'available' } : p)),
          };
        }
        return s;
      })
    );

    setActiveSession(null);
  };

  const handleTopUpWallet = (amount: number) => {
    setUserWallet((prev) => ({
      ...prev,
      balanceUsd: prev.balanceUsd + amount,
    }));
  };

  const handleUpdateStationPrice = (stationId: string, multiplier: number) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, surgePriceMultiplier: multiplier } : s))
    );
  };

  const handleRemotePortAction = (stationId: string, portId: string, action: 'reboot' | 'pause' | 'available') => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === stationId) {
          return {
            ...s,
            ports: s.ports.map((p) => {
              if (p.id === portId) {
                const newStatus = action === 'pause' ? 'degraded' : action === 'available' ? 'available' : 'available';
                return { ...p, status: newStatus as any };
              }
              return p;
            }),
          };
        }
        return s;
      })
    );
  };

  const handleRunDiagnostics = (station: ChargingStation) => {
    setDiagnosticStation(station);
    setShowDiagnosticsModal(true);
  };

  const handleDispatchWorkOrder = (newWorkOrder: MaintenanceWorkOrder) => {
    setWorkOrders((prev) => [newWorkOrder, ...prev]);
  };

  const handleUpdateWorkOrderStatus = (workOrderId: string, status: MaintenanceWorkOrder['status'], notes?: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          return { ...wo, status, resolutionNotes: notes || wo.resolutionNotes };
        }
        return wo;
      })
    );
  };

  const handleUpdateAlertStatus = (alertId: string, status: PredictiveMaintenanceAlert['status']) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, status } : alt))
    );
  };

  // Incident & SOS Reporting Handlers
  const handleOpenIncidentModal = (stationId?: string, portNumber?: number) => {
    setIncidentStationId(stationId || selectedStationId);
    setIncidentPortNumber(portNumber);
    setShowIncidentAlertModal(true);
  };

  const handleSendIncidentAlert = (alertData: Partial<ControlIncidentAlert>) => {
    const targetStation = stations.find((s) => s.id === alertData.stationId) || stations[0];
    const newIncident: ControlIncidentAlert = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      stationId: targetStation.id,
      stationName: targetStation.name,
      portNumber: alertData.portNumber || 1,
      portId: `P${alertData.portNumber || 1}`,
      category: alertData.category || 'gun_stuck',
      severity: alertData.severity || 'High',
      title: alertData.title || `Malfunction reported at ${targetStation.name}`,
      description: alertData.description || 'Hardware or lock failure reported by user.',
      reportedAt: 'Just now',
      status: 'pending_review',
      source: alertData.source || 'driver_sos',
      driverName: alertData.driverName || 'EV Driver',
      vehicleModel: alertData.vehicleModel || 'Electric EV',
      remoteActionsTaken: [],
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // If critical, update station port status
    if (alertData.category === 'gun_stuck' || alertData.category === 'hardware_lockout') {
      setStations((prev) =>
        prev.map((s) => {
          if (s.id === targetStation.id) {
            return {
              ...s,
              status: 'degraded',
              ports: s.ports.map((p) => (p.portNumber === newIncident.portNumber ? { ...p, status: 'faulted' } : p)),
            };
          }
          return s;
        })
      );
    }

    // Simulated NOC fast auto-acknowledgement within 2.5 seconds
    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === newIncident.id) {
            return {
              ...inc,
              status: 'remotely_actioned',
              operatorNotes: 'NOC Operator connected. Diagnostic ping in progress.',
              remoteActionsTaken: ['NOC operator linked telemetry feed', 'Ping diagnostics initiated'],
            };
          }
          return inc;
        })
      );
    }, 2500);
  };

  const handleTakeRemoteAction = (incidentId: string, actionType: string, notes?: string, refundAmount?: number) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const actionLabel =
            actionType === 'force_unlock'
              ? 'Forced actuator solenoid release (3000ms pulse)'
              : actionType === 'hard_reboot'
              ? 'Cold hardware reset sent to OCPP controller'
              : actionType === 'reset_breaker'
              ? 'Ground fault isolator reset pulse issued'
              : actionType === 'refund_wallet'
              ? `Emergency wallet credit issued ($${refundAmount || 15.0})`
              : notes || 'Remote NOC action executed';

          return {
            ...inc,
            status: 'remotely_actioned',
            refundIssuedUsd: actionType === 'refund_wallet' ? (refundAmount || 15) : inc.refundIssuedUsd,
            remoteActionsTaken: [...(inc.remoteActionsTaken || []), actionLabel],
          };
        }
        return inc;
      })
    );

    if (actionType === 'refund_wallet') {
      setUserWallet((prev) => ({
        ...prev,
        balanceUsd: prev.balanceUsd + (refundAmount || 15),
      }));
    }

    if (actionType === 'force_unlock' || actionType === 'hard_reboot') {
      const targetInc = incidents.find((i) => i.id === incidentId);
      if (targetInc) {
        setStations((prev) =>
          prev.map((s) => {
            if (s.id === targetInc.stationId) {
              return {
                ...s,
                ports: s.ports.map((p) =>
                  p.portNumber === targetInc.portNumber ? { ...p, status: 'available' } : p
                ),
              };
            }
            return s;
          })
        );
      }
    }
  };

  const handleResolveIncident = (incidentId: string, resolutionNotes: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'resolved',
            operatorNotes: resolutionNotes,
          };
        }
        return inc;
      })
    );
  };

  const handleDispatchTechFromIncident = (incident: ControlIncidentAlert) => {
    const newWorkOrder: MaintenanceWorkOrder = {
      id: `WO-EMERG-${Math.floor(100 + Math.random() * 900)}`,
      stationId: incident.stationId,
      stationName: incident.stationName,
      portId: `P${incident.portNumber}`,
      component: 'Connector Lock Actuator',
      assignedTechnician: 'Arjun Rao (Senior Field Specialist)',
      priority: 'Urgent',
      status: 'Dispatched',
      scheduledTime: 'Immediate (45m SLA)',
      requiredParts: ['Actuator Pin Release Assembly', 'Thermal Cable harness'],
      resolutionNotes: `Triggered from live incident alert ${incident.id}: ${incident.description}`,
      createdAt: 'Just now',
    };

    setWorkOrders((prev) => [newWorkOrder, ...prev]);

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incident.id
          ? {
              ...inc,
              status: 'technician_dispatched',
              remoteActionsTaken: [
                ...(inc.remoteActionsTaken || []),
                `Dispatched Field Specialist ${newWorkOrder.assignedTechnician} (${newWorkOrder.id})`,
              ],
            }
          : inc
      )
    );
  };

  const handleSimulateNewIncident = () => {
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    const randomPort = randomStation.ports[0] || { portNumber: 1, type: 'CCS2' };
    handleSendIncidentAlert({
      stationId: randomStation.id,
      stationName: randomStation.name,
      portNumber: randomPort.portNumber,
      category: 'gun_stuck',
      severity: 'Critical',
      title: `Gun Lock Actuator Seized (Port #${randomPort.portNumber})`,
      description: `Vehicle driver unable to unplug CCS2 connector after charging completed at ${randomStation.name}. Manual release lever jammed.`,
      source: 'driver_sos',
      driverName: 'Praveen K.',
      vehicleModel: 'Tata Nexon EV Max',
    });
  };

  const handleSimulatePulse = () => {
    // Fluctuate load
    setStations((prev) =>
      prev.map((s) => ({
        ...s,
        gridDemandKw: Math.min(s.maxPowerKw * s.totalPorts, Math.max(80, s.gridDemandKw + Math.floor((Math.random() - 0.5) * 40))),
      }))
    );
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-slate-300 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Platform Header */}
      <HeaderNavbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        totalStations={totalStations}
        availablePorts={availablePorts}
        totalPorts={totalPorts}
        networkUptime={networkUptime}
        activeRevenue={Math.round(activeRevenue)}
        showHeatmap={showHeatmap}
        activeIncidentsCount={incidents.filter((i) => i.status !== 'resolved').length}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        onSimulateTelemetryUpdate={handleSimulatePulse}
        onOpenPermissionsModal={() => setShowPermissionsModal(true)}
        onOpenIncidentModal={() => handleOpenIncidentModal()}
        onOpenDiagramsModal={() => setShowDiagramsModal(true)}
        onOpenQrPaymentModal={() => {
          setQrTargetStation(selectedStation);
          setQrTargetPort(null);
          setShowQrPaymentModal(true);
        }}
      />

      {/* Main Role Persona Views */}
      <main className="flex-1">
        {/* EV Driver View (Map + Driver App) */}
        {currentRole === 'driver' && (
          <div className="space-y-0">
            <MapView
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={handleSelectStation}
              showHeatmap={showHeatmap}
              onStartSession={(s) => handleStartSession(s)}
            />
            <DriverAppView
              stations={stations}
              activeSession={activeSession}
              userWallet={userWallet}
              paymentReceipts={paymentReceipts}
              activeIncidents={incidents}
              onStopActiveSession={handleStopActiveSession}
              onTopUpWallet={handleTopUpWallet}
              onSelectStation={handleSelectStation}
              onOpenReportIncident={(stnId) => handleOpenIncidentModal(stnId)}
              onOpenQrPaymentModal={() => {
                setQrTargetStation(selectedStation);
                setQrTargetPort(null);
                setShowQrPaymentModal(true);
              }}
            />
          </div>
        )}

        {/* Station Operator View */}
        {currentRole === 'operator' && (
          <OperatorDashboard
            stations={stations}
            incidents={incidents}
            onUpdateStationPrice={handleUpdateStationPrice}
            onRunDiagnostics={handleRunDiagnostics}
            onRemotePortAction={handleRemotePortAction}
            onTakeRemoteAction={handleTakeRemoteAction}
            onResolveIncident={handleResolveIncident}
            onDispatchTechFromIncident={handleDispatchTechFromIncident}
            onSimulateNewIncident={handleSimulateNewIncident}
            onOpenReportIncidentModal={(stnId) => handleOpenIncidentModal(stnId)}
          />
        )}

        {/* Predictive Maintenance & Hardware Engineering View */}
        {currentRole === 'maintenance' && (
          <PredictiveMaintenanceView
            stations={stations}
            alerts={alerts}
            workOrders={workOrders}
            onDispatchWorkOrder={handleDispatchWorkOrder}
            onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
            onUpdateAlertStatus={handleUpdateAlertStatus}
          />
        )}

        {/* Investor View */}
        {currentRole === 'investor' && <InvestorDashboard stations={stations} />}

        {/* Smart Expansion Planner View */}
        {currentRole === 'planner' && (
          <ExpansionPlannerView
            proposals={proposals}
            onAddProposal={(p) => setProposals([p, ...proposals])}
            preselectedVahanDistrict={selectedVahanDistrictForPlanner}
          />
        )}

        {/* Vahan Dashboard EV Ownership Density Explorer */}
        {currentRole === 'vahan' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <VahanEVExplorer
              onSelectDistrictForExpansion={(district) => {
                setSelectedVahanDistrictForPlanner(district);
                setCurrentRole('planner');
              }}
              onNavigateToBengaluruHeatmap={() => setCurrentRole('blr_heatmap')}
            />
          </div>
        )}

        {/* Bangalore EV Viability Score Heatmap Explorer */}
        {currentRole === 'blr_heatmap' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <BangaloreViabilityHeatmap
              onSelectZoneForExpansion={(zone) => {
                const baseDistrict = VAHAN_DISTRICTS_DATA.find((d) => d.id === 'KA-BLR') || VAHAN_DISTRICTS_DATA[0];
                const enrichedDistrict: VahanDistrictData = {
                  ...baseDistrict,
                  districtName: `${zone.zoneName} (Bengaluru Hub)`,
                  coordinates: zone.coordinates,
                  totalEvCount: zone.vahanEvFleetCount,
                  chargingDeficitScore: zone.chargingDeficitScore,
                  evToChargerRatio: zone.evToChargerRatio,
                  topFleetCorridors: zone.primaryCorridors,
                };
                setSelectedVahanDistrictForPlanner(enrichedDistrict);
                setCurrentRole('planner');
              }}
            />
          </div>
        )}
      </main>

      {/* High Density Telematics Footer */}
      <footer className="px-6 py-2 border-t border-slate-800 bg-[#0F141C] flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono">
        <div className="flex gap-4">
          <span>UPTIME: 99.9992%</span>
          <span>LATENCY: 14ms</span>
          <span>CLIENTS: 4.2k</span>
          <span>GRID LOAD: 14.2 GW/h</span>
        </div>
        <div className="flex gap-4">
          <span>SECURED BY VOLTGUARD-X</span>
          <span className="text-emerald-500 font-bold">ENCRYPTED END-TO-END</span>
        </div>
      </footer>

      {/* Station Detail Modal Inspector */}
      {showStationModal && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setShowStationModal(false)}
          onStartSession={(s, p) => handleStartSession(s, p)}
          onRemoteDiagnostics={(s) => handleRunDiagnostics(s)}
          onReportIncident={(stn, port) => {
            setShowStationModal(false);
            handleOpenIncidentModal(stn.id, port?.portNumber);
          }}
          onOpenQrPayment={(s, p) => {
            setQrTargetStation(s);
            setQrTargetPort(p || null);
            setShowQrPaymentModal(true);
          }}
        />
      )}

      {/* AI Diagnostics Modal */}
      {showDiagnosticsModal && (
        <AIDiagnosticsModal
          station={diagnosticStation}
          onClose={() => setShowDiagnosticsModal(false)}
        />
      )}

      {/* User Role & Permissions System Inspector Modal */}
      {showPermissionsModal && (
        <RolePermissionsModal
          currentRole={currentRole}
          onSelectRole={(role) => {
            setCurrentRole(role);
          }}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}

      {/* In-App QR Code Payment Modal */}
      <QrPaymentModal
        isOpen={showQrPaymentModal}
        onClose={() => setShowQrPaymentModal(false)}
        station={qrTargetStation}
        port={qrTargetPort}
        userWallet={userWallet}
        onTopUpWallet={handleTopUpWallet}
        onAddPaymentReceipt={(receipt) => setPaymentReceipts([receipt, ...paymentReceipts])}
        onStartSession={(s, p) => handleStartSession(s, p)}
      />

      {/* Driver & Operator Emergency Incident SOS Alert Modal */}
      <IncidentAlertModal
        isOpen={showIncidentAlertModal}
        onClose={() => setShowIncidentAlertModal(false)}
        stations={stations}
        preselectedStationId={incidentStationId}
        preselectedPortNumber={incidentPortNumber}
        onSubmitIncident={handleSendIncidentAlert}
      />

      {/* High-Definition Architecture & Workflow Diagram Viewer Modal */}
      <ArchitectureDiagramModal
        isOpen={showDiagramsModal}
        onClose={() => setShowDiagramsModal(false)}
      />
    </div>
  );
}
