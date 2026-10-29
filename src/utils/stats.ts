import type { AccidentRecord } from '../types/accident';

export const getAccidentStats = (records: AccidentRecord[]) => {
  const totalAccidents = records.length;
  const totalFatalities = records.reduce((acc, curr) => acc + curr.fatalities, 0);
  const totalInjuries = records.reduce((acc, curr) => acc + curr.injuries, 0);
  const fatalPercentage = totalAccidents > 0 ? ((totalFatalities / totalAccidents) * 100).toFixed(1) : "0";
  const severityIndex = totalAccidents > 0 ? (((totalFatalities * 3 + totalInjuries) / totalAccidents) * 2).toFixed(1) : "0";

  // Calculate monthly trajectory for charts
  const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthlyCount: Record<string, { count: number, fatalities: number }> = {};
  
  records.forEach(r => {
    if (!monthlyCount[r.month]) monthlyCount[r.month] = { count: 0, fatalities: 0 };
    monthlyCount[r.month].count += 1;
    monthlyCount[r.month].fatalities += r.fatalities;
  });

  const monthlyTrajectory = monthsOrder.map(month => {
    const data = monthlyCount[month] || { count: 0, fatalities: 0 };
    return {
      month: month.substring(0, 3), // "Jan"
      currentYear: data.count,
      prevYear: Math.floor(data.count * 0.85), // Synthetic previous year data
      fatalities: data.fatalities
    };
  });

  return {
    totalAccidents,
    totalFatalities,
    totalInjuries,
    fatalPercentage: Number(fatalPercentage),
    severityIndex: Number(severityIndex),
    monthlyTrajectory,
    yoyAccidentChange: "N/A", // API handles this for full data
    yoyFatalityChange: "N/A", // API handles this for full data
  };
};
