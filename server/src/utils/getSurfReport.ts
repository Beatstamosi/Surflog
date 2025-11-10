import axios from "axios";
import { getSpot } from "../utils/getSpot.js";
import type { SurflineSpot } from "../utils/getSpot.js";

export interface Swell {
  swell: string;
  height: string;
  period: string;
  power: string;
  direction: string;
}

export interface SurfReport {
  spotName: string;
  region: string;
  sessionStart: string;
  size: string;
  description: string;
  waveEnergy: string;
  rating: {
    value: number; // 1-5
    description: string; // "VERY POOR", "FAIR", "GOOD", etc.
  };
  swells: Swell[];
  wind?: {
    speed: string;
    direction: string;
    gust?: string;
  };
  tide?: {
    height: string;
    type: string;
  };
}

/**
 * Convert Surfline's 1-5 rating to text description
 */
function getRatingDescription(rating: number): string {
  switch (rating) {
    case 1:
      return "VERY POOR";
    case 2:
      return "POOR";
    case 3:
      return "FAIR";
    case 4:
      return "FAIR TO GOOD";
    case 5:
      return "GOOD";
    default:
      return "UNKNOWN";
  }
}

/**
 * Enhanced rating calculation based on multiple factors
 */
function calculateEnhancedRating(
  waveMatch: any,
  windMatch: any,
  tideMatch: any,
  spotName: string
): { value: number; source: string } {
  const surf = waveMatch.surf;
  const avgWaveHeight = (surf.min + surf.max) / 2;

  // Base rating from wave height
  let rating = calculateBaseRatingFromWaveHeight(avgWaveHeight);

  // Adjust based on swell period (longer period = better quality)
  const primarySwell = waveMatch.swells?.[0];
  if (primarySwell?.period) {
    if (primarySwell.period >= 16) rating += 1.0; // Excellent groundswell
    else if (primarySwell.period >= 13) rating += 0.5; // Good groundswell
    else if (primarySwell.period >= 10) rating += 0.25; // Decent swell
    else if (primarySwell.period < 8) rating -= 0.5; // Poor windswell
  }

  // Adjust based on swell consistency (multiple swells = better)
  const activeSwells =
    waveMatch.swells?.filter((s: any) => s.height > 0.1).length || 0;
  if (activeSwells >= 2) rating += 0.25;
  if (activeSwells >= 3) rating += 0.25;

  // Adjust based on wind conditions
  if (windMatch) {
    const windSpeed = windMatch.speed;
    const windDirection = windMatch.directionType?.toLowerCase();

    // Wind direction adjustments
    if (windDirection?.includes("offshore")) rating += 0.75;
    else if (windDirection?.includes("cross offshore")) rating += 0.5;
    else if (windDirection?.includes("onshore")) rating -= 0.5;
    else if (windDirection?.includes("cross onshore")) rating -= 0.25;

    // Wind speed adjustments
    if (windSpeed < 5) rating += 0.25; // Light wind bonus
    else if (windSpeed > 20) rating -= 0.5; // Strong wind penalty
    else if (windSpeed > 30) rating -= 1.0; // Very strong wind penalty
  }

  // Adjust based on tide
  if (tideMatch?.type) {
    const tideType = tideMatch.type.toLowerCase();
    // Some general adjustments (you can make these spot-specific later)
    if (tideType.includes("low") && avgWaveHeight > 2) rating -= 0.25;
    if (tideType.includes("high") && avgWaveHeight < 1) rating += 0.25;
  }

  // Spot-specific adjustments based on known characteristics
  const spotAdjustment = getSpotSpecificAdjustment(
    spotName,
    avgWaveHeight,
    primarySwell
  );
  rating += spotAdjustment;

  // Ensure rating stays within 1-5 range and round to nearest 0.5
  const finalRating = Math.max(1, Math.min(5, Math.round(rating * 2) / 2));

  return {
    value: finalRating,
    source: "enhanced",
  };
}

/**
 * Base rating calculation from wave height only
 */
function calculateBaseRatingFromWaveHeight(waveHeight: number): number {
  if (waveHeight < 0.3) return 1; // VERY POOR - Flat
  if (waveHeight < 0.8) return 1.5; // VERY POOR - Tiny
  if (waveHeight < 1.2) return 2; // POOR - Ankle to knee high
  if (waveHeight < 1.8) return 2.5; // POOR to FAIR - Knee high
  if (waveHeight < 2.5) return 3; // FAIR - Waist high
  if (waveHeight < 3.2) return 3.5; // FAIR to GOOD - Chest high
  if (waveHeight < 4.0) return 4; // GOOD - Head high
  if (waveHeight < 5.0) return 4.5; // GOOD - Overhead
  return 5; // GOOD - Double overhead+
}

/**
 * Spot-specific rating adjustments
 */
function getSpotSpecificAdjustment(
  spotName: string,
  waveHeight: number,
  primarySwell: any
): number {
  const normalizedName = spotName.toLowerCase();

  // Beach breaks generally more forgiving
  if (normalizedName.includes("beach") || normalizedName.includes("ocean")) {
    return 0.1;
  }

  // Reef/point breaks need more size to be good
  if (normalizedName.includes("point") || normalizedName.includes("reef")) {
    if (waveHeight < 2) return -0.2;
    if (waveHeight > 3) return 0.1;
  }

  // World-class spots get slight boost when conditions align
  const worldClassSpots = [
    "pipeline",
    "teahupoo",
    "jaws",
    "waimea",
    "supertubos",
  ];
  if (worldClassSpots.some((spot) => normalizedName.includes(spot))) {
    if (waveHeight > 4 && primarySwell?.period > 14) return 0.3;
  }

  return 0;
}

/**
 * Fetch combined Surfline forecast with enhanced rating calculation
 */
export async function getSurfReport(
  sessionStart: string,
  name: string
): Promise<SurfReport | null> {
  try {
    // Step 1: Find the surf spot
    const surfInfo: SurflineSpot | null = await getSpot(name);
    if (!surfInfo) {
      console.warn(`No surf spot found for "${name}"`);
      return null;
    }

    const spotId = surfInfo.spotId;

    // Step 2: Build URLs for reliable endpoints
    const base = "https://services.surfline.com/kbyg/spots/forecasts";
    const params = `spotId=${spotId}&days=1&intervalHours=1`;

    const waveUrl = `${base}/wave?${params}`;
    const windUrl = `${base}/wind?${params}`;
    const tideUrl = `${base}/tides?${params}`;

    // Step 3: Fetch all data in parallel
    const [waveRes, windRes, tideRes] = await Promise.all([
      axios.get(waveUrl),
      axios.get(windUrl),
      axios.get(tideUrl),
    ]);

    const waveData = waveRes.data?.data?.wave ?? [];
    const windData = windRes.data?.data?.wind ?? [];
    const tideData = tideRes.data?.data?.tides ?? [];

    if (waveData.length === 0) return null;

    // Helper to format timestamps
    const toSessionString = (ts: number) =>
      new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ");

    // Step 4: Match entries by session time
    const waveMatch = waveData.find(
      (w: any) => toSessionString(w.timestamp) === sessionStart
    );
    const windMatch = windData.find(
      (w: any) => toSessionString(w.timestamp) === sessionStart
    );
    const tideMatch = tideData.find(
      (t: any) => toSessionString(t.timestamp) === sessionStart
    );

    if (!waveMatch) return null;

    const surf = waveMatch.surf;
    const swells =
      waveMatch.swells?.slice(0, 3).map((swell: any, i: number) => ({
        swell: `Swell ${i + 1}`,
        height: `Height: ${swell.height ?? "N/A"}`,
        period: `Period: ${swell.period ?? "N/A"} seconds`,
        power: `Power: ${Math.round(swell.power ?? 0)}kJ`,
        direction: `Direction: ${swell.direction ?? "N/A"}`,
      })) ?? [];

    // Determine the best available rating
    let rating;
    if (waveMatch.rating?.value) {
      // Use API rating if available
      rating = {
        value: waveMatch.rating.value,
        source: "api",
      };
    } else {
      // Calculate enhanced rating
      rating = calculateEnhancedRating(
        waveMatch,
        windMatch,
        tideMatch,
        surfInfo.spotName
      );
    }

    const report: SurfReport = {
      spotName: surfInfo.spotName,
      region: surfInfo.region,
      sessionStart,
      size: `Surf: ${surf.min} - ${surf.max}`,
      description: surf.humanRelation,
      waveEnergy: `${Math.round(waveMatch.power)}kJ`,
      rating: {
        value: rating.value,
        description: getRatingDescription(Math.round(rating.value)),
      },
      swells,
      wind: windMatch
        ? {
            speed: `${Math.round(windMatch.speed)} km/h`,
            direction: `${windMatch.directionType ?? "N/A"}`,
            gust: `${Math.round(windMatch.gust ?? 0)} km/h`,
          }
        : undefined,
      tide: tideMatch
        ? {
            height: `${tideMatch.height.toFixed(2)} ft`,
            type: `${tideMatch.type ?? "N/A"}`,
          }
        : undefined,
    };

    console.log(`Rating for ${surfInfo.spotName}:`, {
      finalRating: rating.value,
      source: rating.source,
      waveHeight: `${surf.min}-${surf.max}ft`,
      period: waveMatch.swells?.[0]?.period,
      wind: windMatch?.directionType,
    });

    return report;
  } catch (error) {
    console.error("Error fetching surf report:", error);
    return null;
  }
}
