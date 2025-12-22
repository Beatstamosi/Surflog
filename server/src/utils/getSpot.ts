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

  // Check cache first
  if (spotCache.has(key)) {
    return spotCache.get(key)!;
  }

  try {
    const { data } = await surflineClient.get(
      `/search/site?q=${spot}&type=spot`
    );

    // Always get spots from the first array element
    const spotsResults = data?.[0];
    if (!spotsResults) {
      console.log(`No spot search results found for "${spot}"`);
      return null;
    }

    const hits = spotsResults?.hits?.hits ?? [];

    if (hits.length === 0) {
      console.log(`No spot hits found for "${spot}"`);
      return null;
    }

    console.log(
      `Found ${hits.length} spots for "${spot}":`,
      hits.map((h: any) => h._source?.name)
    );

    // Try to find exact match (case-insensitive)
    const exactMatch = hits.find(
      (hit: any) => hit._source?.name?.toLowerCase() === spot.toLowerCase()
    );

    // Use exact match if found, otherwise use first result
    const chosen = exactMatch || hits[0];
    const src = chosen._source;

    const result: SurflineSpot = {
      spotId: chosen._id,
      spotName: src.name,
      href: src.href,
      region: src.breadCrumbs?.join(" › ") ?? "",
    };

    console.log(`Selected spot: "${result.spotName}"`);

    // Cache the result
    spotCache.set(key, result);
    return result;
  } catch (err) {
    console.error("Error fetching spot:", err);
    return null;
  }
}
