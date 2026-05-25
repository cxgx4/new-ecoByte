import React, { useState, useEffect, useMemo } from 'react';
import { getYearlyTrend, formatMonth, getAQIColor } from '../../utils/aqiForecast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';
import { History, Info } from 'lucide-react';

export default function SeasonalChart({ neighbourhood, isSensitive }) {
  const [data, setData] = useState([]);
  const [showBaseline, setShowBaseline] = useState(false);
  
  useEffect(() => {
     setData(getYearlyTrend(neighbourhood));
  }, [neighbourhood]);

  if (!data.length) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const colors = getAQIColor(val, isSensitive);
      return (
        <div className="bg-white dark:bg-[#0B1120] p-3 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{formatMonth(label)}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${colors.text}`}>{val}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Avg AQI</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 max-w-[140px]">
            Shaded region = model uncertainty (±8.14 µg/m³ MAE)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Yearly Analytics</h4>
            <div className="group relative">
               <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
               <div className="absolute left-6 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-white/10">
                 Shows predicted seasonal averages. The shaded area represents the model's Mean Absolute Error (8.14).
               </div>
            </div>
         </div>
         <button 
            onClick={() => setShowBaseline(!showBaseline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${showBaseline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-slate-500'}`}
         >
            <History className="w-3 h-3" />
            Comparison Mode
         </button>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="uncertaintyUpper"
              stroke="none"
              fill="#10b981"
              fillOpacity={0.15}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="uncertaintyLower"
              stroke="none"
              fill="#060C14"
              fillOpacity={1}
              activeDot={false}
            />

            {/* Main AQI Area */}
            <Area 
              type="monotone" 
              dataKey="avgAQI" 
              stroke="#10b981" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorAqi)" 
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Historical Baseline Line */}
            {showBaseline && (
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#6366f1" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                animationDuration={1000}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
