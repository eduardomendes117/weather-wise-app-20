import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  onSearch: (city: string) => void;
  apiKey: string;
}

interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export const SearchBar = ({ onSearch, apiKey }: SearchBarProps) => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedCity = useDebounce(city, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedCity.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${debouncedCity}&limit=5&appid=${apiKey}`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedCity, apiKey]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const cityName = suggestion.state
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    
    setCity(cityName);
    onSearch(suggestion.name);
    setShowSuggestions(false);
    setCity("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative" ref={wrapperRef}>
        <Input
          type="text"
          placeholder="Buscar cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-12 pr-4 py-6 rounded-full border-2 border-glass-border bg-glass-bg/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary transition-all duration-300"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-card border-2 border-glass-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in backdrop-blur-lg">
            {loading && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Buscando...
              </div>
            )}
            {!loading && (
              <ul className="py-1">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.lat}-${suggestion.lon}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors duration-200 text-left group"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.state
                            ? `${suggestion.state}, ${suggestion.country}`
                            : suggestion.country}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </form>
  );
};
