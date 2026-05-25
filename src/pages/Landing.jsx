import React, { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Landing() {
  const navigate = useNavigate();
  const { updateCity } = useAppContext();
  const [isDetecting, setIsDetecting] = useState(false);

  const handleGetStartedClick = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
            const data = await res.json();
            let cName = "Current Location";
            let cBbox = null;
            if (data.features && data.features.length > 0) {
              const p = data.features[0].properties;
              cName = p.city || p.county || p.state || "Your Location";
              if (p.extent) {
                 cBbox = [p.extent[0], p.extent[1], p.extent[2], p.extent[3]];
              }
            }
            updateCity(cName, [longitude, latitude], cBbox);
            navigate("/signup");
          } catch (e) {
            navigate("/signup"); 
          }
        },
        (error) => {
           console.error(error);
           navigate("/signup"); 
        }
      );
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-neon-green/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: [null, -100],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <div className="relative z-10 text-center px-4">
        <motion.div 
           initial={{ y: -60, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 15 }}
           className="flex items-center justify-center gap-2 mb-12"
        >
           <div className="w-10 h-10 bg-neon-green rounded-xl flex items-center justify-center">
             <Leaf className="w-6 h-6 text-[#0B1120]" />
           </div>
           <span className="text-2xl font-bold text-white tracking-wide">EcoByte</span>
        </motion.div>

        <motion.h1 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-[3rem] md:text-7xl font-black text-white mb-6 leading-tight"
        >
          Making Invisible <br/>
          <span className="text-neon-green drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]">Pollution</span> Visible
        </motion.h1>

        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          The Clean-Air Command Center. Real-time air quality monitoring and health-first navigation for smarter cities.
        </motion.p>

        <motion.button
           onClick={handleGetStartedClick}
           disabled={isDetecting}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           animate={!isDetecting ? { boxShadow: ['0 0 20px rgba(57,255,20,0.3)', '0 0 40px rgba(57,255,20,0.6)', '0 0 20px rgba(57,255,20,0.3)'] } : {}}
           transition={{ duration: 2, repeat: Infinity, type: "tween" }}
           className={`font-bold px-10 py-4 rounded-full flex items-center justify-center gap-3 mx-auto transition-colors ${isDetecting ? 'bg-neon-green/80 text-[#0B1120] cursor-wait' : 'bg-neon-green text-[#0B1120] hover:bg-[#32e011]'}`}
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Detecting Location...
            </>
          ) : (
            <>
              Get Started <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
        
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-16 flex items-center justify-center gap-6 text-sm text-gray-500 font-medium"
        >
            <span>Real-time AQI</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span>IoT Sensors</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span>Clean Routes</span>
        </motion.div>
      </div>
    </div>
  );
}