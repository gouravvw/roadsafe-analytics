import React, { useState } from 'react';
import {
  Bell,
  AlertCircle
} from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import type { UserRole } from '../../types/accident';

export const Header: React.FC = () => {
  const { userRole, setUserRole, activeTab, analytics } = useFilters();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return { title: 'Dashboard', sub: 'Overview of all accident statistics' };
      case 'map': return { title: 'Accident Map', sub: 'View accident locations on a map' };
      case 'trend': return { title: 'Time Analysis', sub: 'See when accidents happen most' };
      case 'severity': return { title: 'Causes & Severity', sub: 'Understand why accidents happen and how bad they are' };
      case 'vehicle': return { title: 'Vehicles & People', sub: 'See which vehicles and age groups are involved' };
      case 'location': return { title: 'High-Risk Areas', sub: 'Top roads where most accidents happen' };
      case 'weather': return { title: 'Weather & Roads', sub: 'How rain and road conditions affect accidents' };
      case 'calculator': return { title: 'Risk Calculator', sub: 'Predict accident risk for a specific road' };
      case 'reports': return { title: 'Reports', sub: 'Download data and print summaries' };
      case 'admin': return { title: 'Data Upload', sub: 'Upload new accident records' };
      default: return { title: 'RoadSafe Dashboard', sub: 'Historical road accident dashboard' };
    }
  };

  const pageInfo = getPageTitle(activeTab);

  const notifications = React.useMemo(() => {
    const alerts: Array<{ id: number; title: string; msg: string; time: string; urgent: boolean }> = [];
    if (!analytics) return alerts;
    let id = 1;

    // 1. Fatality Alert
    if (analytics.SEVERITIES_DATA && analytics.SEVERITIES_DATA.length > 0) {
      const fatal = analytics.SEVERITIES_DATA.find((s: any) => s.severity === 'Fatal')?.count || 0;
      const total = analytics.SEVERITIES_DATA.reduce((sum: number, s: any) => sum + s.count, 0);
      const rate = total > 0 ? (fatal / total) * 100 : 0;
      if (rate > 2) {
        alerts.push({
          id: id++,
          title: rate > 10 ? 'Critical Fatality Rate' : 'High Fatality Rate Detected',
          msg: `The current dataset shows a fatality rate of ${rate.toFixed(1)}%.`,
          time: 'Just now',
          urgent: rate > 10
        });
      }
    }

    // 2. Weekend Spike
    if (analytics.DAY_OF_WEEK_DATA && analytics.DAY_OF_WEEK_DATA.length > 0) {
      let weekday = 0; let weekend = 0;
      analytics.DAY_OF_WEEK_DATA.forEach((d: any) => {
        const t = d.fatal + d.serious + d.minor;
        if (d.day === 'Sat' || d.day === 'Sun') weekend += t;
        else weekday += t;
      });
      const wAvg = weekday / 5;
      const wEndAvg = weekend / 2;
      if (wAvg > 0) {
        const diff = ((wEndAvg - wAvg) / wAvg) * 100;
        if (diff > 10) {
          alerts.push({
            id: id++,
            title: 'Weekend Accident Spike',
            msg: `Accidents increase by ${Math.round(diff)}% on weekends in this region.`,
            time: 'Just now',
            urgent: diff > 50
          });
        }
      }
    }

    // 3. Peak Hour Alert
    if (analytics.HOURLY_DISTRIBUTION_DATA && analytics.HOURLY_DISTRIBUTION_DATA.length > 0) {
      const sortedHours = [...analytics.HOURLY_DISTRIBUTION_DATA].sort((a, b) => b.accidents - a.accidents);
      const peak = sortedHours[0];
      if (peak && peak.accidents > 0) {
        alerts.push({
          id: id++,
          title: 'Peak Danger Time',
          msg: `The most dangerous time to drive is between ${peak.hour} (${peak.accidents} incidents).`,
          time: 'Just now',
          urgent: false
        });
      }
    }

    // 4. Primary Vehicle
    if (analytics.VEHICLE_DEMOGRAPHICS_DATA && analytics.VEHICLE_DEMOGRAPHICS_DATA.length > 0) {
      const topVehicle = analytics.VEHICLE_DEMOGRAPHICS_DATA[0];
      if (topVehicle && topVehicle.accidents > 0) {
        alerts.push({
          id: id++,
          title: 'Vulnerable Vehicle Type',
          msg: `${topVehicle.type}s are involved in the highest number of accidents here.`,
          time: 'Just now',
          urgent: false
        });
      }
    }

    // 5. Weather/Hazard
    if (analytics.ACCIDENT_CAUSES_DATA && analytics.ACCIDENT_CAUSES_DATA.length > 0) {
      const topCause = analytics.ACCIDENT_CAUSES_DATA[0];
      if (topCause && topCause.count > 0 && topCause.cause !== 'Unknown') {
        alerts.push({
          id: id++,
          title: 'Primary Hazard Identified',
          msg: `The leading identified cause of accidents is ${topCause.cause}.`,
          time: 'Just now',
          urgent: false
        });
      }
    }

    if (alerts.length === 0) {
      alerts.push({
        id: id++,
        title: 'System Optimal',
        msg: 'No severe warnings for the current data selection.',
        time: 'Just now',
        urgent: false
      });
    }

    return alerts.slice(0, 5); // Return top 5 alerts
  }, [analytics]);

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-xs z-30 shrink-0">
      {/* Left: Page Title & Breadcrumb */}
      <div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {pageInfo.title}
        </h2>
      </div>

      {/* Right: De-cluttered Controls */}
      <div className="flex items-center gap-5">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-1 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700">
          {(['Viewer', 'Analyst', 'Admin'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${userRole === role
                ? 'bg-white text-blue-700 font-extrabold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="System Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && notifications[0].title !== 'System Optimal' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900">System Alerts & Insights</h4>
                {notifications.length > 0 && notifications[0].title !== 'System Optimal' && (
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
                    {notifications.length} New
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {n.urgent && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md shadow-slate-900/20">
            GS
          </div>
          <div className="hidden sm:block text-left whitespace-nowrap">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">Gourav Singh</p>
          </div>
        </div>
      </div>
    </header>
  );
};
