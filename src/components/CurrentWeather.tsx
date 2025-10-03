import { WeatherIcon } from "./WeatherIcon";

interface CurrentWeatherProps {
  location: string;
  date: string;
  temperature: number;
  icon: "sun" | "cloud" | "rain" | "snow" | "drizzle" | "wind" | "partly-cloudy";
  units: "metric" | "imperial";
}

export const CurrentWeather = ({ location, date, temperature, icon, units }: CurrentWeatherProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: "var(--weather-hero)" }}>
      {/* Decorative elements */}
      <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-weather-accent opacity-70"></div>
      <div className="absolute top-1/3 left-12 w-2 h-2 rounded-full bg-weather-accent opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-white opacity-30"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">{location}</h2>
        <p className="text-weather-textMuted mb-8">{date}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <WeatherIcon type={icon} className="h-20 w-20 md:h-24 md:w-24 text-white" />
            <div className="text-7xl md:text-8xl font-bold">
              {Math.round(temperature)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
