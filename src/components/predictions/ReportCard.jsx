import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Award, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportCard({ neighbourhood, weekSummary }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!weekSummary) return null;

  const { avgAQI, worstDay, bestDay, safeHours } = weekSummary;

  const getGrade = (aqi) => {
    if (aqi <= 50) return "A+";
    if (aqi <= 100) return "B";
    if (aqi <= 150) return "C";
    return "D";
  };

  const safetyScore = Math.round(Math.max(0, 100 - avgAQI * 0.4));
  const grade = getGrade(avgAQI);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#060C14',
        logging: false,
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `EcoByte_Weekly_Report_${neighbourhood}_${new Date().toLocaleDateString()}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate report card", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Visual Hidden Export Card (1080x1080 style) */}
      <div className="fixed -left-[2000px] -top-[2000px]">
        <div 
          ref={cardRef}
          style={{ width: '1080px', height: '1080px' }}
          className="bg-[#060C14] p-20 flex flex-col justify-between font-sans relative overflow-hidden"
        >
           {/* Background Decorations */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

           <div className="z-10 flex flex-col gap-10">
              <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      <Zap className="w-12 h-12 text-white" fill="white" />
                  </div>
                  <div>
                      <h1 className="text-6xl font-black text-white tracking-tight">EcoByte</h1>
                      <p className="text-2xl font-bold text-emerald-400">Survival Report • Week 15</p>
                  </div>
              </div>

              <div className="mt-10">
                  <h2 className="text-4xl font-bold text-slate-400 uppercase tracking-widest mb-4">Location</h2>
                  <p className="text-8xl font-black text-white leading-tight">{neighbourhood}</p>
              </div>

              <div className="grid grid-cols-2 gap-20 mt-10">
                  <div className="flex flex-col gap-4">
                      <span className="text-3xl font-bold text-slate-500 uppercase tracking-widest">Avg AQI</span>
                      <span className="text-9xl font-black text-emerald-500">{avgAQI}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                      <span className="text-3xl font-bold text-slate-500 uppercase tracking-widest">Safety Score</span>
                      <span className="text-9xl font-black text-blue-400">{safetyScore}%</span>
                  </div>
              </div>
           </div>

           <div className="mt-10 p-10 bg-white/5 border border-white/10 rounded-[40px]">
                <p className="text-4xl text-slate-300 leading-relaxed font-medium">
                  Your safest window is <span className="text-emerald-400 font-bold">{bestDay} morning</span>. You had <span className="text-blue-400 font-bold">{safeHours} safe outdoor hours</span> this week.
                </p>
           </div>

           <div className="z-10 border-t-2 border-white/5 pt-10 flex justify-between items-end">
               <div className="flex flex-col gap-2">
                   <p className="text-3xl font-medium text-slate-400 italic">"Clean air is a human right, not a luxury."</p>
                   <p className="text-xl font-bold text-slate-500">Generated via AirIQ Predictive AI</p>
               </div>
               <div className="text-right">
                   <p className="text-2xl font-black text-white">ecobyte.ai</p>
                   <p className="text-lg text-slate-600 font-bold">Smart Air Intelligence</p>
               </div>
           </div>
        </div>
      </div>

      {/* Main UI Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#060C14] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                          <Award className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="text-base font-black text-white tracking-wide">Weekly Report Card</h3>
                  </div>
                  <button 
                    onClick={downloadCard}
                    disabled={downloading}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-slate-400 disabled:opacity-50"
                  >
                      {downloading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Exposure</span>
                      <span className="text-2xl font-black text-white">{avgAQI} <span className="text-xs font-normal text-slate-500">AQI</span></span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Safety Rating</span>
                      <span className="text-2xl font-black text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {grade}</span>
                  </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    Your safest window is <span className="text-emerald-400 font-bold">{bestDay} morning</span>. You had <span className="text-blue-400 font-bold">{safeHours} safe outdoor hours</span> this week.
                  </p>
              </div>

              <button 
                onClick={downloadCard}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                  <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Generate Share Item
              </button>
          </div>
      </div>
    </div>
  );
}
