import type { Place } from '../domain/types'
import type { Adventure } from '../domain/adventure'
import { newTripId, type Trip } from '../domain/trip'
import type { VehicleProfile } from '../domain/vehicle'
import { ADVENTURES_BY_ID, GATEWAYS_BY_ID, NETWORKS_BY_ID } from '../data'
import { estimateTransit, type LatLon } from './geo'
import { assessVehicle, type VehicleAssessment } from './matching'
import { capabilitiesOf } from './capability'
import { roundTripFromGateway } from './itinerary'

/**
 * Multi-stop trip summary: start -> stop -> stop -> (back to start).
 *
 * Leg distances are straight-line-based estimates and labelled so; TREAD
 * does not route. Range checks compare each leg with the vehicle's entered
 * range, which is enough to flag "you will need to refuel / recharge
 * between these two" without pretending to know where the stations are.
 */

export interface TripLeg {
  fromLabel: string
  toLabel: string
  miles: number
  minutes: number
  estimated: true
  /** Leg is longer than 80% of the vehicle's entered range. */
  exceedsRange: boolean
}

export interface TripStopSummary {
  adventure: Adventure
  day: number
  assessment: VehicleAssessment
}

export interface TripSummary {
  legs: TripLeg[]
  stops: TripStopSummary[]
  totalMiles: number
  totalDriveMinutes: number
  hasStart: boolean
  /** Adventures whose fit is "beyond" for the chosen vehicle. */
  beyondCount: number
  rangeWarnings: string[]
}

function pointFor(adventure: Adventure): LatLon & { label: string } {
  const gateway = GATEWAYS_BY_ID[adventure.gatewayId]
  // Legs between adventures run gateway to gateway; the last-mile access
  // roads are covered by each adventure's own plan.
  return gateway
    ? { lat: gateway.lat, lon: gateway.lon, label: `${gateway.name}, ${gateway.state}` }
    : { lat: adventure.anchor.lat, lon: adventure.anchor.lon, label: adventure.anchor.label }
}

export function summarizeTrip(trip: Trip, vehicle: VehicleProfile | null): TripSummary {
  const stops = [...trip.stops]
    .sort((a, b) => a.day - b.day)
    .map((s) => ({ stop: s, adventure: ADVENTURES_BY_ID[s.adventureId] }))
    .filter((s): s is { stop: Trip['stops'][number]; adventure: Adventure } => Boolean(s.adventure))

  const range = vehicle ? capabilitiesOf(vehicle).rangeMiles.value : null
  const usable = range !== null ? range * 0.8 : null

  const points: Array<LatLon & { label: string }> = []
  if (trip.start) points.push({ lat: trip.start.lat, lon: trip.start.lon, label: trip.start.label })
  for (const { adventure } of stops) {
    const p = pointFor(adventure)
    const last = points[points.length - 1]
    if (!last || last.label !== p.label) points.push(p)
  }
  if (trip.start && trip.returnToStart && points.length > 1) {
    points.push({ lat: trip.start.lat, lon: trip.start.lon, label: trip.start.label })
  }

  const legs: TripLeg[] = []
  for (let i = 1; i < points.length; i += 1) {
    const t = estimateTransit(points[i - 1], points[i])
    if (t.roadMiles === 0) continue
    legs.push({
      fromLabel: points[i - 1].label,
      toLabel: points[i].label,
      miles: t.roadMiles,
      minutes: t.minutes,
      estimated: true,
      exceedsRange: usable !== null && t.roadMiles > usable,
    })
  }

  const assessed: TripStopSummary[] = stops.map(({ stop, adventure }) => ({
    adventure,
    day: stop.day,
    assessment: assessVehicle(vehicle, adventure, {
      network: adventure.networkId ? (NETWORKS_BY_ID[adventure.networkId] ?? null) : null,
      roundTripMiles: roundTripFromGateway(adventure),
    }),
  }))

  const rangeWarnings = legs
    .filter((l) => l.exceedsRange)
    .map(
      (l) =>
        `${l.fromLabel} → ${l.toLabel} is about ${l.miles} mi (est.), more than 80% of the ${range} mi range entered for this vehicle. Plan a ${vehicle && capabilitiesOf(vehicle).ev ? 'charging' : 'fuel'} stop.`,
    )

  return {
    legs,
    stops: assessed,
    totalMiles: legs.reduce((s, l) => s + l.miles, 0),
    totalDriveMinutes: legs.reduce((s, l) => s + l.minutes, 0),
    hasStart: trip.start !== null,
    beyondCount: assessed.filter((s) => s.assessment.status === 'beyond').length,
    rangeWarnings,
  }
}

export function blankTrip(opts: { date: string; start: Place | null; vehicleId: string | null; now?: number }): Trip {
  const now = opts.now ?? Date.now()
  return {
    id: newTripId(now),
    name: '',
    start: opts.start,
    returnToStart: true,
    vehicleId: opts.vehicleId,
    date: opts.date,
    days: 1,
    departMinutes: 8 * 60,
    stops: [],
    overnight: false,
    packed: [],
    confirmed: false,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

/** A sensible default name built from the stops, only used when the user leaves it blank. */
export function suggestedTripName(trip: Trip): string {
  const names = trip.stops.map((s) => ADVENTURES_BY_ID[s.adventureId]?.name).filter(Boolean) as string[]
  if (names.length === 0) return 'New trip'
  if (names.length === 1) return names[0]
  return `${names[0]} + ${names.length - 1} more`
}
