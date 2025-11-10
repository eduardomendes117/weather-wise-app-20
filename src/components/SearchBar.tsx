import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-12 pr-4 py-6 rounded-full border-2 border-glass-border bg-glass-bg/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary transition-all duration-300"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};
