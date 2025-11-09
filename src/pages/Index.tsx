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

  const reverseGeocode = async (lat: number, lon: number): Promise<{ city: string; country: string } | null> => {
    try {
      // Using Nominatim (OpenStreetMap) for free reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0'
          }
        }
      );
      const data = await response.json();

      if (response.ok && data.address) {
        // Try to get the most specific city name
        const city = 
          data.address.city || 
          data.address.town || 
          data.address.village || 
          data.address.municipality ||
          data.address.suburb ||
          data.name;
        
        const country = data.address.country || '';
        
        return { city, country };
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização. Busque uma cidade manualmente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Keep 5 decimal places for precision
        const latitude = parseFloat(position.coords.latitude.toFixed(5));
        const longitude = parseFloat(position.coords.longitude.toFixed(5));
        
        toast({
          title: "Localizando...",
          description: `Coordenadas obtidas com precisão de ${Math.round(position.coords.accuracy)}m`,
        });

        // Get precise city name using reverse geocoding
        const location = await reverseGeocode(latitude, longitude);
        
        // Fetch weather data
        const url = `${API_BASE}?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();

          if (response.ok) {
            // Use the more precise city name from reverse geocoding if available
            setWeather({
              city: location?.city || data.name,
              country: location?.country || data.sys.country,
              temp: data.main.temp,
              description: data.weather[0].description,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              icon: data.weather[0].icon,
            });
          } else {
            toast({
              title: "Erro",
              description: data.message || "Não foi possível obter dados climáticos.",
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
      },
      (error) => {
        setLoading(false);
        
        let errorMessage = "Não foi possível acessar sua localização.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada. Por favor, habilite no navegador e tente novamente.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível. Verifique se o GPS está ativado.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao obter localização. Tente novamente.";
            break;
        }
        
        toast({
          title: "Erro de Geolocalização",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
            {weather && (
              <Button
                variant="ghost"
                size="icon"
                onClick={getCurrentLocationWeather}
                className="rounded-full hover:bg-muted"
                aria-label="Atualizar localização"
                title="Corrigir/Atualizar Localização"
              >
                <MapPin className="h-5 w-5 text-primary" />
              </Button>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <SearchBar onSearch={handleCitySearch} apiKey={API_KEY} />
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
