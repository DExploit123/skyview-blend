import { Sun, Settings, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type UnitPreferences = {
  temperature: "celsius" | "fahrenheit";
  windSpeed: "kmh" | "mph";
  precipitation: "mm" | "in";
};

interface HeaderProps {
  units: "metric" | "imperial";
  onUnitsChange: (units: "metric" | "imperial") => void;
  unitPreferences: UnitPreferences;
  onUnitPreferencesChange: (preferences: UnitPreferences) => void;
}

export const Header = ({ units, onUnitsChange, unitPreferences, onUnitPreferencesChange }: HeaderProps) => {
  const handleQuickSwitch = (targetUnits: "metric" | "imperial") => {
    const newPreferences: UnitPreferences = targetUnits === "metric"
      ? { temperature: "celsius", windSpeed: "kmh", precipitation: "mm" }
      : { temperature: "fahrenheit", windSpeed: "mph", precipitation: "in" };
    
    onUnitPreferencesChange(newPreferences);
    onUnitsChange(targetUnits);
  };

  const handleUnitChange = (category: keyof UnitPreferences, value: string) => {
    const newPreferences = { ...unitPreferences, [category]: value };
    onUnitPreferencesChange(newPreferences);
    
    // Auto-detect if all units match metric or imperial
    const isMetric = newPreferences.temperature === "celsius" && 
                    newPreferences.windSpeed === "kmh" && 
                    newPreferences.precipitation === "mm";
    const isImperial = newPreferences.temperature === "fahrenheit" && 
                      newPreferences.windSpeed === "mph" && 
                      newPreferences.precipitation === "in";
    
    if (isMetric) onUnitsChange("metric");
    else if (isImperial) onUnitsChange("imperial");
  };

  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        <Sun className="h-8 w-8 text-weather-accent" />
        <h1 className="text-xl font-semibold">Weather Now</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2 rounded-xl border-2 border-transparent hover:border-border transition-all">
            <Settings className="h-4 w-4" />
            Units
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-weather-card border-border/50">
          <DropdownMenuItem 
            onClick={() => handleQuickSwitch("imperial")}
            className="cursor-pointer hover:bg-secondary/70 transition-all"
          >
            Switch to Imperial
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border/30" />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Temperature
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("temperature", "celsius")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.temperature === "celsius" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            Celsius (°C)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("temperature", "fahrenheit")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.temperature === "fahrenheit" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            Fahrenheit (°F)
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border/30" />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Wind Speed
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("windSpeed", "kmh")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.windSpeed === "kmh" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            km/h
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("windSpeed", "mph")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.windSpeed === "mph" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            mph
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border/30" />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Precipitation
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("precipitation", "mm")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.precipitation === "mm" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            Millimeters (mm)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUnitChange("precipitation", "in")}
            className="cursor-pointer pl-8 relative hover:bg-secondary/70 transition-all"
          >
            {unitPreferences.precipitation === "in" && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            Inches (in)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
