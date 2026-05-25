import React, { useState, useEffect } from 'react';
import { getSmartScheduler, formatHour, getAQIColor } from '../../utils/aqiForecast';
import { Clock, Activity, AlertTriangle, Bike, Footprints, Baby, Flame, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITIES = [
  { id: 'walking', label: 'Walk', icon: Footprints, color: 'text-blue-500', groupColor: 'blue' },
  { id: 'cycling', label: 'Cycle', icon: Bike, color: 'text-emerald-500', groupColor: 'emerald' },
  { id: 'kids_play', label: 'Play', icon: Baby, color: 'text-orange-500', groupColor: 'orange' },
  { id: 'running', label: 'Run', icon: Flame, color: 'text-rose-500', groupColor: 'rose' }
];

export default function SmartScheduler({ month, dayOfWeek, neighbourhood, isSensitive }) {
  const [activity, setActivity] = useState('walking');
  const [duration, setDuration] = useState(2);
  const [data, setData] = useState(null);

  useEffect(() => {
     setData(getSmartScheduler(month, dayOfWeek, neighbourhood, activity, duration));
  }, [month, dayOfWeek, neighbourhood, activity, duration]);

  if (!data) return null;

  const currentActivity = ACTIVITIES.find(a => a.id === activity);

  return (
    <div className="flex flex-col gap-6 w-full">
       {/* Activity & Duration Selectors */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Activity</label>
            <div className="flex bg-gray-100/50 dark:bg-black/40 rounded-2xl p-1 border border-gray-200 dark:border-white/5 w-full">
                {ACTIVITIES.map((act) => (
                  <button 
                    key={act.id} 
                    onClick={() => setActivity(act.id)} 
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${activity === act.id ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                  >
                    <act.icon className={`w-3.5 h-3.5 ${activity === act.id ? act.color : "text-gray-400"}`} />
                    {act.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Duration</label>
            <div className="flex bg-gray-100/50 dark:bg-black/40 rounded-2xl p-1 border border-gray-200 dark:border-white/5 w-full">
                {[1, 2, 4, 8].map((d) => (
                  <button 
                    key={d} 
                    onClick={() => setDuration(d)} 
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${duration === d ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm" : "text-gray-400"}`}
                  >
                    {d}h
                  </button>
                ))}
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Safety Score Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-[#060C14] border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden min-h-[220px]">
                <div className={`absolute top-0 right-0 w-48 h-48 bg-${currentActivity.groupColor}-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> Optimal Time</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">±8.14 µg/m³ MAE</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                          {formatHour(data.bestWindowStart)} - {formatHour(data.bestWindowEnd)}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Score</span>
                        <span className="text-4xl font-black text-emerald-500">
                          {Math.round(data.hourly[data.bestWindowStart].safetyScore)}%
                        </span>
                      </div>
                   </div>

                   <div className="mt-8 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500 dark:text-gray-400">Exposure Profile</span>
                        <span className="text-slate-400 uppercase text-[9px]">uncertainty ±8.14</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                         {data.hourly.map((h, i) => {
                           const isBest = i >= data.bestWindowStart && i < data.bestWindowEnd;
                           const color = getAQIColor(h.aqi, isSensitive).solidBg.replace('bg-', '');
                           return (
                             <div 
                               key={i} 
                               className={`h-full flex-1 transition-all ${isBest ? 'opacity-100 scale-y-125 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'opacity-30 bg-gray-300 dark:bg-gray-700'}`}
                             />
                           )
                         })}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-gray-400 mt-2 italic flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        Exposure includes physical exertion multiplier ({data.effortMultiplier || ACTIVITIES.find(a=>a.id===activity).id==='walking'?'1.0':'1.4-1.8'}x). 
                        Predicted avg AQI: <strong>{data.lowestAvgAQI}</strong>.
                      </p>
                   </div>
                </div>
             </div>

             {/* Hourly Scroll Timeline */}
             <div className="flex gap-3 overflow-x-auto pb-4 pt-2 custom-scrollbar">
                {data.hourly.map((h, i) => {
                   const isBest = i >= data.bestWindowStart && i < data.bestWindowEnd;
                   const colors = getAQIColor(h.aqi, isSensitive);
                   return (
                     <motion.div 
                       key={i}
                       className={`shrink-0 w-24 flex flex-col items-center p-3 rounded-2xl border transition-all ${isBest ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 dark:ring-offset-[#060C14] scale-105 z-10' : 'opacity-60'} ${colors.bg} ${colors.border}`}
                     >
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1">{formatHour(h.hour)}</span>
                        <span className={`text-xl font-black ${colors.text}`}>{h.aqi}</span>
                        <div className="flex flex-col items-center mt-1">
                           <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-gray-500">Exp. PM2.5</span>
                           <span className="text-[10px] font-black text-slate-700 dark:text-gray-200">{h.effectivePm25}</span>
                        </div>
                     </motion.div>
                   );
                })}
             </div>
          </div>

          {/* Top 3 Alternative Slots */}
          <div className="flex flex-col gap-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Alternative Safest Slots</h3>
             <div className="flex flex-col gap-3">
                {data.bestWindows.map((win, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between group cursor-pointer ${idx === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5'}`}
                  >
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-slate-400'}`}>
                           {idx === 0 ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                              {formatHour(win.start)} - {formatHour(win.end)}
                           </span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase">Rank #{idx + 1}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-black text-emerald-500">{win.avgAQI}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Avg AQI</div>
                     </div>
                  </motion.div>
                ))}
             </div>
             
             <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest">
                   <AlertTriangle className="w-3.5 h-3.5" />
                   Health Advisory
                </div>
                <p className="text-[10px] font-medium text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                  {isSensitive ? 'High exertion during peak hours is not recommended for sensitive groups. Use an N95 mask if you must go out.' : 'Moderate activity is safe, but consider shifting high-intensity workouts to early morning or late evening.'}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}
