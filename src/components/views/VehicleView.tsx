import React from 'react';
import { Bike, Users } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const VehicleView: React.FC = () => {
  const { analytics } = useFilters();
  const { VEHICLE_DEMOGRAPHICS_DATA, DRIVER_AGE_GROUPS } = analytics;
  return (
    <div className="space-y-6">
      {/* Vehicle Class Distribution */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
          <Bike className="w-4 h-4 text-blue-600" />
          Vehicle Class Collision Distribution
        </h3>
        <p className="text-xs text-slate-500 mb-4">Breakdown of vehicle types involved in recorded traffic incidents</p>

        <div className="h-64 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VEHICLE_DEMOGRAPHICS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="type" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="accidents" name="Vehicles Involved" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Driver Age Groups */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-purple-600" />
          Accidents by Driver Age
        </h3>
        <p className="text-xs text-slate-500 mb-4">How many crashes happen per age group and if they wore seatbelts/helmets</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
          {DRIVER_AGE_GROUPS.map((group: any) => (
            <div key={group.ageGroup} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{group.ageGroup}</span>
              <h4 className="text-xl font-extrabold text-slate-900">{group.count} <span className="text-xs font-normal text-slate-500">crashes</span></h4>
              <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Deaths:</span>
                  <strong className="text-red-600">{group.fatalShare}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wore Safety Gear:</span>
                  <strong className="text-emerald-600">{group.helmetSeatbeltRate}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
