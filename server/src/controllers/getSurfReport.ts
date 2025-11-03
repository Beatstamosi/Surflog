import axios from "axios";
import { getSpot } from "./getSpot.js";
import type { SurflineSpot } from "./getSpot.js";

export interface SwellInfo {
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
  surf: {
    size: string;
    description: string;
    waveEnergy: string;
    swells: SwellInfo[];
  };
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
 * Fetch combined Surfline forecast for a given spot and session time.
 * - Includes wave, wind, and tide data.
 * - Uses Surfline's public KBYG API endpoints.
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

    // Step 2: Build URLs for all APIs
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

    const report: SurfReport = {
      spotName: surfInfo.spotName,
      region: surfInfo.region,
      sessionStart,
      surf: {
        size: `Surf: ${surf.min} - ${surf.max}`,
        description: surf.humanRelation,
        waveEnergy: `${Math.round(waveMatch.power)}kJ`,
        swells,
      },
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

    return report;
  } catch (error) {
    console.error("Error fetching surf report:", error);
    return null;
  }
}
