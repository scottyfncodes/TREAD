import { describe, expect, it } from 'vitest'
import { ADVENTURES_BY_ID } from '../../data'
import { buildItinerary, type DayPlanSettings } from '../itinerary'
import { buildReadiness, milesNeeded } from '../readiness'
import { buildPackList, packProgress } from '../gear'
import { preTripChecklist } from '../prep'
import type { DailyWeather } from '../../services/weather'
import { AWD_WAGON, BUILT_4X4, CAMPER_VAN, DALLAS, EV_CROSSOVER, JANUARY, OCTOBER, STOCK_4X4 } from '../../test/fixtures'
import type { VehicleProfile } from '../../domain/vehicle'

const settings: DayPlanSettings = { date: OCTOBER, departMinutes: 480, backByMinutes: null, hikeAppetite: 'moderate', food: 'lunch', maxDriveMinutes: 180, paceMph: 2.2 }

const clear: DailyWeather = { date: OCTOBER, tempMaxF: 72, tempMinF: 45, precipInches: 0, precipChance: 5, snowfallInches: 0, windMaxMph: 8, gustMaxMph: 15, sunrise: 440, sunset: 1120, code: 0 }
const storms: DailyWeather = { ...clear, code: 95, precipChance: 70 }

function ready(id: string, vehicle: VehicleProfile | null, weather: DailyWeather | null = clear, date = OCTOBER, start = null as typeof DALLAS | null) {
  const adventure = ADVENTURES_BY_ID[id]
  const itinerary = buildItinerary({ adventure, start, settings: { ...settings, date } })
  return buildReadiness({ adventure, itinerary, vehicle, weather, now: 0 })
}
const row = (r: ReturnType<typeof ready>, key: string) => r.rows.find((x) => x.key === key)!

describe('Ready to Go summary', () => {
  it('has the headline rows in order', () => {
    const r = ready('behind_the_reef', STOCK_4X4())
    expect(r.rows.map((x) => x.key)).toEqual(['vehicle', 'energy', 'weather', 'route', 'fit', 'equipment', 'access'])
    expect(r.title).toMatch(/^SATURDAY: BEHIND THE REEF$/)
  })

  it('reads like the brief for a 4WD route', () => {
    const r = ready('behind_the_reef', STOCK_4X4())
    expect(row(r, 'fit').value).toMatch(/4WD route, high-clearance vehicle required/)
    expect(row(r, 'equipment').value).toBe('Recovery equipment recommended')
    expect(row(r, 'access').value).toBe('Verify current route conditions before departure')
    expect(row(r, 'weather').value).toMatch(/^Clear/)
  })

  it('fuel is unknown until the user enters a level -- never assumed', () => {
    expect(row(ready('fins_and_things', STOCK_4X4()), 'energy').status).toBe('unknown')
  })

  it('compares entered fuel against the local loop', () => {
    const full = { ...STOCK_4X4(), energyPct: 82, energyUpdatedAt: 0 }
    const r = ready('metal_masher', full)
    expect(row(r, 'energy').value).toBe('82%')
    expect(row(r, 'energy').status).toBe('ok')
    const low = { ...STOCK_4X4(), energyPct: 10, energyUpdatedAt: 0 }
    expect(row(ready('metal_masher', low), 'energy').status).toBe('caution')
  })

  it('labels charge for EVs and fuel for ICE', () => {
    expect(row(ready('arches_scenic_drive', EV_CROSSOVER()), 'energy').label).toBe('Charge')
    expect(row(ready('arches_scenic_drive', AWD_WAGON()), 'energy').label).toBe('Fuel')
  })

  it('reports the long drive to the gateway separately from the tank check', () => {
    const r = ready('fins_and_things', { ...STOCK_4X4(), energyPct: 90, energyUpdatedAt: 0 }, clear, OCTOBER, DALLAS)
    expect(row(r, 'energy').detail).toMatch(/Getting to the gateway is about \d+ mi each way/)
    expect(milesNeeded(ADVENTURES_BY_ID.fins_and_things)).toBeLessThan(100)
  })

  it('storms and missing forecasts are flagged, not hidden', () => {
    expect(row(ready('wedge_overlook', AWD_WAGON(), storms), 'weather').status).toBe('caution')
    expect(row(ready('wedge_overlook', AWD_WAGON(), null), 'weather').status).toBe('unknown')
  })

  it('out-of-season access makes the plan not ready', () => {
    const r = ready('paiute_main_loop', STOCK_4X4(), clear, JANUARY)
    expect(row(r, 'access').status).toBe('blocker')
    expect(r.overall).toBe('not_ready')
  })

  it('a vehicle beyond the route blocks readiness', () => {
    expect(ready('hells_revenge', AWD_WAGON()).overall).toBe('not_ready')
  })

  it('with no vehicle, asks for one', () => {
    const r = ready('hells_revenge', null)
    expect(row(r, 'vehicle').status).toBe('unknown')
    expect(row(r, 'energy').value).toBe('No vehicle')
  })
})

describe('packing and prep', () => {
  it('builds off-road and technical sections for a 4WD-low-range route and credits owned gear', () => {
    const adventure = ADVENTURES_BY_ID.hells_revenge
    const itinerary = buildItinerary({ adventure, start: null, settings })
    const pack = buildPackList(itinerary, adventure, BUILT_4X4(), ['tire_plug'])
    const titles = pack.map((s) => s.title)
    expect(titles).toEqual(expect.arrayContaining(['Off-road', 'Technical terrain', 'Out of contact']))
    const offroad = pack.find((s) => s.title === 'Off-road')!
    expect(offroad.items.find((i) => i.id === 'recovery_strap')?.owned).toBe(true) // via vehicle equipment
    expect(offroad.items.find((i) => i.id === 'tire_plug')?.owned).toBe(true) // via gear list
    expect(packProgress(pack, []).done).toBe(0)
  })

  it('a paved drive needs no off-road kit; an EV gets a charging section', () => {
    const adventure = ADVENTURES_BY_ID.arches_scenic_drive
    const itinerary = buildItinerary({ adventure, start: null, settings })
    const pack = buildPackList(itinerary, adventure, EV_CROSSOVER(), [])
    expect(pack.map((s) => s.title)).toEqual(['Charging'])
  })

  it('overnight kit adapts to vehicles that sleep inside', () => {
    const adventure = ADVENTURES_BY_ID.sand_flats_recreation_area
    const itinerary = buildItinerary({ adventure, start: null, settings, overnight: true })
    const van = buildPackList(itinerary, adventure, CAMPER_VAN(), []).find((s) => s.title === 'Overnight')!
    const wagon = buildPackList(itinerary, adventure, AWD_WAGON(), []).find((s) => s.title === 'Overnight')!
    expect(van.items.some((i) => i.id === 'vehicle_bed')).toBe(true)
    expect(wagon.items.some((i) => i.id === 'tent')).toBe(true)
  })

  it('pre-trip checklist follows the vehicle and route', () => {
    const ev = preTripChecklist(EV_CROSSOVER(), ADVENTURES_BY_ID.arches_scenic_drive).map((i) => i.id)
    expect(ev).toContain('charge')
    expect(ev).not.toContain('4wd')
    const rig = preTripChecklist(STOCK_4X4(), ADVENTURES_BY_ID.fins_and_things).map((i) => i.id)
    expect(rig).toEqual(expect.arrayContaining(['fuel', '4wd', 'airdown', 'recovery', 'map']))
  })
})
