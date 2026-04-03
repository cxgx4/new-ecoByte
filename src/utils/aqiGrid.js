import * as turf from '@turf/turf';

export const CELL_SIDE_KM = 0.8;

export function generateCityAQIGrid(bbox, centerCoords) {
  // Clamp bbox to prevent browser crashes on massive areas (max ~40km span)
  const safeBbox = [
     Math.max(bbox[0], centerCoords[0] - 0.2),
     Math.max(bbox[1], centerCoords[1] - 0.2),
     Math.min(bbox[2], centerCoords[0] + 0.2),
     Math.min(bbox[3], centerCoords[1] + 0.2),
  ];

  const grid = turf.hexGrid(safeBbox, CELL_SIDE_KM, { units: 'kilometers' });
  const centerPoint = turf.point(centerCoords);
  
  const sectors = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  const getSectorName = (pt, center) => {
      const bearing = turf.bearing(center, pt);
      let angle = bearing < 0 ? 360 + bearing : bearing;
      const idx = Math.round(angle / 45) % 8;
      return sectors[idx];
  };

  grid.features.forEach((feature, index) => {
    const centroid = turf.centroid(feature);
    const distance = turf.distance(centerPoint, centroid, { units: 'kilometers' });
    
    // Mock simulation: Center is usually more polluted
    let baseAqi = 180 - (distance * 8);
    baseAqi += (Math.random() * 50 - 20); // Add dynamic variance
    
    const finalAqi = Math.max(20, Math.min(350, Math.floor(baseAqi)));
    const score = Math.max(0, Math.floor(100 - (finalAqi / 3)));
    
    // True AQI Color Scale
    let color = "#800080"; // Purple (300+)
    if (finalAqi <= 50) color = "#00E400"; // Green
    else if (finalAqi <= 100) color = "#7CFC00"; // Light Green
    else if (finalAqi <= 150) color = "#FFD700"; // Yellow
    else if (finalAqi <= 200) color = "#FF8C00"; // Orange
    else if (finalAqi <= 300) color = "#FF0000"; // Red
    
    const sector = getSectorName(centroid, centerPoint);
    let distStr = distance < 2 ? "Central " : distance < 5 ? "Inner " : "Outer ";
    let name = `${distStr}${sector} District`;

    feature.properties = {
      id: index,
      aqi: finalAqi,
      score: score,
      color: color,
      description: name
    };
  });
  
  return grid;
}

export function sampleRouteAQI(routeGeoJSON, grid) {
  const coords = routeGeoJSON.geometry?.coordinates || [];
  if (!coords || coords.length === 0 || !grid) return { avgAQI: 100, score: 50 };
  
  let totalAQI = 0;
  let count = 0;
  
  const samples = Math.min(20, coords.length);
  const step = Math.max(1, Math.floor(coords.length / samples));
  
  for(let i = 0; i < coords.length; i += step) {
     const pt = turf.point(coords[i]);
     
     let closestHex = null;
     let minDist = Infinity;
     
     for(let feature of grid.features) {
       const center = turf.centroid(feature);
       const d = turf.distance(pt, center, {units: 'kilometers'});
       if(d < minDist) {
         minDist = d;
         closestHex = feature;
       }
     }
     
     if (closestHex) {
        totalAQI += closestHex.properties.aqi;
        count++;
     }
  }
  
  const avgAQI = count > 0 ? Math.floor(totalAQI / count) : 100;
  const score = Math.max(0, Math.floor(100 - (avgAQI / 3)));
  
  return { avgAQI, score };
}
