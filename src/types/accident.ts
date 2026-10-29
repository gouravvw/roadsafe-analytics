export type AccidentSeverity = 'Fatal' | 'Serious' | 'Minor';

export type VehicleType = 'Two-Wheeler' | 'Car' | 'Truck' | 'Bus' | 'Pedestrian' | 'Commercial/Auto';

export type WeatherCondition = 'Clear' | 'Heavy Rain' | 'Dense Fog' | 'Storm' | 'Dust Storm';

export type RoadType = 'National Highway' | 'State Highway' | 'Expressway' | 'Urban Arterial' | 'Rural Unpaved';

export type AccidentCause = 
  | 'Overspeeding' 
  | 'Drunk Driving' 
  | 'Signal Jumping' 
  | 'Weather Effect' 
  | 'Road Defect/Pothole' 
  | 'Distracted Driving'
  | 'Wrong Side Driving';

export type SurfaceCondition = 'Dry' | 'Wet' | 'Waterlogged' | 'Gravel';
export type LightingCondition = 'Daylight' | 'Streetlights On' | 'Dark Unlit' | 'Dusk/Dawn';

export interface AccidentRecord {
  id: string;
  _id?: string;
  timestamp: string;
  date: string;
  year: number;
  month: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  hour: number; // 0-23
  locationName: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  severity: AccidentSeverity;
  fatalities: number;
  injuries: number;
  vehiclesInvolved: number;
  vehicleTypes: VehicleType[];
  primaryCause: AccidentCause;
  weather: WeatherCondition;
  roadType: RoadType;
  surfaceCondition: SurfaceCondition;
  lighting: LightingCondition;
  speedLimit: number; // km/h
  driverAgeGroup: '18-24' | '25-35' | '36-50' | '51+';
  driverGender: 'Male' | 'Female';
  safetyGearUsed: boolean; // Helmet/Seatbelt
  riskScore: number; // 0-100
}

export interface BlackspotZone {
  id: string;
  name: string;
  highway: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  totalAccidents: number;
  fatalities: number;
  injuries: number;
  severityIndex: number; // 1-10
  primaryFactor: string;
  speedLimit: number;
  recommendedMitigation: string;
}

export interface FilterState {
  dateRange: 'All Time' | '2026' | '2025' | '2024' | '2023' | 'Custom';
  startDate?: string;
  endDate?: string;
  state: string;
  city: string;
  severity: AccidentSeverity | 'All';
  vehicleType: VehicleType | 'All';
  weather: WeatherCondition | 'All';
  cause: AccidentCause | 'All';
  roadType: RoadType | 'All';
  searchQuery: string;
}

export type UserRole = 'Viewer' | 'Analyst' | 'Admin';
