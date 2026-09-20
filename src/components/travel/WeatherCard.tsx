import { useEffect, useState } from "react";

interface WeatherCardProps {
  destination: string;
}

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

function WeatherCard({ destination }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        // Step 1: Find the destination coordinates
        const locationResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            destination
          )}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
          throw new Error("Unable to find destination.");
        }

        const locationResult = await locationResponse.json();

        if (
          !locationResult.results ||
          locationResult.results.length === 0
        ) {
          throw new Error(
            `Could not find "${destination}".`
          );
        }

        const locationData = locationResult.results[0];

        setLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          name: locationData.name,
        });

        // Step 2: Get weather using coordinates
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!weatherResponse.ok) {
          throw new Error("Unable to fetch weather data.");
        }

        const weatherResult = await weatherResponse.json();

        setWeather({
          temperature: weatherResult.current.temperature_2m,
          apparentTemperature:
            weatherResult.current.apparent_temperature,
          humidity:
            weatherResult.current.relative_humidity_2m,
          windSpeed:
            weatherResult.current.wind_speed_10m,
          weatherCode:
            weatherResult.current.weather_code,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (destination.trim()) {
      fetchWeather();
    }
  }, [destination]);

  const getWeatherCondition = (code: number) => {
    if (code === 0) {
      return "Clear sky";
    }

    if ([1, 2, 3].includes(code)) {
      return "Partly cloudy";
    }

    if ([45, 48].includes(code)) {
      return "Foggy";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return "Drizzle";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return "Rainy";
    }

    if ([71, 73, 75, 77].includes(code)) {
      return "Snowy";
    }

    if ([80, 81, 82].includes(code)) {
      return "Rain showers";
    }

    if ([95, 96, 99].includes(code)) {
      return "Thunderstorm";
    }

    return "Unknown";
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) {
      return "☀️";
    }

    if ([1, 2, 3].includes(code)) {
      return "⛅";
    }

    if ([45, 48].includes(code)) {
      return "🌫️";
    }

    if (
      [51, 53, 55, 56, 57].includes(code)
    ) {
      return "🌦️";
    }

    if (
      [61, 63, 65, 66, 67].includes(code)
    ) {
      return "🌧️";
    }

    if (
      [71, 73, 75, 77].includes(code)
    ) {
      return "❄️";
    }

    if (
      [80, 81, 82].includes(code)
    ) {
      return "🌦️";
    }

    if (
      [95, 96, 99].includes(code)
    ) {
      return "⛈️";
    }

    return "🌤️";
  };

  // Loading state
  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Weather
        </p>

        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-slate-200" />
          <div className="h-14 w-24 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
        </div>
      </section>
    );
  }

  // Error state
  if (error || !weather) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Weather
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {destination}
        </h2>

        <p className="mt-4 text-sm text-red-600">
          {error || "Weather data is unavailable."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Live Weather
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {location?.name ?? destination}
          </h2>
        </div>

        <div className="text-4xl">
          {getWeatherIcon(weather.weatherCode)}
        </div>
      </div>

      {/* Temperature */}
      <div className="mt-6">
        <p className="text-5xl font-bold text-slate-900">
          {Math.round(weather.temperature)}°C
        </p>

        <p className="mt-2 text-slate-600">
          {getWeatherCondition(weather.weatherCode)}
        </p>
      </div>

      {/* Weather Details */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-5">
        <div>
          <p className="text-sm text-slate-500">
            Feels Like
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {Math.round(weather.apparentTemperature)}°C
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Humidity
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {weather.humidity}%
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Wind
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {Math.round(weather.windSpeed)} km/h
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Condition
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {getWeatherCondition(weather.weatherCode)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default WeatherCard;