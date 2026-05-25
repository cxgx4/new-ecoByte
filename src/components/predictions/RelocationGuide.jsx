import React, { useState, useEffect } from 'react';
import { getRelocationRankings, getAQIColor, formatMonth } from '../../utils/aqiForecast';
import { ShieldAlert, BadgeCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RelocationGuide({ month }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    setRankings(getRelocationRankings(month));
  }, [month]);

  if (!rankings.length) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
       <div className="flex items-center justify-between px-1 mb-2">
         <div className="text-sm text-slate-500 dark:text-gray-400 font-medium">
           Neighbourhood rankings based on projected AQI for <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatMonth(month)}</strong>.
         </div>
         <div className="group relative">
           <Info className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
           <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-white/10 leading-tight font-medium">
             Scores are estimates derived from neighborhood modifiers applied to the central model baseline.
           </div>
         </div>
       </div>

       {rankings.map((loc, index) => {
          const colors = getAQIColor(loc.averageAQI, false); 
          const isTop = index === 0;
          const isWorst = index === rankings.length - 1;

          return (
             <motion.div 
               key={loc.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className={`flex items-center justify-between p-4 rounded-2xl border ${colors.bg} ${colors.border} shadow-sm`}
             >
                <div className="flex items-center gap-4">
                   <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${isTop ? 'bg-emerald-500 dark:bg-neon-green text-white dark:text-[#060C14] shadow-md' : isWorst ? 'bg-rose-500 text-white shadow-md' : 'bg-white dark:bg-white/10 text-slate-600 dark:text-gray-300'}`}>
                      #{index + 1}
                   </div>
                   <div className="flex flex-col">
                      <span className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                         {loc.label} 
                         {isTop && <BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-neon-green" />}
                         {isWorst && <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-[#ef4444]" />}
                      </span>
                      <span className={`text-xs uppercase font-bold ${colors.text} opacity-80`}>{loc.risk}</span>
                   </div>
                </div>
                <div className={`text-2xl font-black ${colors.text}`}>
                   {loc.averageAQI}
                </div>
             </motion.div>
          );
       })}
    </div>
  );
}
