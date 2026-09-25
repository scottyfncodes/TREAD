import type { Place } from './types'

/**
 * A trip is a user's plan: where they start, which vehicle, which
 * adventures, in what order. Starting location is nullable on purpose --
 * a trip can be sketched before the user has said where they leave from,
 * and TREAD fills nothing in on their behalf.
 */
export interface TripStop {
  /** Adventure id from the dataset. */
  adventureId: string
  /** 0-based day of the trip this stop belongs to. */
  day: number
  note: string
}

export interface Trip {
  id: string
  name: string
  start: Place | null
  /** Return to the starting point at the end (a loop trip). */
  returnToStart: boolean
  vehicleId: string | null
  /** ISO date of day one. */
  date: string
  days: number
  /** Minutes after midnight for the day-one departure. */
  departMinutes: number
  stops: TripStop[]
  overnight: boolean
  packed: string[]
  confirmed: boolean
  notes: string
  createdAt: number
  updatedAt: number
}

export function newTripId(now: number = Date.now()): string {
  return `trip_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/* ------------------------------------------------------------------ gear */

export type GearGroup = 'recovery' | 'camping' | 'hiking' | 'safety' | 'vehicle' | 'winter' | 'other'

/** Gear the user owns, independent of any vehicle. */
export interface GearItem {
  id: string
  label: string
  group: GearGroup
}

/* --------------------------------------------------------------- profile */

/**
 * Adventure preferences. Nothing here is personal data about any specific
 * person, and every default is neutral -- none of them imply a vehicle, a
 * home, or an appetite for hard terrain.
 */
export interface Preferences {
  /** Flat-ground hiking pace, mph. Drives every hiking time estimate. */
  paceMph: number
  /** Ceiling on one-way driving to an adventure, minutes. */
  maxDriveMinutes: number
  hikeAppetite: 'none' | 'short' | 'moderate' | 'long'
  food: 'none' | 'coffee' | 'lunch' | 'brewery' | 'dinner'
  /** Categories the user cares about; empty means "show me everything". */
  interests: string[]
  units: 'imperial'
}

export const DEFAULT_PREFERENCES: Preferences = {
  paceMph: 2.2,
  maxDriveMinutes: 180,
  hikeAppetite: 'moderate',
  food: 'lunch',
  interests: [],
  units: 'imperial',
}
