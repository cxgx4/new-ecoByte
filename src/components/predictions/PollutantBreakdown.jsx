import React, { useMemo, useState } from 'react';
import { getPollutantBreakdown } from '../../utils/aqiForecast';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PollutantBreakdown({ aqi }) {
  const breakdown = useMemo(() => getPollutantBreakdown(aqi), [aqi]);
  const [showTooltip, setShowTooltip] = useState(false);

  const total = breakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Key Pollutants
            <div className="relative">
                <Info 
                    className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" 
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg shadow-xl z-50 leading-tight border border-white/10">
                        Estimated from urban profile data — not direct sensor readings. Represents relative model feature contribution.
                    </div>
                )}
            </div>
         </h4>
      </div>

      <div className="flex flex-col gap-5 justify-center flex-1">
          {/* Proportional Bar */}
          <div className="h-6 w-full flex rounded-full overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner bg-gray-50 dark:bg-black/20">
              {breakdown.map((item, i) => {
                  const width = (item.value / total) * 100;
                  return (
                      <motion.div
                          key={item.name}
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: "circOut" }}
                          style={{ backgroundColor: item.color }}
                          className="h-full relative group"
                          title={`${item.name}: ${item.value}`}
                      >
                          {/* Inner Percentage Label if wide enough */}
                          {width > 12 && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  {Math.round(width)}%
                              </span>
                          )}
                      </motion.div>
                  );
              })}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-3">
              {breakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-700 dark:text-gray-200">{item.value} <span className="text-[9px] font-normal text-slate-400">Idx</span></span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
