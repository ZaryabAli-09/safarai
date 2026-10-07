export interface WeatherForecast {
  date: string;
  temp_max: string;
  temp_min: string;
  condition: string;
  icon: string;
  /**
   * True when the entry came from long-term climate history (trip is beyond
   * the forecast window) rather than an actual forecast.
   */
  isTypical?: boolean;
}

const WEATHER_API = {
  baseUrl: "https://api.open-meteo.com/v1/forecast",
  archiveUrl: "https://archive-api.open-meteo.com/v1/archive",
  timeoutMs: 5000,
};

/** The `daily` block returned by both Open-Meteo APIs. */
interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

async function fetchDaily(
  url: string,
  params: URLSearchParams,
): Promise<DailyWeather | null> {
  try {
    const response = await fetch(`${url}?${params}`, {
      signal: AbortSignal.timeout(WEATHER_API.timeoutMs),
    });
    if (!response.ok) return null;
    const daily = (await response.json())?.daily as DailyWeather | undefined;
    return daily?.time?.length ? daily : null;
  } catch {
    return null;
  }
}

function mapDaily(daily: DailyWeather, isTypical: boolean): WeatherForecast[] {
  return daily.time.map((date: string, index: number) => ({
    date,
    temp_max: `${Math.round(daily.temperature_2m_max[index])}°C`,
    temp_min: `${Math.round(daily.temperature_2m_min[index])}°C`,
    condition: weatherCondition(daily.weathercode[index]),
    icon: weatherIcon(daily.weathercode[index]),
    isTypical,
  }));
}

/**
 * Daily weather for a date range.
 *
 * Open-Meteo's forecast API only covers ~16 days ahead (and ~3 months back).
 * Beyond that we fall back to the archive API:
 *  - past dates → real recorded weather for those dates
 *  - future dates → the same calendar dates last year ("typical" weather),
 *    so trips planned months ahead still get sensible values.
 */
export async function getWeatherForLocation(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<WeatherForecast[] | null> {
  const dailyParams = "temperature_2m_max,temperature_2m_min,weathercode";
  const common = {
    latitude: String(lat),
    longitude: String(lng),
    daily: dailyParams,
    timezone: "auto",
  };

  // 1. Real forecast (works for ~today-3months … ~today+16 days).
  const forecast = await fetchDaily(WEATHER_API.baseUrl, new URLSearchParams({
    ...common,
    start_date: startDate,
    end_date: endDate,
  }));
  if (forecast) return mapDaily(forecast, false);

  const start = new Date(`${startDate}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const isFuture = start.getTime() > today.getTime();

  // 2a. Future beyond the forecast window → same dates last year ("typical").
  const archiveStart = new Date(start);
  const archiveEnd = new Date(`${endDate}T00:00:00Z`);
  if (isFuture) {
    archiveStart.setUTCFullYear(archiveStart.getUTCFullYear() - 1);
    archiveEnd.setUTCFullYear(archiveEnd.getUTCFullYear() - 1);
  }

  const archive = await fetchDaily(
    WEATHER_API.archiveUrl,
    new URLSearchParams({
      ...common,
      start_date: archiveStart.toISOString().slice(0, 10),
      end_date: archiveEnd.toISOString().slice(0, 10),
    }),
  );
  if (!archive) {
    console.warn(`Weather unavailable for ${startDate} → ${endDate}`);
    return null;
  }

  // Shift dates back onto the requested range (archive returns source dates).
  const shifted = {
    ...archive,
    time: archive.time.map((_: string, index: number) => {
      const source = new Date(`${archive.time[index]}T00:00:00Z`);
      if (isFuture) source.setUTCFullYear(source.getUTCFullYear() + 1);
      return source.toISOString().slice(0, 10);
    }),
  };
  return mapDaily(shifted, isFuture);
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
