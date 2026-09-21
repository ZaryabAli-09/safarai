/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWeatherForLocation } from "@/config/weather";

export async function attachItineraryWeather(
  itinerary: any[],
  coordinates: { lat: number; lng: number } | undefined,
  startDate: Date,
  endDate: Date,
) {
  if (!coordinates) return itinerary;
  const forecast = await getWeatherForLocation(
    coordinates.lat,
    coordinates.lng,
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0],
  );
  if (!forecast) return itinerary;
  return itinerary.map((day, index) => {
    const weather = forecast[index];
    if (!weather) return day;
    return {
      ...day,
      activities: (day.activities || []).map((activity: any) => ({
        ...activity,
        weather: {
          temp: weather.temp_max,
          condition: weather.condition,
          icon: weather.icon,
        },
      })),
    };
  });
}
