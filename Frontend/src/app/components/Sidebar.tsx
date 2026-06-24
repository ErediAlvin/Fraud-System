import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  AlertTriangle,
  Briefcase,
  Users,
  CreditCard,
  Package,
  Database,
  Shield,
  FileText,
  Activity,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/alerts', icon: AlertTriangle, label: 'Fraud Alerts' },
  { path: '/cases', icon: Briefcase, label: 'Case Management' },
  { path: '/beneficiaries', icon: Users, label: 'Beneficiary Monitor' },
  { path: '/transactions', icon: CreditCard, label: 'Transaction Monitor' },
  { path: '/supply-chain', icon: Package, label: 'Supply Chain Monitor' },
  { path: '/blockchain', icon: Database, label: 'Blockchain Ledger' },
  { path: '/risk-profiles', icon: Shield, label: 'Risk Profiles' },
  { path: '/reports', icon: FileText, label: 'Reports & Analytics' },
  { path: '/model-performance', icon: Activity, label: 'Model Performance' },
  { path: '/procedures', icon: FileCheck, label: 'SOB / COB Procedures' },
  { path: '/settings', icon: Settings, label: 'System Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#1A3C5E] text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">DSFMP</h1>
              <p className="text-xs text-white/70">Fraud Detection</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-white/10 rounded"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                isActive ? 'bg-white/10 border-l-4 border-[#2E7D52]' : ''
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#2E7D52] flex items-center justify-center text-sm font-bold">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-white/70 truncate">System Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
