import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TravelModeProps {
  units: "metric" | "imperial";
}

export const TravelMode = ({ units }: TravelModeProps) => {
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routeWeather, setRouteWeather] = useState<any>(null);

  const checkRouteWeather = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location: destination, units }
      });

      if (error) throw error;

      setRouteWeather(data);
      toast.success("Route weather loaded!");
    } catch (err) {
      console.error('Error fetching route weather:', err);
      toast.error("Failed to fetch route weather");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Travel Mode</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter destination city..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkRouteWeather()}
          />
          <Button onClick={checkRouteWeather} disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Route"}
          </Button>
        </div>

        {routeWeather && (
          <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-semibold">{routeWeather.location}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Temperature: </span>
                <span className="font-medium">{Math.round(routeWeather.temperature)}°</span>
              </div>
              <div>
                <span className="text-muted-foreground">Humidity: </span>
                <span className="font-medium">{routeWeather.humidity}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Wind: </span>
                <span className="font-medium">{Math.round(routeWeather.wind)} {units === "metric" ? "km/h" : "mph"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Feels Like: </span>
                <span className="font-medium">{Math.round(routeWeather.feelsLike)}°</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Travel Recommendation:</p>
                {routeWeather.precipitation > 0 ? (
                  <p>Rain expected at destination. Consider bringing an umbrella.</p>
                ) : routeWeather.temperature > 30 ? (
                  <p>Hot weather at destination. Stay hydrated and use sun protection.</p>
                ) : routeWeather.temperature < 10 ? (
                  <p>Cold weather at destination. Dress warmly.</p>
                ) : (
                  <p>Weather conditions are favorable for travel.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};