import { useState, useEffect, useMemo } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow } from 'lucide-react';
import { Activity } from '../types';
import { useAppStore } from '../store';
import { climateData } from '../data/climate';

interface WeatherData {
  current: {
    temperature: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

// Get weather based on climate data
const getClimateWeather = (region: string): WeatherData => {
  const climate = climateData[region] || climateData['California'];
  const now = new Date();
  const daily = {
    time: Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    }),
    temperature_2m_max: Array(4).fill(climate.tempMax),
    temperature_2m_min: Array(4).fill(climate.tempMin),
    weathercode: Array(4).fill(climate.weathercode),
  };

  return {
    current: {
      temperature: (climate.tempMax + climate.tempMin) / 2,
      weathercode: climate.weathercode,
    },
    daily,
  };
};

export function WeatherWidget({ activities }: { activities?: Activity[] }) {
  const { calendar } = useAppStore();
  
  // Extract unique locations from planned activities, fallback to all activities, then default
  const dynamicCities = useMemo(() => {
    const plannedIds = Object.values(calendar).flat();
    const sourceActivities = activities || [];
    
    let relevantActivities = sourceActivities.filter(a => plannedIds.includes(a.id));
    if (relevantActivities.length === 0) {
      relevantActivities = sourceActivities;
    }

    const uniqueRegions = new Map();
    relevantActivities.forEach(act => {
      if (!uniqueRegions.has(act.region)) {
        uniqueRegions.set(act.region, { name: act.region, lat: act.lat, lng: act.lng });
      }
    });

    const result = Array.from(uniqueRegions.values());
    if (result.length === 0) {
      return [
        { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
        { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
        { name: 'San Francisco', lat: 37.7749, lng: -122.4194 }
      ];
    }
    return result;
  }, [calendar, activities]);

  const [city, setCity] = useState(dynamicCities[0]?.name || 'Las Vegas');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // Update selected city if dynamicCities changes and current city is not in it
  useEffect(() => {
    if (!dynamicCities.find(c => c.name === city)) {
      setCity(dynamicCities[0]?.name || 'Las Vegas');
    }
  }, [dynamicCities, city]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setWeather(getClimateWeather(city));
      setLoading(false);
    };
    fetchWeather();
  }, [city, dynamicCities]);

  const getWeatherIcon = (code: number, className = "w-6 h-6") => {
    // OpenWeatherMap codes: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
    if (code >= 200 && code < 300) return <CloudLightning className={`${className} text-purple-500`} />;
    if (code >= 300 && code < 600) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 600 && code < 700) return <CloudSnow className={`${className} text-blue-200`} />;
    if (code >= 700 && code < 800) return <Cloud className={`${className} text-gray-400`} />;
    if (code === 800) return <Sun className={`${className} text-yellow-500`} />;
    if (code > 800) return <Cloud className={`${className} text-gray-400`} />;
    return <Sun className={`${className} text-yellow-500`} />;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-5 mb-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-display font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-500" />
          </div>
          Weer (Klimaat)
        </h3>
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          className="text-sm border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-medium cursor-pointer transition-all"
        >
          {dynamicCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      
      {loading || !weather ? (
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-2xl bg-stone-200 dark:bg-stone-800 h-12 w-12"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-5 bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800/50">
            <div className="p-2 bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700/50">
              {getWeatherIcon(weather.current.weathercode, "w-8 h-8")}
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {Math.round(weather.current.temperature)}°C
              </div>
              <div className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-0.5">Gemiddeld</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {weather.daily.time.slice(1, 4).map((time, i) => {
              const date = new Date(time);
              const dayName = date.toLocaleDateString('nl-NL', { weekday: 'short' });
              return (
                <div key={time} className="text-center bg-stone-50 dark:bg-stone-800/30 rounded-2xl p-3 border border-stone-100 dark:border-stone-800/50">
                  <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 capitalize tracking-wide">{dayName}</div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(weather.daily.weathercode[i+1], "w-5 h-5")}
                  </div>
                  <div className="text-sm font-display font-bold text-stone-900 dark:text-stone-100">
                    {Math.round(weather.daily.temperature_2m_max[i+1])}°
                  </div>
                  <div className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-0.5">
                    {Math.round(weather.daily.temperature_2m_min[i+1])}°
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
