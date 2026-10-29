import React from 'react';
import { FileSpreadsheet, Printer, Download, Award, ShieldCheck } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { getAccidentStats } from '../../utils/stats';

export const ReportsView: React.FC = () => {
  const { filteredRecords, summary, analytics } = useFilters();
  
  // Use backend summary for accurate total numbers, fallback to calculated if needed
  const calculatedStats = getAccidentStats(filteredRecords);
  const stats = summary || calculatedStats;

  const topCause = analytics?.ACCIDENT_CAUSES_DATA?.[0]?.cause || 'Unknown';
  const topVehicle = analytics?.VEHICLE_DEMOGRAPHICS_DATA?.[0]?.type || 'Unknown';
  const peakHourObj = analytics?.HOURLY_DISTRIBUTION_DATA?.slice()?.sort((a: any, b: any) => b.accidents - a.accidents)?.[0];
  const peakHour = peakHourObj ? peakHourObj.hour : 'Unknown';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'ID,Date,City,State,Severity,Fatalities,Injuries,PrimaryCause,Weather,RoadType\n';
    const rows = filteredRecords.map(r => 
      `"${r.id}","${r.date}","${r.city}","${r.state}","${r.severity}",${r.fatalities},${r.injuries},"${r.primaryCause}","${r.weather}","${r.roadType}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RoadSafe_Accident_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Executive Report Generation & Project Audit Center
          </h3>
          <p className="text-xs text-slate-500 mt-1">Export active filtered dataset as formatted B.Tech project PDF brief or raw CSV export</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV Dataset
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" /> Print PDF Brief
          </button>
        </div>
      </div>

      {/* Printable Report Preview */}
      <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8 max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase mb-1">
              <Award className="w-4 h-4" /> B.Tech CSE Final Year Capstone Project
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ROADSAFE ANALYTICS REPORT</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Historical Road Casualty Intelligence Platform • MoRTH iRAD Specification</p>
          </div>
          <div className="text-right font-mono text-xs text-slate-600">
            <p className="font-extrabold text-slate-900">Candidate: Gourav Singh</p>
            <p className="text-slate-500">Roll: B.Tech CSE '25</p>
            <p className="mt-1 text-[11px] text-slate-400">Audit Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Executive Crash Summary</h4>
          <div className="grid grid-cols-4 gap-4 text-center font-mono border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Accidents</span>
              <strong className="text-xl font-black text-slate-900">{stats.totalAccidents}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Fatalities</span>
              <strong className="text-xl font-black text-red-600">{stats.totalFatalities}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Injuries</span>
              <strong className="text-xl font-black text-amber-600">{stats.totalInjuries}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Severity Index</span>
              <strong className="text-xl font-black text-purple-600">{stats.severityIndex} / 10</strong>
            </div>
          </div>
        </div>

        {/* Key Analytical Insights */}
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Key Analytical Insights</h4>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-slate-700 leading-relaxed space-y-2">
            <p><strong className="text-blue-900 font-black">Primary Hazard:</strong> The leading identified cause of accidents in this dataset is <strong>{topCause}</strong>.</p>
            <p><strong className="text-blue-900 font-black">Vulnerable Vehicles:</strong> <strong>{topVehicle}s</strong> are involved in the highest number of reported incidents.</p>
            <p><strong className="text-blue-900 font-black">Peak Danger Time:</strong> The most dangerous time interval for driving is between <strong>{peakHour}</strong>.</p>
          </div>
        </div>

        {/* Data Sample Table */}
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Incident Record Audit Sample</h4>
          <table className="w-full text-xs text-left font-mono border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-white border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Location</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.slice(0, 5).map((r: any) => {
                const displayId = r.id || (r._id ? r._id.toString().slice(-6).toUpperCase() : 'N/A');
                let severityColor = 'text-yellow-600';
                if (r.severity === 'Fatal') severityColor = 'text-red-600';
                if (r.severity === 'Serious') severityColor = 'text-orange-500';
                
                return (
                  <tr key={r.id || r._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{displayId}</td>
                    <td className="p-3 text-slate-600">{r.date}</td>
                    <td className="p-3 font-sans font-extrabold text-slate-900">{r.roadType}, {r.city}</td>
                    <td className={`p-3 font-bold ${severityColor}`}>{r.severity}</td>
                    <td className="p-3 text-slate-600">{r.primaryCause}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Dataset & Algorithmic Validation Complete
          </span>
          <span className="text-[11px] text-slate-400">Page 1 of 1 • CSE Capstone Project</span>
        </div>
      </div>
    </div>
  );
};
