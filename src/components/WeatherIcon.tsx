import { Cloud, CloudRain, Sun, CloudSnow, CloudDrizzle, Wind } from "lucide-react";

interface WeatherIconProps {
  type: "sun" | "cloud" | "rain" | "snow" | "drizzle" | "wind" | "partly-cloudy";
  className?: string;
}

export const WeatherIcon = ({ type, className = "h-12 w-12" }: WeatherIconProps) => {
  const icons = {
    sun: <Sun className={className} />,
    cloud: <Cloud className={className} />,
    rain: <CloudRain className={className} />,
    snow: <CloudSnow className={className} />,
    drizzle: <CloudDrizzle className={className} />,
    wind: <Wind className={className} />,
    "partly-cloudy": (
      <div className="relative">
        <Sun className={`${className} absolute`} />
        <Cloud className={`${className} relative translate-x-2 translate-y-2`} />
      </div>
    ),
  };

  return icons[type] || icons.sun;
};
