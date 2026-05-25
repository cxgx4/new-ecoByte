import React, { useState, useEffect, useMemo } from "react";
import { Wind, MapPin, Loader2, Thermometer, Droplets, Sun, Sunrise, Sunset, Eye, Compass, Leaf, ShieldCheck, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getWeatherIcon, getWeatherDescription } from "../components/WeatherIcons";
import CountUp from "../components/CountUp";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }
};

export default function Dashboard() {
  const { cityState, weatherState, theme } = useAppContext();
  const [weather, setWeather] = useState(weatherState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
     if (weatherState) {
         setWeather(weatherState);
     }
  }, [weatherState]);

  const stats = useMemo(() => {
    if (!cityState || !cityState.grid || !cityState.grid.features) return null;
    const feats = cityState.grid.features;
    let totalAqi = 0;
    feats.forEach(f => {
      totalAqi += f.properties.aqi;
    });
    const avgAqi = Math.round(totalAqi / feats.length);
    return { avgAqi };
  }, [cityState]);

  if (!stats || !weather) {
     return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-green)]" />
           <span className="text-[var(--text-muted)] font-medium tracking-wide">Syncing Environment Feeds...</span>
        </div>
     );
  }

  const current = weather.current;
  const hourly = weather.hourly;
  const daily = weather.daily;
  const isDay = current.is_day !== undefined ? current.is_day : true;

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-[var(--accent-green)]', hex: 'var(--accent-green)' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-[var(--accent-lime)]', hex: 'var(--accent-lime)' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-[var(--accent-amber)]', hex: 'var(--accent-amber)' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-[var(--accent-red)]', hex: 'var(--accent-red)' };
    return { label: 'Hazardous', color: 'text-[var(--accent-violet)]', hex: 'var(--accent-violet)' };
  };

  const uvValue = daily.uv_index_max[0];
  let uvColor = "text-[var(--accent-green)]";
  if (uvValue >= 3) uvColor = "text-[var(--accent-lime)]";
  if (uvValue >= 6) uvColor = "text-[var(--accent-amber)]";
  if (uvValue >= 8) uvColor = "text-[#f97316]"; // Orange
  if (uvValue >= 11) uvColor = "text-[var(--accent-red)]";

  const aqiStatus = getAQIStatus(stats.avgAqi);
  
  // FIX 1: AQI Gauge Variables
  const totalLength = Math.PI * 80; // Semicircle circumference
  const safeAqi = Math.min(stats.avgAqi, 300); // cap for viz
  const filledLength = (safeAqi / 300) * totalLength;
  const angle = 180 - (safeAqi / 300) * 180;
  const rad = (angle * Math.PI) / 180;
  const x2 = 100 + 65 * Math.cos(rad);
  const y2 = 110 - 65 * Math.sin(rad);

  // FIX 5: Sunrise/Sunset Progress
  const now = new Date();
  const sunriseTime = new Date(daily.sunrise[0]);
  const sunsetTime = new Date(daily.sunset[0]);
  let sunProgress = (now - sunriseTime) / (sunsetTime - sunriseTime);
  if (sunProgress < 0) sunProgress = 0;
  if (sunProgress > 1) sunProgress = 1;
  
  const sunCx = 30 + (370 - 30) * sunProgress;
  const sunCy = 100 - Math.sin(sunProgress * Math.PI) * 90;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-[32px] max-w-[1440px] mx-auto flex flex-col gap-[20px] w-full animate-fadeUp">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 text-[var(--text-primary)]">
           <MapPin className="w-6 h-6 text-[var(--accent-green)]" /> 
           {cityState.name}
        </h1>
      </motion.div>

      {/* Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] w-full">
         
         {/* FIX 3: Hero Weather Card gradient via CSS var or defined inline. Handled mostly in index.css */}
         <motion.div variants={itemVariants} className="lg:col-span-8 biophilic-card hero-card overflow-hidden flex flex-col justify-center min-h-[340px]" 
           style={{ background: theme === 'dark' ? 'radial-gradient(ellipse 60% 70% at 50% 40%, #0d3320 0%, #071a0f 55%, #030d07 100%)' : undefined }}
         >
            <div className="absolute inset-0 z-0 pointer-events-none">
               <div className="hero-circle absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-[var(--accent-green)] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.06] animate-float" style={{animationDelay: "0s"}}></div>
               <div className="hero-circle absolute top-[40%] right-[10%] w-[200px] h-[200px] bg-[var(--accent-lime)] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.06] animate-float" style={{animationDelay: "2s"}}></div>
            </div>
            
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
               {getWeatherIcon(current.weather_code, isDay, "w-[400px] h-[400px]")}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-8 gap-6">
               {/* FIX 2: Hero Temperature Font */}
               <h2 
                 className="hero-temp relative right-6" 
                 style={{
                   fontFamily: "'DM Mono', monospace",
                   fontSize: "clamp(80px, 10vw, 120px)",
                   fontWeight: 300,
                   letterSpacing: "-0.04em",
                   color: "#ffffff",
                   textShadow: "0 0 80px rgba(34,197,94,0.25)",
                   lineHeight: "0.8"
                 }}
               >
                  <CountUp end={current.temperature_2m} decimals={0} />
                  <span className="text-[60px] text-[var(--text-muted)] opacity-50 absolute -right-16 top-2">°</span>
               </h2>
               
               <div className="glass-pill condition-pill px-[20px] py-[10px] flex items-center justify-center gap-3">
                 <span className="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium">
                    {getWeatherIcon(current.weather_code, isDay, "w-4 h-4")}
                    {getWeatherDescription(current.weather_code)} · {Math.round(daily.temperature_2m_max[0])}°/{Math.round(daily.temperature_2m_min[0])}°
                 </span>
                 <span className="w-1 h-1 bg-[var(--border-active)] rounded-full"></span>
                 <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Air quality: <span className={aqiStatus.color}>{stats.avgAqi} &ndash; {aqiStatus.label}</span>
                 </span>
               </div>
            </div>
         </motion.div>

         {/* FIX 1: AQI Gauge */}
         <motion.div variants={itemVariants} className="lg:col-span-4 biophilic-card aqi-card p-[24px] md:px-[28px] flex flex-col items-center justify-between min-h-[340px]">
            <div className="w-full flex justify-between items-start mb-4">
              <div className="metric-label">
                <Leaf className="w-[14px] h-[14px] text-[var(--accent-green)]" /> AIR QUALITY INDEX
              </div>
            </div>
            
            <div className="relative w-full max-w-[280px] mt-2 flex justify-center overflow-hidden">
               <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible">
                  <defs>
                     <linearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="33%" stopColor="#a3e635" />
                        <stop offset="55%" stopColor="#f59e0b" />
                        <stop offset="75%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                     </linearGradient>
                  </defs>
                  
                  {/* Background Track Arc */}
                  <path 
                    d="M 20 110 A 80 80 0 0 1 180 110" 
                    fill="none" 
                    className="aqi-arc-track"
                    stroke="rgba(255,255,255,0.06)" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Value Arc (Color Gradient) */}
                  <path 
                    d="M 20 110 A 80 80 0 0 1 180 110" 
                    fill="none" 
                    stroke="url(#aqiGradient)" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                    strokeDasharray={totalLength}
                    strokeDashoffset={isMounted ? (totalLength - filledLength) : totalLength}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                  />

                  {/* Needle Pivot / Origin */}
                  <circle cx="100" cy="110" r="4" fill="#ffffff" />
                  
                  {/* Needle Line */}
                  <line 
                    x1="100" y1="110" 
                    x2={isMounted ? x2 : 20} y2={isMounted ? y2 : 110} 
                    stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" 
                    style={{ transition: "x2 1.2s ease-out, y2 1.2s ease-out" }}
                  />
                  
                  {/* Text value inside SVG */}
                  <text 
                    x="100" y="90" 
                    textAnchor="middle" 
                    fontFamily="DM Mono" 
                    fontSize="28" 
                    fill={aqiStatus.hex}
                    fontWeight="500"
                  >
                     {stats.avgAqi}
                  </text>
               </svg>
            </div>
            
            <div className="w-full flex justify-center mt-2 mb-4">
               <div style={{
                  display: 'inline-flex',
                  margin: '0 auto',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  borderRadius: '999px',
                  padding: '4px 14px',
                  fontFamily: 'Sora',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em'
               }}>
                 {aqiStatus.label}
               </div>
            </div>

            <div className="w-full mt-auto pt-6 border-t border-[var(--border)] relative group">
               <Link to="/map" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--accent-green)',
                  fontFamily: 'Sora',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none'
               }}>
                  Plan Clean Route
                  <span style={{ transition: "transform 0.2s ease" }} className="group-hover:translate-x-1">→</span>
               </Link>
            </div>
         </motion.div>

      </div>

      {/* FIX 8: Hourly Strip */}
      <motion.div variants={itemVariants} className="w-full biophilic-card py-4 relative group">
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar fade-mask-x px-8">
            {hourly.temperature_2m.slice(0, 24).map((temp, idx) => {
               const time = new Date(hourly.time[idx]);
               const isNow = idx === 0;
               const hourStr = isNow ? "Now" : time.toLocaleTimeString([], { hour: 'numeric' });
               const isNightHour = time.getHours() < 6 || time.getHours() > 18;
               return (
                  <div key={idx} className={`hour-cell w-[72px] shrink-0 flex flex-col items-center justify-center gap-3 p-4 rounded-[12px] transition-all duration-300 ${isNow ? 'hour-cell-now' : 'border border-transparent hover:bg-[var(--bg-elevated)]'}`}>
                     <span className={`text-[11px] font-semibold tracking-wider ${isNow ? 'text-[var(--accent-green)]' : ''}`}>{hourStr}</span>
                     {getWeatherIcon(hourly.weather_code[idx], !isNightHour, `w-6 h-6 opacity-90 ${isNow ? 'text-[var(--accent-green)]' : 'text-[var(--text-primary)]'}`)}
                     <span className={`font-mono-numbers text-[15px] ${isNow ? 'font-semibold text-[var(--accent-green)]' : 'font-medium text-[var(--text-primary)]'}`}>{Math.round(temp)}°</span>
                  </div>
               );
            })}
         </div>
      </motion.div>

      {/* Grid Row 3: 5-Day + Stats Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] w-full">
         
         {/* 5-Day Outlook */}
         <motion.div variants={itemVariants} className="lg:col-span-4 biophilic-card p-[24px] md:px-[28px] flex flex-col">
            <div className="metric-label mb-6">
              <Sun className="w-[14px] h-[14px] text-[var(--accent-green)]" /> 5-DAY OUTLOOK
            </div>
            
            <div className="flex flex-col flex-1 pb-2">
               {daily.time.slice(0, 5).map((dateStr, idx) => {
                  const d = new Date(dateStr);
                  const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : d.toLocaleDateString([], { weekday: 'short' });
                  return (
                     <div key={idx} className="outlook-row flex justify-between items-center py-[14px] border-b border-[var(--border)] last:border-0 -mx-3 px-3 transition-colors rounded-lg group">
                        <div className="flex items-baseline gap-2 w-[110px]">
                           <span className="font-sora text-[13px] text-[var(--text-secondary)] font-medium">
                              {d.getDate()} {d.toLocaleDateString([], { month: 'short' })}
                           </span>
                           <span className="text-[11px] text-[var(--text-muted)]">{dayName}</span>
                        </div>
                        {getWeatherIcon(daily.weather_code[idx], true, "w-[24px] h-[24px] text-[var(--text-primary)] group-hover:scale-110 transition-transform")}
                        <div className="flex justify-end gap-3 w-[70px] font-mono-numbers text-[15px]">
                           <span className="text-[var(--text-muted)]">{Math.round(daily.temperature_2m_min[idx])}°</span>
                           <span className="text-[var(--text-primary)] font-medium">{Math.round(daily.temperature_2m_max[idx])}°</span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </motion.div>

         {/* 2x3 Stat Mini Cards Grid */}
         <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col md:grid md:grid-cols-3 gap-[20px] w-full">
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Sun className={`w-[14px] h-[14px] ${uvColor}`}/> UV INDEX</div>
               <div className="mt-auto">
                 {/* FIX 4: UV Index as integer */}
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={uvValue} decimals={1}/></div>
                 <div className={`text-[11px] font-semibold uppercase mt-1 ${uvColor}`}>{uvValue > 8 ? 'Very High' : uvValue > 5 ? 'High' : 'Low'}</div>
               </div>
            </div>
            
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Thermometer className="w-[14px] h-[14px] text-[var(--accent-red)]"/> FEELS LIKE</div>
               <div className="mt-auto">
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={current.apparent_temperature} decimals={0}/><span className="metric-unit relative -top-2">°</span></div>
               </div>
            </div>
            
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Droplets className="w-[14px] h-[14px] text-[var(--accent-lime)]"/> HUMIDITY</div>
               <div className="mt-auto">
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={current.relative_humidity_2m} decimals={0}/><span className="metric-unit relative -top-2">%</span></div>
               </div>
            </div>
            
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Wind className="w-[14px] h-[14px] text-[var(--text-secondary)]"/> WIND</div>
               <div className="mt-auto">
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={current.wind_speed_10m} decimals={0}/><span className="metric-unit relative -top-2">km/h</span></div>
               </div>
            </div>
            
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Compass className="w-[14px] h-[14px] text-[var(--accent-violet)]"/> PRESSURE</div>
               <div className="mt-auto">
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={current.surface_pressure} decimals={0}/><span className="metric-unit relative -top-2">hPa</span></div>
               </div>
            </div>
            
            <div className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
               <div className="metric-label mb-2"><Eye className="w-[14px] h-[14px] text-sky-400"/> VISIBILITY</div>
               <div className="mt-auto">
                 <div className="font-mono-numbers text-[32px] text-[var(--text-primary)] leading-tight"><CountUp end={hourly.visibility ? hourly.visibility[0] / 1000 : 10} decimals={0}/><span className="metric-unit relative -top-2">km</span></div>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Row 4: Sunrise / Lifestyle Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full mb-6">
          
          {/* FIX 5: Sunrise / Sunset Vector */}
          <motion.div variants={itemVariants} className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
             <div className="flex justify-between items-center w-full z-10 mb-8">
                <div>
                   <div className="metric-label"><Sunrise className="w-[14px] h-[14px] text-[var(--accent-amber)]"/> SUNRISE</div>
                </div>
                <div className="text-right">
                   <div className="metric-label justify-end">SUNSET <Sunset className="w-[14px] h-[14px] text-[var(--accent-amber)]"/></div>
                </div>
             </div>
             
             <div className="w-full mt-auto">
                <svg viewBox="0 0 400 120" width="100%">
                  {/* Dashed background horizon line */}
                  <line x1="20" y1="100" x2="380" y2="100" 
                        stroke="rgba(255,255,255,0.1)" strokeWidth="1" 
                        strokeDasharray="4 4" />
                  
                  {/* Dashed arc path */}
                  <path d="M 30 100 A 170 90 0 0 1 370 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1.5"
                        strokeDasharray="6 5"
                        strokeLinecap="round" />
                  
                  {/* Sun dot glow */}
                  <circle cx={isMounted ? sunCx : 30} cy={isMounted ? sunCy : 100} r="16" 
                          fill="rgba(245,158,11,0.2)" 
                          style={{ transition: "cx 1s ease-out, cy 1s ease-out" }} />
                  
                  {/* Sun dot exact */}
                  <circle cx={isMounted ? sunCx : 30} cy={isMounted ? sunCy : 100} r="8" fill="#f59e0b"
                          style={{ transition: "cx 1s ease-out, cy 1s ease-out" }}>
                    {isMounted && <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />}
                  </circle>
                  
                  {/* Text Labels */}
                  <text x="30" y="115" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Sora">
                     {new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </text>
                  <text x="340" y="115" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Sora">
                     {new Date(daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </text>
                </svg>
             </div>
          </motion.div>

          {/* FIX 6: Lifestyle Intel Icons */}
          <motion.div variants={itemVariants} className="biophilic-card p-[24px] md:px-[28px] flex flex-col justify-between">
             <div className="flex justify-between items-center mb-6">
                <div className="metric-label">LIFESTYLE INTEL</div>
             </div>
             
             <div className="flex justify-around items-center h-full pb-6 pt-4">
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Leaf className="w-5 h-5 text-[var(--accent-green)]" />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, maxWidth: '72px', fontFamily: 'Sora' }}>
                    Low Pollen Count
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(101, 163, 13, 0.12)', border: '1px solid rgba(101, 163, 13, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ShieldCheck className="w-5 h-5 text-[var(--accent-lime)]" />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, maxWidth: '72px', fontFamily: 'Sora' }}>
                    Apply Sunscreen
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Dumbbell className="w-5 h-5 text-[var(--accent-red)]" />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, maxWidth: '72px', fontFamily: 'Sora' }}>
                    Indoor Workouts
                  </span>
                </div>

             </div>
          </motion.div>

      </div>
      
    </motion.div>
  );
}
