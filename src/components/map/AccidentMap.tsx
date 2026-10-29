import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

import { SeverityBadge } from '../common/SeverityBadge';
import { X, Layers, Eye, ShieldAlert, Navigation, Flame, MapPin as MapPinIcon } from 'lucide-react';
import type { AccidentRecord, BlackspotZone } from '../../types/accident';
import { useFilters } from '../../context/FilterContext';
import { fetchHeatmapAccidents } from '../../services/api';

const HeatmapLayer: React.FC<{ data: AccidentRecord[] }> = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || data.length === 0) return;
    const points = data.map(record => [
      record.lat,
      record.lng,
      record.severity === 'Fatal' ? 1.0 : record.severity === 'Serious' ? 0.6 : 0.2
    ]);
    
    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 12, // Zoom level where the points reach maximum intensity
      max: 1.5, // Lower max makes the colors hotter even with fewer points
      gradient: { 
        0.1: 'blue', 
        0.3: 'cyan', 
        0.5: 'lime', 
        0.7: 'yellow', 
        1.0: 'red' 
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);
  return null;
};

// Custom Leaflet Icons
const fatalIcon = L.divIcon({
  className: 'custom-marker-fatal',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const seriousIcon = L.divIcon({
  className: 'custom-marker-serious',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const minorIcon = L.divIcon({
  className: 'custom-marker-minor',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const blackspotIcon = L.divIcon({
  className: 'custom-marker-blackspot',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Helper component to handle smooth animated flyTo
const MapFlyToController: React.FC<{ target: BlackspotZone | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 13, { duration: 1.8 });
    }
  }, [target, map]);
  return null;
};

export const AccidentMap: React.FC = () => {
  const { selectedBlackspot, setSelectedBlackspot, filteredRecords, blackspots, filters } = useFilters();
  const [selectedAccident, setSelectedAccident] = useState<AccidentRecord | null>(null);
  const [mapTile, setMapTile] = useState<'carto' | 'osm'>('osm');
  const [showHotspots, setShowHotspots] = useState(true);
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
  const [heatmapData, setHeatmapData] = useState<AccidentRecord[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  useEffect(() => {
    if (viewMode === 'heatmap') {
      setLoadingHeatmap(true);
      fetchHeatmapAccidents(filters).then(data => {
        setHeatmapData(data);
        setLoadingHeatmap(false);
      });
    }
  }, [viewMode, filters]);

  const tileUrls = {
    carto: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex flex-wrap items-center gap-3 text-xs">
        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          Map Style:
        </span>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setMapTile('carto')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              mapTile === 'carto' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Light Map
          </button>
          <button
            onClick={() => setMapTile('osm')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              mapTile === 'osm' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Detailed Map
          </button>
        </div>

        <span className="w-px h-6 bg-slate-200 mx-1"></span>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('points')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'points' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <MapPinIcon className="w-3.5 h-3.5" />
            Pins
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'heatmap' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>

        <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          Show Danger Zones
        </label>

        {selectedBlackspot && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 font-bold px-3 py-1 rounded-lg border border-red-200">
            <Navigation className="w-3.5 h-3.5 animate-bounce" />
            Focused: {selectedBlackspot.name}
            <button 
              onClick={() => setSelectedBlackspot(null)}
              className="hover:bg-red-100 p-0.5 rounded ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <MapContainer
        center={selectedBlackspot ? [selectedBlackspot.lat, selectedBlackspot.lng] : [20.5937, 78.9629]}
        zoom={selectedBlackspot ? 13 : 5}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapFlyToController target={selectedBlackspot} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrls[mapTile]}
        />

        {/* Blackspot Hotspot Circles */}
        {showHotspots && blackspots.map((spot) => (
          <Circle
            key={spot.id}
            center={[spot.lat, spot.lng]}
            radius={25000}
            pathOptions={{
              color: spot.id === selectedBlackspot?.id ? '#dc2626' : '#ea580c',
              fillColor: spot.id === selectedBlackspot?.id ? '#dc2626' : '#ea580c',
              fillOpacity: spot.id === selectedBlackspot?.id ? 0.6 : 0.4,
              weight: spot.id === selectedBlackspot?.id ? 4 : 2,
              dashArray: spot.id === selectedBlackspot?.id ? undefined : '5, 5'
            }}
          />
        ))}

        {/* Blackspot Direct Markers */}
        {blackspots.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            position={[spot.lat, spot.lng]}
            icon={blackspotIcon}
            eventHandlers={{
              click: () => setSelectedBlackspot(spot),
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 max-w-xs font-sans">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{spot.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px]">
                    Severity {spot.severityIndex}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">{spot.name}</h4>
                <p className="text-xs text-slate-600">{spot.highway} • {spot.city}, {spot.state}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Fatalities: <strong className="text-red-600">{spot.fatalities}</strong></span>
                  <span className="text-slate-500 font-medium">Crashes: <strong className="text-slate-900">{spot.totalAccidents}</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Conditional Layer: Heatmap vs Individual Points */}
        {viewMode === 'heatmap' && (
          loadingHeatmap ? null : <HeatmapLayer data={heatmapData.length > 0 ? heatmapData : filteredRecords} />
        )}

        {viewMode === 'points' && filteredRecords.slice(0, 1500).map((accident) => {
          const icon = accident.severity === 'Fatal' ? fatalIcon : accident.severity === 'Serious' ? seriousIcon : minorIcon;
          return (
            <Marker
              key={accident.id}
              position={[accident.lat, accident.lng]}
              icon={icon}
              eventHandlers={{
                click: () => setSelectedAccident(accident),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 max-w-xs font-sans">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{accident.id}</span>
                    <SeverityBadge severity={accident.severity} size="sm" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">{accident.roadType} near {accident.city}</h4>
                  <p className="text-xs text-slate-600">{accident.city}, {accident.state}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Fatalities: <strong className="text-slate-900">{accident.fatalities}</strong></span>
                    <button
                      onClick={() => setSelectedAccident(accident)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-xs"
                    >
                      <Eye className="w-3 h-3" /> Full Telemetry
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Side Marker Inspector Drawer */}
      {selectedAccident && (
        <div className="absolute right-4 top-4 bottom-4 w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl p-5 z-40 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{selectedAccident.id}</span>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">{selectedAccident.locationName}</h3>
            </div>
            <button
              onClick={() => setSelectedAccident(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Collision Severity</p>
                <SeverityBadge severity={selectedAccident.severity} size="lg" />
              </div>
              <div className="text-right font-mono">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Risk Index</p>
                <p className="text-lg font-extrabold text-red-600">{selectedAccident.riskScore} / 100</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                <p className="text-[10px] font-bold text-red-600 uppercase">Fatalities</p>
                <p className="text-xl font-extrabold text-red-700">{selectedAccident.fatalities}</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Injuries</p>
                <p className="text-xl font-extrabold text-amber-700">{selectedAccident.injuries}</p>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-600 uppercase">Vehicles</p>
                <p className="text-xl font-extrabold text-slate-800">{selectedAccident.vehiclesInvolved}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Crash Environmental Factors
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block font-medium">Primary Cause</span>
                  <span className="font-bold text-slate-900">{selectedAccident.primaryCause}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block font-medium">Weather Condition</span>
                  <span className="font-bold text-slate-900">{selectedAccident.weather}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block font-medium">Road Type</span>
                  <span className="font-bold text-slate-900">{selectedAccident.roadType}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-slate-400 block font-medium">Speed Limit</span>
                  <span className="font-bold text-slate-900">{selectedAccident.speedLimit} km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
