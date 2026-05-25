import React, { useMemo, useState } from 'react';
import { getSmartScheduler, formatHour } from '../../utils/aqiForecast';
import { Car, Clock, Navigation, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CommutePlanner({ month, dayOfWeek, neighbourhood }) {
  const [direction, setDirection] = useState('morning'); // morning, evening
  
  const data = useMemo(() => {
    return getSmartScheduler(month, dayOfWeek, neighbourhood, 'walking', 1);
  }, [month, dayOfWeek, neighbourhood]);

  const recommendations = useMemo(() => {
    if (!data) return [];
    
    // Sort all windows by AQI
    const all = [...data.hourly];
    const morningSlots = all.filter(h => h.hour >= 7 && h.hour <= 10);
    const eveningSlots = all.filter(h => h.hour >= 17 && h.hour <= 20);
    
    const targetSlots = direction === 'morning' ? morningSlots : eveningSlots;
    return targetSlots.sort((a, b) => a.aqi - b.aqi).slice(0, 2);
  }, [data, direction]);

  if (!data) return null;

  const getRouteQuality = (aqi) => {
    if (aqi <= 50) return { label: "Clean Route Likely", color: "text-emerald-500" };
    if (aqi <= 100) return { label: "Moderate Exposure Route", color: "text-amber-500" };
    return { label: "High Exposure Route — use AuraPath", color: "text-rose-500", showIcon: true };
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" />
            Commute Optimizer
         </h4>
      </div>

      <div className="flex flex-col gap-4">
          <div className="flex bg-gray-100/50 dark:bg-black/40 rounded-xl p-1 border border-gray-200 dark:border-white/5 w-full">
             <button onClick={() => setDirection('morning')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${direction === 'morning' ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow" : "text-gray-500 dark:text-gray-400"}`}>Morning In</button>
             <button onClick={() => setDirection('evening')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${direction === 'evening' ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow" : "text-gray-500 dark:text-gray-400"}`}>Evening Out</button>
          </div>

          <div className="space-y-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Recommended Departure</span>
             {recommendations.map((slot, idx) => {
                const quality = getRouteQuality(slot.aqi);
                return (
                  <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                  <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-800 dark:text-white">{formatHour(slot.hour)}</span>
                                  <span className="text-[9px] font-bold text-slate-400">Best Slot</span>
                              </div>
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{slot.aqi} AQI</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Est. Exposure</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${quality.color}`}>
                          {quality.label}
                          {quality.showIcon && <ExternalLink className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                  </div>
                );
             })}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-slate-600 dark:text-gray-400 leading-tight">
                  Shifting your commute to items in this list can reduce PM2.5 exposure by up to <span className="text-blue-600 dark:text-blue-400 font-bold">24%</span> compared to peak hours.
                </p>
              </div>
              <div className="h-px bg-blue-100 dark:bg-blue-500/10 my-1"></div>
              <Link to="/map" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                For full clean-route navigation, use AuraPath <ExternalLink className="w-2.5 h-2.5" />
              </Link>
          </div>
      </div>
    </div>
  );
}
