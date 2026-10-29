import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { FilterState, UserRole, AccidentRecord, BlackspotZone } from '../types/accident';
import { fetchAccidents, fetchAccidentSummary, fetchBlackspots } from '../services/api';
import { getDynamicAnalytics } from '../data/analyticsData';

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredRecords: AccidentRecord[];
  allRecords: AccidentRecord[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBlackspot: BlackspotZone | null;
  setSelectedBlackspot: (spot: BlackspotZone | null) => void;
  flyToBlackspot: (spot: BlackspotZone) => void;
  summary: any;
  analytics: any;
  blackspots: BlackspotZone[];
  isLoading: boolean;
}

const initialFilters: FilterState = {
  dateRange: 'All Time',
  state: 'All',
  city: 'All',
  severity: 'All',
  vehicleType: 'All',
  weather: 'All',
  cause: 'All',
  roadType: 'All',
  searchQuery: '',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [records, setRecords] = useState<AccidentRecord[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('Viewer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBlackspot, setSelectedBlackspot] = useState<BlackspotZone | null>(null);

  const [summary, setSummary] = useState<any>(null);
  const [blackspots, setBlackspots] = useState<BlackspotZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchAccidents(filters).then(data => {
        if (data) setRecords(data);
      }),
      fetchAccidentSummary(filters).then(data => {
        setSummary(data);
      }),
      fetchBlackspots().then(data => {
        if (data) setBlackspots(data);
      })
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const flyToBlackspot = (spot: BlackspotZone) => {
    setSelectedBlackspot(spot);
    setActiveTab('map');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Date Range Filter
      if (filters.dateRange !== 'All Time' && filters.dateRange !== 'Custom') {
        const selectedYear = parseInt(filters.dateRange, 10);
        if (!isNaN(selectedYear) && record.year !== selectedYear) return false;
      }

      // Severity Filter
      if (filters.severity !== 'All' && record.severity !== filters.severity) return false;

      // Vehicle Filter
      if (filters.vehicleType !== 'All' && !record.vehicleTypes.includes(filters.vehicleType as any)) return false;

      // Weather Filter
      if (filters.weather !== 'All' && record.weather !== filters.weather) return false;

      // Cause Filter
      if (filters.cause !== 'All' && record.primaryCause !== filters.cause) return false;

      // State / City Filter
      if (filters.state !== 'All' && record.state !== filters.state) return false;
      if (filters.city !== 'All' && record.city !== filters.city) return false;

      // Search Query
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matches = 
          (record.id || record._id || '').toString().toLowerCase().includes(query) ||
          (record.locationName || '').toLowerCase().includes(query) ||
          (record.city || '').toLowerCase().includes(query) ||
          (record.district || '').toLowerCase().includes(query) ||
          (record.state || '').toLowerCase().includes(query) ||
          (record.primaryCause || '').toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [filters, records]);

  return (
    <FilterContext.Provider 
      value={{
        filters,
        setFilters,
        resetFilters,
        filteredRecords,
        allRecords: records,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        selectedBlackspot,
        setSelectedBlackspot,
        flyToBlackspot,
        summary,
        analytics: summary?.analytics || getDynamicAnalytics(filteredRecords),
        blackspots,
        isLoading
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
