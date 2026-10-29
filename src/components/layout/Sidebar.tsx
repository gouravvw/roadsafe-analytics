import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Bike, 
  Map, 
  CloudRain, 
  Calculator, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  analystPlus?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, userRole } = useFilters();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'map', label: 'Accident Map', icon: <MapPin className="w-5 h-5" /> },
    { id: 'trend', label: 'Time Analysis', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'severity', label: 'Causes & Severity', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'vehicle', label: 'Vehicles & People', icon: <Bike className="w-5 h-5" /> },
    { id: 'location', label: 'High-Risk Areas', icon: <Map className="w-5 h-5" /> },
    { id: 'weather', label: 'Weather & Roads', icon: <CloudRain className="w-5 h-5" /> },
    { id: 'calculator', label: 'Risk Calculator', icon: <Calculator className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" />, analystPlus: true },
    { id: 'admin', label: 'Data Upload', icon: <ShieldCheck className="w-5 h-5" />, adminOnly: true },
  ];

  return (
    <aside className="h-full w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none shadow-2xl z-20">
      {/* Brand & Agency Header */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-white tracking-tight">RoadSafe</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <div className="px-3 pb-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
          Menu
        </div>

        {navItems.map((item) => {
          if (item.adminOnly && userRole !== 'Admin') return null;
          if (item.analystPlus && userRole === 'Viewer') return null;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-900/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="truncate tracking-tight">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'text-slate-700 opacity-0 group-hover:opacity-100'}`} />
            </button>
          );
        })}
      </nav>

      {/* System Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
        <span>Active Role: <strong className="text-white font-bold">{userRole}</strong></span>
      </div>
    </aside>
  );
};
