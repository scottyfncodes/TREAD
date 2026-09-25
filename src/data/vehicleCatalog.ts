import type { Drivetrain, Powertrain, VehicleType } from '../domain/vehicle'

/**
 * A deliberately small make/model catalogue for fast Year -> Make -> Model
 * entry. It only records things that are true of the model line as a whole:
 * the body style, which drivetrains are offered, and powertrain family.
 *
 * It does NOT carry ground clearance, range or dimensions. Those vary by
 * year, trim, tire and options, and a wrong number here would quietly
 * corrupt every recommendation downstream. The user adds them if they know
 * them; otherwise TREAD says UNKNOWN.
 *
 * Anything not in the list can be typed freely.
 */
export interface CatalogModel {
  model: string
  type: VehicleType
  drivetrains: Drivetrain[]
  powertrains: Powertrain[]
  /** True only when every 4WD version of the line has a low-range transfer case. */
  lowRangeWith4wd?: boolean
}

export interface CatalogMake {
  make: string
  models: CatalogModel[]
}

const PT = '4wd_part_time' as const
const FT = '4wd_full_time' as const

export const VEHICLE_CATALOG: CatalogMake[] = [
  {
    make: 'Chevrolet',
    models: [
      { model: 'Colorado', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas'], lowRangeWith4wd: true },
      { model: 'Silverado 1500', type: 'pickup', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'diesel', 'ev'] },
      { model: 'Tahoe', type: 'suv', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'diesel'] },
      { model: 'Equinox', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'ev'] },
      { model: 'Bolt EUV', type: 'crossover', drivetrains: ['fwd'], powertrains: ['ev'] },
      { model: 'Corvette', type: 'sports_car', drivetrains: ['rwd', 'awd'], powertrains: ['gas', 'hybrid'] },
    ],
  },
  {
    make: 'Ford',
    models: [
      { model: 'Bronco', type: 'suv', drivetrains: [PT, FT], powertrains: ['gas'], lowRangeWith4wd: true },
      { model: 'Bronco Sport', type: 'crossover', drivetrains: ['awd'], powertrains: ['gas'] },
      { model: 'F-150', type: 'pickup', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'hybrid', 'diesel'], lowRangeWith4wd: true },
      { model: 'F-150 Lightning', type: 'pickup', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'Ranger', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas'], lowRangeWith4wd: true },
      { model: 'Explorer', type: 'suv', drivetrains: ['rwd', 'awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Maverick', type: 'pickup', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Mustang', type: 'sports_car', drivetrains: ['rwd'], powertrains: ['gas'] },
      { model: 'Mustang Mach-E', type: 'crossover', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'Transit', type: 'van', drivetrains: ['rwd', 'awd'], powertrains: ['gas', 'ev'] },
    ],
  },
  {
    make: 'GMC',
    models: [
      { model: 'Sierra 1500', type: 'pickup', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'diesel'] },
      { model: 'Canyon', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas'] },
      { model: 'Hummer EV', type: 'pickup', drivetrains: ['awd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Honda',
    models: [
      { model: 'CR-V', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Passport', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Pilot', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Ridgeline', type: 'pickup', drivetrains: ['awd'], powertrains: ['gas'] },
      { model: 'Civic', type: 'sedan', drivetrains: ['fwd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Odyssey', type: 'minivan', drivetrains: ['fwd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Hyundai',
    models: [
      { model: 'Santa Cruz', type: 'pickup', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Tucson', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid', 'phev'] },
      { model: 'Ioniq 5', type: 'crossover', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'Palisade', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Jeep',
    models: [
      { model: 'Wrangler', type: 'suv', drivetrains: [PT, FT], powertrains: ['gas', 'phev'], lowRangeWith4wd: true },
      { model: 'Gladiator', type: 'pickup', drivetrains: [PT, FT], powertrains: ['gas'], lowRangeWith4wd: true },
      { model: 'Grand Cherokee', type: 'suv', drivetrains: ['rwd', FT], powertrains: ['gas', 'phev'] },
      { model: 'Cherokee', type: 'crossover', drivetrains: ['fwd', FT], powertrains: ['gas'] },
      { model: 'Compass', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Kia',
    models: [
      { model: 'Telluride', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Sportage', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid', 'phev'] },
      { model: 'EV6', type: 'crossover', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'EV9', type: 'suv', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Land Rover',
    models: [
      { model: 'Defender', type: 'suv', drivetrains: [FT], powertrains: ['gas', 'phev'] },
      { model: 'Discovery', type: 'suv', drivetrains: [FT], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Mazda',
    models: [
      { model: 'CX-5', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'CX-50', type: 'crossover', drivetrains: ['awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'MX-5 Miata', type: 'sports_car', drivetrains: ['rwd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Mercedes-Benz',
    models: [
      { model: 'Sprinter', type: 'van', drivetrains: ['rwd', FT], powertrains: ['diesel', 'gas', 'ev'] },
      { model: 'G-Class', type: 'suv', drivetrains: [FT], powertrains: ['gas', 'ev'] },
    ],
  },
  {
    make: 'Nissan',
    models: [
      { model: 'Frontier', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas'], lowRangeWith4wd: true },
      { model: 'Pathfinder', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Rogue', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Leaf', type: 'hatchback', drivetrains: ['fwd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Porsche',
    models: [
      { model: '911', type: 'sports_car', drivetrains: ['rwd', 'awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Taycan', type: 'sports_car', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Ram',
    models: [
      { model: '1500', type: 'pickup', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'diesel'], lowRangeWith4wd: true },
      { model: '2500', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas', 'diesel'], lowRangeWith4wd: true },
      { model: 'ProMaster', type: 'van', drivetrains: ['fwd'], powertrains: ['gas', 'ev'] },
    ],
  },
  {
    make: 'Rivian',
    models: [
      { model: 'R1T', type: 'pickup', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'R1S', type: 'suv', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'R2', type: 'suv', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Subaru',
    models: [
      { model: 'Outback', type: 'wagon', drivetrains: ['awd'], powertrains: ['gas'] },
      { model: 'Forester', type: 'crossover', drivetrains: ['awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Crosstrek', type: 'crossover', drivetrains: ['awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Ascent', type: 'suv', drivetrains: ['awd'], powertrains: ['gas'] },
      { model: 'Solterra', type: 'crossover', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'WRX', type: 'sedan', drivetrains: ['awd'], powertrains: ['gas'] },
      { model: 'BRZ', type: 'sports_car', drivetrains: ['rwd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Tesla',
    models: [
      { model: 'Model 3', type: 'sedan', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'Model Y', type: 'crossover', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'Model S', type: 'sedan', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'Model X', type: 'suv', drivetrains: ['awd'], powertrains: ['ev'] },
      { model: 'Cybertruck', type: 'pickup', drivetrains: ['awd', 'rwd'], powertrains: ['ev'] },
    ],
  },
  {
    make: 'Toyota',
    models: [
      { model: '4Runner', type: 'suv', drivetrains: ['rwd', PT, FT], powertrains: ['gas', 'hybrid'], lowRangeWith4wd: true },
      { model: 'Tacoma', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas', 'hybrid'], lowRangeWith4wd: true },
      { model: 'Tundra', type: 'pickup', drivetrains: ['rwd', PT], powertrains: ['gas', 'hybrid'], lowRangeWith4wd: true },
      { model: 'Land Cruiser', type: 'suv', drivetrains: [FT], powertrains: ['hybrid', 'gas'], lowRangeWith4wd: true },
      { model: 'RAV4', type: 'crossover', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid', 'phev'] },
      { model: 'Highlander', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid'] },
      { model: 'Sienna', type: 'minivan', drivetrains: ['fwd', 'awd'], powertrains: ['hybrid'] },
      { model: 'GR86', type: 'sports_car', drivetrains: ['rwd'], powertrains: ['gas'] },
      { model: 'Camry', type: 'sedan', drivetrains: ['fwd', 'awd'], powertrains: ['gas', 'hybrid'] },
    ],
  },
  {
    make: 'Volkswagen',
    models: [
      { model: 'ID. Buzz', type: 'van', drivetrains: ['rwd', 'awd'], powertrains: ['ev'] },
      { model: 'Atlas', type: 'suv', drivetrains: ['fwd', 'awd'], powertrains: ['gas'] },
      { model: 'Golf R', type: 'hatchback', drivetrains: ['awd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Winnebago',
    models: [
      { model: 'Revel', type: 'camper_van', drivetrains: [FT], powertrains: ['diesel'] },
      { model: 'Solis', type: 'camper_van', drivetrains: ['fwd'], powertrains: ['gas'] },
    ],
  },
  {
    make: 'Polaris',
    models: [
      { model: 'RZR', type: 'utv', drivetrains: [PT], powertrains: ['gas'] },
      { model: 'Sportsman', type: 'atv', drivetrains: [PT], powertrains: ['gas'] },
      { model: 'Ranger', type: 'utv', drivetrains: [PT], powertrains: ['gas', 'ev'] },
    ],
  },
  {
    make: 'Can-Am',
    models: [
      { model: 'Maverick', type: 'utv', drivetrains: [PT], powertrains: ['gas'] },
      { model: 'Defender', type: 'utv', drivetrains: [PT], powertrains: ['gas'] },
      { model: 'Outlander', type: 'atv', drivetrains: [PT], powertrains: ['gas'] },
    ],
  },
]

export const MAKES = VEHICLE_CATALOG.map((m) => m.make)

export function modelsFor(make: string): CatalogModel[] {
  const hit = VEHICLE_CATALOG.find((m) => m.make.toLowerCase() === make.trim().toLowerCase())
  return hit ? hit.models : []
}

export function findCatalogModel(make: string, model: string): CatalogModel | null {
  return (
    modelsFor(make).find((m) => m.model.toLowerCase() === model.trim().toLowerCase()) ?? null
  )
}

/** Model years offered in the picker, newest first. Free entry is still allowed. */
export function yearOptions(now: Date = new Date()): number[] {
  const newest = now.getFullYear() + 1
  return Array.from({ length: 40 }, (_, i) => newest - i)
}
