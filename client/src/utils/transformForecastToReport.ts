import type {
  ForecastFromAPI,
  ForecastReport,
} from "../components/types/models";

export function transformForecastToReport(
  apiForecast: ForecastFromAPI
): ForecastReport {
  return {
    spotName: apiForecast.spotName,
    region: apiForecast.region || "",
    sessionStart:
      typeof apiForecast.date === "string"
        ? apiForecast.date
        : apiForecast.date.toISOString(),
    size: apiForecast.size,
    description: apiForecast.description || "",
    waveEnergy: apiForecast.waveEnergy || "",
    rating: {
      value: apiForecast.ratingValue || 0,
      description: apiForecast.ratingDescription || "",
    },
    swells: apiForecast.swells || [],
    wind:
      apiForecast.windSpeed || apiForecast.windDirection
        ? {
            speed: apiForecast.windSpeed || "",
            direction: apiForecast.windDirection || "",
            gust: apiForecast.windGust,
          }
        : undefined,
    tide:
      apiForecast.tideHeight || apiForecast.tideType
        ? {
            height: apiForecast.tideHeight || "",
            type: apiForecast.tideType || "",
          }
        : undefined,
  };
}
