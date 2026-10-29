import React from 'react';
import { CloudRain, Sun, CloudFog } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

export const WeatherView: React.FC = () => {
  const { analytics } = useFilters();
  const { WEATHER_ROAD_MATRIX } = analytics;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
          <CloudRain className="w-4 h-4 text-blue-600" />
          Atmospheric Condition vs Road Classification Matrix
        </h3>
        <p className="text-xs text-slate-500 mb-4">Cross-tabulation of weather phenomena against highway geometry</p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Weather Condition</th>
                <th className="p-3">National Highway</th>
                <th className="p-3">State Highway</th>
                <th className="p-3">Urban Arterial</th>
                <th className="p-3">Rural Unpaved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WEATHER_ROAD_MATRIX.map((row: any) => (
                <tr key={row.condition} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 font-sans flex items-center gap-2">
                    {row.condition.includes('Rain') ? <CloudRain className="w-4 h-4 text-blue-600" /> :
                     row.condition.includes('Fog') ? <CloudFog className="w-4 h-4 text-slate-500" /> :
                     <Sun className="w-4 h-4 text-amber-500" />}
                    {row.condition}
                  </td>
                  <td className="p-3 font-bold text-blue-600">{row.nationalHighway}</td>
                  <td className="p-3 font-bold text-slate-800">{row.stateHighway}</td>
                  <td className="p-3 font-bold text-slate-800">{row.urbanArterial}</td>
                  <td className="p-3 font-bold text-slate-600">{row.ruralUnpaved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
