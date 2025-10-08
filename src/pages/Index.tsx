import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, UnitPreferences } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CurrentWeather } from "@/components/CurrentWeather";
import { WeatherStats } from "@/components/WeatherStats";
import { DailyForecast } from "@/components/DailyForecast";
import { HourlyForecast } from "@/components/HourlyForecast";
import WeatherAIChat from "@/components/WeatherAIChat";
import { PremiumModal } from "@/components/PremiumModal";
import { WeatherPreferences } from "@/components/WeatherPreferences";
import { PremiumBadge } from "@/components/PremiumBadge";
import { TravelMode } from "@/components/TravelMode";
import { WeatherAlerts } from "@/components/WeatherAlerts";
import { Button } from "@/components/ui/button";
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
import { Crown } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({
    temperature: "fahrenheit",
    windSpeed: "mph",
    precipitation: "in",
  });
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        // Check premium status when session changes
        setTimeout(() => {
          checkPremiumStatus(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      checkPremiumStatus(session.user.id);
      getUserLocation();
    }
  }, [session]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await handleLocationByCoords(latitude, longitude);
          setIsGeolocating(false);
        },
        (error) => {
          console.log("Geolocation error:", error);
          setLocation("London");
          handleSearch("London");
          setIsGeolocating(false);
        }
      );
    } else {
      setLocation("London");
      handleSearch("London");
      setIsGeolocating(false);
    }
  };

  const handleLocationByCoords = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      console.log('Fetching weather for coords:', lat, lon, 'units:', units);
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { lat, lon, units }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      } else if (data) {
        setWeatherData(data);
        setLocation(data.location);
        toast.success(`Showing weather for ${data.location}`);
      }
    } catch (err) {
      console.error('Error fetching weather by coords:', err);
      toast.error("Couldn't get weather for your location, showing London instead");
      setLocation("London");
      handleSearch("London");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async (userId: string) => {
    // Check if user has admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleData) {
      setIsPremium(true);
      return;
    }

    // Check active subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error checking subscription:', error);
      setIsPremium(false);
      return;
    }

    // Check if subscription is still valid
    if (data && new Date(data.end_date) > new Date()) {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  };

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
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { location, units: newUnits }
        });

        if (error) {
          toast.error("Failed to fetch weather data");
        } else if (data) {
          setWeatherData(data);
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
        toast.error("Failed to fetch weather data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUnitPreferencesChange = async (newPreferences: UnitPreferences) => {
    setUnitPreferences(newPreferences);
    
    // Auto-detect if all units match metric or imperial
    if (newPreferences.temperature === "celsius" && 
        newPreferences.windSpeed === "kmh" && 
        newPreferences.precipitation === "mm") {
      await handleUnitsChange("metric");
    } else if (newPreferences.temperature === "fahrenheit" && 
               newPreferences.windSpeed === "mph" && 
               newPreferences.precipitation === "in") {
      await handleUnitsChange("imperial");
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        units={units} 
        onUnitsChange={handleUnitsChange}
        unitPreferences={unitPreferences}
        onUnitPreferencesChange={handleUnitPreferencesChange}
      />
      
      <main className="container max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              How's the sky looking today?
            </h2>
            {isPremium && <PremiumBadge />}
          </div>
          {!isPremium && (
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => setShowPremiumModal(true)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
          {isPremium && (
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              {showPreferences ? 'Hide' : 'Show'} Alert Preferences
            </Button>
          )}
          <SearchBar onSearch={handleSearch} />
        </div>

        {isPremium && showPreferences && session && (
          <div className="mb-6 max-w-2xl mx-auto">
            <WeatherPreferences userId={session.user.id} />
          </div>
        )}

        {isPremium && weatherData && session && (
          <div className="mb-6 space-y-6">
            <WeatherAlerts userId={session.user.id} weatherData={weatherData} />
            <TravelMode units={units} />
          </div>
        )}

        {hasError ? (
          <ErrorState onRetry={handleRetry} />
        ) : hasNoResults ? (
          <NoResultsState />
        ) : (
          <div className="space-y-6">
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

            {/* AI Chat Section */}
            {weatherData && (
              <div className="mt-6">
                <WeatherAIChat weatherData={weatherData} isPremium={isPremium} />
              </div>
            )}
          </div>
        )}
      </main>

      {session && (
        <PremiumModal 
          open={showPremiumModal} 
          onOpenChange={setShowPremiumModal}
          userEmail={session.user.email || ''}
        />
      )}
    </div>
  );
};

export default Index;
