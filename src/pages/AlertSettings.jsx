import React, { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, ShieldAlert, SlidersHorizontal, Settings2, Smartphone } from "lucide-react";

export default function AlertSettings() {
    const [thresholds, setThresholds] = useState({
        pm25: 150,
        co2: 1000,
        noise: 85
    });
    const [smsEnabled, setSmsEnabled] = useState(true);

    const handleSliderChange = (e) => {
        setThresholds({
            ...thresholds,
            [e.target.name]: parseInt(e.target.value)
        });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">

            <div className="mb-8">
                <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Settings2 className="w-8 h-8 text-neon-green" />
                    Alert Settings
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Configure health thresholds for automatic EcoByte notifications and routing adjustments.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm flex flex-col gap-8"
            >

                {/* Critical Alerts Toggle */}
                <div className="flex items-start justify-between p-5 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20">
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white text-slate-900">Critical Health Warnings</h3>
                            <p className="text-sm text-gray-500 mt-1">Receive immediate push notifications when life-threatening pollution spikes are detected in your area.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSmsEnabled(!smsEnabled)}
                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${smsEnabled ? 'bg-neon-green' : 'bg-gray-300 dark:bg-slate-700'}`}
                    >
                        <motion.div
                            className="w-6 h-6 bg-white rounded-full shadow-sm"
                            animate={{ x: smsEnabled ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 gap-8 mt-4">

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold dark:text-white flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                    PM2.5 Threshold
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Alert when fine particulate matter exceeds limit (µg/m³)</p>
                            </div>
                            <span className="text-2xl font-bold text-neon-green">{thresholds.pm25}</span>
                        </div>
                        <input
                            type="range"
                            name="pm25"
                            min="50" max="300" step="10"
                            value={thresholds.pm25}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-green hover:accent-green-400 transition-colors"
                        />
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-white/5"></div>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold dark:text-white flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                    CO2 Concentration Limit
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Alert when carbon dioxide levels reach indoor concern levels (ppm)</p>
                            </div>
                            <span className="text-2xl font-bold text-blue-500">{thresholds.co2}</span>
                        </div>
                        <input
                            type="range"
                            name="co2"
                            min="400" max="2000" step="50"
                            value={thresholds.co2}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                        />
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-white/5"></div>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold dark:text-white flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                    Noise Pollution Tolerance
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Avoid routes where average decibels exceed (dB)</p>
                            </div>
                            <span className="text-2xl font-bold text-orange-500">{thresholds.noise}</span>
                        </div>
                        <input
                            type="range"
                            name="noise"
                            min="50" max="120" step="5"
                            value={thresholds.noise}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-colors"
                        />
                    </div>

                </div>

                {/* SMS Integration */}
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-white/5 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <div>
                                <h4 className="font-medium dark:text-gray-200">SMS Notifications</h4>
                                <p className="text-xs text-gray-500">+91 98765 43210</p>
                            </div>
                        </div>
                        <button className="text-neon-green hover:underline text-sm font-medium">Edit</button>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button className="px-8 py-3 bg-neon-green hover:bg-green-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-neon-green/20">
                        Save Configuration
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
