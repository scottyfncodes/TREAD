/**
 * Distance and transit estimates between arbitrary points.
 *
 * TREAD has no routing engine and does not pretend to. The drive from a
 * user's chosen start to a gateway town is a disclosed model: great-circle
 * distance times a road-circuity factor, at an average highway speed. Every
 * figure derived from it is labelled "est." in the UI, and navigation is
 * always handed off to a real maps app.
 */

const EARTH_RADIUS_MI = 3958.8

/** Real roads are longer than the crow flies; 1.3 is a common planning factor. */
export const ROAD_CIRCUITY = 1.3

/** Average door-to-door speed for long drives, including slowdowns. */
export const TRANSIT_MPH = 55

/** Below this, the start is effectively at the gateway. */
export const SAME_PLACE_MILES = 3

export interface LatLon {
  lat: number
  lon: number
}

export function haversineMiles(a: LatLon, b: LatLon): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)))
}

export interface TransitEstimate {
  straightMiles: number
  roadMiles: number
  minutes: number
  /** Always true: this is a model, never a routed distance. */
  estimated: true
}

export function estimateTransit(from: LatLon, to: LatLon): TransitEstimate {
  const straightMiles = haversineMiles(from, to)
  if (straightMiles < SAME_PLACE_MILES) {
    return { straightMiles, roadMiles: 0, minutes: 0, estimated: true }
  }
  const roadMiles = straightMiles * ROAD_CIRCUITY
  return {
    straightMiles,
    roadMiles: Math.round(roadMiles),
    minutes: Math.round((roadMiles / TRANSIT_MPH) * 60),
    estimated: true,
  }
}

export function isValidLatLon(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  )
}
