import type { Basis } from '../domain/types'
import type { Adventure, TrailNetwork, VehicleRequirements } from '../domain/adventure'
import { DIFFICULTY_ORDER } from '../domain/adventure'
import type { VehicleProfile } from '../domain/vehicle'
import { EQUIPMENT_LABEL } from '../domain/vehicle'
import { capabilitiesOf, fitsWidth, HIGH_CLEARANCE_IN, type Capabilities } from './capability'
import { VEHICLE_LABEL } from './drive'

/**
 * Compares an adventure's published requirements with a vehicle's known
 * capabilities. Three rules shape every line of output:
 *
 * 1. It never says a vehicle is "safe" or guarantees anything. The best it
 *    will say is that the vehicle appears compatible with what is published.
 * 2. It never invents a requirement or a capability. Missing data produces
 *    an explicit "unknown" line that tells the user what to add.
 * 3. Every line carries its basis, so an official requirement never reads
 *    the same as a community opinion or a TREAD estimate.
 */

export type ConsiderationLevel = 'ok' | 'caution' | 'blocker' | 'unknown' | 'info'

export interface Consideration {
  level: ConsiderationLevel
  text: string
  basis: Basis
  /** Which aspect this is about, for grouping and tests. */
  topic:
    | 'access'
    | 'drivetrain'
    | 'low_range'
    | 'clearance'
    | 'width'
    | 'ohv'
    | 'street_legal'
    | 'stock'
    | 'tires'
    | 'equipment'
    | 'range'
    | 'difficulty'
    | 'conditions'
}

export type FitStatus = 'compatible' | 'considerations' | 'beyond' | 'unknown' | 'no_vehicle'

export interface VehicleAssessment {
  status: FitStatus
  headline: string
  items: Consideration[]
  /** Things the user could add to their profile to sharpen the answer. */
  missing: string[]
}

export const FIT_LABEL: Record<FitStatus, string> = {
  compatible: 'Appears compatible',
  considerations: 'Vehicle considerations',
  beyond: 'Likely beyond this vehicle',
  unknown: 'Add details to check',
  no_vehicle: 'No vehicle selected',
}

function basisOf(req: VehicleRequirements): Basis {
  return req.basis === 'official' ? 'official' : 'community'
}

/** Blocker when the publisher says required; caution when only recommended. */
function unmet(req: VehicleRequirements): ConsiderationLevel {
  return req.strength === 'required' ? 'blocker' : 'caution'
}

function verb(req: VehicleRequirements): string {
  return req.strength === 'required' ? 'requires' : 'recommends'
}

function who(req: VehicleRequirements): string {
  return req.basis === 'official' ? 'The land manager' : 'Community sources'
}

interface Ctx {
  req: VehicleRequirements
  cap: Capabilities
  items: Consideration[]
  missing: Set<string>
}

function add(ctx: Ctx, c: Consideration) {
  ctx.items.push(c)
}

/**
 * `implied` is for 4WD-class routes whose publisher did not state a
 * clearance requirement: TREAD still raises clearance, but as its own
 * guidance (basis: estimate), never as the land manager's words.
 */
function checkClearance(ctx: Ctx, implied = false) {
  const { cap, req } = ctx
  if (implied) {
    if (cap.highClearance.value === true) {
      add(ctx, { level: 'ok', topic: 'clearance', basis: 'user', text: `Ground clearance ${cap.clearanceIn.value} in meets TREAD’s ${HIGH_CLEARANCE_IN} in high-clearance threshold.` })
    } else if (cap.highClearance.value === false) {
      add(ctx, { level: 'caution', topic: 'clearance', basis: 'estimate', text: `Rough 4WD routes generally call for high clearance; this vehicle’s entered clearance is ${cap.clearanceIn.value} in (TREAD guidance, not a published requirement).` })
    } else {
      ctx.missing.add('Ground clearance')
      add(ctx, { level: 'unknown', topic: 'clearance', basis: 'estimate', text: 'Rough 4WD routes generally call for high clearance. Ground clearance isn’t in this vehicle’s profile.' })
    }
    return
  }
  if (cap.highClearance.value === true) {
    add(ctx, {
      level: 'ok',
      topic: 'clearance',
      basis: 'user',
      text: `Ground clearance ${cap.clearanceIn.value} in meets TREAD’s ${HIGH_CLEARANCE_IN} in high-clearance threshold.`,
    })
  } else if (cap.highClearance.value === false) {
    add(ctx, {
      level: unmet(req),
      topic: 'clearance',
      basis: basisOf(req),
      text: `${who(req)} ${verb(req)} high clearance; this vehicle’s entered clearance is ${cap.clearanceIn.value} in.`,
    })
  } else {
    ctx.missing.add('Ground clearance')
    add(ctx, {
      level: 'unknown',
      topic: 'clearance',
      basis: basisOf(req),
      text: `${who(req)} ${verb(req)} high clearance. Ground clearance isn’t in this vehicle’s profile.`,
    })
  }
}

function checkFourWd(ctx: Ctx) {
  const { cap, req } = ctx
  if (cap.fourWd.value === true) {
    add(ctx, { level: 'ok', topic: 'drivetrain', basis: cap.fourWd.basis as Basis, text: '4WD drivetrain matches the published requirement.' })
  } else if (cap.fourWd.value === false) {
    const awdNote = cap.awd.value ? ' AWD is not the same as 4WD: it has no low range and usually less clearance and articulation.' : ''
    add(ctx, {
      level: unmet(req),
      topic: 'drivetrain',
      basis: basisOf(req),
      text: `${who(req)} ${verb(req)} 4WD; this vehicle is recorded as ${cap.awd.value ? 'AWD' : 'two-wheel drive'}.${awdNote}`,
    })
  } else {
    ctx.missing.add('Drivetrain')
    add(ctx, { level: 'unknown', topic: 'drivetrain', basis: basisOf(req), text: `${who(req)} ${verb(req)} 4WD. Drivetrain isn’t in this vehicle’s profile.` })
  }
}

function checkLowRange(ctx: Ctx) {
  const { cap, req } = ctx
  if (cap.lowRange.value === true) {
    add(ctx, { level: 'ok', topic: 'low_range', basis: cap.lowRange.basis as Basis, text: 'Low range available.' })
  } else if (cap.lowRange.value === false) {
    add(ctx, {
      level: unmet(req),
      topic: 'low_range',
      basis: basisOf(req),
      text: `${who(req)} ${verb(req)} a low-range transfer case; this vehicle doesn’t have one.`,
    })
  } else {
    ctx.missing.add('Low range')
    add(ctx, { level: 'unknown', topic: 'low_range', basis: basisOf(req), text: `${who(req)} ${verb(req)} low range. Whether this vehicle has it isn’t recorded.` })
  }
}

function checkAccess(ctx: Ctx) {
  const { req, cap } = ctx
  switch (req.access) {
    case 'any_vehicle':
      add(ctx, { level: 'ok', topic: 'access', basis: basisOf(req), text: 'Published access is suitable for ordinary vehicles in normal conditions.' })
      break
    case 'high_clearance':
      checkClearance(ctx)
      break
    case 'four_wd':
      checkFourWd(ctx)
      checkClearance(ctx, true)
      break
    case 'four_wd_low_range':
      checkFourWd(ctx)
      if (cap.fourWd.value !== false) checkLowRange(ctx)
      checkClearance(ctx, true)
      break
    case 'modified_4x4':
      checkFourWd(ctx)
      if (cap.fourWd.value !== false) checkLowRange(ctx)
      checkClearance(ctx, true)
      checkModified(ctx)
      break
    case 'unknown':
      add(ctx, {
        level: 'caution',
        topic: 'access',
        basis: basisOf(req),
        text: 'ACCESS STATUS UNKNOWN. No reliable published vehicle requirement -- verify with the land manager before you go.',
      })
      break
  }
}

function checkModified(ctx: Ctx) {
  const { cap, req } = ctx
  if (!req.notForStock) return
  const lockersKnown = cap.lockers.value !== null
  const hasLockers = cap.lockers.value === 'rear' || cap.lockers.value === 'front_and_rear'
  const tiresOk = cap.offroadTires.value === true
  if (hasLockers && tiresOk) {
    add(ctx, { level: 'ok', topic: 'stock', basis: 'user', text: 'Lockers and off-road tires entered -- the kind of build this route is described for.' })
    return
  }
  const gaps: string[] = []
  if (lockersKnown && !hasLockers) gaps.push('no lockers')
  if (cap.offroadTires.value === false) gaps.push('road-oriented tires')
  if (gaps.length > 0) {
    add(ctx, {
      level: unmet(req),
      topic: 'stock',
      basis: basisOf(req),
      text: `${who(req)} describe this route as beyond stock vehicles; this profile shows ${gaps.join(' and ')}.`,
    })
  } else {
    if (!lockersKnown) ctx.missing.add('Lockers')
    if (cap.offroadTires.value === null) ctx.missing.add('Tires')
    add(ctx, {
      level: 'unknown',
      topic: 'stock',
      basis: basisOf(req),
      text: `${who(req)} describe this route as beyond stock vehicles. Add lockers and tire type to compare.`,
    })
  }
}

function checkOhvRules(ctx: Ctx, network: TrailNetwork | null, adventure: Adventure) {
  const { req, cap } = ctx

  if (cap.isOhv && req.ohvAllowed === false) {
    add(ctx, {
      level: 'blocker',
      topic: 'ohv',
      basis: basisOf(req),
      text: 'ATVs and UTVs are not permitted on this route.',
    })
  }
  if (!cap.isOhv && req.ohvOnly) {
    add(ctx, {
      level: 'blocker',
      topic: 'ohv',
      basis: basisOf(req),
      text: 'Designated for OHVs; full-size vehicles are not the intended users.',
    })
  }
  if (cap.isOhv && cap.streetLegal.value !== true && (req.access === 'any_vehicle')) {
    add(ctx, {
      level: 'info',
      topic: 'street_legal',
      basis: 'estimate',
      text: 'Paved approach: an OHV that is not street-legal may need to be trailered to the start.',
    })
  }

  if (req.maxWidthIn !== null) {
    const fit = fitsWidth(cap, req.maxWidthIn)
    if (fit.value === true) {
      add(ctx, { level: 'ok', topic: 'width', basis: 'user', text: `Fits the published ${req.maxWidthIn}-inch width limit.` })
    } else if (fit.value === false) {
      add(ctx, {
        level: cap.isFullSize ? 'caution' : 'blocker',
        topic: 'width',
        basis: 'official',
        text: `Part of this route is limited to ${req.maxWidthIn} inches wide. ${fit.note ?? 'This vehicle is wider.'} Plan to turn around before the width-limited section.`,
      })
    } else {
      ctx.missing.add('Width')
      add(ctx, { level: 'unknown', topic: 'width', basis: 'official', text: `Part of this route is limited to ${req.maxWidthIn} inches wide. ${fit.note}` })
    }
  }

  // Network-wide width limits matter when you are riding the network, not
  // when an adventure merely sits inside it (a graded backway, a campground).
  const ridesNetwork = adventure.kind === 'network' || adventure.kind === 'ohv_route'
  if (network && ridesNetwork && network.widthLimitsIn.length > 0 && req.maxWidthIn === null) {
    const narrowest = Math.min(...network.widthLimitsIn)
    const fit = fitsWidth(cap, narrowest)
    if (fit.value === true) {
      add(ctx, { level: 'ok', topic: 'width', basis: 'user', text: `Fits even the narrowest (${narrowest}-inch) trails in the ${network.name}.` })
    } else {
      add(ctx, {
        level: 'caution',
        topic: 'width',
        basis: 'official',
        text: `The ${network.name} includes trails limited to ${network.widthLimitsIn.map((w) => `${w}"`).join(' and ')}. ${fit.value === false ? 'This vehicle is too wide for those segments; stick to routes open to it.' : 'Add the vehicle’s width to see which segments it fits.'}`,
      })
      if (fit.value === null) ctx.missing.add('Width')
    }
  }
}

function checkEquipment(ctx: Ctx) {
  const { req, cap } = ctx
  const recommended = req.recommendedEquipment
  if (recommended.length === 0) return
  const have = recommended.filter((e) => cap.equipment.includes(e))
  const lacking = recommended.filter((e) => !cap.equipment.includes(e))
  if (lacking.length === 0) {
    add(ctx, { level: 'ok', topic: 'equipment', basis: 'user', text: `Carrying the suggested equipment (${have.map((e) => EQUIPMENT_LABEL[e]).join(', ')}).` })
  } else {
    add(ctx, {
      level: 'caution',
      topic: 'equipment',
      basis: 'estimate',
      text: `TREAD suggests carrying, and this vehicle’s list doesn’t include: ${lacking.map((e) => EQUIPMENT_LABEL[e]).join(', ')}.`,
    })
  }
}

function checkRange(ctx: Ctx, roundTripMiles: number | null) {
  const { cap } = ctx
  if (roundTripMiles === null || roundTripMiles <= 0) return
  const kind = cap.ev ? 'charge' : 'fuel'
  if (cap.rangeMiles.value === null) {
    ctx.missing.add('Range')
    if (cap.ev) {
      add(ctx, {
        level: 'unknown',
        topic: 'range',
        basis: 'estimate',
        text: `About ${Math.round(roundTripMiles)} mi round trip from the gateway (est.). Add your EV’s range to check it. TREAD does not track charging stations.`,
      })
    }
    return
  }
  // Rough country costs range: rule of thumb, disclosed.
  const usable = cap.rangeMiles.value * 0.8
  if (roundTripMiles > usable) {
    add(ctx, {
      level: 'caution',
      topic: 'range',
      basis: 'estimate',
      text: `About ${Math.round(roundTripMiles)} mi round trip from the gateway (est.) is more than 80% of your ${cap.rangeMiles.value} mi ${kind} range. Plan a ${kind} stop${cap.ev ? ' -- check the AFDC station locator' : ''}.`,
    })
  } else {
    add(ctx, {
      level: 'ok',
      topic: 'range',
      basis: 'estimate',
      text: `About ${Math.round(roundTripMiles)} mi round trip from the gateway (est.) is within your ${cap.rangeMiles.value} mi ${kind} range, leaving a margin.`,
    })
  }
}

function checkDifficulty(ctx: Ctx, adventure: Adventure) {
  const d = adventure.difficulty
  if (!d) return
  const idx = DIFFICULTY_ORDER.indexOf(d.level)
  if (idx >= DIFFICULTY_ORDER.indexOf('difficult')) {
    add(ctx, {
      level: 'info',
      topic: 'difficulty',
      basis: d.basis === 'official' ? 'official' : 'community',
      text: `Route difficulty remains high -- rated by ${d.ratedBy}. Driver experience matters as much as the vehicle.`,
    })
  }
}

export interface AssessOptions {
  network?: TrailNetwork | null
  /** Estimated gateway -> adventure -> gateway miles, for range checks. */
  roundTripMiles?: number | null
}

export function assessVehicle(
  vehicle: VehicleProfile | null,
  adventure: Adventure,
  options: AssessOptions = {},
): VehicleAssessment {
  if (!vehicle) {
    return {
      status: 'no_vehicle',
      headline: `Published access: ${VEHICLE_LABEL[adventure.requirements.access]}. Add a vehicle to see how yours compares.`,
      items: [],
      missing: [],
    }
  }

  const ctx: Ctx = {
    req: adventure.requirements,
    cap: capabilitiesOf(vehicle),
    items: [],
    missing: new Set(),
  }

  checkAccess(ctx)
  checkOhvRules(ctx, options.network ?? null, adventure)
  checkEquipment(ctx)
  checkRange(ctx, options.roundTripMiles ?? null)
  for (const condition of adventure.requirements.conditional) {
    add(ctx, { level: 'info', topic: 'conditions', basis: basisOf(adventure.requirements), text: condition })
  }
  checkDifficulty(ctx, adventure)

  // Core requirement topics decide the status first: if the vehicle's basic
  // fit can't be judged, "add details" is more honest than "considerations"
  // driven by an equipment suggestion.
  const CORE = new Set<Consideration['topic']>(['access', 'drivetrain', 'low_range', 'clearance', 'width', 'ohv', 'stock'])
  const core = ctx.items.filter((i) => CORE.has(i.topic))
  const has = (items: Consideration[], level: ConsiderationLevel) => items.some((i) => i.level === level)
  const status: FitStatus = has(ctx.items, 'blocker')
    ? 'beyond'
    : has(core, 'caution')
      ? 'considerations'
      : has(core, 'unknown')
        ? 'unknown'
        : has(ctx.items, 'caution')
          ? 'considerations'
          : has(ctx.items, 'unknown')
            ? 'unknown'
            : 'compatible'

  return {
    status,
    headline: headlineFor(status, adventure),
    items: ctx.items,
    missing: [...ctx.missing],
  }
}

function headlineFor(status: FitStatus, adventure: Adventure): string {
  const hard = adventure.difficulty && DIFFICULTY_ORDER.indexOf(adventure.difficulty.level) >= DIFFICULTY_ORDER.indexOf('difficult')
  switch (status) {
    case 'compatible':
      return hard
        ? 'Vehicle appears compatible with the published requirements. Route difficulty remains high.'
        : 'Vehicle appears compatible with the published requirements.'
    case 'considerations':
      return 'Some published requirements or recommendations need attention for this vehicle.'
    case 'beyond':
      return 'This route may require capabilities or equipment beyond this vehicle’s known configuration.'
    case 'unknown':
      return 'Not enough vehicle detail to compare. Add the missing details below.'
    default:
      return ''
  }
}

/** Numeric sort key: better fit first. */
export function fitRank(status: FitStatus): number {
  return { compatible: 0, no_vehicle: 1, unknown: 2, considerations: 3, beyond: 4 }[status]
}
