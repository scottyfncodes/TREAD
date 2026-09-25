import type { Adventure } from '../domain/adventure'
import type { GearGroup, GearItem } from '../domain/trip'
import type { EquipmentId, VehicleProfile } from '../domain/vehicle'
import { capabilitiesOf } from './capability'
import { high } from './measure'
import type { Itinerary } from './itinerary'

/**
 * Trip-specific packing, derived from what the plan actually involves, the
 * vehicle, and what the user already owns. If the day does not need it,
 * it does not appear.
 */

export interface PackItem {
  id: string
  label: string
  note?: string
  /** Satisfied by vehicle equipment with this id. */
  equipment?: EquipmentId
}

export interface PackSection {
  title: string
  reason: string
  items: Array<PackItem & { owned: boolean }>
}

/** The starter library users tick in the garage. Custom items can be added too. */
export const GEAR_LIBRARY: GearItem[] = [
  { id: 'recovery_strap', label: 'Recovery strap & soft shackles', group: 'recovery' },
  { id: 'traction_boards', label: 'Traction boards', group: 'recovery' },
  { id: 'shovel', label: 'Shovel', group: 'recovery' },
  { id: 'tire_plug', label: 'Tire plug kit', group: 'vehicle' },
  { id: 'compressor', label: 'Air compressor & gauge', group: 'vehicle' },
  { id: 'jump_starter', label: 'Jump starter', group: 'vehicle' },
  { id: 'ev_cable', label: 'EV charging cable & adapters', group: 'vehicle' },
  { id: 'tent', label: 'Tent', group: 'camping' },
  { id: 'sleeping_bag', label: 'Sleeping bags', group: 'camping' },
  { id: 'stove', label: 'Stove & fuel', group: 'camping' },
  { id: 'camp_light', label: 'Camp lighting', group: 'camping' },
  { id: 'water_jugs', label: 'Extra water containers', group: 'safety' },
  { id: 'first_aid', label: 'First aid kit', group: 'safety' },
  { id: 'sat_messenger', label: 'Satellite messenger / PLB', group: 'safety' },
  { id: 'offline_maps', label: 'Offline maps downloaded', group: 'safety' },
  { id: 'headlamp', label: 'Headlamps', group: 'hiking' },
  { id: 'daypack', label: 'Daypack & water bottles', group: 'hiking' },
  { id: 'rain_shell', label: 'Rain / wind shell', group: 'hiking' },
  { id: 'chains', label: 'Snow chains or socks', group: 'winter' },
  { id: 'ice_scraper', label: 'Ice scraper & warm layers', group: 'winter' },
]

export const GEAR_GROUP_LABEL: Record<GearGroup, string> = {
  recovery: 'Recovery',
  camping: 'Camping',
  hiking: 'Hiking',
  safety: 'Safety',
  vehicle: 'Vehicle',
  winter: 'Winter',
  other: 'Other',
}

const HIKE: PackItem[] = [
  { id: 'daypack', label: 'Daypack & water', note: 'Dry air costs more water than you think' },
  { id: 'rain_shell', label: 'Wind or rain shell and a warm layer' },
  { id: 'first_aid', label: 'First aid kit' },
  { id: 'headlamp', label: 'Headlamp' },
  { id: 'offline_maps', label: 'Offline map downloaded' },
]

const OFFROAD: PackItem[] = [
  { id: 'recovery_strap', label: 'Recovery strap & soft shackles', equipment: 'recovery_kit' },
  { id: 'traction_boards', label: 'Traction boards', equipment: 'traction_boards' },
  { id: 'compressor', label: 'Compressor & gauge', note: 'Air down for the dirt, air up for the pavement', equipment: 'air_compressor' },
  { id: 'spare', label: 'Full-size spare & jack', equipment: 'full_size_spare' },
  { id: 'tire_plug', label: 'Tire plug kit' },
  { id: 'water_jugs', label: 'Extra water in the vehicle' },
]

const TECHNICAL: PackItem[] = [
  { id: 'winch', label: 'Winch or a group with one', equipment: 'winch' },
  { id: 'shovel', label: 'Shovel' },
]

const REMOTE: PackItem[] = [
  { id: 'sat_messenger', label: 'Satellite messenger or PLB', note: 'Assume no cell service', equipment: 'sat_communicator' },
  { id: 'plan', label: 'Leave your plan and a turnaround time with someone' },
]

const EV: PackItem[] = [
  { id: 'ev_cable', label: 'Charging cable & adapters', equipment: 'portable_charger' },
  { id: 'charge_plan', label: 'Charging stops checked on the AFDC station locator' },
]

const WINTER: PackItem[] = [
  { id: 'chains', label: 'Snow chains or socks', equipment: 'snow_chains' },
  { id: 'ice_scraper', label: 'Ice scraper & warm layers' },
]

function campItems(vehicle: VehicleProfile | null): PackItem[] {
  const sleeps = vehicle ? capabilitiesOf(vehicle).sleepsInVehicle.value : null
  return [
    sleeps
      ? { id: 'vehicle_bed', label: 'Vehicle bed or rooftop tent set up and levelling blocks' }
      : { id: 'tent', label: 'Tent' },
    { id: 'sleeping_bag', label: 'Sleeping bags rated for the overnight low' },
    { id: 'stove', label: 'Stove, fuel & water' },
    { id: 'camp_light', label: 'Camp lighting' },
    { id: 'wag', label: 'Trowel or waste bags, per land-manager rules' },
  ]
}

export function buildPackList(
  itinerary: Itinerary,
  adventure: Adventure,
  vehicle: VehicleProfile | null,
  ownedGearIds: string[],
): PackSection[] {
  const owned = new Set(ownedGearIds)
  const equipment = new Set(vehicle?.equipment ?? [])
  const mark = (items: PackItem[]) =>
    items.map((i) => ({ ...i, owned: owned.has(i.id) || (i.equipment !== undefined && equipment.has(i.equipment)) }))

  const sections: PackSection[] = []
  const access = adventure.requirements.access
  const offroad = access === 'four_wd' || access === 'four_wd_low_range' || access === 'modified_4x4' || access === 'high_clearance'
  const technical = access === 'four_wd_low_range' || access === 'modified_4x4'

  if (itinerary.hikeId) {
    sections.push({ title: 'Hiking', reason: `About ${Math.max(1, Math.round(itinerary.hikeMinutes / 60))} hours on foot`, items: mark(HIKE) })
  }
  if (offroad) {
    sections.push({ title: 'Off-road', reason: 'Part of this adventure is on rough or 4WD roads', items: mark(OFFROAD) })
  }
  if (technical) {
    sections.push({ title: 'Technical terrain', reason: 'The route is published as needing low range or a modified 4x4', items: mark(TECHNICAL) })
  }
  if (itinerary.overnight) {
    sections.push({ title: 'Overnight', reason: 'You are sleeping out', items: mark(campItems(vehicle)) })
  }
  if (vehicle && capabilitiesOf(vehicle).plugIn) {
    sections.push({ title: 'Charging', reason: 'Plug-in vehicle', items: mark(EV) })
  }
  if (adventure.categories.includes('skiing')) {
    sections.push({ title: 'Winter driving', reason: 'Mountain roads in snow season', items: mark(WINTER) })
  }
  const elevation = high(itinerary.maxElevationFt) ?? 0
  if (technical || itinerary.overnight || elevation >= 12000 || adventure.kind === 'network') {
    sections.push({ title: 'Out of contact', reason: 'Far enough out that help is slow', items: mark(REMOTE) })
  }
  return sections
}

export function packProgress(sections: PackSection[], packed: string[]): { done: number; total: number } {
  const ids = sections.flatMap((s) => s.items.map((i) => `${s.title}:${i.id}`))
  return { done: ids.filter((id) => packed.includes(id)).length, total: ids.length }
}
