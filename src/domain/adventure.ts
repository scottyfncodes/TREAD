import type {
  DriveSegment,
  Measure,
  SeasonWindow,
  Sourced,
  VehicleRequirement,
} from './types'
import type { EquipmentId } from './vehicle'

/* -------------------------------------------------------------- categories */

/**
 * Categories are data, not code paths. Adding one is a registry entry in
 * data/categories.ts; no screen special-cases any of them.
 */
export type CategoryId =
  | 'day_trip'
  | 'road_trip'
  | 'camping'
  | 'hiking'
  | 'offroad'
  | 'scenic_drive'
  | 'skiing'
  | 'mountains'
  | 'lakes'
  | 'parks'
  | 'lookouts'
  | 'food'
  | 'coffee'
  | 'breweries'
  | 'roadside'
  | 'towns'
  | 'vehicle_destinations'
  | 'history'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  blurb: string
}

/* ------------------------------------------------------------- regions */

/** A town that serves as the jumping-off point for an area. */
export interface Gateway extends Sourced {
  id: string
  name: string
  state: string
  lat: number
  lon: number
  /** Only services a source actually documents. Empty = not recorded. */
  services: Array<'fuel' | 'food' | 'lodging' | 'groceries' | 'ev_charging'>
}

export interface Region extends Sourced {
  id: string
  name: string
  state: string
  /** Parent grouping for browsing, e.g. "Utah". */
  stateName: string
  summary: string
  center: { lat: number; lon: number }
  zoom: number
  landManagers: string[]
  gatewayIds: string[]
  /** Where to check current conditions and closures. */
  conditionsUrl: string
  conditionsLabel: string
  notes: string[]
}

export interface Trailhead extends Sourced {
  id: string
  name: string
  lat: number
  lon: number
  elevationFt: Measure
  facilities: string | null
}

/**
 * A system of connected routes (the Paiute, the Swell's designated route
 * network). Distinct from any one adventure so more networks can be added
 * without inventing per-network code.
 */
export interface TrailNetwork extends Sourced {
  id: string
  name: string
  regionId: string
  summary: string
  mainRouteMiles: Measure
  mainRouteNote: string
  connectedMiles: Measure
  connectedNote: string
  accessCommunityIds: string[]
  trailheads: Trailhead[]
  vehicleRules: string[]
  widthLimitsIn: number[]
  season: SeasonWindow
  managers: string[]
}

/* ---------------------------------------------------- difficulty & access */

/**
 * TREAD's five-step difficulty summary. The label summarises; `wording`
 * quotes or paraphrases what the rating body actually said, and `ratedBy`
 * names them, so the summary never stands alone.
 */
export type DifficultyLevel =
  | 'easy'
  | 'moderate'
  | 'difficult'
  | 'very_difficult'
  | 'extreme'

export interface Difficulty extends Sourced {
  level: DifficultyLevel
  ratedBy: string
  wording: string
  basis: 'official' | 'community'
}

/**
 * The vehicle-relevant requirements of an adventure, as published. The
 * matching engine compares these against the capability model; it never
 * invents requirements that are not written here.
 */
export interface VehicleRequirements extends Sourced {
  access: VehicleRequirement
  /** Whether the publisher says required or merely recommended. */
  strength: 'required' | 'recommended'
  basis: 'official' | 'community'
  /** Published maximum vehicle width in inches, when a limit applies. */
  maxWidthIn: number | null
  /** Can ATVs/UTVs legally use it? null = not recorded. */
  ohvAllowed: boolean | null
  /** True when full-size, street-legal vehicles are not the intended users. */
  ohvOnly: boolean
  recommendedEquipment: EquipmentId[]
  /** Publisher says stock vehicles should not attempt it. */
  notForStock: boolean
  notes: string
  /** Conditions that change the answer, e.g. clay roads when wet. */
  conditional: string[]
}

export interface Fee extends Sourced {
  label: string
  /** Stored as text: fees change, and the check date matters more than a number. */
  amount: string
}

export type RouteShape =
  | 'loop'
  | 'out_and_back'
  | 'one_way'
  | 'point_to_point'
  | 'network'
  | 'destination'

export interface RouteSpec extends Sourced {
  miles: Measure
  milesNote: string
  shape: RouteShape
  /** Time on the route itself, hours, when published. */
  hours: Measure
  terrain: string[]
  obstacles: string[]
}

/* -------------------------------------------------------- places to go */

export type TrailShape = 'out_and_back' | 'loop' | 'point_to_point' | 'partly_off_trail' | 'unknown'
export type DogPolicy = 'leash' | 'under_control' | 'prohibited' | 'unknown'

export interface Parking extends Sourced {
  spaces: Measure
  notes: string | null
  fee: string | null
  finalApproach: VehicleRequirement
}

export interface Hike extends Sourced {
  id: string
  name: string
  trailNumber?: string
  shape: TrailShape
  miles: Measure
  gainFt: Measure
  trailheadFt: Measure
  highPointFt: Measure
  ratedDifficulty: string | null
  hazards: string[]
  wilderness: string | null
  dogs: DogPolicy
  permits: string | null
  parking: Parking
  season: SeasonWindow
  lat: number
  lon: number
}

export type CampKind = 'dispersed' | 'developed' | 'designated' | 'unknown'
export type ReservationPolicy = 'first_come' | 'reservable' | 'mixed' | 'none_required' | 'unknown'

export interface Camp extends Sourced {
  id: string
  name: string
  regionId: string
  kind: CampKind
  sites: Measure
  fee: string | null
  reservations: ReservationPolicy
  reservationUrl: string | null
  elevationFt: Measure
  access: VehicleRequirement
  /** Notes on fitting a vehicle, trailer, camper or rooftop tent. */
  vehicleFitNotes: string | null
  water: string | null
  season: SeasonWindow
  restrictions: string[]
  lat: number
  lon: number
}

export type FoodKind = 'brewery' | 'brewpub' | 'restaurant' | 'cafe' | 'coffee' | 'casual'

export interface FoodStop extends Sourced {
  id: string
  name: string
  regionId: string
  kind: FoodKind
  town: string
  address: string | null
  url: string | null
  phone: string | null
  /** Hours are volatile and never stored as fact -- this is a labelled note. */
  hoursNote: string | null
  /** Set when a place is known to have closed, so it is never re-suggested. */
  closed: string | null
  lat: number
  lon: number
}

export type StopKind =
  | 'scenic'
  | 'historic'
  | 'ghost_town'
  | 'mine'
  | 'geology'
  | 'overlook'
  | 'water'
  | 'photo'
  | 'town'
  | 'rock_art'
  | 'park'

export interface Stop extends Sourced {
  id: string
  name: string
  kind: StopKind
  dwellMinutes: number | null
  blurb: string
  lat: number
  lon: number
  elevationFt: Measure
}

/* ------------------------------------------------------------ adventures */

export type AdventureKind =
  | 'ohv_route'
  | 'scenic_drive'
  | 'destination'
  | 'hike'
  | 'network'
  | 'ski_area'

export interface Adventure extends Sourced {
  id: string
  name: string
  tagline: string
  kind: AdventureKind
  regionId: string
  networkId?: string
  categories: CategoryId[]
  /** The spot navigation hands off to (trailhead, overlook, entrance). */
  anchor: { lat: number; lon: number; label: string }
  /** The town you would normally set off from; never the user's home. */
  gatewayId: string
  /** Gateway -> anchor. Empty when the anchor is on the highway. */
  access: DriveSegment[]
  /** Optional different way back to the gateway. */
  returnVia?: DriveSegment[]
  route: RouteSpec | null
  difficulty: Difficulty | null
  requirements: VehicleRequirements
  fees: Fee[]
  permits: string | null
  landManager: string
  hikeIds: string[]
  stopIds: string[]
  campIds: string[]
  foodIds: string[]
  why: string
  highlights: string[]
  hazards: string[]
  season: SeasonWindow
  /** Where to verify access and closures before going. */
  conditionsUrl: string
}

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  difficult: 'Difficult',
  very_difficult: 'Very difficult',
  extreme: 'Extreme',
}

export const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'easy',
  'moderate',
  'difficult',
  'very_difficult',
  'extreme',
]

/**
 * Everything one region contributes. New regions (or states) are added by
 * writing a pack and listing it in data/index.ts -- nothing else changes.
 */
export interface RegionPack {
  region: Region
  gateways: Gateway[]
  adventures: Adventure[]
  networks: TrailNetwork[]
  hikes: Hike[]
  camps: Camp[]
  food: FoodStop[]
  stops: Stop[]
}
