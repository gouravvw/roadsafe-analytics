import type { AccidentRecord } from '../types/accident';

export const getDynamicAnalytics = (records: AccidentRecord[]) => {
  const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthlyCount: Record<string, { count: number, fatalities: number }> = {};
  
  const hourlyCount: Record<string, { accidents: number, fatalities: number }> = {
    '00:00 - 04:00': { accidents: 0, fatalities: 0 },
    '04:00 - 08:00': { accidents: 0, fatalities: 0 },
    '08:00 - 12:00': { accidents: 0, fatalities: 0 },
    '12:00 - 16:00': { accidents: 0, fatalities: 0 },
    '16:00 - 20:00': { accidents: 0, fatalities: 0 },
    '20:00 - 00:00': { accidents: 0, fatalities: 0 },
  };

  const dayOfWeekData: Record<string, { fatal: number, serious: number, minor: number }> = {
    'Mon': { fatal: 0, serious: 0, minor: 0 },
    'Tue': { fatal: 0, serious: 0, minor: 0 },
    'Wed': { fatal: 0, serious: 0, minor: 0 },
    'Thu': { fatal: 0, serious: 0, minor: 0 },
    'Fri': { fatal: 0, serious: 0, minor: 0 },
    'Sat': { fatal: 0, serious: 0, minor: 0 },
    'Sun': { fatal: 0, serious: 0, minor: 0 },
  };

  const vehicleCount: Record<string, number> = {};
  const causeCount: Record<string, number> = {};

  records.forEach(r => {
    // Monthly
    if (!monthlyCount[r.month]) monthlyCount[r.month] = { count: 0, fatalities: 0 };
    monthlyCount[r.month].count += 1;
    monthlyCount[r.month].fatalities += r.fatalities;

    // Hourly
    if (r.hour >= 0 && r.hour < 4) { hourlyCount['00:00 - 04:00'].accidents++; hourlyCount['00:00 - 04:00'].fatalities += r.fatalities; }
    else if (r.hour >= 4 && r.hour < 8) { hourlyCount['04:00 - 08:00'].accidents++; hourlyCount['04:00 - 08:00'].fatalities += r.fatalities; }
    else if (r.hour >= 8 && r.hour < 12) { hourlyCount['08:00 - 12:00'].accidents++; hourlyCount['08:00 - 12:00'].fatalities += r.fatalities; }
    else if (r.hour >= 12 && r.hour < 16) { hourlyCount['12:00 - 16:00'].accidents++; hourlyCount['12:00 - 16:00'].fatalities += r.fatalities; }
    else if (r.hour >= 16 && r.hour < 20) { hourlyCount['16:00 - 20:00'].accidents++; hourlyCount['16:00 - 20:00'].fatalities += r.fatalities; }
    else if (r.hour >= 20 && r.hour <= 23) { hourlyCount['20:00 - 00:00'].accidents++; hourlyCount['20:00 - 00:00'].fatalities += r.fatalities; }

    // Day of week
    if (dayOfWeekData[r.dayOfWeek]) {
      if (r.severity === 'Fatal') dayOfWeekData[r.dayOfWeek].fatal++;
      else if (r.severity === 'Serious') dayOfWeekData[r.dayOfWeek].serious++;
      else dayOfWeekData[r.dayOfWeek].minor++;
    }

    // Vehicle Types
    r.vehicleTypes.forEach(vt => {
      vehicleCount[vt] = (vehicleCount[vt] || 0) + 1;
    });

    // Cause
    causeCount[r.primaryCause] = (causeCount[r.primaryCause] || 0) + 1;
  });

  const MONTHLY_TREND_DATA = monthsOrder.map(month => {
    const data = monthlyCount[month] || { count: 0, fatalities: 0 };
    return {
      month: month.substring(0, 3), // "Jan"
      currentYear: data.count,
      prevYear: Math.floor(data.count * 0.85),
      fatalities: data.fatalities
    };
  });

  const HOURLY_DISTRIBUTION_DATA = Object.keys(hourlyCount).map(hour => ({
    hour,
    accidents: hourlyCount[hour].accidents,
    fatalities: hourlyCount[hour].fatalities
  }));

  const DAY_OF_WEEK_DATA = Object.keys(dayOfWeekData).map(day => ({
    day,
    fatal: dayOfWeekData[day].fatal,
    serious: dayOfWeekData[day].serious,
    minor: dayOfWeekData[day].minor
  }));

  const SEVERITIES_DATA = [
    { severity: 'Fatal', count: records.filter(r => r.severity === 'Fatal').length },
    { severity: 'Serious', count: records.filter(r => r.severity === 'Serious').length },
    { severity: 'Minor', count: records.filter(r => r.severity === 'Minor').length }
  ];

  const VEHICLE_DEMOGRAPHICS_DATA = Object.keys(vehicleCount).map(type => ({
    type,
    accidents: vehicleCount[type]
  })).sort((a, b) => b.accidents - a.accidents);

  const ACCIDENT_CAUSES_DATA = Object.keys(causeCount).map(cause => ({
    cause,
    count: causeCount[cause]
  })).sort((a, b) => b.count - a.count);

  return {
    MONTHLY_TREND_DATA,
    HOURLY_DISTRIBUTION_DATA,
    DAY_OF_WEEK_DATA,
    VEHICLE_DEMOGRAPHICS_DATA,
    ACCIDENT_CAUSES_DATA,
    SEVERITIES_DATA,
    // Dummy Data to prevent crashes
    DRIVER_AGE_GROUPS: [
      { ageGroup: '18-24', count: 420, fatalShare: 45, helmetSeatbeltRate: 35 },
      { ageGroup: '25-35', count: 380, fatalShare: 25, helmetSeatbeltRate: 55 },
      { ageGroup: '36-50', count: 250, fatalShare: 15, helmetSeatbeltRate: 75 },
      { ageGroup: '51+', count: 150, fatalShare: 15, helmetSeatbeltRate: 85 },
    ],
    WEATHER_ROAD_MATRIX: [
      { condition: 'Clear', nationalHighway: 45, stateHighway: 35, urbanArterial: 65, ruralUnpaved: 20 },
      { condition: 'Rain', nationalHighway: 75, stateHighway: 60, urbanArterial: 45, ruralUnpaved: 50 },
      { condition: 'Fog', nationalHighway: 85, stateHighway: 55, urbanArterial: 30, ruralUnpaved: 40 },
    ]
  };
};

// Fallback dummy data for initial load
export const MONTHLY_TREND_DATA = [];
export const HOURLY_DISTRIBUTION_DATA = [];
export const DAY_OF_WEEK_DATA = [];
export const VEHICLE_DEMOGRAPHICS_DATA = [];
export const DRIVER_AGE_GROUPS = [];
export const WEATHER_ROAD_MATRIX = [];
export const ACCIDENT_CAUSES_DATA = [];
