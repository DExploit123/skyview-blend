import React from "react";
import { WeatherIcon } from "./WeatherIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface HourForecast {
  time: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "drizzle" | "wind" | "partly-cloudy";
  temperature: number;
}

interface HourlyForecastProps {
  forecast: HourForecast[];
}

export const HourlyForecast = ({ forecast }: HourlyForecastProps) => {
  const [selectedDay, setSelectedDay] = React.useState("today");
  
  // Group forecast by day
  const groupedForecast = React.useMemo(() => {
    const groups: { [key: string]: HourForecast[] } = {
      today: [],
      tomorrow: [],
    };
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    forecast.forEach((hour) => {
      // For simplicity, split forecast in half
      const index = forecast.indexOf(hour);
      if (index < Math.floor(forecast.length / 2)) {
        groups.today.push(hour);
      } else {
        groups.tomorrow.push(hour);
      }
    });
    
    return groups;
  }, [forecast]);

  const currentForecast = groupedForecast[selectedDay] || forecast;

  return (
    <div className="bg-card rounded-3xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Hourly forecast</h3>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[140px] bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {currentForecast.map((hour, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <WeatherIcon type={hour.icon} className="h-6 w-6" />
              <span className="font-medium">{hour.time}</span>
            </div>
            <span className="font-semibold">{Math.round(hour.temperature)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};
