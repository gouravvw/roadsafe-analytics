import React from 'react';
import { Map, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

export const LocationView: React.FC = () => {
  const { flyToBlackspot, blackspots } = useFilters();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Map className="w-5 h-5 text-blue-600" />
              Top {blackspots.length} High-Risk Accident Locations ("Blackspots")
            </h3>
            <p className="text-xs text-slate-500 mt-1">Click any location card to view it on the Map</p>
          </div>
          <span className="text-xs font-mono font-bold px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200">
            {blackspots.length} Dangerous Locations
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {blackspots.map((spot, idx) => (
            <div 
              key={spot.id} 
              className="py-5 space-y-3 hover:bg-slate-50/80 px-3 rounded-xl transition-all cursor-pointer group"
              onClick={() => flyToBlackspot(spot)}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-xs transition-colors">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                        {spot.name}
                        <Navigation className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {spot.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{spot.highway} • {spot.city}, {spot.state}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Crashes</span>
                    <strong className="text-slate-900 font-extrabold text-sm">{spot.totalAccidents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Fatalities</span>
                    <strong className="text-red-600 font-extrabold text-sm">{spot.fatalities}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Injuries</span>
                    <strong className="text-amber-600 font-extrabold text-sm">{spot.injuries}</strong>
                  </div>
                  <div className="pl-4 border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Severity Index</span>
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs shadow-xs inline-block mt-0.5">
                      {spot.severityIndex} / 10
                    </span>
                  </div>
                </div>
              </div>

              {/* Engineering Factors & Interventions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Main Cause of Danger
                  </span>
                  <p className="text-slate-800 font-medium">{spot.primaryFactor}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Recommended Solution
                  </span>
                  <p className="text-slate-800 font-bold text-emerald-800">{spot.recommendedMitigation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
