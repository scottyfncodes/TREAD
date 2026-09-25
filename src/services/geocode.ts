import type { Place, PlaceOrigin } from '../domain/types'
import { searchKnownPlaces } from '../data/places'
import { isValidLatLon } from '../engine/geo'

/**
 * Place search for choosing a starting location.
 *
 * Only ever runs because the user typed something and asked. The offline
 * town list answers first (works with no signal); an online search through
 * Open-Meteo's free geocoder is an explicit second step.
 */
const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

export function placeId(lat: number, lon: number): string {
  return `pl_${lat.toFixed(4)}_${lon.toFixed(4)}`
}

export function makePlace(label: string, lat: number, lon: number, origin: PlaceOrigin, admin?: string): Place {
  return { id: placeId(lat, lon), label: label.trim(), lat, lon, origin, admin }
}

export function offlineSearch(query: string): Place[] {
  return searchKnownPlaces(query).map((p) => makePlace(`${p.name}, ${p.admin}`, p.lat, p.lon, 'manual', p.admin))
}

export async function onlineSearch(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const params = new URLSearchParams({ name: q, count: '8', language: 'en', format: 'json' })
  const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal })
  if (!response.ok) throw new Error(`Place search returned ${response.status}`)
  return parseGeocode(await response.json())
}

export function parseGeocode(body: unknown): Place[] {
  const results = (body as { results?: unknown[] })?.results
  if (!Array.isArray(results)) return []
  const places: Place[] = []
  for (const r of results) {
    const row = r as { name?: unknown; latitude?: unknown; longitude?: unknown; admin1?: unknown; country_code?: unknown }
    if (typeof row.name !== 'string' || typeof row.latitude !== 'number' || typeof row.longitude !== 'number') continue
    if (!isValidLatLon(row.latitude, row.longitude)) continue
    const admin = typeof row.admin1 === 'string' ? row.admin1 : undefined
    const country = typeof row.country_code === 'string' ? row.country_code : ''
    const label = [row.name, admin, country && country !== 'US' ? country : ''].filter(Boolean).join(', ')
    places.push(makePlace(label, row.latitude, row.longitude, 'search', admin))
  }
  return places
}

/** "38.5733, -109.5498" -> Place. Accepts comma or space separation. */
export function parseCoordinates(text: string): Place | null {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text)
  if (!match) return null
  const lat = Number(match[1])
  const lon = Number(match[2])
  if (!isValidLatLon(lat, lon)) return null
  return makePlace(`${lat.toFixed(4)}, ${lon.toFixed(4)}`, lat, lon, 'manual')
}

/**
 * Explicit device location. Must be called from a user gesture; never on
 * load. Resolves to a Place labelled as a device fix so the UI can say so.
 */
export function requestDeviceLocation(geo: Geolocation | undefined = typeof navigator !== 'undefined' ? navigator.geolocation : undefined): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!geo) {
      reject(new Error('Location is not available on this device.'))
      return
    }
    geo.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        resolve(makePlace(`My location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`, latitude, longitude, 'device'))
      },
      (err) => reject(new Error(err.code === 1 ? 'Location permission was declined.' : 'Could not get a location fix.')),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    )
  })
}
