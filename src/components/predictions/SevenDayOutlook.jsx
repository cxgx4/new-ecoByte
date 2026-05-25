import React, { useState, useEffect } from 'react';
import { get7DayOutlook, formatDay, formatHour, getAQIColor } from '../../utils/aqiForecast';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SevenDayOutlook({ month, neighbourhood, isSensitive }) {
  const [data, setData] = useState([]);
  const today = new Date().getDay(); 

  useEffect(() => {
     setData(get7DayOutlook(month, neighbourhood));
  }, [month, neighbourhood]);

  if (!data.length) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
       {data.map((day, i) => {
          const actualDayIndex = (today + i) % 7; 
          const isToday = i === 0;

          const minColors = getAQIColor(day.minAQI, isSensitive);
          const maxColors = getAQIColor(day.maxAQI, isSensitive);

          return (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.05 }}
               className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/5 shadow-sm"
             >
                <div className="flex items-center gap-3 w-20">
                   <div className="text-base font-bold text-slate-700 dark:text-gray-200">
                      {isToday ? 'Today' : formatDay(actualDayIndex)}
                   </div>
                </div>

                <div className="flex-1 flex justify-around items-center">
                   <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-green-500 uppercase tracking-widest"><ArrowDown className="w-3 h-3"/> Best</div>
                      <div className={`px-3 py-1 rounded-lg text-base font-black ${minColors.bg} ${minColors.text} border ${minColors.border}`}>
                         {day.minAQI}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-500 font-medium">{formatHour(day.minHour)}</div>
                   </div>

                   <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

                   <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center text-xs font-bold text-rose-600 dark:text-red-500 uppercase tracking-widest"><ArrowUp className="w-3 h-3"/> Worst</div>
                      <div className={`px-3 py-1 rounded-lg text-base font-black ${maxColors.bg} ${maxColors.text} border ${maxColors.border}`}>
                         {day.maxAQI}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-500 font-medium">{formatHour(day.maxHour)}</div>
                   </div>
                </div>
             </motion.div>
          );
       })}
    </div>
  );
}
