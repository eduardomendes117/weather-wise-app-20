import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeatherCard } from "@/components/WeatherCard";
import { SearchBar } from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // OpenWeatherMap free API key
const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const fetchWeather = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setWeather({
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          icon: data.weather[0].icon,
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Cidade não encontrada. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao serviço de clima.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `${API_BASE}?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`;
          fetchWeather(url);
        },
        () => {
          toast({
            title: "Permissão negada",
            description: "Não foi possível acessar sua localização. Busque uma cidade manualmente.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive",
      });
    }
  };

  const handleCitySearch = (city: string) => {
    const url = `${API_BASE}?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`;
    fetchWeather(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-sky transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground capitalize">
              {formatDate(currentTime)}
            </h1>
            <p className="text-lg text-muted-foreground">{formatTime(currentTime)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={getCurrentLocationWeather}
              className="rounded-full hover:bg-muted"
              aria-label="Detectar localização"
            >
              <MapPin className="h-5 w-5 text-foreground" />
            </Button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <SearchBar onSearch={handleCitySearch} />
        </div>

        {/* Weather Card or Loading */}
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : weather ? (
            <WeatherCard weather={weather} />
          ) : (
            <div className="text-center text-muted-foreground animate-fade-in">
              <p className="text-lg">Busque uma cidade ou permita acesso à sua localização</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
