/**
 * Shared primitives for TREAD's data layer.
 *
 * The rule that outranks everything else: the model must be able to say
 * "I don't know". Every physical measurement is a `Measure` -- a number, a
 * range (when reputable sources disagree), or `null` meaning UNKNOWN. The UI
 * renders `null` as UNKNOWN rather than guessing.
 */

/** A measured quantity. `null` means genuinely unknown -- never fill it in. */
export type Measure = number | MeasureRange | null

export interface MeasureRange {
  min: number
  max: number
}

export type SourceKind =
  | 'agency' // BLM / USFS / NPS / state parks / county
  | 'operator' // the business, club or association that runs the thing
  | 'reference' // encyclopedic / tourism board
  | 'community' // crowd-sourced or club trail data

export interface Source {
  id: string
  label: string
  org: string
  url: string
  kind: SourceKind
}

/** Anything the user can be shown carries where it came from and when we looked. */
export interface Sourced {
  /** Source ids, see data/sources.ts */
  sources: string[]
  /** ISO date (YYYY-MM-DD) this record was last checked against its sources. */
  lastChecked: string
}

/**
 * Where a statement about fitness-for-purpose comes from. The UI shows this
 * next to every vehicle consideration so "the BLM says 4WD" never reads the
 * same as "TREAD estimated it".
 */
export type Basis =
  | 'official' // published by the land manager / agency
  | 'vehicle_spec' // known specification for the vehicle, from the catalog
  | 'user' // entered by the user about their own vehicle
  | 'estimate' // TREAD's disclosed model
  | 'community' // club / crowd-sourced information

export const BASIS_LABEL: Record<Basis, string> = {
  official: 'Official',
  vehicle_spec: 'Vehicle spec',
  user: 'You entered',
  estimate: 'TREAD estimate',
  community: 'Community',
}

/* ------------------------------------------------------------------ roads */

export type RoadClass =
  | 'paved_highway'
  | 'paved_mountain'
  | 'graded_dirt'
  | 'rough_dirt'
  | 'high_clearance'
  | 'technical_4wd'

/**
 * What a stretch of road asks of a vehicle. Ordered roughly by demand; see
 * engine/drive.ts for the ranking. `modified_4x4` is for routes whose
 * publishers say stock vehicles should not attempt them.
 */
export type VehicleRequirement =
  | 'any_vehicle'
  | 'high_clearance'
  | 'four_wd'
  | 'four_wd_low_range'
  | 'modified_4x4'
  | 'unknown'

export interface DriveSegment extends Sourced {
  /** Human label, e.g. "Sand Flats Road east from Moab". */
  via: string
  miles: Measure
  roadClass: RoadClass
  vehicle: VehicleRequirement
  /** Published travel time in minutes; always beats the speed model. */
  minutesOverride?: Measure
  notes?: string
}

/* --------------------------------------------------------------- seasons */

export type SeasonConfidence = 'documented' | 'reported' | 'unknown'

export interface SeasonWindow extends Sourced {
  /** Months (1-12) when access is typically viable. `null` = unknown. */
  months: number[] | null
  note: string
  confidence: SeasonConfidence
}

/* --------------------------------------------------------------- warnings */

export type WarningLevel = 'info' | 'caution' | 'blocker'

export interface Warning {
  level: WarningLevel
  message: string
}

/* ------------------------------------------------------------------ places */

/**
 * How a place came to be the user's starting point. There is deliberately no
 * "default" member: TREAD never invents a starting location.
 */
export type PlaceOrigin =
  | 'manual' // typed coordinates or picked from the offline town list
  | 'search' // result of a user-initiated place search
  | 'map' // user tapped a point on the map
  | 'device' // user pressed "use my location" and granted permission
  | 'saved' // chosen from the user's saved places

export interface Place {
  id: string
  label: string
  lat: number
  lon: number
  origin: PlaceOrigin
  /** Optional region hint, e.g. "UT", used only for display. */
  admin?: string
}
