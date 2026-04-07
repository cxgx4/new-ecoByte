import React, { useState } from "react";
import { Sun, Moon, Bell, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import SearchBar from "./search/SearchBar";
import AlertsPanel from "./AlertsPanel";

export default function TopNavigation() {
    const { theme, toggleTheme, user, updateCity, activeAlerts } = useAppContext();
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsProfileOpen(false);
        if (window.confirm("Are you sure you want to log out of EcoByte?")) {
            navigate("/");
        }
    };

    const handleGlobalCitySearch = (coords, name, item) => {
        // Extract just the primary short name, e.g. "Kolkata" instead of the massive string
        const shortName = name.split(',')[0].trim();
        const bbox = item.bbox; 
        updateCity(shortName, coords, bbox);
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white/70 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-10 transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                     <SearchBar 
                        placeholder="Search any global city for live metrics..." 
                        compact={true} 
                        localOnly={false} 
                        onLocationSelect={(coords, name, item) => handleGlobalCitySearch(coords, name, item)}
                     />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                >
                    <motion.div animate={{ rotate: theme === "dark" ? 0 : 180 }} transition={{ duration: 0.4, type: "spring" }}>
                       {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                    </motion.div>
                </motion.button>

                <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <Bell className="w-5 h-5 dark:text-gray-300" />
                        {activeAlerts?.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                        )}
                    </motion.button>
                    <AnimatePresence>
                        {isAlertsOpen && <AlertsPanel onClose={() => setIsAlertsOpen(false)} />}
                    </AnimatePresence>
                </div>

                <div className="relative flex items-center pl-2 sm:pl-4 sm:border-l border-gray-200 dark:border-white/10">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 p-1 -ml-1 sm:ml-0 sm:pr-3 rounded-full transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green border border-neon-green/50 pointer-events-none">
                            <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium hidden sm:block dark:text-gray-200 pointer-events-none">{user}</span>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                           <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-12 right-0 w-48 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl overflow-hidden py-1 z-50"
                           >
                              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                 <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Signed in as</p>
                                 <p className="text-sm font-bold truncate dark:text-gray-200">{user}</p>
                              </div>
                              <button 
                                 onClick={handleLogout}
                                 className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                 <LogOut className="w-4 h-4" />
                                 Log Out
                              </button>
                           </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
