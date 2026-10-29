import React from 'react';
import type { AccidentSeverity } from '../../types/accident';

interface SeverityBadgeProps {
  severity: AccidentSeverity;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  let style = 'bg-blue-50 text-blue-700 border-blue-200';
  let dotStyle = 'bg-blue-500';

  if (severity === 'Fatal') {
    style = 'bg-red-50 text-red-700 border-red-200';
    dotStyle = 'bg-red-600 animate-pulse';
  } else if (severity === 'Serious') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    dotStyle = 'bg-amber-500';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold border rounded-full ${style} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
      {severity}
    </span>
  );
};
