import React, { useState } from 'react';
import { Calculator, Cpu, Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export const RiskCalculatorView: React.FC = () => {
  const [timeOfDay, setTimeOfDay] = useState('Night (22:00-04:00)');
  const [weather, setWeather] = useState('Heavy Rain / Fog');
  const [roadType, setRoadType] = useState('National Highway');
  const [vehicle, setVehicle] = useState('Two-Wheeler');
  const [speed, setSpeed] = useState(85);
  const [safetyGear, setSafetyGear] = useState(false);

  // Dynamic Risk Score Algorithm
  const calculateScore = () => {
    let score = 20;
    if (timeOfDay.includes('Night')) score += 25;
    if (weather.includes('Rain') || weather.includes('Fog')) score += 20;
    if (roadType.includes('Highway') || roadType.includes('Expressway')) score += 15;
    if (vehicle === 'Two-Wheeler') score += 15;
    if (speed > 70) {
      // Speed is exponential/highly dangerous, especially past 100km/h
      score += (speed - 70) * 1.2;
    } else if (speed < 40) {
      // Significantly reduce risk if traveling very slowly
      score -= 20;
    }
    
    // Safety gear check
    if (!safetyGear) score += 15;
    
    // Ensure score stays between 10 and 100
    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const score = calculateScore();

  const getRiskLevel = (val: number) => {
    if (val >= 80) return { label: 'CRITICAL RISK', color: 'bg-red-600 text-white', border: 'border-red-600' };
    if (val >= 60) return { label: 'HIGH RISK', color: 'bg-amber-500 text-white', border: 'border-amber-500' };
    if (val >= 40) return { label: 'MODERATE RISK', color: 'bg-yellow-500 text-slate-900', border: 'border-yellow-500' };
    return { label: 'LOW RISK', color: 'bg-emerald-600 text-white', border: 'border-emerald-600' };
  };

  const risk = getRiskLevel(score);

  // AI Recommendation Engine Logic
  const getAIRecommendations = () => {
    const recs = [];
    if (speed > 80) {
      recs.push({
        type: 'Speed Control',
        title: 'Speed Cameras & Speed Bumps',
        desc: `Driving at ${speed} km/h is too fast for these conditions. We recommend installing speed cameras and warning speed bumps on this road.`
      });
    }
    if (weather.includes('Rain') || weather.includes('Fog')) {
      recs.push({
        type: 'Road Safety',
        title: 'Anti-Skid Roads & Warning Signs',
        desc: 'High risk of slipping due to bad weather. We recommend applying anti-skid road materials and installing electronic warning signs for drivers.'
      });
    }
    if (vehicle === 'Two-Wheeler' && !safetyGear) {
      recs.push({
        type: 'Police Action',
        title: 'Automated Helmet Camera Checks',
        desc: 'Not wearing a helmet increases death risk by 3 times. We recommend installing smart cameras at toll booths to automatically fine drivers without helmets.'
      });
    }
    if (timeOfDay.includes('Night') && roadType.includes('Highway')) {
      recs.push({
        type: 'Lighting',
        title: 'Better Highway Lighting',
        desc: 'Driving on dark highways is highly dangerous. We recommend installing bright LED streetlights and reflective markers on the road.'
      });
    }
    if (recs.length === 0) {
      recs.push({
        type: 'Standard',
        title: 'Routine Police Patrols',
        desc: 'The current conditions are relatively safe. Maintain standard police patrols in the area.'
      });
    }
    return recs;
  };

  const aiRecommendations = getAIRecommendations();

  const radarData = [
    { factor: 'Speed', value: Math.min(100, speed) },
    { factor: 'Time Window', value: timeOfDay.includes('Night') ? 90 : 30 },
    { factor: 'Weather', value: weather.includes('Clear') ? 20 : 85 },
    { factor: 'Road Class', value: roadType.includes('Expressway') ? 80 : 50 },
    { factor: 'Vehicle Vulnerability', value: vehicle === 'Two-Wheeler' ? 95 : 40 },
    { factor: 'Non-Compliance', value: safetyGear ? 20 : 90 },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-blue-600" />
              Travel Telemetry & Environmental Risk Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-1">Adjust parameters to compute real-time collision probability & dynamic safety recommendations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Time of Travel</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Daylight (06:00-18:00)">Daylight (06:00-18:00)</option>
                <option value="Dusk/Dawn (18:00-22:00)">Dusk / Dawn (18:00-22:00)</option>
                <option value="Night (22:00-04:00)">Night / Late Hour (22:00-04:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Weather Condition</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Clear Weather">Clear / Normal</option>
                <option value="Heavy Rain / Fog">Heavy Rain / Monsoon</option>
                <option value="Dense Winter Fog">Dense Winter Fog</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Road Classification</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="National Highway">National Highway (NH)</option>
                <option value="State Highway">State Highway (SH)</option>
                <option value="Expressway">Controlled Expressway</option>
                <option value="Urban Arterial">Urban Arterial City Road</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Vehicle Category</label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Two-Wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
                <option value="Car">Car / SUV</option>
                <option value="Truck">Truck / Heavy Freight</option>
                <option value="Bus">Transit Bus</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-slate-700 uppercase text-[10px]">Average Travel Speed</span>
              <span className="font-mono text-blue-600 text-sm font-black">{speed} km/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="140"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyGear}
                onChange={(e) => setSafetyGear(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Safety Helmet / Seatbelt Compliance Verified
            </label>
          </div>
        </div>

        {/* Calculated Score Result Card */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Model Assessment</span>
              <span className={`text-xs font-mono font-extrabold px-3.5 py-1 rounded-full ${risk.color}`}>
                {risk.label}
              </span>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicted Collision Risk Score</p>
              <h2 className="text-5xl font-black font-mono text-white tracking-tight my-2">
                {score} <span className="text-xl text-slate-400 font-normal">/ 100</span>
              </h2>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="factor" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Radar name="Risk Factor" dataKey="value" stroke="#dc2626" fill="#dc2626" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Countermeasure Recommendation Engine Section */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Smart Safety Recommendations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time safety solutions based on the risk calculator inputs above</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {aiRecommendations.length} Actions Recommended
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {aiRecommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {rec.type}
                </span>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{rec.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
