import axios from "axios";

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

  // ✅ Check cache first
  if (spotCache.has(key)) {
    return spotCache.get(key)!;
  }

  const searchUrl = `https://services.surfline.com/search/site?q=${encodeURIComponent(
    spot
  )}&type=spot`;

  try {
    const { data } = await axios.get(searchUrl);

    // Extract the list of spot hits from Surfline's API response
    const hits = data?.[0]?.hits?.hits ?? [];
    if (hits.length === 0) return null;

    // Try to find an exact match first (case-insensitive)
    const exactMatch = hits.find(
      (hit: any) => hit._source?.name?.toLowerCase() === spot.toLowerCase()
    );

    // Use the best available match
    const chosen = exactMatch || hits[0];
    const src = chosen._source;

    const result: SurflineSpot = {
      spotId: chosen._id,
      spotName: src.name,
      href: src.href,
      region: src.breadCrumbs?.join(" › ") ?? "",
    };

    // Cache the result
    spotCache.set(key, result);

    return result;
  } catch (err) {
    console.error("Error fetching spot:", err);
    return null;
  }
}
