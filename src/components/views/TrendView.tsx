import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const TrendView: React.FC = () => {
  const { analytics } = useFilters();
  const { HOURLY_DISTRIBUTION_DATA, DAY_OF_WEEK_DATA } = analytics;

  // Calculate Peak Accident Window dynamically
  const peakAccidentWindow = HOURLY_DISTRIBUTION_DATA && HOURLY_DISTRIBUTION_DATA.length > 0 
    ? [...HOURLY_DISTRIBUTION_DATA].sort((a, b) => b.accidents - a.accidents)[0]?.hour 
    : 'N/A';

  // Calculate Weekend Spike dynamically
  const getWeekendSpike = () => {
    if (!DAY_OF_WEEK_DATA || DAY_OF_WEEK_DATA.length === 0) return 0;
    let weekdayTotal = 0;
    let weekendTotal = 0;
    
    DAY_OF_WEEK_DATA.forEach((day: any) => {
      const total = day.fatal + day.serious + day.minor;
      if (['Sat', 'Sun'].includes(day.day)) {
        weekendTotal += total;
      } else {
        weekdayTotal += total;
      }
    });
    
    const weekdayAvg = weekdayTotal / 5;
    const weekendAvg = weekendTotal / 2;
    if (weekdayAvg === 0) return 0;
    
    return Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);
  };
  
  const weekendSpikePct = getWeekendSpike();

  return (
    <div className="space-y-6">
      {/* 24-Hour Accident Analysis */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              24-Hour Accident Analysis
            </h3>
            <p className="text-xs text-slate-500">Accidents grouped by 4-hour blocks to show risky times of day</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
            Peak Accident Window: {peakAccidentWindow}
          </span>
        </div>

        <div className="h-72 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_DISTRIBUTION_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="accidents" name="Total Accidents" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fatalities" name="Fatalities" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of Week Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Weekly Accident Analysis
            </h3>
            <p className="text-xs text-slate-500">Showing how accidents increase on weekends</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            Weekend Spike: {weekendSpikePct > 0 ? '+' : ''}{weekendSpikePct}%
          </span>
        </div>

        <div className="h-72 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAY_OF_WEEK_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="fatal" name="Fatal" stackId="a" fill="#dc2626" />
              <Bar dataKey="serious" name="Serious" stackId="a" fill="#d97706" />
              <Bar dataKey="minor" name="Minor" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
