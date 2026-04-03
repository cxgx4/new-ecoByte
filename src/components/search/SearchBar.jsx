import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { fetchGeocode } from "../../utils/api";

export default function SearchBar({ onLocationSelect, compact, icon, placeholder, preferBbox = null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Close dropdown if clicked outside
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsSearching(true);
    
    // 300ms Debounce
    timeoutRef.current = setTimeout(async () => {
      const data = await fetchGeocode(value, preferBbox);
      setResults(data);
      setIsSearching(false);
    }, 300);
  };

  const handleSelect = (item) => {
    setQuery("");
    setIsOpen(false);
    if (onLocationSelect) {
      onLocationSelect([item.lon, item.lat], item.name, item);
    }
  };

  const displayPlaceholder = placeholder || "Search locations in Kolkata...";
  const containerClass = compact 
    ? "relative w-full rounded-xl"
    : "relative w-full shadow-lg rounded-2xl z-50 pointer-events-auto";
    
  const inputClass = compact
    ? "w-full bg-transparent border-none py-2 pl-9 pr-8 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder-gray-500 dark:placeholder-gray-400"
    : "w-full bg-transparent border-none py-4 pl-12 pr-12 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div ref={containerRef} className={containerClass}>
      <div className={`relative flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200 dark:border-white/10 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-neon-green/50 ${compact ? 'rounded-xl' : 'rounded-2xl'}`}>
        {!compact && <Search className="absolute left-4 w-5 h-5 text-gray-400" />}
        {compact && (icon || <Search className="absolute left-3 w-4 h-4 text-gray-400" />)}
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query) setIsOpen(true); }}
          placeholder={displayPlaceholder}
          className={inputClass}
        />
        {isSearching && (
          <Loader2 className={`absolute animate-spin text-neon-green ${compact ? 'right-2 w-4 h-4' : 'right-4 w-5 h-5'}`} />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50">
          <ul className="max-h-64 overflow-y-auto">
            {results.map((item, idx) => {
              // Extract a shorter name for the main text, full name for sub
              const parts = item.name.split(",");
              const mainName = parts[0];
              const subName = parts.slice(1).join(",").trim();

              return (
                <li key={idx}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-start gap-3 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                  >
                    <MapPin className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{mainName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{subName}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {isOpen && !isSearching && query && results.length === 0 && (
         <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-4 text-center z-50">
           <p className="text-sm text-gray-500 dark:text-gray-400">No locations found in Kolkata.</p>
         </div>
      )}
    </div>
  );
}
