import type { DriveSegment, Measure, Place, VehicleRequirement, Warning } from '../domain/types'
import type { Adventure, Camp, FoodStop, Gateway, Hike, Stop } from '../domain/adventure'
import type { Preferences } from '../domain/trip'
import { CAMPS_BY_ID, FOOD_BY_ID, GATEWAYS_BY_ID, HIKES_BY_ID, STOPS_BY_ID } from '../data'
import { estimateDrive, hardestVehicle, ROAD_CLASS_LABEL, VEHICLE_LABEL, worstCaseMinutes } from './drive'
import { estimateHike } from './hike'
import { classifyDepth, type AdventureDepth } from './depth'
import { seasonWarnings } from './season'
import { addMeasures, formatMeasure, high, low, maxMeasure, mid, sumMeasures } from './measure'
import { formatClock, formatDuration, MINUTES_PER_DAY } from './time'
import { estimateTransit } from './geo'

/**
 * Turns an adventure plus the day's settings into a timed plan.
 *
 * Generalised from a single fixed home: the plan starts wherever the USER
 * said they start. With no start location, it starts at the adventure's
 * gateway town and says so -- it never fills in a start on its own.
 *
 * Durations come from disclosed models and every modelled leg is flagged
 * `estimated`. Legs with no sourced distance are counted, never invented.
 */

export const TRAILHEAD_BUFFER_MINUTES = 15
export const CAMP_SETUP_MINUTES = 45

export const FOOD_MINUTES: Record<Preferences['food'], number> = {
  none: 0,
  coffee: 25,
  lunch: 60,
  brewery: 75,
  dinner: 90,
}

export type LegKind = 'depart' | 'transit' | 'drive' | 'stop' | 'hike' | 'food' | 'camp' | 'arrive'

export interface ItineraryLeg {
  kind: LegKind
  title: string
  detail: string
  startMinutes: number
  endMinutes: number
  refId?: string
  vehicle?: VehicleRequirement
  estimated: boolean
}

export interface DayPlanSettings {
  date: string
  departMinutes: number
  /** Target return time; null for no target. */
  backByMinutes: number | null
  hikeAppetite: Preferences['hikeAppetite']
  food: Preferences['food']
  maxDriveMinutes: number
  paceMph: number
}

export interface Itinerary {
  adventureId: string
  date: string
  startLabel: string
  /** True when the user supplied a start; false means "starts at the gateway". */
  hasStart: boolean
  legs: ItineraryLeg[]
  departMinutes: number
  endMinutes: number
  transitMinutes: number
  transitMiles: number
  /** One-way start -> gateway road miles (est.); 0 with no start. */
  transitOneWayMiles: number
  driveMinutes: number
  hikeMinutes: number
  totalMinutes: number
  /** Gateway <-> adventure road miles (sourced where available). */
  accessMiles: Measure
  hikeMiles: Measure
  gainFt: Measure
  maxElevationFt: Measure
  depth: AdventureDepth
  vehicle: VehicleRequirement
  overnight: boolean
  unmeasuredLegs: number
  warnings: Warning[]
  hikeId: string | null
  foodId: string | null
  campId: string | null
}

export interface BuildOptions {
  adventure: Adventure
  start: Place | null
  settings: DayPlanSettings
  hikeId?: string | null
  foodId?: string | null
  campId?: string | null
  daylight?: { sunrise: number; sunset: number } | null
  overnight?: boolean
}

interface Cursor {
  at: number
  legs: ItineraryLeg[]
}

function push(cursor: Cursor, leg: Omit<ItineraryLeg, 'startMinutes' | 'endMinutes'> & { minutes: number }) {
  const { minutes, ...rest } = leg
  cursor.legs.push({ ...rest, startMinutes: cursor.at, endMinutes: cursor.at + minutes })
  cursor.at += minutes
}

export function gatewayOf(adventure: Adventure): Gateway | null {
  return GATEWAYS_BY_ID[adventure.gatewayId] ?? null
}

export function buildItinerary(options: BuildOptions): Itinerary {
  const { adventure, start, settings, daylight } = options
  const gateway = gatewayOf(adventure)
  const gatewayLabel = gateway ? `${gateway.name}, ${gateway.state}` : adventure.anchor.label

  const hike = pickHike(adventure, options.hikeId, settings)
  const food = pickFood(adventure, options.foodId, settings)
  const camp = pickCamp(adventure, options.campId)
  const overnight = Boolean(options.overnight) && camp !== null

  const stops = adventure.stopIds.map((id) => STOPS_BY_ID[id]).filter((s): s is Stop => Boolean(s))
  const access = estimateDrive(adventure.access)
  const back = estimateDrive(adventure.returnVia ?? adventure.access)
  const hikeEstimate = hike ? estimateHike(hike, settings.paceMph, settings.hikeAppetite === 'long' ? 0.2 : 0.15) : null

  const transit = start && gateway ? estimateTransit(start, gateway) : null
  const transitNeeded = transit !== null && transit.minutes > 0

  const cursor: Cursor = { at: settings.departMinutes, legs: [] }
  const startLabel = start ? start.label : gatewayLabel

  push(cursor, {
    kind: 'depart',
    title: start ? `Leave ${start.label}` : `Start in ${gatewayLabel}`,
    detail: start
      ? `Rolling at ${formatClock(settings.departMinutes)}.`
      : 'No starting location set, so this plan begins at the gateway town. Set a start to include the drive there.',
    minutes: 0,
    estimated: false,
  })

  if (transitNeeded && transit) {
    push(cursor, {
      kind: 'transit',
      title: `Drive to ${gatewayLabel}`,
      detail: `About ${transit.roadMiles} mi (est. from straight-line distance). Your maps app will have the real route.`,
      minutes: transit.minutes,
      estimated: true,
    })
  }

  for (const segment of adventure.access) {
    const { minutes, sourced } = segmentTiming(segment)
    push(cursor, {
      kind: 'drive',
      title: segment.via,
      detail: driveDetail(segment),
      minutes,
      vehicle: segment.vehicle,
      estimated: !sourced,
    })
  }

  const destinationStops = stops.filter((s) => s.kind !== 'town' && s.dwellMinutes !== null)
  const returnStops = stops.filter((s) => s.kind === 'town' && s.dwellMinutes !== null)
  const window = (settings.backByMinutes ?? settings.departMinutes + 12 * 60) - settings.departMinutes
  const stopBudget = Math.max(0, Math.round(window * (hike ? 0.15 : 0.45)))
  let spent = 0

  // A route itself takes time: use the published duration when there is one.
  const routeHours = adventure.route?.hours ?? null
  if (routeHours !== null && adventure.route) {
    push(cursor, {
      kind: 'drive',
      title: `${adventure.name} (the route)`,
      detail: `${formatMeasure(adventure.route.miles, 'mi', { decimals: 1 })} · published time ${formatMeasure(routeHours, 'h', { decimals: 1 })}`,
      minutes: Math.round((mid(routeHours) ?? 0) * 60),
      vehicle: adventure.requirements.access,
      estimated: false,
    })
  }

  for (const stop of destinationStops) {
    const dwell = stop.dwellMinutes as number
    if (spent + dwell > stopBudget) continue
    spent += dwell
    push(cursor, { kind: 'stop', title: stop.name, detail: stop.blurb, minutes: dwell, refId: stop.id, estimated: true })
  }

  if (hike && hikeEstimate) {
    push(cursor, {
      kind: 'stop',
      title: 'Trailhead',
      detail: 'Boots, packs, water, a last look at the map and the weather.',
      minutes: TRAILHEAD_BUFFER_MINUTES,
      estimated: true,
    })
    push(cursor, {
      kind: 'hike',
      title: hike.name,
      detail: hikeDetail(hike, hikeEstimate.minutesWithBreaks),
      minutes: mid(hikeEstimate.minutesWithBreaks) ?? 0,
      refId: hike.id,
      estimated: true,
    })
  }

  if (overnight && camp) {
    if (food) pushFood(cursor, food, settings)
    push(cursor, {
      kind: 'camp',
      title: `Make camp: ${camp.name}`,
      detail: campDetail(camp),
      minutes: CAMP_SETUP_MINUTES,
      refId: camp.id,
      estimated: true,
    })
  } else {
    if (adventure.access.length > 0) {
      const segments = adventure.returnVia ?? [...adventure.access].reverse()
      const minutes = segments.reduce((sum, s) => sum + segmentTiming(s).minutes, 0)
      push(cursor, {
        kind: 'drive',
        title: `Back to ${gatewayLabel}`,
        detail: returnDetail(segments),
        minutes,
        vehicle: hardestVehicle(segments.map((s) => s.vehicle)),
        estimated: !segments.every((s) => segmentTiming(s).sourced),
      })
    }

    for (const stop of returnStops) {
      const dwell = stop.dwellMinutes as number
      if (spent + dwell > stopBudget) continue
      spent += dwell
      push(cursor, { kind: 'stop', title: stop.name, detail: stop.blurb, minutes: dwell, refId: stop.id, estimated: true })
    }

    if (food) pushFood(cursor, food, settings)

    if (transitNeeded && transit && start) {
      push(cursor, {
        kind: 'transit',
        title: `Drive back to ${start.label}`,
        detail: `About ${transit.roadMiles} mi (est.).`,
        minutes: transit.minutes,
        estimated: true,
      })
    }

    push(cursor, {
      kind: 'arrive',
      title: start ? `Back at ${start.label}` : `Back in ${gatewayLabel}`,
      detail: `Around ${formatClock(cursor.at)}.`,
      minutes: 0,
      estimated: false,
    })
  }

  const sumKind = (kind: LegKind) =>
    cursor.legs.filter((l) => l.kind === kind).reduce((s, l) => s + (l.endMinutes - l.startMinutes), 0)

  const accessMiles = overnight ? access.miles : addNullable(access.miles, back.miles)
  const unmeasuredLegs = overnight ? access.unmeasuredLegs : access.unmeasuredLegs + back.unmeasuredLegs

  const maxElevationFt = maxMeasure([
    hike ? hike.highPointFt : null,
    ...stops.map((s) => s.elevationFt),
    overnight && camp ? camp.elevationFt : null,
  ])

  const vehicle = hardestVehicle([
    access.vehicle,
    adventure.requirements.access,
    ...(hike ? [hike.parking.finalApproach] : []),
    ...(overnight && camp ? [camp.access] : []),
  ])

  const totalMinutes = cursor.at - settings.departMinutes

  const itinerary: Itinerary = {
    adventureId: adventure.id,
    date: settings.date,
    startLabel,
    hasStart: start !== null,
    legs: cursor.legs,
    departMinutes: settings.departMinutes,
    endMinutes: cursor.at,
    transitMinutes: sumKind('transit'),
    transitMiles: transitNeeded && transit ? transit.roadMiles * (overnight ? 1 : 2) : 0,
    transitOneWayMiles: transitNeeded && transit ? transit.roadMiles : 0,
    driveMinutes: sumKind('drive') + sumKind('transit'),
    hikeMinutes: sumKind('hike'),
    totalMinutes,
    accessMiles,
    hikeMiles: hike?.miles ?? null,
    gainFt: hike?.gainFt ?? null,
    maxElevationFt,
    depth: classifyDepth({
      totalMinutes,
      hikeMiles: hike?.miles ?? null,
      gainFt: hike?.gainFt ?? null,
      maxElevationFt,
      overnight,
      technicalDriving: vehicle === 'four_wd_low_range' || vehicle === 'modified_4x4',
    }),
    vehicle,
    overnight,
    unmeasuredLegs,
    warnings: [],
    hikeId: hike?.id ?? null,
    foodId: food?.id ?? null,
    campId: overnight ? (camp?.id ?? null) : null,
  }

  itinerary.warnings = collectWarnings(itinerary, adventure, settings, hike, overnight ? camp : null, daylight ?? null, transit?.minutes ?? 0, access.minutes)
  return itinerary
}

function pushFood(cursor: Cursor, food: FoodStop, settings: DayPlanSettings) {
  push(cursor, {
    kind: 'food',
    title: food.name,
    detail: foodDetail(food),
    minutes: FOOD_MINUTES[settings.food] || FOOD_MINUTES.lunch,
    refId: food.id,
    estimated: true,
  })
}

/* --------------------------------------------------------------- warnings */

function collectWarnings(
  it: Itinerary,
  adventure: Adventure,
  settings: DayPlanSettings,
  hike: Hike | null,
  camp: Camp | null,
  daylight: { sunrise: number; sunset: number } | null,
  transitMinutes: number,
  accessMinutes: Measure,
): Warning[] {
  const warnings: Warning[] = []

  warnings.push(...seasonWarnings(adventure.season, settings.date, adventure.name))
  if (hike) warnings.push(...seasonWarnings(hike.season, settings.date, hike.name))
  if (camp) warnings.push(...seasonWarnings(camp.season, settings.date, camp.name))

  if (!it.hasStart) {
    warnings.push({
      level: 'info',
      message: 'No starting location set. Times begin at the gateway town; set a start to include the drive there.',
    })
  }

  if (!it.overnight) {
    if (settings.backByMinutes !== null && it.endMinutes > settings.backByMinutes) {
      const over = it.endMinutes - settings.backByMinutes
      warnings.push({
        level: over > 90 ? 'blocker' : 'caution',
        message: `Gets you back around ${formatClock(it.endMinutes)}, ${formatDuration(over)} past your ${formatClock(settings.backByMinutes)} target.`,
      })
    }
    if (it.endMinutes >= MINUTES_PER_DAY) {
      warnings.push({
        level: 'blocker',
        message: 'This plan runs past midnight as a day trip. Make it an overnight or a multi-day trip.',
      })
    }
  }

  const oneWay = transitMinutes + worstCaseMinutes(accessMinutes)
  if (oneWay > settings.maxDriveMinutes) {
    warnings.push({
      level: 'caution',
      message: `One-way driving is about ${formatDuration(oneWay)} (est.), over your ${formatDuration(settings.maxDriveMinutes)} preference.`,
    })
  }

  if (it.vehicle === 'unknown') {
    warnings.push({
      level: 'caution',
      message: 'ACCESS STATUS UNKNOWN on part of this route. Confirm with the land manager before you commit to it.',
    })
  }

  if (it.unmeasuredLegs > 0) {
    warnings.push({
      level: 'info',
      message: `${it.unmeasuredLegs} road leg${it.unmeasuredLegs === 1 ? '' : 's'} on this route ${it.unmeasuredLegs === 1 ? 'has' : 'have'} no sourced distance, so drive times shown are floors, not totals.`,
    })
  }

  if (daylight) {
    const hikeLeg = it.legs.find((l) => l.kind === 'hike')
    if (hikeLeg && hikeLeg.endMinutes > daylight.sunset) {
      warnings.push({
        level: 'caution',
        message: `The walking finishes at ${formatClock(hikeLeg.endMinutes)}, after sunset at ${formatClock(daylight.sunset)}. Headlamps, or start earlier.`,
      })
    }
    if (it.departMinutes < daylight.sunrise - 60) {
      warnings.push({
        level: 'info',
        message: `You will be driving in the dark: sunrise is ${formatClock(daylight.sunrise)}. Watch for wildlife on the road.`,
      })
    }
  }

  if (camp) {
    warnings.push({
      level: 'info',
      message: 'Camping rules are set by the land manager and the signs on site, not by this app. Check fire restrictions the day you go.',
    })
  }

  return warnings
}

/* ---------------------------------------------------------------- pickers */

function pickHike(adventure: Adventure, explicit: string | null | undefined, settings: DayPlanSettings): Hike | null {
  if (explicit === null) return null
  if (explicit) return HIKES_BY_ID[explicit] ?? null
  if (settings.hikeAppetite === 'none') return null
  const candidates = adventure.hikeIds.map((id) => HIKES_BY_ID[id]).filter((h): h is Hike => Boolean(h))
  if (candidates.length === 0) return null
  const ceiling = settings.hikeAppetite === 'short' ? 4 : settings.hikeAppetite === 'moderate' ? 8 : Infinity
  return candidates.find((h) => (mid(h.miles) ?? 0) <= ceiling) ?? candidates[0]
}

function pickFood(adventure: Adventure, explicit: string | null | undefined, settings: DayPlanSettings): FoodStop | null {
  if (explicit === null) return null
  if (explicit) {
    const chosen = FOOD_BY_ID[explicit]
    return chosen && chosen.closed === null ? chosen : null
  }
  if (settings.food === 'none') return null
  // A place known to have closed is never recommended.
  const open = adventure.foodIds.map((id) => FOOD_BY_ID[id]).filter((f): f is FoodStop => Boolean(f) && f.closed === null)
  if (settings.food === 'brewery') {
    const beer = open.find((f) => f.kind === 'brewery' || f.kind === 'brewpub')
    if (beer) return beer
  }
  if (settings.food === 'coffee') {
    const coffee = open.find((f) => f.kind === 'coffee' || f.kind === 'cafe')
    if (coffee) return coffee
  }
  return open[0] ?? null
}

function pickCamp(adventure: Adventure, explicit: string | null | undefined): Camp | null {
  if (explicit === null) return null
  if (explicit) return CAMPS_BY_ID[explicit] ?? null
  return adventure.campIds.map((id) => CAMPS_BY_ID[id]).find(Boolean) ?? null
}

/* ----------------------------------------------------------------- detail */

export function segmentTiming(segment: DriveSegment): { minutes: number; sourced: boolean } {
  if (segment.minutesOverride !== undefined && segment.minutesOverride !== null) {
    return { minutes: mid(segment.minutesOverride) ?? 0, sourced: true }
  }
  if (segment.miles === null) {
    // No sourced distance and no sourced time: contributes zero minutes and
    // is counted in `unmeasuredLegs`. We refuse to invent one.
    return { minutes: 0, sourced: false }
  }
  return { minutes: mid(estimateDrive([segment]).minutes) ?? 0, sourced: false }
}

function driveDetail(segment: DriveSegment): string {
  const parts = [
    `${formatMeasure(segment.miles, 'mi', { decimals: 1 })} · ${ROAD_CLASS_LABEL[segment.roadClass]} · ${VEHICLE_LABEL[segment.vehicle]}`,
  ]
  if (segment.notes) parts.push(segment.notes)
  return parts.join(' — ')
}

function hikeDetail(hike: Hike, minutes: Measure): string {
  return [
    formatMeasure(hike.miles, 'mi', { decimals: 1 }),
    `${formatMeasure(hike.gainFt, 'ft')} gain`,
    `high point ${formatMeasure(hike.highPointFt, 'ft')}`,
    `about ${formatDurationRange(minutes)} moving and stopped`,
  ].join(' · ')
}

export function formatDurationRange(minutes: Measure): string {
  if (minutes === null) return 'UNKNOWN'
  const lo = low(minutes) as number
  const hi = high(minutes) as number
  return lo === hi ? formatDuration(lo) : `${formatDuration(lo)}–${formatDuration(hi)}`
}

function returnDetail(segments: DriveSegment[]): string {
  const names: string[] = []
  for (const segment of segments) {
    const name = shortRoad(segment.via)
    if (names[names.length - 1] !== name) names.push(name)
  }
  const miles = sumMeasures(segments.map((s) => s.miles))
  const distance =
    miles.value === null ? 'distance UNKNOWN' : `${formatMeasure(miles.value, 'mi', { decimals: 1 })}${miles.missing > 0 ? '+' : ''}`
  return `Back the way you came: ${names.join(', then ')} · ${distance}`
}

/**
 * Reduces an outbound leg name to the road itself. Compass bearings are
 * dropped (correct outbound, wrong on the way back) and the LAST road
 * designator wins, since "US 191 north, then UT 313" is really the 313 leg.
 */
export function shortRoad(via: string): string {
  const routes = via.match(/\b(?:US|UT|CO|CR|FR|FDR|SR|I)[\s-]?\d+[A-Z]?\b/g)
  if (routes) return routes[routes.length - 1]
  const road = via.split(/,| to | toward | over | up | along | from /)[0]
  return road
    .replace(/\b(north|south|east|west|up|down)(bound)?\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function foodDetail(food: FoodStop): string {
  const bits = [food.town]
  if (food.address) bits.push(food.address)
  bits.push(food.hoursNote ?? 'Hours not verified — check before you go.')
  return bits.join(' · ')
}

function campDetail(camp: Camp): string {
  return [
    camp.kind === 'dispersed' ? 'Dispersed' : camp.kind === 'designated' ? 'Designated sites' : 'Campground',
    formatMeasure(camp.elevationFt, 'ft'),
    camp.vehicleFitNotes ?? '',
  ]
    .filter(Boolean)
    .join(' · ')
}

function addNullable(a: Measure, b: Measure): Measure {
  if (a === null) return b
  if (b === null) return a
  return addMeasures(a, b)
}

/** Gateway round-trip miles as a single number for range checks; floor when partly unknown. */
export function roundTripFromGateway(adventure: Adventure): number | null {
  const access = estimateDrive(adventure.access)
  const accessLow = low(access.miles) ?? 0
  const routeLow = adventure.route && adventure.route.shape !== 'network' ? (low(adventure.route.miles) ?? 0) : 0
  const total = accessLow * 2 + routeLow
  return total > 0 ? total : null
}
