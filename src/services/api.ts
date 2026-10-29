import type { AccidentRecord, BlackspotZone, FilterState } from '../types/accident';
import { MOCK_ACCIDENTS } from '../data/mockAccidents';
import { BLACKSPOTS_DATA } from '../data/blackspotsData';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export interface HealthStatus {
  status: string;
  system: string;
  version: string;
  timestamp: string;
}

export interface RiskPredictionInput {
  roadType: string;
  speedLimit: number;
  estimatedSpeed: number;
  weather: string;
  lighting: string;
  surfaceCondition: string;
  vehicleType: string;
  driverAgeGroup: string;
  safetyGearUsed: boolean;
}

export interface RiskPredictionResult {
  riskScore: number;
  riskTier: string;
  badgeColor: string;
  factorBreakdown: {
    speedRisk: number;
    weatherRisk: number;
    environmentRisk: number;
    vehicleRisk: number;
    driverRisk: number;
  };
  countermeasures: string[];
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data: HealthStatus = await res.json();
      return data.status === 'online';
    }
  } catch (err) {
    console.warn('Backend server offline, falling back to client-side mock data engine.');
  }
  return false;
}

export async function fetchAccidents(filters?: Partial<FilterState>): Promise<AccidentRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
      if (filters.weather && filters.weather !== 'All') params.append('weather', filters.weather);
      if (filters.cause && filters.cause !== 'All') params.append('cause', filters.cause);
      if (filters.roadType && filters.roadType !== 'All') params.append('roadType', filters.roadType);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.dateRange && filters.dateRange !== 'All Time') params.append('year', filters.dateRange);
      if (filters.vehicleType && filters.vehicleType !== 'All') params.append('vehicleType', filters.vehicleType);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    }

    params.append('limit', '5000');

    const res = await fetch(`${API_BASE}/accidents?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetching accidents, using mock data:', err);
  }
  return MOCK_ACCIDENTS;
}

export async function fetchHeatmapAccidents(filters?: Partial<FilterState>): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
      if (filters.weather && filters.weather !== 'All') params.append('weather', filters.weather);
      if (filters.cause && filters.cause !== 'All') params.append('cause', filters.cause);
      if (filters.roadType && filters.roadType !== 'All') params.append('roadType', filters.roadType);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.dateRange && filters.dateRange !== 'All Time') params.append('year', filters.dateRange);
      if (filters.vehicleType && filters.vehicleType !== 'All') params.append('vehicleType', filters.vehicleType);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    }

    const res = await fetch(`${API_BASE}/accidents/heatmap?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetching heatmap accidents:', err);
  }
  return [];
}

export async function fetchAccidentSummary(filters?: Partial<FilterState>): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
      if (filters.weather && filters.weather !== 'All') params.append('weather', filters.weather);
      if (filters.cause && filters.cause !== 'All') params.append('cause', filters.cause);
      if (filters.roadType && filters.roadType !== 'All') params.append('roadType', filters.roadType);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.dateRange && filters.dateRange !== 'All Time') params.append('year', filters.dateRange);
      if (filters.vehicleType && filters.vehicleType !== 'All') params.append('vehicleType', filters.vehicleType);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    }

    const res = await fetch(`${API_BASE}/accidents/summary?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetching summary analytics:', err);
  }
  return null;
}

export async function fetchBlackspots(): Promise<BlackspotZone[]> {
  try {
    const res = await fetch(`${API_BASE}/blackspots`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetching blackspots, using mock blackspots:', err);
  }
  return BLACKSPOTS_DATA;
}

export async function predictRisk(input: RiskPredictionInput): Promise<RiskPredictionResult> {
  try {
    const res = await fetch(`${API_BASE}/risk-calculator/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error predicting risk, using client-side estimation:', err);
  }

  // Client-side fallback calculation
  const speedDiff = Math.max(0, input.estimatedSpeed - input.speedLimit);
  let score = 25 + speedDiff * 1.4;
  if (input.weather !== 'Clear') score += 15;
  if (!input.safetyGearUsed) score += 12;
  const riskScore = Math.min(99, Math.max(15, score));

  return {
    riskScore: Number(riskScore.toFixed(1)),
    riskTier: riskScore >= 75 ? 'Critical Danger' : riskScore >= 50 ? 'High Risk' : 'Moderate Risk',
    badgeColor: riskScore >= 75 ? 'crimson' : riskScore >= 50 ? 'amber' : 'sapphire',
    factorBreakdown: {
      speedRisk: Number((speedDiff * 1.4).toFixed(1)),
      weatherRisk: input.weather !== 'Clear' ? 15 : 0,
      environmentRisk: 10,
      vehicleRisk: 12,
      driverRisk: !input.safetyGearUsed ? 12 : 5
    },
    countermeasures: [
      `Reduce speed to design limit (${input.speedLimit} km/h).`,
      'Ensure safety gear / seatbelts are fastened.',
      'Maintain extra braking distance under low visibility.'
    ]
  };
}

export async function uploadAccidentCSV(file: File): Promise<{ success: boolean; message: string; recordsIngested?: number }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/admin/upload-csv`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      return await res.json();
    } else {
      const errData = await res.json();
      throw new Error(errData.error || 'Server rejected CSV upload');
    }
  } catch (err: any) {
    console.warn('CSV Upload API error:', err);
    return {
      success: false,
      message: err.message || 'Failed to upload CSV to server'
    };
  }
}

export async function fetchUploadLogs(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/uploads`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetching upload logs:', err);
  }
  return [];
}
