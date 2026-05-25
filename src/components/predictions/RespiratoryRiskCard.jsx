import React, { useMemo } from 'react';
import { getParticulateRiskIndex } from '../../utils/aqiForecast';
import { Wind, Waves, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RespiratoryRiskCard({ month }) {
  // Use a typical humidity for Kolkata based on month (Proxy)
  const getTypicalHumidity = (m) => {
    if (m >= 6 && m <= 9) return 85; // Monsoon
    if (m >= 3 && m <= 5) return 45; // Dry heat
    return 65; // Moderate
  };

  const humidity = getTypicalHumidity(month);
  const { risk, score } = useMemo(() => getParticulateRiskIndex(month, humidity), [month, humidity]);

  const getRiskColor = (r) => {
    if (r === 'Low') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (r === 'Moderate') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (r === 'High') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 text-wrap">
            <Wind className="w-4 h-4 text-emerald-500" />
            Allergen & Particulate Risk
         </h4>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4">
          <div className="relative flex items-center justify-center">
              {/* Radial Score Background */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100 dark:text-white/5"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  fill="transparent"
                  strokeLinecap="round"
                  className={`${getRiskColor(risk).split(' ')[0]}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{score}</span>
                  <span className="text-[8px] font-bold uppercase text-slate-400">Risk Score</span>
              </div>
          </div>

          <div className={`px-4 py-2 rounded-2xl border ${getRiskColor(risk)} flex flex-col items-center w-full max-w-[180px]`}>
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Category</span>
              <span className="text-sm font-black italic">{risk} Risk</span>
          </div>

          <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Waves className="w-3 h-3 text-blue-400" /> Avg Humidity</span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">{humidity}%</span>
              </div>
              <p className="text-[9px] leading-tight text-center text-slate-400 dark:text-gray-500 italic">
                  Combination of humidity-driven mold risk and model PM2.5 baseline.
              </p>
          </div>
      </div>
    </div>
  );
}
