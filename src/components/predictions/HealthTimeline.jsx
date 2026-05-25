import React, { useMemo } from 'react';
import { getSmartScheduler, formatHour, getAQIColor, getHealthImpact } from '../../utils/aqiForecast';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function HealthTimeline({ month, dayOfWeek, neighbourhood, isSensitive }) {
  const data = useMemo(() => {
    return getSmartScheduler(month, dayOfWeek, neighbourhood, 'walking', 1);
  }, [month, dayOfWeek, neighbourhood]);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">24h Health Impact Timeline</h4>
         <span className="text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">Hover for tips</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-4 pt-2 custom-scrollbar snap-x">
        {data.hourly.map((h, i) => {
          const colors = getAQIColor(h.aqi, isSensitive);
          const impact = getHealthImpact(h.aqi);
          
          return (
            <div key={i} className="group relative flex-shrink-0 snap-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.01 }}
                className={`w-12 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group-hover:scale-110 group-hover:z-10 shadow-sm border ${colors.bg} ${colors.border}`}
              >
                <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">{formatHour(h.hour)}</span>
                <div className={`w-3 h-3 rounded-full ${colors.solidBg} border border-white/20 shadow-sm`}></div>
                <span className={`text-xs font-black ${colors.text}`}>{h.aqi}</span>
              </motion.div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-white dark:bg-[#0B1120] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 translate-y-2 group-hover:translate-y-0">
                <div className="flex flex-col gap-1.5">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hour {formatHour(h.hour)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{impact.category}</span>
                   </div>
                   <div className="flex items-end gap-2">
                       <span className={`text-2xl font-black ${colors.text}`}>{h.aqi}</span>
                       <span className="text-[10px] font-bold text-slate-400 mb-1">AQI</span>
                   </div>
                   <p className="text-[10px] leading-relaxed font-medium text-slate-600 dark:text-gray-300">
                     {impact.tip}
                   </p>
                   <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                   <div className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase flex justify-between">
                      <span>Pred. PM2.5</span>
                      <span className="text-slate-700 dark:text-gray-300">{h.pm25} µg/m³</span>
                   </div>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#0B1120] border-r border-b border-gray-200 dark:border-white/10 rotate-45"></div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 px-1 mt-1 opacity-60">
        <Info className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] italic font-medium text-slate-500 dark:text-gray-400">Model uncertainty: ±8.14 µg/m³ per hour</span>
      </div>
    </div>
  );
}
