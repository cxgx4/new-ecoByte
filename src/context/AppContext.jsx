import React, { createContext, useContext, useState, useEffect } from "react";
import { generateCityAQIGrid } from "../utils/aqiGrid";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");
    const [user, setUser] = useState("Supriyo Bhattacharyya");

    const defaultBbox = [88.20, 22.40, 88.55, 22.75];
    const defaultCenter = [88.3639, 22.5726];
    
    const [cityState, setCityState] = useState({
        name: "Kolkata",
        center: defaultCenter,
        bbox: defaultBbox,
        grid: generateCityAQIGrid(defaultBbox, defaultCenter),
        lastUpdated: new Date().toISOString()
    });

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

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    return (
        <AppContext.Provider value={{ theme, toggleTheme, cityState, updateCity, user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
