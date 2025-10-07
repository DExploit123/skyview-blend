import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Droplets, Snowflake, Thermometer, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherAlertsProps {
  userId: string;
  weatherData: any;
}

interface Alert {
  type: string;
  message: string;
  severity: "warning" | "info";
}

export const WeatherAlerts = ({ userId, weatherData }: WeatherAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  useEffect(() => {
    if (preferences && weatherData) {
      checkForAlerts();
    }
  }, [preferences, weatherData]);

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from('weather_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setPreferences(data);
    }
  };

  const checkForAlerts = () => {
    const newAlerts: Alert[] = [];

    // Check for rain
    if (preferences.alert_rain && weatherData.precipitation > 0) {
      newAlerts.push({
        type: "rain",
        message: `Rain expected today (${weatherData.precipitation.toFixed(1)}mm). Don't forget your umbrella!`,
        severity: "warning"
      });
    }

    // Check for snow
    if (preferences.alert_snow && weatherData.icon === "snow") {
      newAlerts.push({
        type: "snow",
        message: "Snow conditions detected. Drive carefully and dress warmly.",
        severity: "warning"
      });
    }

    // Check for extreme temperature
    if (preferences.alert_extreme_temp) {
      if (weatherData.temperature > 35) {
        newAlerts.push({
          type: "heat",
          message: `High temperature alert: ${Math.round(weatherData.temperature)}°. Stay hydrated and avoid prolonged sun exposure.`,
          severity: "warning"
        });
      } else if (weatherData.temperature < 0) {
        newAlerts.push({
          type: "cold",
          message: `Freezing temperature alert: ${Math.round(weatherData.temperature)}°. Dress in warm layers.`,
          severity: "warning"
        });
      }
    }

    // Check for wind
    if (preferences.alert_wind && weatherData.wind > 30) {
      newAlerts.push({
        type: "wind",
        message: `Strong winds detected: ${Math.round(weatherData.wind)} mph. Secure loose objects outdoors.`,
        severity: "info"
      });
    }

    setAlerts(newAlerts);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "rain":
        return <Droplets className="h-4 w-4" />;
      case "snow":
        return <Snowflake className="h-4 w-4" />;
      case "heat":
      case "cold":
        return <Thermometer className="h-4 w-4" />;
      case "wind":
        return <Wind className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Weather Alerts</h3>
        <Badge variant="secondary">{alerts.length}</Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              alert.severity === "warning"
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-blue-500/10 border-blue-500/20"
            }`}
          >
            <div className={alert.severity === "warning" ? "text-orange-500" : "text-blue-500"}>
              {getIcon(alert.type)}
            </div>
            <p className="text-sm flex-1">{alert.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};