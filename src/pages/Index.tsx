import { useState, useEffect } from "react";
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
import { ErrorState } from "@/components/ErrorState";
import { NoResultsState } from "@/components/NoResultsState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [location, setLocation] = useState("London");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({
    temperature: "fahrenheit",
    windSpeed: "mph",
    precipitation: "in",
  });

  useEffect(() => {
    handleSearch(location);
  }, []);

  const handleSearch = async (newLocation: string) => {
    setIsLoading(true);
    setHasError(false);
    setHasNoResults(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location: newLocation, units }
      });

      if (error) {
        if (error.message?.includes('Location not found')) {
          setHasNoResults(true);
        } else {
          setHasError(true);
          toast.error("Failed to fetch weather data");
        }
      } else if (data) {
        setWeatherData(data);
        setLocation(data.location);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setHasError(true);
      toast.error("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    handleSearch(location);
  };

  const handleUnitsChange = async (newUnits: "metric" | "imperial") => {
    setUnits(newUnits);
    if (weatherData) {
      await handleSearch(location);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        units={units} 
        onUnitsChange={handleUnitsChange}
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

        {hasError ? (
          <ErrorState onRetry={handleRetry} />
        ) : hasNoResults ? (
          <NoResultsState />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <CurrentWeatherLoading />
              ) : weatherData ? (
                <CurrentWeather
                  location={weatherData.location}
                  date={weatherData.date}
                  temperature={weatherData.temperature}
                  icon={weatherData.icon}
                  units={units}
                />
              ) : null}
              
              {isLoading ? (
                <WeatherStatsLoading />
              ) : weatherData ? (
                <WeatherStats
                  feelsLike={weatherData.feelsLike}
                  humidity={weatherData.humidity}
                  wind={weatherData.wind}
                  precipitation={weatherData.precipitation}
                  units={units}
                />
              ) : null}
              
              {isLoading ? (
                <DailyForecastLoading />
              ) : weatherData ? (
                <DailyForecast forecast={weatherData.dailyForecast} />
              ) : null}
            </div>

            <div className="lg:col-span-1">
              {isLoading ? (
                <HourlyForecastLoading />
              ) : weatherData ? (
                <HourlyForecast forecast={weatherData.hourlyForecast} />
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
