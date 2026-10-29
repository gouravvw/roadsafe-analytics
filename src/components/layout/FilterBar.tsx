import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import type { AccidentSeverity, VehicleType, AccidentCause } from '../../types/accident';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFilters();



  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 z-20 shadow-xs shrink-0 overflow-x-auto custom-scrollbar">
      <div className="flex items-center justify-between gap-4 min-w-max">
        {/* Filter Controls Group */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-extrabold text-slate-700 uppercase text-[11px] tracking-wider flex items-center gap-2 pr-2">
            <Filter className="w-4 h-4 text-blue-600" />
            Global Filters:
          </span>

          {/* Date Range Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Period:</span>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All Time">All Time Historical</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* State Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">State:</span>
            <select
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All India</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Severity:</span>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as AccidentSeverity | 'All' }))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Fatal">Fatal Collisions</option>
              <option value="Serious">Serious Injury</option>
              <option value="Minor">Minor Incident</option>
            </select>
          </div>

          {/* Vehicle Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Vehicle:</span>
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value as VehicleType | 'All' }))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Vehicle Classes</option>
              <option value="Two-Wheeler">Two-Wheelers</option>
              <option value="Car">Car / SUV</option>
              <option value="Truck">Truck / Heavy</option>
              <option value="Bus">Transit Bus</option>
              <option value="Pedestrian">Pedestrian</option>
            </select>
          </div>

          {/* Cause Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Cause:</span>
            <select
              value={filters.cause}
              onChange={(e) => setFilters(prev => ({ ...prev, cause: e.target.value as AccidentCause | 'All' }))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Causes</option>
              <option value="Overspeeding">Overspeeding</option>
              <option value="Drunk Driving">DUI / Drunk Driving</option>
              <option value="Signal Jumping">Signal Jumping</option>
              <option value="Weather Effect">Weather Factor</option>
              <option value="Road Defect/Pothole">Road Defect</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors font-bold ml-1 border border-transparent hover:border-slate-200"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>


      </div>
    </div>
  );
};
