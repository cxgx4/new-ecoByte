import React, { useRef, useMemo, useCallback } from "react";
import Map, { GeolocateControl, NavigationControl } from "react-map-gl/maplibre";
import { useAppContext } from "../../context/AppContext";
import "maplibre-gl/dist/maplibre-gl.css";


const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE_DARK = `https://api.maptiler.com/maps/toner/style.json?key=${MAPTILER_KEY}`;
const MAP_STYLE_LIGHT = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;

export default function KolkataMap({ children, onMapLoad, interactiveLayerIds, onMouseMove, onMouseLeave }) {
  const { theme, cityState } = useAppContext(); 
  const mapRef = useRef(null);
  const geoControlRef = useRef(null);

  const mapStyle = useMemo(() => {
    return (theme === "dark" || !theme) ? MAP_STYLE_DARK : MAP_STYLE_LIGHT; 
  }, [theme]);

  const handleMapLoad = useCallback((e) => {
    if (onMapLoad) {
      onMapLoad(e.target);
    }
    
    setTimeout(() => {
        geoControlRef.current?.trigger();
    }, 1000);
  }, [onMapLoad]);

  const initialViewState = useMemo(() => ({
    longitude: cityState?.center[0] || 88.3639,
    latitude: cityState?.center[1] || 22.5726,
    zoom: 12,
    pitch: 45,
    bearing: 0
  }), [cityState]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0e0e0e]">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        minZoom={2} 
        maxZoom={18} 
        onLoad={handleMapLoad}
        interactiveLayerIds={interactiveLayerIds || []}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ width: "100%", height: "100%" }}
        dragRotate={true}
        pitchWithRotate={true}
      >
        <GeolocateControl 
           ref={geoControlRef}
           position="bottom-right" 
           trackUserLocation={true} 
           showUserHeading={true} 
           showAccuracyCircle={true}
           positionOptions={{ enableHighAccuracy: true }}
        />
        <NavigationControl position="bottom-right" />
        {children}
      </Map>
    </div>
  );
}
