import modelData from '../data/aqi_forecast_model.json';

const lookup = modelData.lookup;
const neighbourhoods = modelData.neighbourhoods;
const stations = modelData.metadata.stations;
const MAE = modelData.metadata.mae || 8.14;

// Activity effort multipliers (relative exposure based on breathing rates)
const ACTIVITY_MODIFIERS = {
  walking: 1.0,
  cycling: 1.4,
  kids_play: 1.6,
  running: 1.8
};

// Historical Baseline Monthly Averages (Extracted from training patterns)
const HISTORICAL_MONTHLY_MEANS = {
  1: 145, 2: 130, 3: 95, 4: 75, 5: 65, 6: 55, 
  7: 45, 8: 48, 9: 60, 10: 85, 11: 125, 12: 155
};

// Helpers to format hours / days / months
export const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

export const formatDay = (d) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d % 7];
};

export const formatMonth = (m) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[m - 1] || 'Unknown';
};

// Relocation Rankings (Housing Guide)
export const getRelocationRankings = (month) => {
  const rankings = [];

  for (const station of stations) {
      let totalAQI = 0;
      let count = 0;

      for (let d = 0; d < 7; d++) {
          for (let h = 0; h < 24; h++) {
              const key = `${month}_${d}_${h}`;
              if (lookup[key]) {
                  totalAQI += lookup[key].aqi;
                  count++;
              }
          }
      }

      const avgBaseAQI = count > 0 ? totalAQI / count : 0;
      const neighbourhoodModifier = neighbourhoods[station]?.modifier || 1;
      const finalAQI = avgBaseAQI * neighbourhoodModifier;

      // Determine Exposure Risk
      let risk = "Low Risk";
      if (finalAQI > 50) risk = "Moderate Risk";
      if (finalAQI > 100) risk = "Unhealthy for Sensitive";
      if (finalAQI > 150) risk = "High Risk";

      rankings.push({
          name: station,
          label: neighbourhoods[station]?.label || station,
          averageAQI: Math.round(finalAQI),
          risk
      });
  }

  return rankings.sort((a, b) => a.averageAQI - b.averageAQI);
};

// 24 Hour Scheduler (Smart Scheduler Upgrade)
export const getSmartScheduler = (month, dayOfWeek, neighbourhood, activityType = 'walking', activityDurationHrs = 2) => {
  const modifier = neighbourhoods[neighbourhood]?.modifier || 1;
  const effortMultiplier = ACTIVITY_MODIFIERS[activityType] || 1.0;
  const hourlyData = [];

  for (let h = 0; h < 24; h++) {
      const key = `${month}_${dayOfWeek}_${h}`;
      if (lookup[key]) {
          const basePm25 = lookup[key].pm25 * modifier;
          const healthAQI = Math.round(lookup[key].aqi * modifier);
          
          hourlyData.push({
              hour: h,
              aqi: healthAQI,
              pm25: basePm25.toFixed(1),
              effectivePm25: (basePm25 * effortMultiplier).toFixed(1),
              safetyScore: Math.max(0, 100 - (healthAQI * 0.4 * effortMultiplier))
          });
      } else {
           hourlyData.push({ hour: h, aqi: 0, pm25: '0', effectivePm25: '0', safetyScore: 0 });
      }
  }

  // Find top 3 best windows
  const windows = [];
  for (let i = 0; i <= 24 - activityDurationHrs; i++) {
      let sumAQI = 0;
      let valid = true;
      for (let j = 0; j < activityDurationHrs; j++) {
            if (hourlyData[i+j].aqi === 0) valid = false;
            sumAQI += hourlyData[i+j].aqi;
      }
      if (valid) {
          windows.push({
              start: i,
              end: i + activityDurationHrs,
              avgAQI: Math.round(sumAQI / activityDurationHrs)
          });
      }
  }

  const sortedWindows = windows.sort((a, b) => a.avgAQI - b.avgAQI).slice(0, 3);

  return {
      hourly: hourlyData,
      bestWindows: sortedWindows,
      bestWindowStart: sortedWindows[0]?.start || 0,
      bestWindowEnd: sortedWindows[0]?.end || 0,
      lowestAvgAQI: sortedWindows[0]?.avgAQI || 0,
      mae: MAE
  };
};

// 7-Day Outlook
export const get7DayOutlook = (month, neighbourhood) => {
   const modifier = neighbourhoods[neighbourhood]?.modifier || 1;
   const days = [];

   for (let d = 0; d < 7; d++) {
       let minAQI = Infinity;
       let maxAQI = -1;
       let minHour = -1;
       let maxHour = -1;

       for(let h = 0; h < 24; h++) {
           const key = `${month}_${d}_${h}`;
           if(lookup[key]) {
                const val = lookup[key].aqi * modifier;
                if (val < minAQI) {
                    minAQI = val;
                    minHour = h;
                }
                if (val > maxAQI) {
                    maxAQI = val;
                    maxHour = h;
                }
           }
       }
       days.push({
           dayIndex: d,
           minAQI: Math.round(minAQI === Infinity ? 0 : minAQI),
           maxAQI: Math.round(maxAQI === -1 ? 0 : maxAQI),
           minHour,
           maxHour
       });
   }
   return days;
};

// 12-Month Seasonal Trend
export const getYearlyTrend = (neighbourhood) => {
  const modifier = neighbourhoods[neighbourhood]?.modifier || 1;
  const months = [];

  for (let m = 1; m <= 12; m++) {
      let totalAQI = 0;
      let count = 0;
      for (let d = 0; d < 7; d++) {
          for (let h = 0; h < 24; h++) {
              const key = `${m}_${d}_${h}`;
              if (lookup[key]) {
                  totalAQI += lookup[key].aqi;
                  count++;
              }
          }
      }
      const avg = count > 0 ? (totalAQI / count) * modifier : 0;
      months.push({
          month: m,
          avgAQI: Math.round(avg),
          baseline: HISTORICAL_MONTHLY_MEANS[m] || avg,
          uncertaintyUpper: Math.round(avg + MAE),
          uncertaintyLower: Math.round(Math.max(0, avg - MAE))
      });
  }
  return months;
};

// Health Impact Logic
export const getHealthImpact = (aqi) => {
    if (aqi <= 50) return { category: "Good", tip: "Ideal conditions for all outdoor activities." };
    if (aqi <= 100) return { category: "Moderate", tip: "Sensitive groups should reduce heavy exertion." };
    if (aqi <= 150) return { category: "Unhealthy for Sensitive", tip: "Limit prolonged outdoor exertion for children/elderly." };
    if (aqi <= 200) return { category: "Unhealthy", tip: "Everyone should limit outdoor time and avoid heavy work." };
    if (aqi <= 300) return { category: "Very Unhealthy", tip: "Significant health risk. Avoid all outdoor activity." };
    return { category: "Hazardous", tip: "Stay indoors. Wear N95 masks if travel is necessary." };
};

// Pollutant Breakdown Simulation (Regression Approximation)
export const getPollutantBreakdown = (aqi) => {
    // PM2.5 is dominant in Kolkata (typically 65-80% contribution)
    // Deterministic: AQI-seeded ratio so values are stable across renders
    const pm25Base = 0.70 + (aqi % 10) * 0.005; // Range: 0.70–0.745
    const no2Base = 0.15;
    const so2Base = 0.05;
    const coBase = 0.1;

    return [
        { name: "PM2.5", color: "#10b981", value: Math.round(aqi * pm25Base) },
        { name: "NO2", color: "#3b82f6", value: Math.round(aqi * no2Base) },
        { name: "SO2", color: "#f59e0b", value: Math.round(aqi * so2Base) },
        { name: "CO", color: "#ef4444", value: Math.round(aqi * coBase) }
    ];
};

// Anomaly Detection
export const getMonthlyAnomaly = (month, predictedAvg) => {
    const historical = HISTORICAL_MONTHLY_MEANS[month];
    if (!historical) return null;
    
    const diff = (predictedAvg - historical) / historical;
    if (diff > 0.20) {
        return {
            severity: "critical",
            message: `Predicted levels are ${Math.round(diff * 100)}% above seasonal average for ${formatMonth(month)}.`
        };
    }
    return null;
};

// Respiratory Risk Index (Pollen Proxy)
export const getParticulateRiskIndex = (month, humidity = 65) => {
    // High humidity + Spring/Summer months = High mold/allergen risk
    const isMonsonOrSpring = (month >= 3 && month <= 9);
    let risk = "Low";
    let score = 20;

    if (isMonsonOrSpring) {
        score += 30;
        if (humidity > 80) score += 40;
        else if (humidity > 60) score += 20;
    } else {
        if (humidity > 70) score += 15;
    }

    if (score > 75) risk = "Critical";
    else if (score > 50) risk = "High";
    else if (score > 30) risk = "Moderate";

    return { risk, score };
};

export const getNeighbourhoods = () => {
  return stations.map(station => ({
      id: station,
      label: neighbourhoods[station]?.label || station
  }));
};

export const getAQIColor = (aqi, isSensitive) => {
    // Dynamic shift if sensitive group
    const shift = isSensitive ? 20 : 0; // If sensitive, it hits yellow/red earlier
    const adjusted = aqi + shift;
  
    if (adjusted <= 50) return { bg: 'bg-[#22c55e]/20', solidBg: 'bg-[#22c55e]/80', border: 'border-[#22c55e]/50', text: 'text-[#22c55e]' }; // Green
    if (adjusted <= 100) return { bg: 'bg-[#eab308]/20', solidBg: 'bg-[#eab308]/80', border: 'border-[#eab308]/50', text: 'text-[#eab308]' }; // Yellow
    if (adjusted <= 150) return { bg: 'bg-[#f97316]/20', solidBg: 'bg-[#f97316]/80', border: 'border-[#f97316]/50', text: 'text-[#f97316]' }; // Orange
    if (adjusted <= 200) return { bg: 'bg-[#ef4444]/20', solidBg: 'bg-[#ef4444]/80', border: 'border-[#ef4444]/50', text: 'text-[#ef4444]' }; // Red
    return { bg: 'bg-[#a855f7]/20', solidBg: 'bg-[#a855f7]/80', border: 'border-[#a855f7]/50', text: 'text-[#a855f7]' }; // Purple
};
