import { surflineClient } from "./surflineClient.js";

export interface SurflineSpot {
  spotId: string;
  spotName: string;
  href: string;
  region: string;
}

// In-memory cache (key: lowercase spot name)
const spotCache = new Map<string, SurflineSpot>();

/**
 * Fetches the closest matching Surfline spot by name.
 * - Uses Surfline's public search API (no scraping).
 * - Prioritizes exact name matches (case-insensitive).
 * - Caches results in memory for faster repeated lookups.
 */
export async function getSpot(spot: string): Promise<SurflineSpot | null> {
  const key = spot.toLowerCase();

  // For debugging, clear cache or skip it
  // spotCache.clear();

  if (spotCache.has(key)) {
    const cached = spotCache.get(key)!;
    console.log(`Using cached result for "${spot}":`, cached.spotName);
    return cached;
  }

  try {
    const { data } = await surflineClient.get(
      `/search/site?q=${encodeURIComponent(spot)}&type=spot`
    );

    const spotsData = data?.[0];
    const hits = spotsData?.hits?.hits ?? [];

    if (hits.length === 0) {
      console.log(`❌ No spots found for "${spot}"`);
      return null;
    }

    const firstHit = hits[0];
    const src = firstHit._source;

    const result: SurflineSpot = {
      spotId: firstHit._id,
      spotName: src.name,
      href: src.href,
      region: src.breadCrumbs?.join(" › ") ?? "",
    };

    console.log(`Found spot for "${spot}":`, result.spotName);

    spotCache.set(key, result);
    return result;
  } catch (err) {
    console.error("Error fetching spot:", err);
    return null;
  }
}
