import { useState } from "react";
import { Header, UnitPreferences } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CurrentWeather } from "@/components/CurrentWeather";
import { WeatherStats } from "@/components/WeatherStats";
import { DailyForecast } from "@/components/DailyForecast";
import { HourlyForecast } from "@/components/HourlyForecast";
import { 
  CurrentWeatherLoading, 
  WeatherStatsLoading, 
  DailyForecastLoading, 
  HourlyForecastLoading 
} from "@/components/LoadingState";

const Index = () => {
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [location, setLocation] = useState("Berlin, Germany");
  const [isLoading, setIsLoading] = useState(false);
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({
    temperature: "fahrenheit",
    windSpeed: "mph",
    precipitation: "in",
  });

  // Mock data - in a real app, this would come from an API
  const currentTemp = units === "metric" ? 20 : 68;
  const feelsLike = units === "metric" ? 18 : 64;
  const wind = units === "metric" ? 14 : 9;
  const precipitation = units === "metric" ? 0 : 0;

  const dailyForecast = [
    { day: "Tue", icon: "drizzle" as const, high: units === "metric" ? 20 : 68, low: units === "metric" ? 14 : 57 },
    { day: "Wed", icon: "rain" as const, high: units === "metric" ? 21 : 70, low: units === "metric" ? 15 : 59 },
    { day: "Thu", icon: "sun" as const, high: units === "metric" ? 24 : 75, low: units === "metric" ? 14 : 57 },
    { day: "Fri", icon: "partly-cloudy" as const, high: units === "metric" ? 25 : 77, low: units === "metric" ? 13 : 55 },
    { day: "Sat", icon: "rain" as const, high: units === "metric" ? 21 : 70, low: units === "metric" ? 15 : 59 },
    { day: "Sun", icon: "cloud" as const, high: units === "metric" ? 25 : 77, low: units === "metric" ? 16 : 61 },
    { day: "Mon", icon: "wind" as const, high: units === "metric" ? 24 : 75, low: units === "metric" ? 15 : 59 },
  ];

  const hourlyForecast = [
    { time: "3 PM", icon: "cloud" as const, temperature: units === "metric" ? 20 : 68 },
    { time: "4 PM", icon: "partly-cloudy" as const, temperature: units === "metric" ? 20 : 68 },
    { time: "5 PM", icon: "sun" as const, temperature: units === "metric" ? 20 : 68 },
    { time: "6 PM", icon: "cloud" as const, temperature: units === "metric" ? 19 : 66 },
    { time: "7 PM", icon: "cloud" as const, temperature: units === "metric" ? 18 : 66 },
    { time: "8 PM", icon: "wind" as const, temperature: units === "metric" ? 18 : 64 },
    { time: "9 PM", icon: "cloud" as const, temperature: units === "metric" ? 17 : 63 },
    { time: "10 PM", icon: "cloud" as const, temperature: units === "metric" ? 17 : 63 },
  ];

  const handleSearch = (newLocation: string) => {
    setIsLoading(true);
    setLocation(newLocation);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        units={units} 
        onUnitsChange={setUnits}
        unitPreferences={unitPreferences}
        onUnitPreferencesChange={setUnitPreferences}
      />
      
      <main className="container max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            How's the sky looking today?
          </h2>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <CurrentWeatherLoading />
            ) : (
              <CurrentWeather
                location={location}
                date="Tuesday, Aug 5, 2025"
                temperature={currentTemp}
                icon="sun"
                units={units}
              />
            )}
            
            {isLoading ? (
              <WeatherStatsLoading />
            ) : (
              <WeatherStats
                feelsLike={feelsLike}
                humidity={46}
                wind={wind}
                precipitation={precipitation}
                units={units}
              />
            )}
            
            {isLoading ? (
              <DailyForecastLoading />
            ) : (
              <DailyForecast forecast={dailyForecast} />
            )}
          </div>

          <div className="lg:col-span-1">
            {isLoading ? (
              <HourlyForecastLoading />
            ) : (
              <HourlyForecast forecast={hourlyForecast} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
