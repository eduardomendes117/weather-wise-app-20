import { Cloud, Droplets, Wind } from "lucide-react";

interface WeatherData {
  city: string;
  state?: string;
  country: string;
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard = ({ weather }: WeatherCardProps) => {
  return (
    <div className="backdrop-blur-lg bg-glass-bg/40 border border-glass-border rounded-3xl p-8 shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center space-y-6">
        {/* Location */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {weather.city}
          </h2>
          <p className="text-sm text-muted-foreground">
            {weather.state ? `${weather.state}, ${weather.country}` : weather.country}
          </p>
        </div>

        {/* Weather Icon & Temp */}
        <div className="flex flex-col items-center space-y-2">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
            alt={weather.description}
            className="w-32 h-32 drop-shadow-lg animate-scale-in"
          />
          <div className="text-7xl font-bold text-foreground">
            {Math.round(weather.temp)}°
          </div>
          <p className="text-xl text-muted-foreground capitalize">
            {weather.description}
          </p>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-sm pt-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umidade</p>
              <p className="text-lg font-semibold text-foreground">
                {weather.humidity}%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Wind className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vento</p>
              <p className="text-lg font-semibold text-foreground">
                {weather.windSpeed} m/s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
