import { WeatherIcon } from "./WeatherIcon";
import { ChevronDown } from "lucide-react";
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
  selectedDay?: string;
}

export const HourlyForecast = ({ forecast, selectedDay = "Tuesday" }: HourlyForecastProps) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="bg-card rounded-3xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Hourly forecast</h3>
        <Select defaultValue={selectedDay}>
          <SelectTrigger className="w-[140px] bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {forecast.map((hour, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors"
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
