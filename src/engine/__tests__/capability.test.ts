import { describe, expect, it } from 'vitest'
import { capabilitiesOf, capabilityChips, fitsWidth, HIGH_CLEARANCE_IN, profileCompleteness } from '../capability'
import { AWD_WAGON, BARE, BUILT_4X4, CAMPER_VAN, EV_CROSSOVER, SPORTS_CAR, STOCK_4X4, UTV_64, vehicle } from '../../test/fixtures'

describe('capability model: drivetrains', () => {
  it('distinguishes AWD from 4WD', () => {
    const awd = capabilitiesOf(AWD_WAGON())
    expect(awd.awd.value).toBe(true)
    expect(awd.fourWd.value).toBe(false)
    const fourWd = capabilitiesOf(STOCK_4X4())
    expect(fourWd.fourWd.value).toBe(true)
    expect(fourWd.awd.value).toBe(false)
  })

  it('knows a non-4WD vehicle has no low range, as a derived fact', () => {
    const c = capabilitiesOf(AWD_WAGON())
    expect(c.lowRange.value).toBe(false)
    expect(c.lowRange.basis).toBe('estimate')
  })

  it('treats FWD and RWD as two-wheel drive', () => {
    expect(capabilitiesOf(vehicle({ drivetrain: 'fwd' })).fourWd.value).toBe(false)
    expect(capabilitiesOf(SPORTS_CAR()).fourWd.value).toBe(false)
  })

  it('reports low range only when entered for a 4WD', () => {
    expect(capabilitiesOf(vehicle({ drivetrain: '4wd_part_time', lowRange: null })).lowRange.value).toBeNull()
    expect(capabilitiesOf(STOCK_4X4()).lowRange.value).toBe(true)
  })
})

describe('capability model: missing optional data', () => {
  it('returns unknown for everything a bare profile does not say', () => {
    const c = capabilitiesOf(BARE())
    expect(c.fourWd.value).toBeNull()
    expect(c.clearanceIn.value).toBeNull()
    expect(c.highClearance.value).toBeNull()
    expect(c.rangeMiles.value).toBeNull()
    expect(c.offroadTires.value).toBeNull()
    expect(c.lockers.value).toBeNull()
    expect(c.widthIn.value).toBeNull()
  })

  it('never invents a clearance from the vehicle type', () => {
    const suv = capabilitiesOf(vehicle({ type: 'suv', drivetrain: '4wd_full_time' }))
    expect(suv.clearanceIn.value).toBeNull()
    expect(suv.highClearance.basis).toBe('unknown')
  })

  it('uses the disclosed high-clearance threshold', () => {
    expect(capabilitiesOf(vehicle({ groundClearanceIn: HIGH_CLEARANCE_IN })).highClearance.value).toBe(true)
    expect(capabilitiesOf(vehicle({ groundClearanceIn: HIGH_CLEARANCE_IN - 0.5 })).highClearance.value).toBe(false)
  })

  it('counts profile completeness for gentle nudges', () => {
    expect(profileCompleteness(BARE()).filled).toBe(0)
    expect(profileCompleteness(BUILT_4X4()).missing).toContain('Width')
  })
})

describe('capability model: vehicle kinds', () => {
  it('flags EVs and plug-ins', () => {
    expect(capabilitiesOf(EV_CROSSOVER()).ev).toBe(true)
    expect(capabilitiesOf(vehicle({ powertrain: 'phev' })).plugIn).toBe(true)
    expect(capabilitiesOf(vehicle({ powertrain: 'phev' })).ev).toBe(false)
    expect(capabilitiesOf(STOCK_4X4()).ev).toBe(false)
  })

  it('knows campers sleep inside, and records the basis', () => {
    const c = capabilitiesOf(CAMPER_VAN())
    expect(c.sleepsInVehicle.value).toBe(true)
    expect(capabilitiesOf(vehicle({ type: 'camper_van' })).sleepsInVehicle.value).toBe(true)
    expect(capabilitiesOf(vehicle({ equipment: ['rooftop_tent'] })).sleepsInVehicle.value).toBe(true)
    expect(capabilitiesOf(AWD_WAGON()).sleepsInVehicle.value).toBeNull()
  })

  it('treats ATVs and UTVs as OHVs and road vehicles as full-size', () => {
    expect(capabilitiesOf(UTV_64()).isOhv).toBe(true)
    expect(capabilitiesOf(UTV_64()).isFullSize).toBe(false)
    expect(capabilitiesOf(AWD_WAGON()).isFullSize).toBe(true)
  })

  it('only assumes street-legality for road vehicle types', () => {
    expect(capabilitiesOf(AWD_WAGON()).streetLegal.value).toBe(true)
    expect(capabilitiesOf(AWD_WAGON()).streetLegal.basis).toBe('estimate')
    expect(capabilitiesOf(vehicle({ type: 'utv' })).streetLegal.value).toBeNull()
  })

  it('marks catalogue-filled fields as vehicle spec, typed fields as user', () => {
    const fromCatalog = vehicle({ drivetrain: 'awd', catalogFields: ['drivetrain'] })
    expect(capabilitiesOf(fromCatalog).awd.basis).toBe('vehicle_spec')
    expect(capabilitiesOf(vehicle({ drivetrain: 'awd' })).awd.basis).toBe('user')
  })
})

describe('width limits', () => {
  it('answers for full-size vehicles even without a typed width', () => {
    const fit = fitsWidth(capabilitiesOf(AWD_WAGON()), 50)
    expect(fit.value).toBe(false)
    expect(fit.basis).toBe('estimate')
  })
  it('uses the entered width for OHVs', () => {
    expect(fitsWidth(capabilitiesOf(UTV_64()), 60).value).toBe(false)
    expect(fitsWidth(capabilitiesOf(UTV_64()), 65).value).toBe(true)
  })
  it('says unknown for an OHV with no width', () => {
    expect(fitsWidth(capabilitiesOf(vehicle({ type: 'utv' })), 50).value).toBeNull()
  })
})

describe('capability chips', () => {
  it('only states what is known', () => {
    expect(capabilityChips(BARE())).toEqual([])
    expect(capabilityChips(STOCK_4X4())).toContain('4WD + low range')
    expect(capabilityChips(EV_CROSSOVER())).toContain('Electric')
  })
})
