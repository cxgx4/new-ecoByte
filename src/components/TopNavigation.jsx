import React from "react";
import { Sun, Moon, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import SearchBar from "./search/SearchBar";

export default function TopNavigation() {
    const { theme, toggleTheme, user, updateCity } = useAppContext();

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

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5 dark:text-gray-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                </motion.button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-gray-200 dark:border-white/10">
                    <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green border border-neon-green/50">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block dark:text-gray-200">{user}</span>
                </div>
            </div>
        </header>
    );
}
