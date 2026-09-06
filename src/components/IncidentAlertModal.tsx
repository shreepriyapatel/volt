import React, { useState } from 'react';
import { ChargingStation, ControlIncidentAlert, IncidentCategory } from '../types';
import {
  AlertTriangle,
  Flame,
  Zap,
  Lock,
  CreditCard,
  MonitorX,
  ShieldAlert,
  Send,
  X,
  Car,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

interface IncidentAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: ChargingStation[];
  preselectedStationId?: string;
  preselectedPortNumber?: number;
  driverSessionId?: string;
  driverVehicleModel?: string;
  onSendAlert: (alert: Omit<ControlIncidentAlert, 'id' | 'reportedAt' | 'status' | 'remoteActionsTaken'>) => void;
}

const ISSUE_CATEGORIES: {
  category: IncidentCategory;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultSeverity: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestedTitle: string;
}[] = [
  {
    category: 'gun_stuck',
    label: 'Gun Stuck in Vehicle Socket',
    description: 'Lock pin failed to retract; cable is mechanically locked to the car.',
    icon: Lock,
    defaultSeverity: 'Critical',
    suggestedTitle: 'Charging Connector Solenoid Lock Refuses to Release',
  },
  {
    category: 'thermal_overheat',
    label: 'Thermal Overheating / Hot Handle',
    description: 'Connector handle is burning hot, thermal throttling, or smoke detected.',
    icon: Flame,
    defaultSeverity: 'Critical',
    suggestedTitle: 'High Temperature Detected on Connector Cable Handle',
  },
  {
    category: 'power_surge',
    label: 'Power Drop / Sudden Session Cut',
    description: 'Charging abruptly stalled or fluctuating heavily under load.',
    icon: Zap,
    defaultSeverity: 'High',
    suggestedTitle: 'Unexpected Power Delivery Drop / Contactors Tripped',
  },
  {
    category: 'payment_glitch',
    label: 'Payment / RFID Auth Glitch',
    description: 'Billed twice, QR code failed, or RFID card not recognized.',
    icon: CreditCard,
    defaultSeverity: 'Medium',
    suggestedTitle: 'Payment Gateway Timeout / Duplicate Transaction Reported',
  },
  {
    category: 'hardware_lockout',
    label: 'Screen Frozen / HMI Touch Dead',
    description: 'Touchscreen is unresponsive, black screen, or payment terminal error.',
    icon: MonitorX,
    defaultSeverity: 'Medium',
    suggestedTitle: 'HMI User Interface Display Frozen / Touch Controller Error',
  },
  {
    category: 'emergency_stop',
    label: 'Physical Emergency / E-Stop Active',
    description: 'Emergency stop button engaged or safety interlock activated on-site.',
    icon: ShieldAlert,
    defaultSeverity: 'Critical',
    suggestedTitle: 'Emergency Stop Engaged / Critical Safety Isolation',
  },
  {
    category: 'vandalism_iceing',
    label: 'Bay Blocked / ICE Vehicle / Damage',
    description: 'Combustion car parked in bay, broken cable, or physical vandalism.',
    icon: Car,
    defaultSeverity: 'Low',
    suggestedTitle: 'Charging Bay Blocked by Non-EV / Physical Asset Damage',
  },
];

export const IncidentAlertModal: React.FC<IncidentAlertModalProps> = ({
  isOpen,
  onClose,
  stations,
  preselectedStationId,
  preselectedPortNumber,
  driverSessionId,
  driverVehicleModel,
  onSendAlert,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    preselectedStationId || stations[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('gun_stuck');
  const [portNumber, setPortNumber] = useState<number>(preselectedPortNumber || 1);
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Critical');
  const [customTitle, setCustomTitle] = useState<string>('Charging Connector Solenoid Lock Refuses to Release');
  const [description, setDescription] = useState<string>(
    'Charging completed, but the locking pin won’t disengage from my charge port. Vehicle is currently immobilized.'
  );
  const [driverName, setDriverName] = useState<string>('Sophia Chen');
  const [vehicleModel, setVehicleModel] = useState<string>(driverVehicleModel || 'Tesla Model Y');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handleSelectCategory = (catItem: typeof ISSUE_CATEGORIES[0]) => {
    setSelectedCategory(catItem.category);
    setSeverity(catItem.defaultSeverity);
    setCustomTitle(catItem.suggestedTitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendAlert({
      source: 'driver_sos',
      stationId: currentStation.id,
      stationName: currentStation.name,
      portNumber: Number(portNumber),
      category: selectedCategory,
      title: customTitle,
      description: description,
      severity: severity,
      driverName: driverName,
      vehicleModel: vehicleModel,
      sessionId: driverSessionId || 'SES-' + Math.floor(1000 + Math.random() * 9000),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0F141C] border border-rose-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200 relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/60 flex items-center justify-center shadow-lg shadow-rose-950/80">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Send Incident Alert to NOC Control Room
              </h2>
              <p className="text-xs text-slate-400">
                Direct 24/7 telematics channel to Network Operations & Remote Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Incident Alert Transmitted to Control</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              NOC Operator on duty has received the live telemetry packet for <strong>{currentStation.name}</strong>. Remote diagnostic sequence initiated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Quick Category Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Select Malfunction Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ISSUE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.category;
                  return (
                    <button
                      type="button"
                      key={cat.category}
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md shadow-rose-950/40 ring-1 ring-rose-500'
                          : 'bg-[#0A0D12] hover:bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                      <div>
                        <div className={`font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Station and Port Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Station
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-rose-500"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Gun / Port #
                </label>
                <select
                  value={portNumber}
                  onChange={(e) => setPortNumber(Number(e.target.value))}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-rose-500"
                >
                  {currentStation.ports?.map((p) => (
                    <option key={p.id} value={p.portNumber}>
                      Port #{p.portNumber} - {p.type} ({p.maxPowerKw} kW) - {p.status.toUpperCase()}
                    </option>
                  )) || [1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>Port #{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Incident Severity Level
                </label>
                <div className="flex items-center gap-1.5">
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all border ${
                        severity === sev
                          ? sev === 'Critical'
                            ? 'bg-rose-950 border-rose-500 text-rose-300 shadow'
                            : sev === 'High'
                            ? 'bg-amber-950 border-amber-500 text-amber-300 shadow'
                            : 'bg-blue-950 border-blue-500 text-blue-300 shadow'
                          : 'bg-[#0A0D12] border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Driver / Vehicle Contact
                </label>
                <input
                  type="text"
                  value={`${driverName} • ${vehicleModel}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('•');
                    if (parts[0]) setDriverName(parts[0].trim());
                    if (parts[1]) setVehicleModel(parts[1].trim());
                  }}
                  className="w-full bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Sophia Chen • Tesla Model Y"
                />
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Incident Summary Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Describe What Happened / Specific Error Code
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0A0D12] border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            {/* Submit & Emergency Call */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>NOC Hotline: <strong>+1 (800) 555-VOLT</strong> (24/7 Priority)</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Alert to NOC</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
