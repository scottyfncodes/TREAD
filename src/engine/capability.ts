import type { Basis } from '../domain/types'
import type { EquipmentId, Lockers, VehicleProfile } from '../domain/vehicle'

/**
 * The capability model: the ONE place that turns a vehicle profile into
 * statements about what the vehicle can do. Nothing else in TREAD reads
 * drivetrain or clearance directly -- screens and the matching engine ask
 * this module, so vehicle assumptions cannot leak across the codebase.
 *
 * Every capability carries its basis. A value the owner typed is `user`; a
 * value pre-filled from the model catalogue is `vehicle_spec`; a value that
 * follows logically from other facts (a FWD car has no low range) is
 * `estimate`; and `null` means TREAD does not know. It never guesses a
 * number to fill a gap.
 */

export interface Fact<T> {
  value: T | null
  basis: Basis | 'unknown'
  note?: string
}

/** TREAD's disclosed threshold for "high clearance". Shown in the UI. */
export const HIGH_CLEARANCE_IN = 8

/** Every full-size road vehicle is wider than this; used for OHV width limits. */
export const FULL_SIZE_MIN_WIDTH_IN = 60

export interface Capabilities {
  isOhv: boolean
  isFullSize: boolean
  isMotorcycle: boolean
  streetLegal: Fact<boolean>
  fourWd: Fact<boolean>
  awd: Fact<boolean>
  lowRange: Fact<boolean>
  clearanceIn: Fact<number>
  highClearance: Fact<boolean>
  offroadTires: Fact<boolean>
  lockers: Fact<Lockers>
  recovery: Fact<boolean>
  ev: boolean
  plugIn: boolean
  rangeMiles: Fact<number>
  widthIn: Fact<number>
  sleepsInVehicle: Fact<boolean>
  equipment: EquipmentId[]
}

function known<T>(value: T, basis: Basis, note?: string): Fact<T> {
  return { value, basis, note }
}

function unknown<T>(note?: string): Fact<T> {
  return { value: null, basis: 'unknown', note }
}

function fieldBasis(v: VehicleProfile, field: VehicleProfile['catalogFields'][number]): Basis {
  return v.catalogFields.includes(field) ? 'vehicle_spec' : 'user'
}

export function capabilitiesOf(v: VehicleProfile): Capabilities {
  const isOhv = v.type === 'atv' || v.type === 'utv'
  const isMotorcycle = v.type === 'motorcycle'
  const isFullSize = !isOhv && !isMotorcycle

  const streetLegal: Fact<boolean> =
    v.streetLegal !== null
      ? known(v.streetLegal, 'user')
      : isFullSize
        ? known(true, 'estimate', 'Assumed road-registered because it is a road vehicle type.')
        : unknown('Not entered. Many ATVs and UTVs are not street-legal.')

  const dt = v.drivetrain
  const fourWd: Fact<boolean> =
    dt === 'unknown'
      ? unknown('Drivetrain not entered.')
      : known(dt === '4wd_part_time' || dt === '4wd_full_time', fieldBasis(v, 'drivetrain'))
  const awd: Fact<boolean> =
    dt === 'unknown' ? unknown('Drivetrain not entered.') : known(dt === 'awd', fieldBasis(v, 'drivetrain'))

  let lowRange: Fact<boolean>
  if (fourWd.value === false) {
    lowRange = known(false, 'estimate', 'Low range comes with a 4WD transfer case; this drivetrain does not have one.')
  } else if (v.lowRange !== null) {
    lowRange = known(v.lowRange, fieldBasis(v, 'lowRange'))
  } else {
    lowRange = unknown('Low range not entered.')
  }

  const clearanceIn: Fact<number> =
    v.groundClearanceIn !== null ? known(v.groundClearanceIn, 'user') : unknown('Ground clearance not entered.')

  const highClearance: Fact<boolean> =
    clearanceIn.value === null
      ? unknown('Add ground clearance to check high-clearance routes.')
      : known(clearanceIn.value >= HIGH_CLEARANCE_IN, 'user', `TREAD treats ${HIGH_CLEARANCE_IN} in or more as high clearance.`)

  const offroadTires: Fact<boolean> =
    v.tireType === 'unknown'
      ? unknown('Tire type not entered.')
      : known(v.tireType === 'all_terrain' || v.tireType === 'mud_terrain', 'user')

  const lockers: Fact<Lockers> =
    v.lockers === 'unknown' ? unknown('Lockers not entered.') : known(v.lockers, 'user')

  const recoveryGear: EquipmentId[] = ['winch', 'recovery_kit', 'traction_boards']
  const hasRecovery = v.equipment.some((e) => recoveryGear.includes(e))
  const recovery: Fact<boolean> = hasRecovery
    ? known(true, 'user')
    : v.equipment.length > 0
      ? known(false, 'user')
      : unknown('No equipment entered.')

  const ev = v.powertrain === 'ev'
  const plugIn = ev || v.powertrain === 'phev'

  const rangeMiles: Fact<number> =
    v.rangeMiles !== null ? known(v.rangeMiles, 'user') : unknown('Range not entered.')

  const widthIn: Fact<number> =
    v.widthIn !== null ? known(v.widthIn, 'user') : unknown('Width not entered.')

  const sleepsInVehicle: Fact<boolean> =
    v.sleeps !== null
      ? known(v.sleeps > 0, 'user')
      : v.equipment.includes('rooftop_tent')
        ? known(true, 'user', 'Rooftop tent listed in equipment.')
        : v.type === 'camper_van' || v.type === 'rv'
          ? known(true, fieldBasis(v, 'type'), 'Vehicle type is built for sleeping in.')
          : unknown()

  return {
    isOhv,
    isFullSize,
    isMotorcycle,
    streetLegal,
    fourWd,
    awd,
    lowRange,
    clearanceIn,
    highClearance,
    offroadTires,
    lockers,
    recovery,
    ev,
    plugIn,
    rangeMiles,
    widthIn,
    sleepsInVehicle,
    equipment: v.equipment,
  }
}

/**
 * Whether the vehicle fits under a published width limit.
 * Full-size road vehicles are always wider than an OHV trail limit, which is
 * a physical fact rather than a guess, so that case is answered even when
 * the owner has not typed a width.
 */
export function fitsWidth(c: Capabilities, limitIn: number): Fact<boolean> {
  if (c.widthIn.value !== null) {
    return { value: c.widthIn.value <= limitIn, basis: 'user' }
  }
  if (c.isFullSize && limitIn <= FULL_SIZE_MIN_WIDTH_IN) {
    return {
      value: false,
      basis: 'estimate',
      note: `Full-size road vehicles are wider than ${FULL_SIZE_MIN_WIDTH_IN} inches.`,
    }
  }
  return { value: null, basis: 'unknown', note: 'Add the vehicle’s width to check width-limited trails.' }
}

/** Short, factual chips for a vehicle card. Only states what is known. */
export function capabilityChips(v: VehicleProfile): string[] {
  const c = capabilitiesOf(v)
  const chips: string[] = []
  if (c.fourWd.value) chips.push(c.lowRange.value ? '4WD + low range' : '4WD')
  else if (c.awd.value) chips.push('AWD')
  else if (v.drivetrain === 'fwd') chips.push('FWD')
  else if (v.drivetrain === 'rwd') chips.push('RWD')
  if (c.clearanceIn.value !== null) chips.push(`${c.clearanceIn.value} in clearance`)
  if (c.ev) chips.push('Electric')
  else if (v.powertrain === 'phev') chips.push('Plug-in hybrid')
  else if (v.powertrain === 'hybrid') chips.push('Hybrid')
  if (c.rangeMiles.value !== null) chips.push(`${c.rangeMiles.value} mi range`)
  if (c.offroadTires.value) chips.push(v.tireType === 'mud_terrain' ? 'M/T tires' : 'A/T tires')
  if (c.lockers.value === 'rear') chips.push('Rear locker')
  if (c.lockers.value === 'front_and_rear') chips.push('Front & rear lockers')
  if (v.equipment.includes('winch')) chips.push('Winch')
  if (c.sleepsInVehicle.value) chips.push(v.sleeps ? `Sleeps ${v.sleeps}` : 'Sleeps in vehicle')
  if (c.isOhv) chips.push('OHV')
  return chips
}

/** How much of the optional profile is filled in, for a gentle nudge. */
export function profileCompleteness(v: VehicleProfile): { filled: number; total: number; missing: string[] } {
  const checks: Array<[string, boolean]> = [
    ['Drivetrain', v.drivetrain !== 'unknown'],
    ['Low range', v.lowRange !== null || (v.drivetrain !== '4wd_part_time' && v.drivetrain !== '4wd_full_time' && v.drivetrain !== 'unknown')],
    ['Ground clearance', v.groundClearanceIn !== null],
    ['Tires', v.tireType !== 'unknown'],
    ['Range', v.rangeMiles !== null],
    ['Width', v.widthIn !== null],
    ['Equipment', v.equipment.length > 0],
  ]
  return {
    filled: checks.filter(([, ok]) => ok).length,
    total: checks.length,
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  }
}
