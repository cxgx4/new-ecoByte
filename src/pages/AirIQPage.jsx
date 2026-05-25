import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, MapPin, CalendarDays, LineChart, Home, Clock, AlertCircle, Info, Share2, X } from 'lucide-react';
import SmartScheduler from '../components/predictions/SmartScheduler';
import SevenDayOutlook from '../components/predictions/SevenDayOutlook';
import RelocationGuide from '../components/predictions/RelocationGuide';
import SeasonalChart from '../components/predictions/SeasonalChart';
import HealthTimeline from '../components/predictions/HealthTimeline';
import PollutantBreakdown from '../components/predictions/PollutantBreakdown';
import RespiratoryRiskCard from '../components/predictions/RespiratoryRiskCard';
import CommutePlanner from '../components/predictions/CommutePlanner';
import ReportCard from '../components/predictions/ReportCard';
import { getNeighbourhoods, getMonthlyAnomaly, getSmartScheduler, getYearlyTrend, get7DayOutlook, formatDay } from '../utils/aqiForecast';

export default function AirIQPage() {
  const [neighbourhood, setNeighbourhood] = useState('Victoria');
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay()); // 0-6
  const [isSensitive, setIsSensitive] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [showAnomaly, setShowAnomaly] = useState(true);

  const neighbourhoods = getNeighbourhoods();

  // Reset anomaly dismissal when month/neighbourhood changes
  useMemo(() => setShowAnomaly(true), [month, neighbourhood]);

  // Calculate anomaly
  const anomaly = useMemo(() => {
    const yearlyTrend = getYearlyTrend(neighbourhood);
    const predictedAvg = yearlyTrend.find(m => m.month === month)?.avgAQI || 0;
    return getMonthlyAnomaly(month, predictedAvg);
  }, [month, neighbourhood]);

  // Calculate Week Summary for Report Card
  const weekSummary = useMemo(() => {
    const outlook = get7DayOutlook(month, neighbourhood);
    let totalAvgAQI = 0;
    let worstVal = -1;
    let worstIdx = 0;
    let bestVal = 9999;
    let bestIdx = 0;
    let safeHours = 0;

    outlook.forEach((day, i) => {
      const dayAvg = (day.minAQI + day.maxAQI) / 2;
      totalAvgAQI += dayAvg;
      
      if (day.maxAQI > worstVal) {
        worstVal = day.maxAQI;
        worstIdx = i;
      }
      if (day.minAQI < bestVal) {
        bestVal = day.minAQI;
        bestIdx = i;
      }

      // Count safe hours for this day
      const dayData = getSmartScheduler(month, i, neighbourhood, 'walking', 1);
      dayData.hourly.forEach(h => {
        if (h.aqi > 0 && h.aqi <= 100) safeHours++;
      });
    });

    return {
      avgAQI: Math.round(totalAvgAQI / 7),
      worstDay: formatDay(worstIdx),
      bestDay: formatDay(bestIdx),
      safeHours,
      neighbourhood
    };
  }, [month, neighbourhood]);

  return (
    <div className="w-full h-[calc(100vh-theme('spacing.16'))] lg:h-screen p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-[#f0fdf4] via-emerald-50 to-[#e0f2fe] dark:from-[#060C14] dark:via-[#0B1120] dark:to-[#060C14] text-slate-800 dark:text-white flex flex-col items-center custom-scrollbar border-l border-t border-gray-200 dark:border-white/5 rounded-tl-3xl transition-colors duration-500">
       
       <div className="w-full max-w-5xl pt-4 pb-12 flex flex-col items-center">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-8 w-full"
          >
             <div className="flex items-center justify-center p-3 bg-emerald-500/10 dark:bg-neon-green/10 rounded-full mb-4 border border-emerald-500/20 dark:border-neon-green/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] dark:shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                <Activity className="w-8 h-8 text-emerald-600 dark:text-neon-green" />
             </div>
             <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm dark:drop-shadow-md text-slate-900 dark:text-white">
                AirIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-neon-green dark:to-emerald-500">Analytics</span>
             </h1>
             <p className="text-slate-600 dark:text-gray-400 max-w-2xl text-sm md:text-base font-medium">
               Advanced predictive mapping for localized air quality trends and health risks.
             </p>
          </motion.div>

          {/* Anomaly Banner */}
          <AnimatePresence>
            {anomaly && showAnomaly && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-8 flex items-center gap-4 text-rose-700 dark:text-rose-400 relative overflow-hidden group"
              >
                <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest mb-0.5">Seasonal Anomaly Detected</p>
                  <p className="text-sm font-bold leading-tight">{anomaly.message}</p>
                </div>
                <button 
                  onClick={() => setShowAnomaly(false)}
                  className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors text-rose-500"
                >
                   <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Control Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-4xl bg-white/70 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-3xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center shadow-xl shadow-emerald-900/5 dark:shadow-none"
          >
             {/* Location Selector */}
             <div className="flex flex-col gap-2 w-full md:w-1/3">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase flex items-center gap-1.5 justify-between">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400"/> Target Location</span>
                  <div className="relative">
                    <Info 
                      className="w-3 h-3 text-slate-400 hover:text-blue-500 cursor-help transition-colors"
                      onMouseEnter={() => setShowTransparency(true)}
                      onMouseLeave={() => setShowTransparency(false)}
                    />
                    {showTransparency && (
                      <div className="absolute right-0 bottom-6 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg shadow-xl z-50 leading-tight">
                        Results are calculated using local neighborhood modifiers applied to the central model prediction.
                      </div>
                    )}
                  </div>
                </label>
                <select 
                  value={neighbourhood} 
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  className="bg-white dark:bg-black/40 text-slate-800 dark:text-white text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl p-2.5 outline-none hover:border-blue-500/50 dark:hover:border-white/20 transition-colors w-full focus:ring-2 ring-blue-500/50 shadow-sm"
                >
                   {neighbourhoods.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
             </div>
             
             {/* Target Month */}
             <div className="flex flex-col gap-2 w-full md:w-1/3">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"/> Context Month</label>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="bg-white dark:bg-black/40 text-slate-800 dark:text-white text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl p-2.5 outline-none hover:border-emerald-500/50 dark:hover:border-white/20 transition-colors w-full focus:ring-2 ring-emerald-500/50 shadow-sm"
                >
                   {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long'})}</option>)}
                </select>
             </div>

             {/* Health Shield Mode */}
             <div className="flex flex-col items-center justify-center gap-2 w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 pt-4 md:pt-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-gray-400">
                   <Shield className={`w-4 h-4 ${isSensitive ? 'text-rose-500 dark:text-[#ef4444]' : 'text-slate-400 dark:text-gray-500'}`} />
                   Health Shield Mode
                </div>
                <button 
                   onClick={() => setIsSensitive(!isSensitive)}
                   className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${isSensitive ? 'bg-rose-500 dark:bg-[#ef4444]' : 'bg-gray-300 dark:bg-gray-700'}`}
                 >
                   <motion.div 
                      className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 ${isSensitive ? 'shadow-[0_0_10px_rgba(244,63,94,0.6)] dark:shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}
                      animate={{ left: isSensitive ? '32px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                   />
                </button>
             </div>
          </motion.div>

          {/* 24h Timeline Bar */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="w-full max-w-4xl mb-12"
          >
             <HealthTimeline month={month} dayOfWeek={dayOfWeek} neighbourhood={neighbourhood} isSensitive={isSensitive} />
          </motion.div>

          {/* Vertical Stack Timeline Container */}
          <div className="w-full flex flex-col gap-12">
             
             {/* DAILY Section */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="w-full flex flex-col gap-4"
             >
                <div className="flex items-center gap-3">
                   <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
                     <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                   </div>
                   <div>
                     <h2 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Daily Activity</h2>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white">Smart Scheduler</h3>
                   </div>
                </div>
                <div className="bg-white/80 dark:bg-[#0B1120]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-teal-900/5 dark:shadow-none w-full">
                   <SmartScheduler month={month} dayOfWeek={dayOfWeek} neighbourhood={neighbourhood} isSensitive={isSensitive} />
                </div>
             </motion.div>

             {/* PREDICTIVE TOOLS GRID */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-3xl bg-white/50 dark:bg-[#0B1120]/40 border border-white/10 backdrop-blur-md"
                >
                  <PollutantBreakdown aqi={120} /> {/* Mock value for now, will tie to selected hour in future */}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="p-6 rounded-3xl bg-white/50 dark:bg-[#0B1120]/40 border border-white/10 backdrop-blur-md"
                >
                  <RespiratoryRiskCard month={month} />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-3xl bg-white/50 dark:bg-[#0B1120]/40 border border-white/10 backdrop-blur-md"
                >
                  <CommutePlanner month={month} dayOfWeek={dayOfWeek} neighbourhood={neighbourhood} />
                </motion.div>
             </div>

             {/* WEEKLY Section */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="w-full flex flex-col gap-4"
             >
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                     <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <div>
                     <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Weekly Outlook</h2>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white">7-Day Horizon</h3>
                   </div>
                </div>
                <div className="bg-white/80 dark:bg-[#0B1120]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-indigo-900/5 dark:shadow-none w-full">
                   <SevenDayOutlook month={month} neighbourhood={neighbourhood} isSensitive={isSensitive} />
                </div>
             </motion.div>

             {/* RELOCATION & REPORT CARD */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.6 }}
                 className="flex flex-col gap-4"
               >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                      <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Clean Living Index</h3>
                  </div>
                  <div className="bg-white/80 dark:bg-[#0B1120]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-orange-900/5 dark:shadow-none h-full">
                    <RelocationGuide month={month} />
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.6 }}
                 className="flex flex-col gap-4"
               >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                      <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Personal Summary</h3>
                  </div>
                  <ReportCard neighbourhood={neighbourhood} weekSummary={weekSummary} />
               </motion.div>
             </div>

             {/* YEARLY Section */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               className="w-full flex flex-col gap-4"
             >
                <div className="flex items-center gap-3">
                   <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                     <LineChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                   </div>
                   <div>
                     <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Yearly Perspective</h2>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white">Forecast Trends</h3>
                   </div>
                </div>
                <div className="bg-white/80 dark:bg-[#0B1120]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-purple-900/5 dark:shadow-none w-full">
                   <div className="w-full min-h-[300px]">
                      <SeasonalChart neighbourhood={neighbourhood} isSensitive={isSensitive} />
                   </div>
                </div>
             </motion.div>

          </div>

       </div>
    </div>
  );
}
