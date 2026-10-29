import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Calendar
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { useFilters } from '../../context/FilterContext';
import { getAccidentStats } from '../../utils/stats';
import { MONTHLY_TREND_DATA } from '../../data/analyticsData';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { filteredRecords, summary, filters, isLoading } = useFilters();
  const calculatedStats = getAccidentStats(filteredRecords);

  // Show generic loading values if the backend summary is still being fetched
  const stats = isLoading ? { 
    totalAccidents: 0, 
    totalFatalities: 0, 
    totalInjuries: 0, 
    severityIndex: 0, 
    yoyAccidentChange: '0%', 
    yoyFatalityChange: '0%' 
  } : (summary || calculatedStats);

  const { analytics } = useFilters();
  const trendData = analytics?.MONTHLY_TREND_DATA || MONTHLY_TREND_DATA;
  const [showPrevYear, setShowPrevYear] = useState(true);

  const activeYear = filters.dateRange === 'All Time' ? '2025' : filters.dateRange;
  const prevYearStr = String(parseInt(activeYear) - 1);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Accidents"
          value={stats.totalAccidents.toLocaleString()}
          subtext="Total recorded accidents"
          change={filters.dateRange === 'All Time' ? undefined : stats.yoyAccidentChange}
          isPositiveChangeGood={true}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          accentColor="border-blue-600"
        />
        <MetricCard
          title="Total Fatalities"
          value={stats.totalFatalities.toLocaleString()}
          subtext="Total deaths in these accidents"
          change={filters.dateRange === 'All Time' ? undefined : stats.yoyFatalityChange}
          isPositiveChangeGood={true}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          accentColor="border-red-600"
        />
        <MetricCard
          title="Total Injuries"
          value={stats.totalInjuries.toLocaleString()}
          subtext="Total people injured"
          change={filters.dateRange === 'All Time' ? undefined : "-2.1%"}
          isPositiveChangeGood={true}
          icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
          accentColor="border-amber-500"
        />
        <MetricCard
          title="Severity Risk Index"
          value={`${stats.severityIndex} / 10`}
          subtext="Average severity out of 10"
          change={filters.dateRange === 'All Time' ? undefined : "-0.4"}
          isPositiveChangeGood={true}
          icon={<Activity className="w-5 h-5 text-purple-600" />}
          accentColor="border-purple-600"
        />
      </div>

      {/* 12-Month Historical Trend Section */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-blue-600" />
              Monthly Accident Trend
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold">
            {filters.dateRange !== 'All Time' && (
              <button
                onClick={() => setShowPrevYear(!showPrevYear)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  showPrevYear
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {showPrevYear ? `Hide ${prevYearStr} Baseline` : `Show ${prevYearStr} Baseline`}
              </button>
            )}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-[420px] w-full font-mono text-xs pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFatalities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', padding: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
              {showPrevYear && filters.dateRange !== 'All Time' && (
                <Area type="monotone" dataKey="prevYear" name={`Accidents (${prevYearStr})`} stroke="#94a3b8" strokeDasharray="4 4" fill="transparent" strokeWidth={2} />
              )}
              <Area type="monotone" dataKey="currentYear" name={filters.dateRange === 'All Time' ? 'All-Time Historical' : `Accidents (${activeYear})`} stroke="#2563eb" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={3} />
              <Area type="monotone" dataKey="fatalities" name="Fatalities" stroke="#dc2626" fillOpacity={1} fill="url(#colorFatalities)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
