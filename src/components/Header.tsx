import { Sun, Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  units: "metric" | "imperial";
  onUnitsChange: (units: "metric" | "imperial") => void;
}

export const Header = ({ units, onUnitsChange }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        <Sun className="h-8 w-8 text-weather-accent" />
        <h1 className="text-xl font-semibold">Weather Now</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Units
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onUnitsChange("metric")}>
            Metric (°C, km/h, mm)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUnitsChange("imperial")}>
            Imperial (°F, mph, in)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
