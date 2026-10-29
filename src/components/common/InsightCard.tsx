import React from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  category?: string;
  impactScore?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  category = 'Pattern Observation',
  impactScore = 'High Impact'
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          {category}
        </span>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
          {impactScore}
        </span>
      </div>
      <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center justify-between group cursor-pointer">
        {title}
        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      </h4>
      <p className="text-xs text-slate-300 leading-relaxed font-normal">{description}</p>
    </div>
  );
};
