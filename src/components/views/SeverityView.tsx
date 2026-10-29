import React from 'react';
import { AlertCircle, PieChart } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const SeverityView: React.FC = () => {
  const { analytics } = useFilters();
  const { ACCIDENT_CAUSES_DATA, SEVERITIES_DATA } = analytics;

  let fatal = 0, serious = 0, minor = 0;
  if (SEVERITIES_DATA) {
    SEVERITIES_DATA.forEach((s: any) => {
      if (s.severity === 'Fatal') fatal += s.count;
      else if (s.severity === 'Serious') serious += s.count;
      else minor += s.count;
    });
  }

  const pieData = [
    { name: 'Fatal Collisions', value: fatal, color: '#dc2626' },
    { name: 'Serious Injury', value: serious, color: '#d97706' },
    { name: 'Minor Incident', value: minor, color: '#2563eb' },
  ];

  const total = fatal + serious + minor;
  const fatalPct = total > 0 ? Math.round((fatal / total) * 100) : 0;
  const seriousPct = total > 0 ? Math.round((serious / total) * 100) : 0;
  const minorPct = total > 0 ? Math.round((minor / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Proportion Donut */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <PieChart className="w-4 h-4 text-blue-600" />
            Accident Severity Proportions
          </h3>
          <p className="text-xs text-slate-500 mb-4">Ratio of fatal vs serious vs minor incidents</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-3 border-t border-slate-100">
            <div className="p-2 bg-red-50 rounded border border-red-200">
              <span className="text-[10px] text-red-600 block uppercase font-bold">Fatal</span>
              <strong className="text-red-700 font-extrabold">{fatalPct}%</strong>
            </div>
            <div className="p-2 bg-amber-50 rounded border border-amber-200">
              <span className="text-[10px] text-amber-600 block uppercase font-bold">Serious</span>
              <strong className="text-amber-700 font-extrabold">{seriousPct}%</strong>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-[10px] text-blue-600 block uppercase font-bold">Minor</span>
              <strong className="text-blue-700 font-extrabold">{minorPct}%</strong>
            </div>
          </div>
        </div>

        {/* Primary Cause Ranking Horizontal Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Primary Contributing Cause Ranking
          </h3>
          <p className="text-xs text-slate-500 mb-4">Ranked by volume of recorded driver violations & road factors</p>

          <div className="h-64 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                layout="vertical"
                data={ACCIDENT_CAUSES_DATA}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="cause" type="category" stroke="#64748b" tickLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
