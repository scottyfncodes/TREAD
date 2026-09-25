import type { Adventure } from '../domain/adventure'
import { DIFFICULTY_LABEL } from '../domain/adventure'
import type { VehicleProfile } from '../domain/vehicle'
import { EQUIPMENT_LABEL, vehicleName } from '../domain/vehicle'
import { CAMPS_BY_ID, NETWORKS_BY_ID } from '../data'
import type { DailyWeather } from '../services/weather'
import { describeCode } from '../services/weather'
import { capabilitiesOf } from './capability'
import { roundTripFromGateway, type Itinerary } from './itinerary'
import { assessVehicle, FIT_LABEL, type VehicleAssessment } from './matching'
import { MONTH_NAMES, monthOf, seasonVerdict } from './season'

/**
 * READY TO GO.
 *
 * One glanceable card per planned adventure: vehicle, fuel/charge, weather,
 * route, vehicle considerations, equipment, access, camping. Each row has a
 * status and a one-line value; the detail lives underneath. The rows only
 * restate facts from the data layer, the vehicle profile and the forecast --
 * readiness never upgrades an unknown into an "OK".
 */

export type ReadyStatus = 'ok' | 'caution' | 'blocker' | 'unknown' | 'info'

export interface ReadyRow {
  key: 'vehicle' | 'energy' | 'weather' | 'route' | 'fit' | 'equipment' | 'access' | 'camping'
  label: string
  value: string
  status: ReadyStatus
  detail: string
}

export interface Readiness {
  title: string
  overall: 'ready' | 'check' | 'not_ready'
  overallText: string
  rows: ReadyRow[]
  assessment: VehicleAssessment
  milesNeeded: number | null
}

export interface ReadinessInput {
  adventure: Adventure
  itinerary: Itinerary
  vehicle: VehicleProfile | null
  weather: DailyWeather | null
  /** Why weather is missing, when it is. */
  weatherNote?: string
  now?: number
}

const WEEKDAY = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

function dayName(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return WEEKDAY[new Date(y, m - 1, d).getDay()]
}

/**
 * Miles the tank or battery must cover once you leave the gateway town --
 * the last reliable place to fill up -- and get back to it. The drive from
 * the user's start to the gateway is reported separately: nobody does that
 * on one tank, and pretending otherwise would make every long trip "red".
 */
export function milesNeeded(adventure: Adventure): number | null {
  const local = roundTripFromGateway(adventure)
  return local && local > 0 ? Math.round(local) : null
}

export function buildReadiness(input: ReadinessInput): Readiness {
  const { adventure, itinerary, vehicle, weather } = input
  const network = adventure.networkId ? (NETWORKS_BY_ID[adventure.networkId] ?? null) : null
  const needed = milesNeeded(adventure)
  const assessment = assessVehicle(vehicle, adventure, { network, roundTripMiles: roundTripFromGateway(adventure) })
  const rows: ReadyRow[] = []

  /* Vehicle */
  rows.push(
    vehicle
      ? { key: 'vehicle', label: 'Vehicle', value: vehicleName(vehicle), status: 'info', detail: 'Selected for this plan.' }
      : { key: 'vehicle', label: 'Vehicle', value: 'None selected', status: 'unknown', detail: 'Choose a vehicle in your garage to check fit, range and equipment.' },
  )

  /* Fuel / charge */
  const energy = energyRow(vehicle, needed, input.now ?? Date.now())
  if (itinerary.transitOneWayMiles > 0) {
    energy.detail += ` Getting to the gateway is about ${itinerary.transitOneWayMiles} mi each way (est.) -- plan ${vehicle && capabilitiesOf(vehicle).ev ? 'charging' : 'fuel'} stops for that drive.`
  }
  rows.push(energy)

  /* Weather */
  if (weather) {
    const bits = [describeCode(weather.code)]
    if (weather.tempMaxF !== null && weather.tempMinF !== null) bits.push(`${Math.round(weather.tempMaxF)}° / ${Math.round(weather.tempMinF)}°`)
    const storms = weather.code !== null && weather.code >= 95
    const wet = (weather.precipChance ?? 0) >= 50
    const hot = (weather.tempMaxF ?? 0) >= 95
    rows.push({
      key: 'weather',
      label: 'Weather',
      value: bits.join(' · '),
      status: storms || wet || hot ? 'caution' : 'ok',
      detail: [
        storms ? 'Thunderstorms forecast -- flash floods and lightning on exposed ground.' : '',
        wet ? `${Math.round(weather.precipChance ?? 0)}% chance of precipitation -- dirt and clay roads can become impassable.` : '',
        hot ? 'Extreme heat: carry extra water for people and vehicle.' : '',
        'Forecast for the destination. Weather is an input, not a verdict.',
      ]
        .filter(Boolean)
        .join(' '),
    })
  } else {
    rows.push({ key: 'weather', label: 'Weather', value: 'Not available', status: 'unknown', detail: input.weatherNote ?? 'No forecast for this date.' })
  }

  /* Route */
  const KIND: Record<Adventure['kind'], string> = {
    ohv_route: 'OHV route',
    network: 'trail network',
    scenic_drive: 'scenic drive',
    destination: 'destination',
    hike: 'hike',
    ski_area: 'ski area',
  }
  const routeBits: string[] = []
  if (adventure.difficulty) routeBits.push(DIFFICULTY_LABEL[adventure.difficulty.level])
  routeBits.push(adventure.difficulty ? KIND[adventure.kind] : KIND[adventure.kind].replace(/^./, (c) => c.toUpperCase()))
  rows.push({
    key: 'route',
    label: 'Route',
    value: routeBits.join(' '),
    status: adventure.difficulty && ['very_difficult', 'extreme'].includes(adventure.difficulty.level) ? 'caution' : 'info',
    detail: adventure.difficulty
      ? `${adventure.difficulty.wording} (${adventure.difficulty.ratedBy})`
      : 'No published difficulty rating on record for this route.',
  })

  /* Vehicle considerations */
  const firstIssue = assessment.items.find((i) => i.level === 'blocker') ?? assessment.items.find((i) => i.level === 'caution') ?? assessment.items.find((i) => i.level === 'unknown')
  rows.push({
    key: 'fit',
    label: 'Vehicle considerations',
    value: requirementSummary(adventure),
    status: assessment.status === 'compatible' ? 'ok' : assessment.status === 'beyond' ? 'blocker' : assessment.status === 'considerations' ? 'caution' : 'unknown',
    detail: `${FIT_LABEL[assessment.status]}. ${firstIssue ? firstIssue.text : assessment.headline}`,
  })

  /* Equipment */
  const recommended = adventure.requirements.recommendedEquipment
  if (recommended.length > 0) {
    const lacking = vehicle ? recommended.filter((e) => !vehicle.equipment.includes(e)) : recommended
    const recoveryish = recommended.some((e) => e === 'recovery_kit' || e === 'winch' || e === 'traction_boards')
    rows.push({
      key: 'equipment',
      label: 'Equipment',
      value: lacking.length === 0 ? 'Suggested equipment listed' : recoveryish ? 'Recovery equipment recommended' : 'Equipment recommended',
      status: lacking.length === 0 ? 'ok' : 'caution',
      detail: lacking.length === 0
        ? `Your vehicle lists: ${recommended.map((e) => EQUIPMENT_LABEL[e]).join(', ')}.`
        : `TREAD suggests carrying, and your vehicle’s list doesn’t include: ${lacking.map((e) => EQUIPMENT_LABEL[e]).join(', ')}.`,
    })
  }

  /* Access */
  const verdict = seasonVerdict(adventure.season, itinerary.date)
  const month = MONTH_NAMES[monthOf(itinerary.date) - 1]
  rows.push({
    key: 'access',
    label: 'Access',
    value: 'Verify current route conditions before departure',
    status: verdict === 'out_of_season' ? 'blocker' : verdict === 'in_season' ? 'info' : 'caution',
    detail: [
      verdict === 'out_of_season'
        ? `Usually out of season in ${month}.`
        : verdict === 'shoulder'
          ? `${month} is at the edge of the usual season.`
          : verdict === 'unknown'
            ? 'Seasonal access unknown.'
            : `${month} is within the usual season.`,
      adventure.season.note,
      adventure.permits ? `Permits: ${adventure.permits}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  })

  /* Camping */
  if (itinerary.overnight && itinerary.campId) {
    const camp = CAMPS_BY_ID[itinerary.campId]
    const sleeps = vehicle ? capabilitiesOf(vehicle).sleepsInVehicle.value : null
    rows.push({
      key: 'camping',
      label: 'Camping',
      value: camp ? camp.name : 'Camp selected',
      status: 'info',
      detail: [
        camp?.fee ? `Fee: ${camp.fee}.` : 'Fee not recorded.',
        sleeps ? 'Your vehicle is set up to sleep in or on.' : 'Bring a tent -- this vehicle isn’t recorded as sleeping-capable.',
        'Camping rules and fire restrictions are set on site by the land manager.',
      ].join(' '),
    })
  }

  const statuses = rows.map((r) => r.status)
  const overall: Readiness['overall'] = statuses.includes('blocker') ? 'not_ready' : statuses.includes('caution') || statuses.includes('unknown') ? 'check' : 'ready'

  return {
    title: `${dayName(itinerary.date)}: ${adventure.name.toUpperCase()}`,
    overall,
    overallText:
      overall === 'ready'
        ? 'Nothing flagged from what TREAD knows. Still verify conditions before you leave.'
        : overall === 'check'
          ? 'A few things to check before you go.'
          : 'Something here needs resolving before this plan works.',
    rows,
    assessment,
    milesNeeded: needed,
  }
}

function requirementSummary(adventure: Adventure): string {
  const req = adventure.requirements
  const parts: string[] = []
  switch (req.access) {
    case 'any_vehicle':
      parts.push('Suitable for most vehicles in dry conditions')
      break
    case 'high_clearance':
      parts.push(`High-clearance vehicle ${req.strength}`)
      break
    case 'four_wd':
      parts.push(`4WD route, high-clearance vehicle ${req.strength}`)
      break
    case 'four_wd_low_range':
      parts.push(`4WD with low range ${req.strength}`)
      break
    case 'modified_4x4':
      parts.push('Modified 4x4 route')
      break
    default:
      parts.push('Access requirements unknown')
  }
  if (req.maxWidthIn !== null) parts.push(`${req.maxWidthIn}" width limit on part`)
  if (req.ohvAllowed === false) parts.push('no ATVs/UTVs')
  return parts.join(' · ')
}

function energyRow(vehicle: VehicleProfile | null, needed: number | null, now: number): ReadyRow {
  if (!vehicle) {
    return { key: 'energy', label: 'Fuel / charge', value: 'No vehicle', status: 'unknown', detail: 'Select a vehicle to check range.' }
  }
  const cap = capabilitiesOf(vehicle)
  const label = cap.ev ? 'Charge' : 'Fuel'
  const noun = cap.ev ? 'charge' : 'fuel'
  if (vehicle.energyPct === null) {
    return {
      key: 'energy',
      label,
      value: 'Not entered',
      status: 'unknown',
      detail: `Enter your current ${noun} level below to check it against this plan${needed ? ` (about ${needed} mi, est.)` : ''}.`,
    }
  }
  const pct = `${Math.round(vehicle.energyPct)}%`
  const stale = vehicle.energyUpdatedAt !== null && now - vehicle.energyUpdatedAt > 1000 * 60 * 60 * 24 * 2
  if (cap.rangeMiles.value === null || needed === null) {
    return {
      key: 'energy',
      label,
      value: pct,
      status: 'unknown',
      detail: cap.rangeMiles.value === null ? 'Add your full-tank or full-charge range to the vehicle to compare with this plan.' : 'Distance for this plan is not fully known.',
    }
  }
  const available = (cap.rangeMiles.value * vehicle.energyPct) / 100
  const enough = available * 0.85 >= needed
  return {
    key: 'energy',
    label,
    value: pct,
    status: enough ? (stale ? 'caution' : 'ok') : 'caution',
    detail: `About ${Math.round(available)} mi available (est. from your ${cap.rangeMiles.value} mi range) vs about ${needed} mi for this plan (est.).${enough ? '' : ` Plan to ${cap.ev ? 'charge' : 'refuel'} on the way -- ${cap.ev ? 'check the AFDC station locator' : 'confirm your last fuel stop'}.`}${stale ? ' Level was entered more than two days ago.' : ''}`,
  }
}
