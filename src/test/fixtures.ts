import type { VehicleProfile } from '../domain/vehicle'
import { blankVehicle } from '../domain/vehicle'
import type { Place } from '../domain/types'

/** Test vehicles. Specs here are test inputs, not claims about real models. */
export function vehicle(patch: Partial<VehicleProfile>): VehicleProfile {
  return { ...blankVehicle(1_700_000_000_000), id: `veh_${Math.random().toString(36).slice(2, 8)}`, year: 2024, make: 'Test', model: 'Vehicle', ...patch }
}

export const AWD_WAGON = () =>
  vehicle({ make: 'Subaru', model: 'Outback', type: 'wagon', drivetrain: 'awd', powertrain: 'gas', groundClearanceIn: 8.7, tireType: 'all_season', lockers: 'none', rangeMiles: 450 })

export const STOCK_4X4 = () =>
  vehicle({ make: 'Ford', model: 'Bronco', type: 'suv', drivetrain: '4wd_part_time', lowRange: true, powertrain: 'gas', groundClearanceIn: 8.3, tireType: 'all_terrain', lockers: 'none', rangeMiles: 350 })

export const BUILT_4X4 = () =>
  vehicle({
    make: 'Jeep',
    model: 'Wrangler',
    type: 'suv',
    drivetrain: '4wd_part_time',
    lowRange: true,
    powertrain: 'gas',
    groundClearanceIn: 12,
    tireType: 'mud_terrain',
    lockers: 'front_and_rear',
    rangeMiles: 300,
    equipment: ['winch', 'recovery_kit', 'full_size_spare', 'rock_sliders', 'skid_plates', 'air_compressor', 'traction_boards'],
  })

export const EV_CROSSOVER = () =>
  vehicle({ make: 'Tesla', model: 'Model Y', type: 'crossover', drivetrain: 'awd', powertrain: 'ev', groundClearanceIn: 6.6, tireType: 'all_season', rangeMiles: 300 })

export const SPORTS_CAR = () =>
  vehicle({ make: 'Mazda', model: 'MX-5 Miata', type: 'sports_car', drivetrain: 'rwd', powertrain: 'gas', groundClearanceIn: 5.3, tireType: 'performance' })

export const CAMPER_VAN = () =>
  vehicle({ make: 'Winnebago', model: 'Revel', type: 'camper_van', drivetrain: '4wd_full_time', powertrain: 'diesel', sleeps: 2 })

export const UTV_50 = () =>
  vehicle({ make: 'Polaris', model: 'Sportsman', type: 'atv', drivetrain: '4wd_part_time', powertrain: 'gas', widthIn: 48, groundClearanceIn: 11, streetLegal: false })

export const UTV_64 = () =>
  vehicle({ make: 'Can-Am', model: 'Maverick', type: 'utv', drivetrain: '4wd_part_time', powertrain: 'gas', widthIn: 64, groundClearanceIn: 14, streetLegal: false })

/** Minimum-entry vehicle: year/make/model only, nothing else known. */
export const BARE = () => vehicle({ make: 'Unknown', model: 'Car' })

export const DALLAS: Place = { id: 'pl_dallas', label: 'Dallas, TX', lat: 32.7767, lon: -96.797, origin: 'manual' }
export const MOAB_START: Place = { id: 'pl_moab', label: 'Moab, UT', lat: 38.5733, lon: -109.5498, origin: 'manual' }

export const SUMMER = '2026-07-15'
export const OCTOBER = '2026-10-10'
export const JANUARY = '2027-01-15'
