import { describe, expect, it } from 'vitest'
import { ADVENTURES, ADVENTURES_BY_ID, FOOD_BY_ID } from '../../data'
import { buildItinerary, shortRoad, type DayPlanSettings } from '../itinerary'
import { formatClock } from '../time'
import { DALLAS, MOAB_START, SUMMER, JANUARY } from '../../test/fixtures'

const base: DayPlanSettings = {
  date: SUMMER,
  departMinutes: 8 * 60,
  backByMinutes: null,
  hikeAppetite: 'moderate',
  food: 'lunch',
  maxDriveMinutes: 180,
  paceMph: 2.2,
}
const s = (patch: Partial<DayPlanSettings> = {}) => ({ ...base, ...patch })

describe('starting location is never assumed', () => {
  it('with no start, the plan begins at the gateway town and says so', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: null, settings: s() })
    expect(plan.hasStart).toBe(false)
    expect(plan.legs[0].title).toBe('Start in Moab, UT')
    expect(plan.legs.some((l) => l.kind === 'transit')).toBe(false)
    expect(plan.warnings.some((w) => /No starting location set/.test(w.message))).toBe(true)
  })

  it('with a manual start, it drives there and back, labelled as estimates', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: DALLAS, settings: s() })
    expect(plan.legs[0].title).toBe('Leave Dallas, TX')
    const transit = plan.legs.filter((l) => l.kind === 'transit')
    expect(transit).toHaveLength(2)
    expect(transit.every((l) => l.estimated)).toBe(true)
    expect(plan.legs[plan.legs.length - 1].title).toBe('Back at Dallas, TX')
  })

  it('changing the start changes the plan', () => {
    const fromDallas = buildItinerary({ adventure: ADVENTURES_BY_ID.buckhorn_wash, start: DALLAS, settings: s() })
    const fromMoab = buildItinerary({ adventure: ADVENTURES_BY_ID.buckhorn_wash, start: MOAB_START, settings: s() })
    expect(fromDallas.transitMinutes).toBeGreaterThan(fromMoab.transitMinutes)
    expect(fromDallas.endMinutes).toBeGreaterThan(fromMoab.endMinutes)
  })

  it('starting in the gateway town adds no transit', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.fins_and_things, start: MOAB_START, settings: s() })
    expect(plan.transitMinutes).toBe(0)
  })

  it('warns that a Dallas day trip to Moab is not a day trip', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: DALLAS, settings: s({ backByMinutes: 20 * 60 }) })
    expect(plan.warnings.some((w) => w.level === 'blocker')).toBe(true)
  })
})

describe('itinerary shape', () => {
  it('lays legs end to end for every adventure, with and without a start', () => {
    for (const adventure of ADVENTURES) {
      for (const start of [null, DALLAS]) {
        const plan = buildItinerary({ adventure, start, settings: s() })
        for (let i = 1; i < plan.legs.length; i += 1) {
          expect(plan.legs[i].startMinutes).toBe(plan.legs[i - 1].endMinutes)
        }
        const total = plan.legs.reduce((sum, l) => sum + (l.endMinutes - l.startMinutes), 0)
        expect(plan.endMinutes).toBe(plan.departMinutes + total)
      }
    }
  })

  it('departs exactly when told to', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.wedge_overlook, start: null, settings: s({ departMinutes: 7 * 60 + 15 }) })
    expect(formatClock(plan.legs[0].startMinutes)).toBe('7:15 AM')
  })

  it('uses a published route time when there is one', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: null, settings: s() })
    const routeLeg = plan.legs.find((l) => l.title.includes('(the route)'))
    expect(routeLeg && routeLeg.endMinutes - routeLeg.startMinutes).toBe(150) // midpoint of 2-3 h
    expect(routeLeg?.estimated).toBe(false)
  })

  it('counts unmeasured road legs instead of inventing distances', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: null, settings: s() })
    expect(plan.unmeasuredLegs).toBeGreaterThan(0)
    expect(plan.warnings.some((w) => /no sourced distance/.test(w.message))).toBe(true)
  })

  it('ends at camp for an overnight', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.sand_flats_recreation_area, start: null, settings: s(), overnight: true })
    expect(plan.overnight).toBe(true)
    expect(plan.legs[plan.legs.length - 1].kind).toBe('camp')
    expect(plan.warnings.some((w) => /Camping rules/.test(w.message))).toBe(true)
  })

  it('flags out-of-season plans', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.paiute_koosharem, start: null, settings: s({ date: JANUARY }) })
    expect(plan.warnings.some((w) => w.level === 'blocker' && /out of season/.test(w.message))).toBe(true)
  })

  it('honours "no food" and never picks a closed place', () => {
    const none = buildItinerary({ adventure: ADVENTURES_BY_ID.hells_revenge, start: null, settings: s({ food: 'none' }) })
    expect(none.foodId).toBeNull()
    for (const adventure of ADVENTURES) {
      const plan = buildItinerary({ adventure, start: null, settings: s({ food: 'brewery' }) })
      if (plan.foodId) expect(FOOD_BY_ID[plan.foodId].closed).toBeNull()
    }
  })

  it('picks a brewery when asked and one is listed', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.fins_and_things, start: null, settings: s({ food: 'brewery' }) })
    expect(['brewery', 'brewpub']).toContain(FOOD_BY_ID[plan.foodId!].kind)
  })

  it('drops the hike when appetite is none', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.ice_lake_basin, start: null, settings: s({ hikeAppetite: 'none' }) })
    expect(plan.hikeId).toBeNull()
  })

  it('includes the hike and its time model otherwise', () => {
    const plan = buildItinerary({ adventure: ADVENTURES_BY_ID.ice_lake_basin, start: null, settings: s() })
    expect(plan.hikeId).toBe('ice_lake_basin')
    expect(plan.hikeMinutes).toBeGreaterThan(0)
  })
})

describe('road names on the way back', () => {
  it('drops compass bearings and keeps the last designator', () => {
    expect(shortRoad('US 191 north, then UT 313 west toward Island in the Sky')).toBe('UT 313')
    expect(shortRoad('Sand Flats Road east from Moab')).toBe('Sand Flats Road')
  })
})
