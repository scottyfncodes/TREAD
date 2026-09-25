import type { Place } from '../domain/types'
import type { Adventure, CategoryId, FoodStop } from '../domain/adventure'
import type { Preferences } from '../domain/trip'
import type { VehicleProfile } from '../domain/vehicle'
import { ADVENTURES, FOOD, GATEWAYS_BY_ID, NETWORKS_BY_ID } from '../data'
import { assessVehicle, fitRank, type VehicleAssessment } from './matching'
import { estimateTransit } from './geo'
import { seasonVerdict, type SeasonVerdict } from './season'
import { roundTripFromGateway } from './itinerary'

/**
 * Vehicle-aware discovery.
 *
 * Ranking uses facts, not opinions about vehicles: how well the selected
 * vehicle matches the published requirements, whether it is in season,
 * how far it is from the start the USER chose, and whether it matches the
 * categories they asked for. There is no table of "good" or "bad" vehicles.
 *
 * Routes that do not suit the vehicle are pushed down and labelled rather
 * than hidden -- the user may be planning for a different vehicle, or be
 * curious what it would take.
 */

export interface DiscoveryInput {
  vehicle: VehicleProfile | null
  start: Place | null
  date: string
  categories?: CategoryId[]
  regionId?: string | null
  preferences?: Preferences
  /** When true, only show adventures the vehicle appears suited to. */
  suitedOnly?: boolean
}

export interface Discovered {
  adventure: Adventure
  assessment: VehicleAssessment
  season: SeasonVerdict
  /** Estimated one-way transit from the user's start to the gateway; null with no start. */
  transitMinutes: number | null
  transitMiles: number | null
  score: number
  reasons: string[]
}

export function discover(input: DiscoveryInput): Discovered[] {
  const { vehicle, start, date, categories = [], regionId = null, preferences, suitedOnly = false } = input

  const results = ADVENTURES.filter((a) => !regionId || a.regionId === regionId)
    .filter((a) => categories.length === 0 || a.categories.some((c) => categories.includes(c)))
    .map((adventure) => {
      const network = adventure.networkId ? (NETWORKS_BY_ID[adventure.networkId] ?? null) : null
      const assessment = assessVehicle(vehicle, adventure, { network, roundTripMiles: roundTripFromGateway(adventure) })
      const season = seasonVerdict(adventure.season, date)
      const gateway = GATEWAYS_BY_ID[adventure.gatewayId]
      const transit = start && gateway ? estimateTransit(start, gateway) : null

      const reasons: string[] = []
      let score = 100 - fitRank(assessment.status) * 18

      if (season === 'in_season') score += 8
      else if (season === 'shoulder') {
        score -= 6
        reasons.push('Edge of the usual season')
      } else if (season === 'out_of_season') {
        score -= 40
        reasons.push('Usually out of season on this date')
      }

      if (transit) {
        const limit = preferences?.maxDriveMinutes ?? 180
        if (transit.minutes <= limit) {
          score += 10
          reasons.push(transit.minutes === 0 ? 'Starts right where you are' : 'Within your driving range')
        } else {
          // Far from the start is fine for a road trip, but should not
          // outrank something close when the user is planning a day.
          score -= Math.min(30, (transit.minutes - limit) / 20)
        }
      }

      const wanted = new Set(preferences?.interests ?? [])
      const overlap = adventure.categories.filter((c) => wanted.has(c))
      score += overlap.length * 4

      if (assessment.status === 'compatible') reasons.unshift('Fits your vehicle’s known setup')

      return {
        adventure,
        assessment,
        season,
        transitMinutes: transit ? transit.minutes : null,
        transitMiles: transit ? transit.roadMiles : null,
        score,
        reasons,
      }
    })
    .filter((d) => !suitedOnly || d.assessment.status === 'compatible' || d.assessment.status === 'considerations')

  return results.sort((a, b) => b.score - a.score || a.adventure.name.localeCompare(b.adventure.name))
}

/** Food, coffee and brewery stops, optionally near the start. Closed places are excluded. */
export function discoverFood(kind: 'food' | 'coffee' | 'breweries', regionId: string | null = null): FoodStop[] {
  const kinds: FoodStop['kind'][] =
    kind === 'coffee' ? ['coffee', 'cafe'] : kind === 'breweries' ? ['brewery', 'brewpub'] : ['restaurant', 'casual', 'brewpub', 'cafe']
  return FOOD.filter((f) => f.closed === null && kinds.includes(f.kind) && (!regionId || f.regionId === regionId))
}

/**
 * "What can I do with the vehicle I have?" -- the vehicle-first summary.
 * Counts adventures by fit, so different vehicles genuinely see different
 * answers without any hand-written per-vehicle rules.
 */
export function vehicleSummary(vehicle: VehicleProfile, date: string) {
  const all = discover({ vehicle, start: null, date })
  const count = (s: string) => all.filter((d) => d.assessment.status === s).length
  return {
    compatible: count('compatible'),
    considerations: count('considerations'),
    beyond: count('beyond'),
    unknown: count('unknown'),
    total: all.length,
    topPicks: all.filter((d) => d.assessment.status === 'compatible').slice(0, 3),
  }
}
