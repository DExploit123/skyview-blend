import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface SearchBarProps {
  onSearch: (location: string) => void;
}

// Mock city suggestions - in a real app, these would come from an API
const citySuggestions = [
  "Berlin, Germany",
  "Barcelona, Spain",
  "Bangkok, Thailand",
  "Boston, USA",
  "Brussels, Belgium",
  "Budapest, Hungary",
];

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (value.trim().length > 0) {
      const filtered = citySuggestions.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setOpen(false);
    }
  };

  const handleSearch = (location?: string) => {
    const searchTerm = location || input;
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setOpen(false);
    }
  };

  const handleSuggestionClick = (city: string) => {
    setInput(city);
    handleSearch(city);
  };

  return (
    <div className="flex gap-3 w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search for a place..."
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => {
                if (input.trim().length > 0 && filteredSuggestions.length > 0) {
                  setOpen(true);
                }
              }}
              className="pl-10 h-12 bg-input border-2 border-transparent rounded-2xl transition-all hover:bg-input/80 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-weather-card border-border/50"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            {filteredSuggestions.map((city, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(city)}
                className="px-4 py-3 text-left hover:bg-secondary/70 transition-all text-sm text-foreground border-b border-border/30 last:border-0 cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button onClick={() => handleSearch()} size="lg" className="px-8 rounded-2xl hover:scale-105 transition-all">
        Search
      </Button>
    </div>
  );
};
