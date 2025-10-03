import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

interface WeatherStatsProps {
  feelsLike: number;
  humidity: number;
  wind: number;
  precipitation: number;
  units: "metric" | "imperial";
}

export const WeatherStats = ({ feelsLike, humidity, wind, precipitation, units }: WeatherStatsProps) => {
  const windUnit = units === "metric" ? "km/h" : "mph";
  const precipUnit = units === "metric" ? "mm" : "in";

  const stats = [
    {
      label: "Feels Like",
      value: `${Math.round(feelsLike)}°`,
      icon: Thermometer,
    },
    {
      label: "Humidity",
      value: `${humidity}%`,
      icon: Droplets,
    },
    {
      label: "Wind",
      value: `${wind} ${windUnit}`,
      icon: Wind,
    },
    {
      label: "Precipitation",
      value: `${precipitation} ${precipUnit}`,
      icon: CloudRain,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-weather-card rounded-2xl p-6 border border-border/50 hover:bg-secondary/30 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-weather-textMuted">{stat.label}</p>
          </div>
          <p className="text-3xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};
