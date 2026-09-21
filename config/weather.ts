export interface WeatherForecast {
  date: string;
  temp_max: string;
  temp_min: string;
  condition: string;
  icon: string;
}

const WEATHER_API = {
  baseUrl: "https://api.open-meteo.com/v1/forecast",
  timeoutMs: 5000,
};

export async function getWeatherForLocation(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<WeatherForecast[] | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: "temperature_2m_max,temperature_2m_min,weathercode",
      start_date: startDate,
      end_date: endDate,
      timezone: "auto",
    });
    const response = await fetch(`${WEATHER_API.baseUrl}?${params}`, {
      signal: AbortSignal.timeout(WEATHER_API.timeoutMs),
    });
    if (!response.ok) return null;
    const daily = (await response.json())?.daily;
    if (!daily) return null;
    return daily.time.map((date: string, index: number) => ({
      date,
      temp_max: `${Math.round(daily.temperature_2m_max[index])}°C`,
      temp_min: `${Math.round(daily.temperature_2m_min[index])}°C`,
      condition: weatherCondition(daily.weathercode[index]),
      icon: weatherIcon(daily.weathercode[index]),
    }));
  } catch {
    console.warn("Weather API unavailable");
    return null;
  }
}

function weatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Moderate showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "🌨️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}
