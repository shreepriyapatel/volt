import React, { useState } from 'react';
import { RolePersona, PermissionKey, UserRoleProfile, RoleAuditLog } from '../types';
import { USER_ROLE_PROFILES, INITIAL_ROLE_AUDIT_LOGS } from '../data/mockMaintenance';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  Car,
  Wrench,
  Compass,
  X,
  FileText,
  Key,
} from 'lucide-react';

interface RolePermissionsModalProps {
  currentRole: RolePersona;
  onSelectRole: (role: RolePersona) => void;
  onClose: () => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'profile' | 'audit'>('profile');
  const [auditLogs, setAuditLogs] = useState<RoleAuditLog[]>(INITIAL_ROLE_AUDIT_LOGS);

  const activeProfile = USER_ROLE_PROFILES[currentRole] || USER_ROLE_PROFILES.driver;

  const roleList: { role: RolePersona; label: string; icon: any; color: string }[] = [
    { role: 'operator', label: 'Operator', icon: Activity, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { role: 'investor', label: 'Investor', icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { role: 'driver', label: 'EV Driver', icon: Car, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { role: 'maintenance', label: 'Field Tech', icon: Wrench, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { role: 'planner', label: 'Planner', icon: Compass, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  ];

  const permissionFeatures: { name: string; category: string; operator: boolean; investor: boolean; driver: boolean; maintenance: boolean; planner: boolean }[] = [
    { name: 'Remote Port Reboot & Pause', category: 'Hardware Control', operator: true, investor: false, driver: false, maintenance: true, planner: false },
    { name: 'Surge Price & Dynamic Tariff Overrides', category: 'Revenue Ops', operator: true, investor: false, driver: false, maintenance: false, planner: false },
    { name: 'Predictive Alert & Tech Work Order Dispatch', category: 'Maintenance', operator: true, investor: false, driver: false, maintenance: true, planner: false },
    { name: 'Portfolio CapEx, OpEx & IRR Analytics', category: 'Financials', operator: false, investor: true, driver: false, maintenance: false, planner: true },
    { name: 'Live Charging Session Start & RFID Wallet', category: 'End-User', operator: true, investor: false, driver: true, maintenance: false, planner: false },
    { name: 'AI Expansion Site Feasibility Analysis', category: 'Expansion', operator: false, investor: true, driver: false, maintenance: false, planner: true },
    { name: 'Multi-Sensor Telemetry Stream Read Access', category: 'Telemetry', operator: true, investor: true, driver: true, maintenance: true, planner: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D12]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#0F141C] border border-slate-800 rounded-lg w-full max-w-3xl shadow-2xl overflow-hidden my-6 font-mono text-xs">
        {/* Header */}
        <div className="bg-[#0A0D12] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                User Role & Permission Management
              </h3>
              <p className="text-[10px] text-slate-500">
                Role-Based Access Control (RBAC), capability matrix, and audit logging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0F141C] text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#0A0D12] px-5 py-2 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Role Profile
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Permissions Matrix
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security Audit Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Active Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Role Switcher Pills */}
              <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2">
                  Select User Role Persona:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {roleList.map((item) => {
                    const Icon = item.icon;
                    const isSelected = currentRole === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => onSelectRole(item.role)}
                        className={`p-2.5 rounded border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? `${item.color} font-bold shadow-lg`
                            : 'bg-[#0A0D12] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-mono">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-[#0A0D12] p-4 rounded border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
                      {activeProfile.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100 font-mono">{activeProfile.name}</h4>
                      <p className="text-xs text-slate-400">{activeProfile.title} • {activeProfile.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
                    ROLE: {activeProfile.role}
                  </span>
                </div>

                {/* Permissions List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#0F141C] p-3 rounded border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Granted Capabilities
                    </span>
                    <ul className="space-y-1 text-slate-300 font-sans text-xs">
                      {activeProfile.permissions.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Key className="w-3 h-3 text-emerald-400 shrink-0 font-mono" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#0F141C] p-3 rounded border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Restricted Features
                    </span>
                    <ul className="space-y-1 text-slate-400 font-sans text-xs">
                      {activeProfile.restrictedFeatures.map((rf, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <XCircle className="w-3 h-3 text-rose-400 shrink-0" /> {rf}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Matrix Tab */}
          {activeTab === 'matrix' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Role Capabilities Matrix
                </h4>
                <span className="text-[10px] text-slate-500">Enforced by RBAC Kernel</span>
              </div>

              <div className="bg-[#0A0D12] border border-slate-800 rounded overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0F141C] text-slate-400 uppercase text-[9px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Feature / Action</th>
                      <th className="p-2.5 text-center">Operator</th>
                      <th className="p-2.5 text-center">Investor</th>
                      <th className="p-2.5 text-center">Driver</th>
                      <th className="p-2.5 text-center">Field Tech</th>
                      <th className="p-2.5 text-center">Planner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {permissionFeatures.map((feat, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-2.5 font-sans font-semibold text-slate-200">
                          {feat.name}
                          <span className="text-[9px] font-mono text-slate-500 block">{feat.category}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          {feat.operator ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {feat.investor ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {feat.driver ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {feat.maintenance ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {feat.planner ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Security Access Logs & RBAC Checks
                </h4>
                <span className="text-[10px] text-slate-500">Live Session Log</span>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#0A0D12] p-3 rounded border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{log.userName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 uppercase">
                          {log.userRole}
                        </span>
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-400 mt-1 font-sans">
                        Action: <strong className="text-slate-200 font-mono">{log.action}</strong> on <span className="text-slate-300">{log.resource}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        log.granted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {log.granted ? 'ACCESS GRANTED' : 'BLOCKED BY RBAC'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0A0D12] px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">ENFORCING RBAC POLICY V4.2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#0F141C] hover:bg-slate-800 text-slate-200 font-bold border border-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
