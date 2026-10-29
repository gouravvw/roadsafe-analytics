import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number; // in ms
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 800 }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, ''));
  const isNumeric = !isNaN(numericValue);

  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!isNumeric) return;

    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = numericValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuad);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [numericValue, duration, isNumeric]);

  if (!isNumeric) {
    return <span>{value}</span>;
  }

  // Format with commas if original string had commas
  const formatted = displayValue.toLocaleString();
  return <span>{formatted}</span>;
};
