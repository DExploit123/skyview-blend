import { WeatherIcon } from "./WeatherIcon";

interface DayForecast {
  day: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "drizzle" | "wind" | "partly-cloudy";
  high: number;
  low: number;
}

interface DailyForecastProps {
  forecast: DayForecast[];
}

export const DailyForecast = ({ forecast }: DailyForecastProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Daily forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-weather-card rounded-2xl p-4 border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-sm font-medium">{day.day}</p>
            <WeatherIcon type={day.icon} className="h-10 w-10" />
            <div className="flex gap-2 text-sm">
              <span className="font-semibold">{Math.round(day.high)}°</span>
              <span className="text-weather-textMuted">{Math.round(day.low)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
