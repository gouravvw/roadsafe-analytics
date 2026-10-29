import mongoose from 'mongoose';

const accidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  date: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  hour: { type: Number, required: true },
  locationName: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  severity: { type: String, required: true },
  fatalities: { type: Number, required: true },
  injuries: { type: Number, required: true },
  vehiclesInvolved: { type: Number, required: true },
  vehicleTypes: { type: [String], required: true },
  primaryCause: { type: String, required: true },
  weather: { type: String, required: true },
  roadType: { type: String, required: true },
  surfaceCondition: { type: String, required: true },
  lighting: { type: String, required: true },
  speedLimit: { type: Number, required: true },
  driverAge: { type: Number, required: false },
  woreSafetyGear: { type: Boolean, required: false }
});

export const Accident = mongoose.model('Accident', accidentSchema);
