import type { Adventure } from '../domain/adventure'
import type { VehicleProfile } from '../domain/vehicle'
import { capabilitiesOf } from './capability'

/**
 * Vehicle prep: "is my vehicle ready for the thing I want to do?"
 * A short pre-trip checklist built from the vehicle and, when given, the
 * adventure. Not a maintenance schedule -- TREAD does not know service
 * intervals for every vehicle and does not pretend to.
 */

export interface PrepItem {
  id: string
  label: string
  why?: string
}

export function preTripChecklist(vehicle: VehicleProfile, adventure: Adventure | null = null): PrepItem[] {
  const cap = capabilitiesOf(vehicle)
  const items: PrepItem[] = [
    { id: 'tires', label: 'Tire pressure and tread checked, spare inflated' },
    { id: 'fluids', label: 'Fluids and warning lights checked' },
    { id: 'lights', label: 'Lights working' },
  ]
  items.unshift(
    cap.ev
      ? { id: 'charge', label: 'Charged, with a charging plan for the route', why: 'Rough roads, cold and climbing all use more energy.' }
      : { id: 'fuel', label: 'Full tank before leaving the last town' },
  )
  const access = adventure?.requirements.access
  if (cap.fourWd.value && (access === 'four_wd' || access === 'four_wd_low_range' || access === 'modified_4x4')) {
    items.push({ id: '4wd', label: 'Engage 4WD (and low range) once before you need it' })
  }
  if (access && access !== 'any_vehicle') {
    items.push({ id: 'airdown', label: 'Know your air-down and air-up pressures' })
    items.push({ id: 'recovery', label: 'Recovery gear packed and reachable' })
  }
  if (adventure?.networkId || adventure?.kind === 'ohv_route') {
    items.push({ id: 'map', label: 'Current land-manager route map downloaded for offline use' })
  }
  if (cap.isOhv) {
    items.push({ id: 'ohv_reg', label: 'OHV registration or non-resident permit with you' })
  }
  if (vehicle.equipment.includes('rooftop_tent')) {
    items.push({ id: 'rtt', label: 'Rooftop tent mounts and hardware checked' })
  }
  return items
}

/** Most recent maintenance entry of a kind, for the garage summary. */
export function lastService(vehicle: VehicleProfile, kind: VehicleProfile['maintenance'][number]['kind']) {
  return [...vehicle.maintenance].filter((m) => m.kind === kind).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
}
