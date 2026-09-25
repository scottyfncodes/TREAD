import { describe, expect, it } from 'vitest'
import { discover, discoverFood, vehicleSummary } from '../discovery'
import { estimateTransit, haversineMiles } from '../geo'
import { AWD_WAGON, BUILT_4X4, DALLAS, EV_CROSSOVER, MOAB_START, SPORTS_CAR, SUMMER, JANUARY, UTV_64 } from '../../test/fixtures'
import { FOOD_BY_ID } from '../../data'

describe('vehicle-aware discovery', () => {
  it('different vehicles get different top results from the same dataset', () => {
    const car = discover({ vehicle: SPORTS_CAR(), start: null, date: SUMMER, categories: ['offroad'] })
    const rig = discover({ vehicle: BUILT_4X4(), start: null, date: SUMMER, categories: ['offroad'] })
    expect(car[0].adventure.id).not.toBe(rig[0].adventure.id)
    // The built 4x4 should see more compatible off-road routes.
    const ok = (list: typeof car) => list.filter((d) => d.assessment.status === 'compatible').length
    expect(ok(rig)).toBeGreaterThan(ok(car))
  })

  it('pushes routes beyond the vehicle down but does not hide them', () => {
    const list = discover({ vehicle: AWD_WAGON(), start: null, date: SUMMER })
    const hr = list.findIndex((d) => d.adventure.id === 'hells_revenge')
    const arches = list.findIndex((d) => d.adventure.id === 'arches_scenic_drive')
    expect(hr).toBeGreaterThan(-1)
    expect(arches).toBeLessThan(hr)
  })

  it('"suits my vehicle" hides only the beyond / unknown ones', () => {
    const list = discover({ vehicle: SPORTS_CAR(), start: null, date: SUMMER, suitedOnly: true })
    expect(list.every((d) => ['compatible', 'considerations'].includes(d.assessment.status))).toBe(true)
    expect(list.some((d) => d.adventure.id === 'hells_revenge')).toBe(false)
  })

  it('EV and OHV summaries differ from a wagon', () => {
    const ev = vehicleSummary(EV_CROSSOVER(), SUMMER)
    const utv = vehicleSummary(UTV_64(), SUMMER)
    const wagon = vehicleSummary(AWD_WAGON(), SUMMER)
    expect(new Set([JSON.stringify(ev), JSON.stringify(utv), JSON.stringify(wagon)]).size).toBe(3)
  })
})

describe('location in discovery', () => {
  it('shows no distances without a user-chosen start', () => {
    const list = discover({ vehicle: null, start: null, date: SUMMER })
    expect(list.every((d) => d.transitMinutes === null)).toBe(true)
  })
  it('computes estimated distances from a manual start', () => {
    const list = discover({ vehicle: null, start: DALLAS, date: SUMMER, regionId: 'ut_moab' })
    expect(list.every((d) => (d.transitMiles ?? 0) > 800)).toBe(true)
  })
  it('a Moab start ranks Moab adventures as within range', () => {
    const list = discover({ vehicle: null, start: MOAB_START, date: SUMMER, regionId: 'ut_moab' })
    expect(list[0].reasons.join(' ')).toMatch(/right where you are|driving range/)
  })
})

describe('filters', () => {
  it('filters by category and region', () => {
    const camping = discover({ vehicle: null, start: null, date: SUMMER, categories: ['camping'] })
    expect(camping.every((d) => d.adventure.categories.includes('camping'))).toBe(true)
    const swell = discover({ vehicle: null, start: null, date: SUMMER, regionId: 'ut_san_rafael' })
    expect(swell.every((d) => d.adventure.regionId === 'ut_san_rafael')).toBe(true)
  })
  it('labels out-of-season adventures', () => {
    const list = discover({ vehicle: null, start: null, date: JANUARY, regionId: 'ut_paiute' })
    expect(list.find((d) => d.adventure.id === 'paiute_main_loop')?.season).toBe('out_of_season')
  })
  it('food discovery excludes closed places', () => {
    for (const f of discoverFood('breweries')) expect(FOOD_BY_ID[f.id].closed).toBeNull()
    expect(discoverFood('breweries').length).toBeGreaterThan(0)
  })
})

describe('geo model', () => {
  it('measures great-circle distance', () => {
    expect(haversineMiles(DALLAS, MOAB_START)).toBeGreaterThan(700)
    expect(haversineMiles(DALLAS, DALLAS)).toBe(0)
  })
  it('treats a start at the gateway as zero transit', () => {
    expect(estimateTransit(MOAB_START, { lat: 38.574, lon: -109.55 }).minutes).toBe(0)
  })
  it('always marks transit as an estimate', () => {
    expect(estimateTransit(DALLAS, MOAB_START).estimated).toBe(true)
  })
})
