import React from 'react';
import { 
  Sun, Moon, Cloud, CloudRain, CloudLightning, 
  CloudSnow, CloudFog, CloudDrizzle, SunDim 
} from 'lucide-react';

export const getWeatherIcon = (code, isDay = true, className = "w-6 h-6") => {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  if (code === 0) return isDay ? <Sun className={className} /> : <Moon className={className} />;
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code === 1 || code === 2) return isDay ? <SunDim className={className} /> : <Cloud className={className} />;
  if (code === 3) return <Cloud className={className} />;
  
  // 45, 48: Fog and depositing rime fog
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  if (code >= 51 && code <= 57) return <CloudDrizzle className={className} />;
  
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 85, 86: Snow showers slight and heavy
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
  
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail
  if (code >= 95 && code <= 99) return <CloudLightning className={className} />;
  
  return <Cloud className={className} />;
};

export const getWeatherDescription = (code) => {
    if (code === 0) return "Clear Sky";
    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 95) return "Thunderstorm";
    return "Unknown";
};
