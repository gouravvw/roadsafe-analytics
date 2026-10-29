import React from 'react';
import { FilterProvider, useFilters } from './context/FilterContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { Loader2 } from 'lucide-react';

import { DashboardView } from './components/views/DashboardView';
import { MapView } from './components/views/MapView';
import { TrendView } from './components/views/TrendView';
import { SeverityView } from './components/views/SeverityView';
import { VehicleView } from './components/views/VehicleView';
import { LocationView } from './components/views/LocationView';
import { WeatherView } from './components/views/WeatherView';
import { RiskCalculatorView } from './components/views/RiskCalculatorView';
import { ReportsView } from './components/views/ReportsView';
import { AdminView } from './components/views/AdminView';

const MainLayout: React.FC = () => {
  const { activeTab, isLoading } = useFilters();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'map': return <MapView />;
      case 'trend': return <TrendView />;
      case 'severity': return <SeverityView />;
      case 'vehicle': return <VehicleView />;
      case 'location': return <LocationView />;
      case 'weather': return <WeatherView />;
      case 'calculator': return <RiskCalculatorView />;
      case 'reports': return <ReportsView />;
      case 'admin': return <AdminView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      <div className="print:hidden h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Header />
          <FilterBar />
        </div>
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-transparent z-50 flex flex-col items-center justify-center pointer-events-none">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3 drop-shadow-sm" />
              <p className="text-blue-600 font-bold animate-pulse text-sm drop-shadow-sm">Loading data...</p>
            </div>
          )}
          <main className="h-full overflow-y-auto bg-slate-50 p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <FilterProvider>
      <MainLayout />
    </FilterProvider>
  );
}

export default App;
