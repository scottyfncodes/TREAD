import { describe, expect, it } from 'vitest'
import { detachVehicle, isPlace, isTrip, normalizeVehicle, removeVehicle, upsert } from './persistence'
import { blankVehicle, isVehicleComplete, vehicleName, vehicleTitle } from '../domain/vehicle'
import { blankTrip } from '../engine/tripPlan'
import { AWD_WAGON, CAMPER_VAN, DALLAS, EV_CROSSOVER, STOCK_4X4 } from '../test/fixtures'

describe('garage: vehicle creation and editing', () => {
  it('a new vehicle starts with nothing assumed', () => {
    const v = blankVehicle(0)
    expect(v.year).toBeNull()
    expect(v.drivetrain).toBe('unknown')
    expect(v.groundClearanceIn).toBeNull()
    expect(v.energyPct).toBeNull()
    expect(v.equipment).toEqual([])
    expect(isVehicleComplete(v)).toBe(false)
  })

  it('year + make + model is a complete minimum profile', () => {
    expect(isVehicleComplete({ ...blankVehicle(0), year: 2024, make: 'Subaru', model: 'Outback' })).toBe(true)
  })

  it('titles read naturally, and nicknames win', () => {
    const v = { ...AWD_WAGON(), trim: 'Wilderness' }
    expect(vehicleTitle(v)).toBe('2024 Subaru Outback Wilderness')
    expect(vehicleName({ ...v, nickname: 'The wagon' })).toBe('The wagon')
  })

  it('editing replaces in place; adding appends', () => {
    const a = AWD_WAGON()
    const b = STOCK_4X4()
    let list = upsert([], a)
    list = upsert(list, b)
    expect(list.map((v) => v.id)).toEqual([a.id, b.id])
    list = upsert(list, { ...a, trim: 'Touring' })
    expect(list).toHaveLength(2)
    expect(list[0].trim).toBe('Touring')
  })
})

describe('garage: multiple vehicles and deletion', () => {
  const a = AWD_WAGON()
  const b = STOCK_4X4()
  const c = EV_CROSSOVER()

  it('deleting a non-preferred vehicle keeps the preference', () => {
    const r = removeVehicle([a, b, c], a.id, b.id)
    expect(r.vehicles.map((v) => v.id)).toEqual([a.id, c.id])
    expect(r.preferredId).toBe(a.id)
  })

  it('deleting the preferred vehicle moves the preference, never leaving it dangling', () => {
    const r = removeVehicle([a, b, c], a.id, a.id)
    expect(r.preferredId).toBe(b.id)
  })

  it('deleting the last vehicle clears the preference', () => {
    expect(removeVehicle([a], a.id, a.id).preferredId).toBeNull()
  })

  it('trips that used a deleted vehicle survive without it', () => {
    const t1 = { ...blankTrip({ date: '2026-10-10', start: null, vehicleId: a.id }), id: 't1' }
    const t2 = { ...blankTrip({ date: '2026-10-11', start: null, vehicleId: c.id }), id: 't2' }
    const out = detachVehicle([t1, t2], a.id)
    expect(out[0].vehicleId).toBeNull()
    expect(out[1].vehicleId).toBe(c.id)
  })
})

describe('stored data outlives the code that wrote it', () => {
  it('back-fills old vehicle records with "not entered" defaults', () => {
    const old = { id: 'v1', make: 'Ford', model: 'Bronco', year: 2022 }
    const v = normalizeVehicle(old)!
    expect(v.equipment).toEqual([])
    expect(v.catalogFields).toEqual([])
    expect(v.groundClearanceIn).toBeNull()
  })

  it('drops things that are not vehicles, trips or places', () => {
    expect(normalizeVehicle(null)).toBeNull()
    expect(normalizeVehicle({ id: 3 })).toBeNull()
    expect(isTrip({ id: 'x' })).toBe(false)
    expect(isPlace({ id: 'p', label: 'x', lat: 200, lon: 0, origin: 'manual' })).toBe(false)
    expect(isPlace(DALLAS)).toBe(true)
  })

  it('accepts trips with or without a start', () => {
    expect(isTrip(blankTrip({ date: '2026-10-10', start: null, vehicleId: null }))).toBe(true)
    expect(isTrip(blankTrip({ date: '2026-10-10', start: DALLAS, vehicleId: CAMPER_VAN().id }))).toBe(true)
  })
})
