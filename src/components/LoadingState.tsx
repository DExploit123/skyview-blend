import { Skeleton } from "./ui/skeleton";

export const CurrentWeatherLoading = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-weather-card border border-border/50">
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-muted rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-muted rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-muted rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export const WeatherStatsLoading = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-weather-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold text-muted-foreground">—</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DailyForecastLoading = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Daily forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="bg-weather-card rounded-2xl p-4 border border-border/50"
          >
            <Skeleton className="h-full w-full min-h-[120px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const HourlyForecastLoading = () => {
  return (
    <div className="bg-card rounded-3xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Hourly forecast</h3>
        <Skeleton className="h-10 w-[140px] rounded-lg" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl"
          >
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
