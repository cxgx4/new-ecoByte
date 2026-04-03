import React, { useState, useCallback } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import KolkataMap from "../components/map/KolkataMap";
import SearchBar from "../components/search/SearchBar";
import AQIOverlay from "../components/aqi/AQIOverlay";
import { fetchRoutes } from "../utils/api";
import { sampleRouteAQI } from "../utils/aqiGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Navigation2, Clock, MapPin, X, Loader2 } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppContext } from "../context/AppContext";

export default function KolkataDashboard() {
  const { cityState } = useAppContext();
  const [mapInstance, setMapInstance] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoveredStateId, setHoveredStateId] = useState(null);

  const [routeData, setRouteData] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [activeRouteType, setActiveRouteType] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState(null);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const onHover = useCallback((event) => {
    const { features, point } = event;
    const hoveredFeature = features && features[0];

    if (mapInstance && hoveredFeature && hoveredFeature.source === "aqi-grid-source") {
      if (hoveredStateId !== null) {
        mapInstance.setFeatureState(
          { source: "aqi-grid-source", id: hoveredStateId },
          { hover: false }
        );
      }
      setHoveredStateId(hoveredFeature.id);
      mapInstance.setFeatureState(
        { source: "aqi-grid-source", id: hoveredFeature.id },
        { hover: true }
      );
      setHoverInfo({
        x: point.x,
        y: point.y,
        properties: hoveredFeature.properties
      });
    } else {
      clearHover();
    }
  }, [mapInstance, hoveredStateId]);

  const clearHover = useCallback(() => {
    if (mapInstance && hoveredStateId !== null) {
      mapInstance.setFeatureState(
        { source: "aqi-grid-source", id: hoveredStateId },
        { hover: false }
      );
    }
    setHoverInfo(null);
    setHoveredStateId(null);
  }, [mapInstance, hoveredStateId]);

  const handleGlobalSearch = (coords, name) => {
    if (mapInstance) {
      mapInstance.flyTo({ center: coords, zoom: 14, duration: 1500 });
    }
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) return;
    setIsRouting(true);
    setRouteData(null);
    setActiveRouteType(null);
    setAvailableRoutes(null);

    try {
       const data = await fetchRoutes(startPoint.coords, endPoint.coords);
       if (data && data.features && data.features.length > 0) {
           const processedRoutes = data.features.map(feat => {
               const properties = feat.properties.summary || feat.properties.segments?.[0] || {};
               const { avgAQI, score } = sampleRouteAQI(feat, cityState.grid);
               return {
                   geojson: feat,
                   distance: properties.distance || 0,
                   duration: properties.duration || 0,
                   avgAQI: avgAQI,
                   healthScore: score
               };
           });

           // Find Fastest
           const sortedByDuration = [...processedRoutes].sort((a, b) => a.duration - b.duration);
           const fastest = sortedByDuration[0];
           
           // Find Cleanest
           const sortedByHealth = [...processedRoutes].sort((a, b) => b.healthScore - a.healthScore);
           const cleanest = sortedByHealth[0];

           const routesObj = {
             fastest: fastest,
             cleanest: cleanest,
           };

           setAvailableRoutes(routesObj);
           
           // Default to cleanest if they are different, or fastest if they are the same
           const defaultType = cleanest.healthScore > fastest.healthScore ? 'cleanest' : 'fastest';
           setActiveRouteType(defaultType);
           setRouteData(routesObj[defaultType]);

           // Zoom to fit route
           if (data.bbox && mapInstance) {
              const [minLng, minLat, maxLng, maxLat] = data.bbox;
              mapInstance.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 2000 });
           }
       }
    } catch (e) {
       console.error(e);
    }
    setIsRouting(false);
  };

  const handleRouteSwitch = (type) => {
    if (availableRoutes && availableRoutes[type]) {
      setActiveRouteType(type);
      setRouteData(availableRoutes[type]);
    }
  };

  const openInGoogleMaps = () => {
    if (!routeData || !startPoint || !endPoint) return;
    
    // Google Maps expects LAT,LON
    const originStr = `${startPoint.coords[1]},${startPoint.coords[0]}`;
    const destStr = `${endPoint.coords[1]},${endPoint.coords[0]}`;
    
    // Add a waypoint from the middle of the route to force the path
    const coords = routeData.geojson.geometry.coordinates;
    const midIndex = Math.floor(coords.length / 2);
    const midStr = `${coords[midIndex][1]},${coords[midIndex][0]}`;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&waypoints=${midStr}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const clearRoute = () => {
     setStartPoint(null);
     setEndPoint(null);
     setRouteData(null);
     setAvailableRoutes(null);
     setActiveRouteType(null);
  };

  const routeColor = routeData?.healthScore > 60 ? "#39FF14" : routeData?.healthScore > 30 ? "#EAB308" : "#EF4444";

  return (
    <div className="relative w-full h-[calc(100vh-theme('spacing.16'))] lg:h-screen rounded-tl-3xl overflow-hidden bg-[#060C14] border-l border-t border-gray-200 dark:border-white/5 pointer-events-auto">
      
      {/* 1. Map Layer (Z-0) */}
      <KolkataMap 
        onMapLoad={onMapLoad} 
        interactiveLayerIds={['aqi-hex-layer']} 
        onMouseMove={onHover}
        onMouseLeave={clearHover}
      >
        <AQIOverlay />

        {/* Alternative Route Polyline Overlay (Background) */}
        {availableRoutes && availableRoutes.fastest !== availableRoutes.cleanest && (
          <Source id="route-line-alt" type="geojson" data={activeRouteType === 'fastest' ? availableRoutes.cleanest.geojson : availableRoutes.fastest.geojson}>
             <Layer 
               id="route-layer-alt"
               type="line"
               layout={{ "line-join": "round", "line-cap": "round" }}
               paint={{ "line-color": "#6B7280", "line-width": 4, "line-opacity": 0.5, "line-dasharray": [2, 2] }}
             />
          </Source>
        )}

        {/* Active Route Polyline Overlay */}
        {routeData && (
          <Source id="route-line-active" type="geojson" data={routeData.geojson}>
             <Layer 
               id="route-layer-outline"
               type="line"
               layout={{ "line-join": "round", "line-cap": "round" }}
               paint={{ "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.5 }}
             />
             <Layer 
               id="route-layer-main"
               type="line"
               layout={{ "line-join": "round", "line-cap": "round" }}
               paint={{ "line-color": routeColor, "line-width": 5, "line-opacity": 1.0 }}
             />
          </Source>
        )}
      </KolkataMap>

      {/* Hover Tooltip - Z-50 */}
      {hoverInfo && (
        <div 
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div className="bg-[#0B1120]/90 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 min-w-[140px]">
            <div className="font-bold text-xs uppercase text-gray-400 mb-1">{hoverInfo.properties.description}</div>
            <div className="flex justify-between items-baseline gap-4 mb-1">
              <span className="text-sm font-medium">AQI</span>
              <span className={`text-xl font-bold ${hoverInfo.properties.aqi > 150 ? 'text-red-400' : 'text-neon-green'}`}>
                {Math.round(hoverInfo.properties.aqi)}
              </span>
            </div>
            <div className="flex justify-between items-baseline gap-4">
               <span className="text-xs font-medium text-gray-300">Health Score</span>
               <span className="text-sm font-bold text-blue-300">{hoverInfo.properties.score}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Title Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-3 mb-1">
          <Leaf className="w-8 h-8 text-neon-green/90 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white drop-shadow-md">
            {cityState.name}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-gray-300 font-medium ml-11 text-sm bg-white/50 dark:bg-[#0B1120]/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 inline-block shadow-sm">
          Urban Air Quality Grid
        </p>
      </motion.div>

      {/* Global Search Bar Container */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto">
         <SearchBar onLocationSelect={handleGlobalSearch} />
      </div>

      {/* Route Panel Container - Highly Z-Indexed & fully interactive */}
      <div className="absolute top-24 right-6 w-80 z-50 flex flex-col gap-4 pointer-events-auto">
         <div className="bg-white/90 dark:bg-[#0B1120]/95 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
           <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center justify-between">
             Route Planner
             {(startPoint || endPoint) && (
               <button onClick={clearRoute} className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full hover:bg-red-500/20 transition cursor-pointer">Reset</button>
             )}
           </h3>
           <div className="flex flex-col gap-3">
             
             {/* Start Point Input (Search Base) */}
             <div className="relative">
               {startPoint ? (
                 <div className="relative w-full bg-gray-50 dark:bg-slate-800 rounded-xl py-2 pl-9 pr-8 text-sm font-medium text-slate-900 dark:text-white border border-gray-200 dark:border-white/5 flex items-center min-h-[36px]">
                   <MapPin className="absolute left-3 w-4 h-4 text-gray-400" />
                   <span className="truncate">{startPoint.name}</span>
                   <button onClick={() => setStartPoint(null)} className="absolute right-3 hover:text-red-400 cursor-pointer text-gray-400"><X className="w-4 h-4"/></button>
                 </div>
               ) : (
                 <SearchBar 
                   compact 
                   placeholder={`Enter start location in ${cityState.name}...`} 
                   icon={<MapPin className="absolute left-3 w-4 h-4 text-gray-400" />}
                   onLocationSelect={(coords, name) => setStartPoint({coords, name})} 
                   preferBbox={cityState.bbox}
                 />
               )}
             </div>
             
             <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 ml-4"></div>

             {/* End Point Input (Search Base) */}
             <div className="relative">
               {endPoint ? (
                 <div className="relative w-full bg-gray-50 dark:bg-slate-800 rounded-xl py-2 pl-9 pr-8 text-sm font-medium text-slate-900 dark:text-white border border-gray-200 dark:border-white/5 flex items-center min-h-[36px]">
                   <MapPin className="absolute left-3 w-4 h-4 text-neon-green" />
                   <span className="truncate">{endPoint.name}</span>
                   <button onClick={() => setEndPoint(null)} className="absolute right-3 hover:text-red-400 cursor-pointer text-gray-400"><X className="w-4 h-4"/></button>
                 </div>
               ) : (
                 <SearchBar 
                   compact 
                   placeholder="Enter destination..." 
                   icon={<MapPin className="absolute left-3 w-4 h-4 text-neon-green" />}
                   onLocationSelect={(coords, name) => setEndPoint({coords, name})} 
                   preferBbox={cityState.bbox}
                 />
               )}
             </div>

             {/* Execute Button */}
              <motion.button 
                onClick={calculateRoute}
                disabled={!startPoint || !endPoint || isRouting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={startPoint && endPoint && !isRouting ? { boxShadow: ['0 0 15px rgba(57,255,20,0.2)', '0 0 30px rgba(57,255,20,0.6)', '0 0 15px rgba(57,255,20,0.2)'] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-2 ${
                  !startPoint || !endPoint ? "bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed" : "bg-neon-green text-slate-900 shadow-lg hover:shadow-neon-green/50"
                }`}
              >
                {isRouting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation2 className="w-5 h-5" />}
                {isRouting ? "Calculating Routes..." : "Go"}
              </motion.button>
           </div>
           
           <AnimatePresence mode="wait">
             {routeData && (
               <motion.div 
                 key="route-data"
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 14 }}
                 className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10"
               >
                 
                 {/* Route Type Switcher */}
                 {availableRoutes && availableRoutes.fastest && availableRoutes.cleanest && (
                    <div className="flex bg-gray-100 dark:bg-black/40 rounded-lg p-1 mb-3 border border-gray-200 dark:border-white/5">
                      <button
                        onClick={() => handleRouteSwitch('cleanest')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${activeRouteType === 'cleanest' ? "bg-white dark:bg-white/10 text-neon-green shadow" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                      >
                        Cleanest
                      </button>
                      <button
                        onClick={() => handleRouteSwitch('fastest')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${activeRouteType === 'fastest' ? "bg-white dark:bg-white/10 text-blue-400 shadow" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                      >
                        Fastest
                      </button>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-3 shadow-inner">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">{Math.ceil(routeData.duration / 60)} min</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-3 shadow-inner">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Dist</div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">{(routeData.distance / 1000).toFixed(1)} km</div>
                    </div>
                 </div>
                 
                 <div className={`rounded-xl p-3 shadow-inner mb-3 ${routeData.healthScore > 60 ? 'bg-neon-green/10' : routeData.healthScore > 30 ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1"><Leaf className="w-3 h-3"/> Route Health</div>
                      <div className={`font-bold text-sm ${routeData.healthScore > 60 ? 'text-neon-green' : routeData.healthScore > 30 ? 'text-yellow-500' : 'text-red-500'}`}>{routeData.healthScore}%</div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Avg Exposure: {routeData.avgAQI} AQI</div>
                 </div>

                 <motion.button 
                   onClick={openInGoogleMaps}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="w-full mt-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-white/10 dark:text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                 >
                   Open in Google Maps
                 </motion.button>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
      </div>

      {/* AQI Legend Container */}
      <div className="absolute bottom-6 left-6 z-50 pointer-events-none">
         <div className="bg-white/80 dark:bg-[#0B1120]/90 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Air Quality</span>
            <div className="flex gap-1 h-2 w-48 rounded-full overflow-hidden">
               <div className="flex-1 bg-[#00E400]"></div>
               <div className="flex-1 bg-[#7CFC00]"></div>
               <div className="flex-1 bg-[#FFD700]"></div>
               <div className="flex-1 bg-[#FF8C00]"></div>
               <div className="flex-1 bg-[#FF0000]"></div>
               <div className="flex-1 bg-[#800080]"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-gray-400 mt-0.5">
               <span>0</span>
               <span>100</span>
               <span>200</span>
               <span>300+</span>
            </div>
         </div>
      </div>

      {/* Beta Notice Container */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-slate-900/90 dark:bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-[pulse_2s_infinite]"></span>
           <span className="text-xs font-medium text-gray-200">
             <strong className="text-blue-400">AuraPath Beta:</strong> Intelligent routing is currently optimized exclusively for Kolkata.
           </span>
        </div>
      </div>

    </div>
  );
}
