import React from 'react';
import { AccidentMap } from '../map/AccidentMap';


export const MapView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* GIS Map Container */}
      <AccidentMap />


    </div>
  );
};
