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
 * - Always returns the first result from Surfline's search.
 * - Caches results in memory for faster repeated lookups.
 */
export async function getSpot(spot: string): Promise<SurflineSpot | null> {
  const key = spot.toLowerCase();

  // Check cache first
  if (spotCache.has(key)) {
    return spotCache.get(key)!;
  }

  try {
    const { data } = await surflineClient.get(
      `/search/site?q=${spot}&type=spot`
    );

    // Get spots from first array element
    const spotsData = data?.[0];
    const hits = spotsData?.hits?.hits ?? [];

    if (hits.length === 0) {
      console.log(`No spots found for "${spot}"`);
      return null;
    }

    // Always take the first result (highest score from Surfline)
    const firstHit = hits[0];
    const src = firstHit._source;

    const result: SurflineSpot = {
      spotId: firstHit._id,
      spotName: src.name,
      href: src.href,
      region: src.breadCrumbs?.join(" › ") ?? "",
    };

    console.log(`Found spot for "${spot}":`, result.spotName);

    // Cache the result
    spotCache.set(key, result);
    return result;

  } catch (err) {
    console.error("Error fetching spot:", err);
    return null;
  }
}