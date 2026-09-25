import { describe, expect, it } from 'vitest'
import { blankTrip, suggestedTripName, summarizeTrip } from '../tripPlan'
import type { Trip } from '../../domain/trip'
import { AWD_WAGON, BUILT_4X4, DALLAS, EV_CROSSOVER, MOAB_START } from '../../test/fixtures'

function trip(patch: Partial<Trip>): Trip {
  return { ...blankTrip({ date: '2026-10-10', start: null, vehicleId: null, now: 0 }), ...patch }
}

describe('trip creation', () => {
  it('a blank trip takes the given start (or none) and no stops', () => {
    expect(blankTrip({ date: '2026-10-10', start: null, vehicleId: null }).start).toBeNull()
    expect(blankTrip({ date: '2026-10-10', start: DALLAS, vehicleId: null }).start?.label).toBe('Dallas, TX')
  })
  it('suggests a name from the stops only when there are some', () => {
    expect(suggestedTripName(trip({}))).toBe('New trip')
    expect(suggestedTripName(trip({ stops: [{ adventureId: 'wedge_overlook', day: 0, note: '' }] }))).toBe('Wedge Overlook')
    expect(suggestedTripName(trip({ stops: [{ adventureId: 'wedge_overlook', day: 0, note: '' }, { adventureId: 'hells_revenge', day: 1, note: '' }] }))).toBe('Wedge Overlook + 1 more')
  })
})

describe('road trip summary', () => {
  const stops = [
    { adventureId: 'fins_and_things', day: 0, note: '' },
    { adventureId: 'buckhorn_wash', day: 1, note: '' },
    { adventureId: 'paiute_main_loop', day: 2, note: '' },
  ]

  it('Dallas -> Moab -> Swell -> Paiute -> Dallas, all estimated', () => {
    const s = summarizeTrip(trip({ start: DALLAS, stops, returnToStart: true }), BUILT_4X4())
    expect(s.legs[0].fromLabel).toBe('Dallas, TX')
    expect(s.legs[0].toLabel).toBe('Moab, UT')
    expect(s.legs[s.legs.length - 1].toLabel).toBe('Dallas, TX')
    expect(s.legs.every((l) => l.estimated)).toBe(true)
    expect(s.totalMiles).toBeGreaterThan(1500)
  })

  it('with no start, legs begin at the first stop', () => {
    const s = summarizeTrip(trip({ start: null, stops }), null)
    expect(s.hasStart).toBe(false)
    expect(s.legs[0].fromLabel).toBe('Moab, UT')
  })

  it('a Moab start adds no leg to Moab', () => {
    const s = summarizeTrip(trip({ start: MOAB_START, stops: stops.slice(0, 1), returnToStart: false }), null)
    expect(s.legs).toHaveLength(0)
  })

  it('checks every stop against the chosen vehicle', () => {
    const s = summarizeTrip(trip({ stops: [{ adventureId: 'hells_revenge', day: 0, note: '' }] }), AWD_WAGON())
    expect(s.beyondCount).toBe(1)
  })

  it('warns when a leg outruns the entered range', () => {
    const ev = { ...EV_CROSSOVER(), rangeMiles: 250 }
    const s = summarizeTrip(trip({ start: DALLAS, stops }), ev)
    expect(s.rangeWarnings.length).toBeGreaterThan(0)
    expect(s.rangeWarnings[0]).toMatch(/charging stop/)
  })

  it('ignores stops for adventures that no longer exist', () => {
    const s = summarizeTrip(trip({ stops: [{ adventureId: 'removed_route', day: 0, note: '' }] }), null)
    expect(s.stops).toHaveLength(0)
  })
})
