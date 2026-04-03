import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useAppContext } from '../../context/AppContext';

export default function AQIOverlay() {
  const { cityState } = useAppContext();

  return (
    <>
      {cityState && cityState.grid && (
        <Source id="aqi-grid-source" type="geojson" data={cityState.grid}>
          <Layer
            id="aqi-hex-layer"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8,
                0.35
              ],
              'fill-outline-color': 'rgba(255,255,255,0.1)'
            }}
          />
          <Layer
            id="aqi-hex-outline"
            type="line"
            paint={{
              'line-color': 'rgba(255,255,255,0.1)',
              'line-width': 1
            }}
          />
        </Source>
      )}
    </>
  );
}
