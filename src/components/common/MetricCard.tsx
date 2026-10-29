import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositiveChangeGood?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  change,
  isPositiveChangeGood = false,
  icon,
  accentColor = 'border-blue-600'
}) => {
  const isUp = change ? change.startsWith('+') : false;
  const isGood = isUp ? isPositiveChangeGood : !isPositiveChangeGood;

  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200/90 border-l-4 ${accentColor} shadow-xs hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</span>
        {icon && <div className="text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight font-mono">
          <AnimatedCounter value={value} />
        </h3>
        {change && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            isGood ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">{subtext}</p>}
    </div>
  );
};
