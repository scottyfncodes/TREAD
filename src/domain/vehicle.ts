/**
 * Vehicle profiles.
 *
 * Only year / make / model / trim / type / drivetrain are needed to get
 * going. Everything else is optional and `null` means "not entered" -- it is
 * never back-filled with a guess. The capability model (engine/capability.ts)
 * is the only place that interprets these fields.
 */

export type VehicleType =
  | 'sedan'
  | 'hatchback'
  | 'wagon'
  | 'crossover'
  | 'suv'
  | 'pickup'
  | 'minivan'
  | 'van'
  | 'camper_van'
  | 'rv'
  | 'sports_car'
  | 'motorcycle'
  | 'utv'
  | 'atv'
  | 'other'

export type Drivetrain =
  | 'fwd'
  | 'rwd'
  | 'awd'
  | '4wd_part_time'
  | '4wd_full_time'
  | 'unknown'

export type Powertrain = 'gas' | 'diesel' | 'hybrid' | 'phev' | 'ev' | 'unknown'

export type TireType =
  | 'highway'
  | 'all_season'
  | 'performance'
  | 'winter'
  | 'all_terrain'
  | 'mud_terrain'
  | 'unknown'

export type Lockers = 'none' | 'rear' | 'front_and_rear' | 'unknown'

/** Equipment the vehicle carries or has fitted. Extensible by design. */
export type EquipmentId =
  | 'roof_rack'
  | 'hitch'
  | 'rooftop_tent'
  | 'winch'
  | 'recovery_kit'
  | 'traction_boards'
  | 'air_compressor'
  | 'full_size_spare'
  | 'skid_plates'
  | 'rock_sliders'
  | 'lift_kit'
  | 'sat_communicator'
  | 'extra_fuel'
  | 'portable_charger'
  | 'fridge'
  | 'bike_rack'
  | 'ski_rack'
  | 'snow_chains'

export interface MaintenanceEntry {
  id: string
  date: string
  kind: 'oil' | 'tires' | 'brakes' | 'fluids' | 'inspection' | 'battery' | 'other'
  miles: number | null
  note: string
}

export type CatalogField = 'type' | 'drivetrain' | 'powertrain' | 'lowRange'

export interface VehicleProfile {
  id: string
  /** Optional friendly name, e.g. "The wagon". */
  nickname: string
  year: number | null
  make: string
  model: string
  trim: string
  type: VehicleType
  drivetrain: Drivetrain
  /** Transfer case with a low range. `null` = not entered. */
  lowRange: boolean | null
  powertrain: Powertrain

  /* ---- optional, progressive-disclosure fields ---- */
  groundClearanceIn: number | null
  /** Overall width, inches -- matters on width-limited OHV trails. */
  widthIn: number | null
  tireSize: string
  tireType: TireType
  lockers: Lockers
  /** Full-tank or full-charge range, miles, as the owner knows it. */
  rangeMiles: number | null
  fuelCapacityGal: number | null
  cargoCuFt: number | null
  /** People who can sleep in or on the vehicle (camper, rooftop tent). */
  sleeps: number | null
  /** Registered and legal on public highways. OHVs often are not. */
  streetLegal: boolean | null
  equipment: EquipmentId[]
  notes: string

  /* ---- prep ---- */
  odometer: number | null
  /** Last known fuel or charge level, 0-100. User-entered, never assumed. */
  energyPct: number | null
  energyUpdatedAt: number | null
  maintenance: MaintenanceEntry[]

  /**
   * Fields that were pre-filled from the model catalogue and not changed
   * since. Lets the UI say "typical for this model -- confirm" instead of
   * presenting a suggestion as the owner's own fact.
   */
  catalogFields: CatalogField[]

  createdAt: number
  updatedAt: number
}

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  wagon: 'Wagon',
  crossover: 'Crossover',
  suv: 'SUV',
  pickup: 'Pickup',
  minivan: 'Minivan',
  van: 'Van',
  camper_van: 'Camper van',
  rv: 'RV / motorhome',
  sports_car: 'Sports car',
  motorcycle: 'Motorcycle',
  utv: 'UTV / side-by-side',
  atv: 'ATV',
  other: 'Other',
}

export const DRIVETRAIN_LABEL: Record<Drivetrain, string> = {
  fwd: 'FWD',
  rwd: 'RWD',
  awd: 'AWD',
  '4wd_part_time': '4WD (part-time)',
  '4wd_full_time': '4WD (full-time)',
  unknown: 'Not sure',
}

export const POWERTRAIN_LABEL: Record<Powertrain, string> = {
  gas: 'Gas',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  phev: 'Plug-in hybrid',
  ev: 'Electric',
  unknown: 'Not sure',
}

export const TIRE_LABEL: Record<TireType, string> = {
  highway: 'Highway',
  all_season: 'All-season',
  performance: 'Performance',
  winter: 'Winter',
  all_terrain: 'All-terrain',
  mud_terrain: 'Mud-terrain',
  unknown: 'Not sure',
}

export const LOCKERS_LABEL: Record<Lockers, string> = {
  none: 'None',
  rear: 'Rear',
  front_and_rear: 'Front & rear',
  unknown: 'Not sure',
}

export const EQUIPMENT_LABEL: Record<EquipmentId, string> = {
  roof_rack: 'Roof rack',
  hitch: 'Hitch',
  rooftop_tent: 'Rooftop tent',
  winch: 'Winch',
  recovery_kit: 'Recovery kit (strap, shackles)',
  traction_boards: 'Traction boards',
  air_compressor: 'Air compressor',
  full_size_spare: 'Full-size spare',
  skid_plates: 'Skid plates',
  rock_sliders: 'Rock sliders',
  lift_kit: 'Lift kit',
  sat_communicator: 'Satellite messenger / PLB',
  extra_fuel: 'Extra fuel',
  portable_charger: 'Portable EV charger',
  fridge: 'Fridge / cooler',
  bike_rack: 'Bike rack',
  ski_rack: 'Ski / board rack',
  snow_chains: 'Snow chains / socks',
}

export const EQUIPMENT_IDS = Object.keys(EQUIPMENT_LABEL) as EquipmentId[]

/** "2024 Subaru Outback Wilderness", or the nickname when there is one. */
export function vehicleTitle(v: Pick<VehicleProfile, 'year' | 'make' | 'model' | 'trim'>): string {
  return [v.year ?? '', v.make, v.model, v.trim].filter((p) => String(p).trim()).join(' ')
}

export function vehicleName(v: VehicleProfile): string {
  return v.nickname.trim() || vehicleTitle(v)
}

export function newVehicleId(now: number = Date.now()): string {
  return `veh_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/** The minimum a user must supply; everything else starts as "not entered". */
export function blankVehicle(now: number = Date.now()): VehicleProfile {
  return {
    id: newVehicleId(now),
    nickname: '',
    year: null,
    make: '',
    model: '',
    trim: '',
    type: 'other',
    drivetrain: 'unknown',
    lowRange: null,
    powertrain: 'unknown',
    groundClearanceIn: null,
    widthIn: null,
    tireSize: '',
    tireType: 'unknown',
    lockers: 'unknown',
    rangeMiles: null,
    fuelCapacityGal: null,
    cargoCuFt: null,
    sleeps: null,
    streetLegal: null,
    equipment: [],
    notes: '',
    odometer: null,
    energyPct: null,
    energyUpdatedAt: null,
    maintenance: [],
    catalogFields: [],
    createdAt: now,
    updatedAt: now,
  }
}

/** Minimum viable profile: year, make and model. */
export function isVehicleComplete(v: VehicleProfile): boolean {
  return v.year !== null && v.make.trim() !== '' && v.model.trim() !== ''
}
