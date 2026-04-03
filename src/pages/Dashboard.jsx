import React, { useState, useEffect, useMemo } from "react";
import { Wind, MapPin, Loader2, Thermometer, Droplets, Sun, Sunrise, Sunset, Eye, Compass, Activity, Map as MapIcon, ShieldCheck, Leaf, Car, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { fetchWeatherData } from "../utils/api";
import { getWeatherIcon, getWeatherDescription } from "../components/WeatherIcons";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
};

export default function Dashboard() {
  const { cityState } = useAppContext();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      if (!cityState?.center) return;
      // Fetch data based on the city's precise center
      const res = await fetchWeatherData(cityState.center[1], cityState.center[0]);
      if (active && res) setWeather(res);
    };
    fetchWeather();
    return () => { active = false; };
  }, [cityState]);

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
           <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
           <span className="text-gray-400 font-medium tracking-wide">Syncing Environment Feeds...</span>
        </div>
     );
  }

  const current = weather.current;
  const hourly = weather.hourly;
  const daily = weather.daily;
  // If API missing current.is_day, we fallback to true since we have our custom UI
  const isDay = current.is_day !== undefined ? current.is_day : true;

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-neon-green', bg: 'bg-[#39FF14]' , desc: 'Air quality is satisfactory, pollution poses little risk.' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-[#FBBF24]', desc: 'Air quality is acceptable. There may be a risk for some.' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-500', bg: 'bg-[#F97316]', desc: 'Members of sensitive groups may experience health effects.' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-500', bg: 'bg-[#EF4444]', desc: 'Wearing a mask outside is recommended. Everyone may begin to experience health effects.' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500', bg: 'bg-[#A855F7]', desc: 'Health warnings of emergency conditions for the entire population.' };
    return { label: 'Hazardous', color: 'text-rose-900', bg: 'bg-[#881337]', desc: 'Health alert: everyone may experience more serious health effects.' };
  };

  const aqiStatus = getAQIStatus(stats.avgAqi);
  const uvStatus = daily.uv_index_max[0] > 8 ? 'Very High' : daily.uv_index_max[0] > 5 ? 'High' : 'Low';
  
  // Calculate dynamic pointer percentage for AQI Scale (max 300)
  const aqiPercentage = Math.min((stats.avgAqi / 300) * 100, 100);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full h-[calc(100vh-theme('spacing.16'))] lg:h-screen overflow-y-auto custom-scrollbar pb-24 text-white">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between pl-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <MapPin className="w-6 h-6 text-neon-green" /> 
             {cityState.name}
          </h1>
        </div>
      </motion.div>

      {/* Row 1: Weather Hero & AQI Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
         
         {/* Atmosphere Hero Card */}
         <motion.div variants={itemVariants} className="lg:col-span-7 rounded-3xl p-8 relative overflow-hidden bg-gradient-to-tr from-indigo-900/40 via-[#0B1120] to-[#0B1120] shadow-lg flex flex-col justify-between min-h-[340px] border border-blue-500/20">
            {/* Faint Background Decor */}
            <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none mix-blend-screen overflow-hidden">
               {getWeatherIcon(current.weather_code, isDay, "w-[400px] h-[400px]")}
            </div>
            {/* Stars generated randomly */}
            <div className="absolute inset-0 z-0 opacity-40">
               <div className="absolute top-12 left-12 w-1 h-1 bg-white rounded-full"></div>
               <div className="absolute top-24 left-1/3 w-1.5 h-1.5 bg-white rounded-full"></div>
               <div className="absolute top-48 right-1/4 w-1 h-1 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full pt-6">
               <div className="flex flex-col items-center gap-2">
                 <h2 className="text-[7rem] font-black leading-none drop-shadow-2xl tracking-tighter text-white">
                    {Math.round(current.temperature_2m)}<span className="text-6xl text-white/50 absolute">°</span>
                 </h2>
               </div>
               
               <div className="mt-8 text-center bg-black/40 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                 <p className="text-lg font-medium text-gray-200 flex items-center justify-center gap-4">
                    <span className="flex items-center gap-2">
                       {getWeatherIcon(current.weather_code, isDay, "w-5 h-5 text-blue-300")}
                       {getWeatherDescription(current.weather_code)}
                    </span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span className="text-blue-200 font-bold">{Math.round(daily.temperature_2m_max[0])}° / {Math.round(daily.temperature_2m_min[0])}°</span>
                 </p>
                 <p className="text-sm font-medium mt-1">Air quality: {stats.avgAqi} - <span className={aqiStatus.color}>{aqiStatus.label}</span></p>
               </div>
            </div>
         </motion.div>

         {/* AQI Detailed Tracking Module */}
         <motion.div variants={itemVariants} className="lg:col-span-5 bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col">
           <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-2xl font-black ${aqiStatus.color} flex items-center gap-2`}>
                   {aqiStatus.label} <span className="text-white bg-white/10 px-3 py-1 rounded-full text-lg">{stats.avgAqi}</span>
                </h3>
              </div>
           </div>
           
           <p className="text-sm text-gray-400 font-medium flex-1 mb-8">
             {aqiStatus.desc} <Link to="/map" className="text-neon-green ml-1 hover:underline">Plan Clean Route</Link>
           </p>

           {/* Linear AQI Spectrum Scale */}
           <div className="w-full mt-auto mb-2">
              <div className="h-4 w-full rounded-full flex gap-1.5 overflow-hidden shadow-inner">
                 <div className="flex-1 bg-gradient-to-r from-[#00E400] to-[#00E400]/80"></div>
                 <div className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFD700]/80"></div>
                 <div className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FF8C00]/80"></div>
                 <div className="flex-1 bg-gradient-to-r from-[#FF0000] to-[#FF0000]/80"></div>
                 <div className="flex-[2] bg-gradient-to-r from-[#800080] to-[#881337]"></div>
              </div>
              {/* Dynamic pointer (Glass indicator) */}
              <div className="relative w-full h-8 -mt-6">
                 <motion.div 
                    initial={{ left: 0 }} 
                    animate={{ left: `${aqiPercentage}%` }} 
                    transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                    className="absolute top-0 w-3 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] border border-gray-300 -ml-1.5"
                 ></motion.div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 px-1">
                 <span>0 (Good)</span><span>100</span><span>200</span><span>300+ (Hazard)</span>
              </div>
           </div>
         </motion.div>

      </div>

      {/* Row 2: 24-Hour Forecast Scroller */}
      <motion.div variants={itemVariants} className="w-full bg-[#0B1120]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg overflow-x-auto custom-scrollbar flex items-center scroll-smooth min-h-[140px]">
         <div className="flex items-center gap-6 min-w-max">
            {hourly.temperature_2m.slice(0, 24).map((temp, idx) => {
               const time = new Date(hourly.time[idx]);
               const isNow = idx === 0;
               const hourStr = isNow ? "Now" : time.toLocaleTimeString([], { hour: 'numeric' });
               const isNightHour = time.getHours() < 6 || time.getHours() > 18;
               return (
                  <div key={idx} className={`flex w-16 flex-col items-center justify-center gap-3 p-3 rounded-2xl transition ${isNow ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5'}`}>
                     <span className={`text-sm font-bold ${isNow ? 'text-white' : 'text-gray-400'}`}>{hourStr}</span>
                     {getWeatherIcon(hourly.weather_code[idx], !isNightHour, "w-8 h-8 text-white")}
                     <span className="text-lg font-bold text-white">{Math.round(temp)}°</span>
                  </div>
               );
            })}
         </div>
      </motion.div>

      {/* Row 3: Modular Data Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
         
         {/* 5-Day Forecast Column */}
         <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6 px-2">5-Day Outlook</h3>
            <div className="flex flex-col gap-6 flex-1 justify-center relative">
               {/* Vertical grid lines faintly in background */}
               <div className="absolute inset-y-0 right-16 w-px bg-white/5 z-0"></div>
               <div className="absolute inset-y-0 right-8 w-px bg-white/5 z-0"></div>
               
               {daily.time.slice(0, 5).map((dateStr, idx) => {
                  const d = new Date(dateStr);
                  const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : d.toLocaleDateString([], { weekday: 'short' });
                  return (
                     <div key={idx} className="flex items-center justify-between relative z-10 px-2 py-1 rounded-xl hover:bg-white/5 transition cursor-default">
                        <span className="text-sm font-bold text-white w-28 tracking-wide">
                          {d.getDate()} {d.toLocaleDateString([], { month: 'short' })} <span className="text-gray-500 ml-1 font-medium">{dayName}</span>
                        </span>
                        {getWeatherIcon(daily.weather_code[idx], true, "w-6 h-6 text-gray-300")}
                        <div className="flex gap-4 text-sm font-bold items-center justify-end w-24">
                           <span className="text-gray-400">{Math.round(daily.temperature_2m_min[idx])}°</span>
                           <span className="text-white">{Math.round(daily.temperature_2m_max[idx])}°</span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </motion.div>

         {/* Extracted Metrics & Environmental Analytics Grid */}
         <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6 w-full">
            
            {/* 3x2 Grid for Specific Data points */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Sun className="w-4 h-4 text-yellow-500"/> UV Index</div>
                  <div className="text-3xl font-black relative top-2 mb-2">{Math.round(daily.uv_index_max[0])}</div>
                  <div className="text-xs text-yellow-500 font-bold uppercase">{uvStatus}</div>
               </div>
               
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Thermometer className="w-4 h-4 text-red-400"/> Feels like</div>
                  <div className="text-4xl font-black mt-2">{Math.round(current.apparent_temperature)}°</div>
               </div>
               
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Droplets className="w-4 h-4 text-blue-400"/> Humidity</div>
                  <div className="text-4xl font-black mt-2">{Math.round(current.relative_humidity_2m)}<span className="text-2xl text-gray-500 ml-1">%</span></div>
               </div>
               
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Wind className="w-4 h-4 text-teal-400"/> Wind</div>
                  <div className="text-3xl font-black mt-3 flex items-baseline gap-1">
                     {Math.round(current.wind_speed_10m)} <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">km/h</span>
                  </div>
               </div>
               
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Compass className="w-4 h-4 text-purple-400"/> Pressure</div>
                  <div className="text-3xl font-black mt-3 flex items-baseline gap-1 relative top-1">
                     {Math.round(current.surface_pressure)} <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">hPa</span>
                  </div>
               </div>
               
               <div className="bg-[#0B1120]/80 border border-white/5 rounded-3xl p-5 shadow-sm hover:border-white/10 transition">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold mb-3"><Eye className="w-4 h-4 text-sky-400"/> Visibility</div>
                  <div className="text-3xl font-black mt-3 flex items-baseline gap-1">
                     {hourly.visibility ? Math.round(hourly.visibility[0] / 1000) : 10} <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">km</span>
                  </div>
               </div>
            </div>

            {/* Solar Cycle & Lifestyle Engine Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* Sun Position Array */}
                <div className="bg-gradient-to-tr from-[#0B1120] to-blue-900/10 border border-white/5 rounded-3xl p-6 shadow-inner relative overflow-hidden flex flex-col justify-between">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><Sunrise className="w-3 h-3 text-yellow-500"/> Sunrise</span>
                         <span className="text-2xl font-black">{new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-end gap-1"><Sunset className="w-3 h-3 text-orange-500"/> Sunset</span>
                         <span className="text-2xl font-black">{new Date(daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                   </div>
                   
                   {/* Simplified Solar Arc UI */}
                   <div className="relative w-full h-10 mt-auto">
                      <div className="absolute top-2 w-[90%] left-1/2 -translate-x-1/2 h-40 border-t-2 border-dashed border-white/20 rounded-t-full"></div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#0B1120] p-1 rounded-full text-white">
                         <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                      </div>
                   </div>
                </div>

                {/* Lifestyle Tips Dynamic Engine */}
                <div className="bg-[#0B1120] border border-white/5 rounded-3xl p-6 shadow-inner">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Lifestyle Intel</h3>
                      <button className="text-xs text-neon-green hover:underline">More &gt;</button>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                      
                      <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition cursor-default">
                         <Leaf className="w-5 h-5 text-neon-green" />
                         <span className="text-xs font-bold text-gray-200 text-center leading-tight">Low Pollen<br/>Count</span>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition cursor-default">
                         <ShieldCheck className="w-5 h-5 text-blue-400" />
                         <span className="text-xs font-bold text-gray-200 text-center leading-tight">Apply<br/>Sunscreen</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition cursor-default">
                         <Dumbbell className="w-5 h-5 text-orange-400" />
                         <span className="text-xs font-bold text-gray-200 text-center leading-tight">Indoor<br/>Workouts</span>
                      </div>
                      
                   </div>
                </div>

            </div>

         </motion.div>
      </div>

    </motion.div>
  );
}
