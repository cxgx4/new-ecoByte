import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ArrowRight, Loader2, User, Server, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Landing() {
  const navigate = useNavigate();
  const { updateCity, setAuthRole, setUser } = useAppContext();
  const [isDetecting, setIsDetecting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [localAuthRole, setLocalAuthRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGetStartedClick = () => {
    setShowLogin(true);
  };

  const executeLoginAndEnter = (e) => {
    e.preventDefault();
    setAuthRole(localAuthRole);
    // Remember the user or fallback to the dummy user
    setUser(username.trim() ? username : "Supriyo Bhattacharyya");
    setShowLogin(false);
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocode to find city
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
            navigate("/dashboard");
          } catch (e) {
            navigate("/dashboard"); // Fallback if reverse geocode fails
          }
        },
        (error) => {
           console.error(error);
           navigate("/dashboard"); // Fallback back to Default Kolkata if denied
        }
      );
    } else {
      navigate("/dashboard");
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

      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowLogin(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                 <div className="w-14 h-14 bg-neon-green/10 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-neon-green" />
                 </div>
                 <h2 className="text-2xl font-black text-white tracking-wide">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                 <p className="text-sm text-gray-400 text-center">Enter your details to access the EcoByte platform.</p>
              </div>

              <div className="flex bg-gray-800/50 p-1 rounded-xl mb-6">
                 <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-[#0B1120] text-neon-green shadow border border-white/5' : 'text-gray-400 hover:text-white'}`}>Login</button>
                 <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-[#0B1120] text-neon-green shadow border border-white/5' : 'text-gray-400 hover:text-white'}`}>Sign Up</button>
              </div>

              <form onSubmit={executeLoginAndEnter} className="flex flex-col gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Access Role</label>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setLocalAuthRole('user')} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${localAuthRole === 'user' ? 'border-neon-green bg-neon-green/10' : 'border-gray-700 hover:border-gray-500'}`}>
                          <Leaf className={`w-5 h-5 ${localAuthRole === 'user' ? 'text-neon-green' : 'text-gray-400'}`} />
                          <span className={`text-xs font-bold ${localAuthRole === 'user' ? 'text-neon-green' : 'text-gray-400'}`}>Resident</span>
                       </button>
                       <button type="button" onClick={() => setLocalAuthRole('admin')} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${localAuthRole === 'admin' ? 'border-blue-400 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'}`}>
                          <Server className={`w-5 h-5 ${localAuthRole === 'admin' ? 'text-blue-400' : 'text-gray-400'}`} />
                          <span className={`text-xs font-bold ${localAuthRole === 'admin' ? 'text-blue-400' : 'text-gray-400'}`}>Admin</span>
                       </button>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">User ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Username / Identifier"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                    />
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                    />
                 </div>

                 <button type="submit" className="w-full bg-neon-green hover:bg-[#32e011] text-[#0B1120] font-bold py-3.5 rounded-xl uppercase tracking-wider mt-2 transition-colors inline-block text-center cursor-pointer">
                    {authMode === 'login' ? 'Login Securely' : 'Create Account'}
                 </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}