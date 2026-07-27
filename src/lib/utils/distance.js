/**
 * Human-readable distance label — meters under 1km, otherwise km to 1 decimal.
 * Returns null if distanceKm is null/undefined so callers can conditionally render.
 *
 * distanceKm itself is computed server-side (Redis GEORADIUS via
 * VendorGeoIndexService.getDistancesKm) — the frontend only formats it, it
 * doesn't compute great-circle distance itself.
 */
export const formatDistance = (distanceKm) => {
    if (distanceKm == null || Number.isNaN(distanceKm)) return null;
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
    return `${distanceKm.toFixed(1)} km away`;
};
