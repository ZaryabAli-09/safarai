// Weather Service - Uses Open-Meteo (free, no API key needed)
// Falls back gracefully if unavailable

interface WeatherData {
  temp: string;
  condition: string;
  icon: string;
}

interface WeatherForecast {
  date: string;
  temp_max: string;
  temp_min: string;
  condition: string;
  icon: string;
}

/**
 * Get weather forecast for a location using Open-Meteo (free, no key required).
 * Returns null if the API is unavailable.
 */
export async function getWeatherForLocation(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<WeatherForecast[] | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json();
    const daily = data.daily;

    if (!daily) return null;

    const forecasts: WeatherForecast[] = daily.time.map(
      (date: string, i: number) => ({
        date,
        temp_max: `${Math.round(daily.temperature_2m_max[i])}°C`,
        temp_min: `${Math.round(daily.temperature_2m_min[i])}°C`,
        condition: getWeatherCondition(daily.weathercode[i]),
        icon: getWeatherIcon(daily.weathercode[i]),
      }),
    );

    return forecasts;
  } catch (error) {
    console.warn(
      "Weather API unavailable, generating trip without weather data",
    );
    return null;
  }
}

function getWeatherCondition(code: number): string {
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

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "🌨️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

export type { WeatherData, WeatherForecast };
