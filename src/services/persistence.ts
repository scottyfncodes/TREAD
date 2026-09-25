import type { Place } from '../domain/types'
import type { GearItem, Preferences, Trip } from '../domain/trip'
import { DEFAULT_PREFERENCES } from '../domain/trip'
import type { VehicleProfile } from '../domain/vehicle'
import { blankVehicle } from '../domain/vehicle'
import { isValidLatLon } from '../engine/geo'
import { readJson, writeJson } from './storage'

/**
 * Stored data outlives the code that wrote it. Everything read back is
 * validated; anything that no longer looks right is dropped (or, for
 * vehicles, back-filled with "not entered" defaults) rather than crashing
 * the screen that renders it.
 */

export const KEYS = {
  vehicles: 'garage.vehicles',
  preferredVehicle: 'garage.preferred',
  start: 'location.start',
  savedPlaces: 'location.saved',
  trips: 'trips',
  gear: 'gear.owned',
  customGear: 'gear.custom',
  prefs: 'prefs',
  onboarded: 'onboarded',
} as const

export function isPlace(value: unknown): value is Place {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Partial<Place>
  return (
    typeof p.id === 'string' &&
    typeof p.label === 'string' &&
    typeof p.lat === 'number' &&
    typeof p.lon === 'number' &&
    isValidLatLon(p.lat, p.lon) &&
    typeof p.origin === 'string'
  )
}

export function normalizeVehicle(value: unknown): VehicleProfile | null {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Partial<VehicleProfile>
  if (typeof v.id !== 'string' || typeof v.make !== 'string' || typeof v.model !== 'string') return null
  const base = blankVehicle(typeof v.createdAt === 'number' ? v.createdAt : Date.now())
  return {
    ...base,
    ...v,
    id: v.id,
    equipment: Array.isArray(v.equipment) ? v.equipment : [],
    maintenance: Array.isArray(v.maintenance) ? v.maintenance : [],
    catalogFields: Array.isArray(v.catalogFields) ? v.catalogFields : [],
  } as VehicleProfile
}

export function isTrip(value: unknown): value is Trip {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Partial<Trip>
  return (
    typeof t.id === 'string' &&
    typeof t.date === 'string' &&
    Array.isArray(t.stops) &&
    (t.start === null || isPlace(t.start))
  )
}

export function loadVehicles(): VehicleProfile[] {
  const raw = readJson<unknown>(KEYS.vehicles, [])
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeVehicle).filter((v): v is VehicleProfile => v !== null)
}

export function saveVehicles(vehicles: VehicleProfile[]) {
  writeJson(KEYS.vehicles, vehicles)
}

export function loadTrips(): Trip[] {
  const raw = readJson<unknown>(KEYS.trips, [])
  return Array.isArray(raw) ? raw.filter(isTrip).map((t) => ({ ...t, packed: Array.isArray(t.packed) ? t.packed : [], notes: t.notes ?? '' })) : []
}

export function saveTrips(trips: Trip[]) {
  writeJson(KEYS.trips, trips)
}

export function loadStart(): Place | null {
  const raw = readJson<unknown>(KEYS.start, null)
  return isPlace(raw) ? raw : null
}

export function loadSavedPlaces(): Place[] {
  const raw = readJson<unknown>(KEYS.savedPlaces, [])
  return Array.isArray(raw) ? raw.filter(isPlace) : []
}

export function loadPrefs(): Preferences {
  const raw = readJson<Partial<Preferences> | null>(KEYS.prefs, null)
  return raw && typeof raw === 'object' ? { ...DEFAULT_PREFERENCES, ...raw } : DEFAULT_PREFERENCES
}

export function loadOwnedGear(): string[] {
  const raw = readJson<unknown>(KEYS.gear, [])
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
}

export function loadCustomGear(): GearItem[] {
  const raw = readJson<unknown>(KEYS.customGear, [])
  return Array.isArray(raw)
    ? raw.filter((g): g is GearItem => typeof g === 'object' && g !== null && typeof (g as GearItem).id === 'string' && typeof (g as GearItem).label === 'string')
    : []
}

export function upsert<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((i) => i.id === item.id)
  if (index === -1) return [...items, item]
  const next = [...items]
  next[index] = item
  return next
}

/**
 * Deleting the preferred vehicle must not leave a dangling id: the preference
 * moves to the first remaining vehicle, or clears.
 */
export function removeVehicle(vehicles: VehicleProfile[], preferredId: string | null, id: string) {
  const next = vehicles.filter((v) => v.id !== id)
  const preferred = preferredId === id ? (next[0]?.id ?? null) : preferredId
  return { vehicles: next, preferredId: preferred }
}

/** Trips that referenced a deleted vehicle keep existing, with no vehicle. */
export function detachVehicle(trips: Trip[], vehicleId: string): Trip[] {
  return trips.map((t) => (t.vehicleId === vehicleId ? { ...t, vehicleId: null } : t))
}
