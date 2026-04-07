import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, X, Clock, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function AlertsPanel({ onClose }) {
    const { activeAlerts, historicalAlerts, dismissAlert } = useAppContext();
    const [activeTab, setActiveTab] = useState("active");

    const renderAlertIcon = (type) => {
        switch (type) {
            case "Critical":
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case "Warning":
                return <AlertTriangle className="w-6 h-6 text-amber-500" />;
            case "Advisory":
                return <Info className="w-6 h-6 text-blue-500" />;
            default:
                return <Info className="w-6 h-6 text-gray-500" />;
        }
    };

    const getAlertColorClasses = (type) => {
        switch (type) {
            case "Critical":
                return "border-red-500/50 bg-red-50/50 dark:bg-red-500/10";
            case "Warning":
                return "border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/10";
            case "Advisory":
                return "border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/10";
            default:
                return "border-gray-500/50 bg-gray-50/50 dark:bg-gray-800/50";
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Sort active alerts by severity, then by time (newest first). Since mock data is already somewhat sorted, we just sort by time for simplicity or by a rank.
    const severityRank = { Critical: 3, Warning: 2, Advisory: 1 };
    const sortedActive = [...activeAlerts].sort((a, b) => {
        if (severityRank[b.type] !== severityRank[a.type]) {
            return severityRank[b.type] - severityRank[a.type];
        }
        return new Date(b.time) - new Date(a.time);
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-16 right-4 sm:right-6 w-80 sm:w-96 max-h-[80vh] overflow-hidden bg-white dark:bg-[#0B1120] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col z-50"
        >
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                    Notifications
                    {activeAlerts.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {activeAlerts.length}
                        </span>
                    )}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex px-4 pt-3 gap-4 border-b border-gray-100 dark:border-white/10">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-3 font-medium text-sm transition-colors border-b-2 relative ${
                        activeTab === "active"
                            ? "text-neon-green border-neon-green"
                            : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    Active Alerts
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 font-medium text-sm transition-colors border-b-2 relative ${
                        activeTab === "history"
                            ? "text-neon-green border-neon-green"
                            : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    History
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {activeTab === "active" && (
                    <AnimatePresence mode="popLayout">
                        {sortedActive.length > 0 ? (
                            sortedActive.map((alert) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={alert.id}
                                    className={`relative p-4 rounded-xl border ${getAlertColorClasses(alert.type)}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 relative">
                                            {renderAlertIcon(alert.type)}
                                            {alert.type === "Critical" && (
                                                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {alert.title}
                                                </h4>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(alert.time)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                                                {alert.description}
                                            </p>
                                            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2 mt-2">
                                                <p className="text-xs font-medium text-slate-800 dark:text-gray-200">
                                                    <span className="text-neon-green mr-1">Recommended:</span>
                                                    {alert.action}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismissAlert(alert.id)}
                                        className="absolute top-2 -right-2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors tooltip-trigger group"
                                        aria-label="Dismiss alert"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span className="absolute hidden group-hover:block -top-8 right-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                            Mark Resolved
                                        </span>
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 mx-auto flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                No active alerts at the moment.
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {activeTab === "history" && (
                    <AnimatePresence>
                        {historicalAlerts.length > 0 ? (
                            historicalAlerts.map((alert) => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={alert.id}
                                    className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                                            {alert.type}
                                        </span>
                                        <span className="text-slate-800 dark:text-gray-300 text-sm font-medium line-clamp-1">
                                            {alert.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                                        <span>Detected: {formatTime(alert.time)}</span>
                                        <span>Resolved: {formatTime(alert.resolvedTime)}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
                            >
                                No historical alerts.
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            {activeTab === "active" && sortedActive.length > 0 && (
                <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => sortedActive.forEach(a => dismissAlert(a.id))}
                        className="w-full py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Dismiss All
                    </button>
                </div>
            )}
        </motion.div>
    );
}
