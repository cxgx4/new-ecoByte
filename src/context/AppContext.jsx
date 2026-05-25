import React, { createContext, useContext, useState, useEffect } from "react";
import { generateCityAQIGrid } from "../utils/aqiGrid";
import { fetchWeatherData } from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");
    const [user, setUser] = useState("Supriyo Bhattacharyya");
    const [authRole, setAuthRole] = useState("user"); // default to user

    const [thresholds, setThresholds] = useState({
        pm25: 150,
        co2: 1000,
        noise: 85
    });

    const defaultBbox = [88.20, 22.40, 88.55, 22.75];
    const defaultCenter = [88.3639, 22.5726];
    
    const [cityState, setCityState] = useState({
        name: "Kolkata",
        center: defaultCenter,
        bbox: defaultBbox,
        grid: generateCityAQIGrid(defaultBbox, defaultCenter),
        lastUpdated: new Date().toISOString()
    });

    const [weatherState, setWeatherState] = useState(null);

    const updateCity = (name, center, bbox) => {
        const usedBbox = bbox || [center[0]-0.2, center[1]-0.2, center[0]+0.2, center[1]+0.2];
        setCityState({
            name,
            center,
            bbox: usedBbox,
            grid: generateCityAQIGrid(usedBbox, center),
            lastUpdated: new Date().toISOString()
        });
    };

    // Prefetch weather globally so navigating to the dashboard is instant
    useEffect(() => {
        let active = true;
        if (cityState.center) {
            fetchWeatherData(cityState.center[1], cityState.center[0]).then(res => {
                if (active && res) setWeatherState(res);
            });
        }
        return () => { active = false; };
    }, [cityState.center]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    const initialAlerts = [
        {
            id: Date.now(),
            type: "Advisory",
            title: "Sensor Network Active",
            description: "All environmental sensors are calibrated and reporting data normally.",
            time: new Date().toISOString(),
            action: "Monitor dashboard for real-time updates."
        }
    ];

    const [activeAlerts, setActiveAlerts] = useState(initialAlerts);
    const [historicalAlerts, setHistoricalAlerts] = useState([]);

    // Simulate real-time alerts popping up
    useEffect(() => {
        const mockEvents = [
            {
                type: "Critical",
                title: "Sudden AQI Spike Detected",
                description: "AQI rapidly jumped over 30 points in the last polling cycle. Possible localized pollution event.",
                action: "Keep windows closed and avoid outdoor activities."
            },
            {
                type: "Warning",
                title: "Moderate Temperature Anomaly",
                description: "Local temperatures are trending 4°C above the seasonal average.",
                action: "Stay hydrated if planning outdoor routes."
            },
            {
                type: "Advisory",
                title: "Predicted Pollen Spike",
                description: "Pollen counts are expected to rise significantly in your area by tomorrow morning.",
                action: "Take preventative medication if you suffer from allergies."
            },
            {
                type: "Critical",
                title: "Hazardous Air Quality",
                description: `PM2.5 has exceeded your critical threshold of ${thresholds.pm25} µg/m³.`,
                action: "Consider wearing an N95 mask outdoors."
            },
            {
                type: "Warning",
                title: "Elevated CO2 Levels",
                description: `CO2 concentration has reached ${thresholds.co2} ppm. Moderate indoor air quality risk.`,
                action: "Ensure good airflow and open windows."
            },
            {
                type: "Advisory",
                title: "Noise Pollution Notice",
                description: `Routing is actively avoiding areas exceeding ${thresholds.noise} dB.`,
                action: "No action required. AuraPath is adjusted."
            },
            {
                type: "Warning",
                title: "Weather Condition Alert",
                description: "Low wind speeds and high temperature inversions are trapping smog near the surface.",
                action: "Limit strenuous exercise outdoors."
            }
        ];

        // Every 15 seconds, maybe generate an alert
        const intervalId = setInterval(() => {
            if (Math.random() > 0.5) {
                const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
                const newAlert = {
                    id: Date.now(),
                    ...randomEvent,
                    time: new Date().toISOString()
                };
                
                setActiveAlerts(prev => {
                    if (prev.some(a => a.title === newAlert.title)) {
                        return prev;
                    }
                    return [newAlert, ...prev];
                });
            }
        }, 15000);

        return () => clearInterval(intervalId);
    }, [thresholds]);

    const dismissAlert = (alertId) => {
        const alert = activeAlerts.find(a => a.id === alertId);
        if (alert) {
            setActiveAlerts(activeAlerts.filter(a => a.id !== alertId));
            setHistoricalAlerts([
                { ...alert, resolvedTime: new Date().toISOString() },
                ...historicalAlerts
            ]);
        }
    };

    return (
        <AppContext.Provider value={{ 
            theme, toggleTheme, 
            cityState, updateCity, 
            user, setUser,
            authRole, setAuthRole,
            weatherState,
            activeAlerts, historicalAlerts, dismissAlert,
            thresholds, setThresholds
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
