import { describe, expect, it } from 'vitest'
import { ADVENTURES_BY_ID, NETWORKS_BY_ID } from '../../data'
import { assessVehicle, type VehicleAssessment } from '../matching'
import { roundTripFromGateway } from '../itinerary'
import { AWD_WAGON, BARE, BUILT_4X4, CAMPER_VAN, EV_CROSSOVER, SPORTS_CAR, STOCK_4X4, UTV_50, UTV_64 } from '../../test/fixtures'
import type { VehicleProfile } from '../../domain/vehicle'

function assess(v: VehicleProfile | null, id: string): VehicleAssessment {
  const a = ADVENTURES_BY_ID[id]
  return assessVehicle(v, a, {
    network: a.networkId ? NETWORKS_BY_ID[a.networkId] : null,
    roundTripMiles: roundTripFromGateway(a),
  })
}

const allText = (x: VehicleAssessment) => [x.headline, ...x.items.map((i) => i.text)].join(' ').toLowerCase()

describe("Hell's Revenge", () => {
  it('flags an AWD wagon as likely beyond it, citing the official 4WD requirement', () => {
    const r = assess(AWD_WAGON(), 'hells_revenge')
    expect(r.status).toBe('beyond')
    const drivetrain = r.items.find((i) => i.topic === 'drivetrain')
    expect(drivetrain?.level).toBe('blocker')
    expect(drivetrain?.basis).toBe('official')
    expect(drivetrain?.text).toMatch(/AWD is not the same as 4WD/)
  })

  it('treats a capable, equipped 4x4 as compatible -- while saying difficulty remains high', () => {
    const r = assess(BUILT_4X4(), 'hells_revenge')
    expect(r.status).toBe('compatible')
    expect(r.headline).toMatch(/difficulty remains high/i)
    expect(r.items.some((i) => i.topic === 'difficulty')).toBe(true)
  })

  it('never calls a route safe or guarantees anything', () => {
    for (const v of [AWD_WAGON(), STOCK_4X4(), BUILT_4X4(), BARE(), null]) {
      const text = allText(assess(v, 'hells_revenge'))
      expect(text).not.toMatch(/\bis safe\b|\bguarantee/)
    }
  })

  it('labels clearance for a 4WD route as TREAD guidance, not a published requirement', () => {
    const r = assess({ ...STOCK_4X4(), groundClearanceIn: 7.5 }, 'hells_revenge')
    const clearance = r.items.find((i) => i.topic === 'clearance')
    expect(clearance?.basis).toBe('estimate')
    expect(clearance?.level).toBe('caution')
  })
})

describe('modified-vehicle routes', () => {
  it('flags a stock 4x4 with no lockers on Pritchett Canyon', () => {
    const r = assess(STOCK_4X4(), 'pritchett_canyon')
    expect(r.status).toBe('beyond')
    expect(r.items.find((i) => i.topic === 'stock')?.basis).toBe('community')
  })
  it('recognises a built 4x4 as the kind of build described', () => {
    expect(assess(BUILT_4X4(), 'pritchett_canyon').items.find((i) => i.topic === 'stock')?.level).toBe('ok')
  })
  it('recommended-strength community guidance is a caution, not a blocker, for tires', () => {
    const r = assess(STOCK_4X4(), 'moab_rim')
    expect(r.items.find((i) => i.topic === 'stock')?.level).toBe('caution')
  })
})

describe('everyday vehicles on easy adventures', () => {
  it('a sports car suits the paved Arches drive', () => {
    expect(assess(SPORTS_CAR(), 'arches_scenic_drive').status).toBe('compatible')
  })
  it('an AWD wagon suits the graded Buckhorn Wash backway, with the wet-road caveat', () => {
    const r = assess(AWD_WAGON(), 'buckhorn_wash')
    expect(r.status).toBe('compatible')
    expect(r.items.some((i) => i.topic === 'conditions' && /wet/i.test(i.text))).toBe(true)
  })
  it('a camper van suits Sand Flats camping', () => {
    expect(assess(CAMPER_VAN(), 'sand_flats_recreation_area').status).toBe('compatible')
  })
})

describe('different vehicles get different answers from the same data', () => {
  it('Gemini Bridges: sports car vs capable 4x4', () => {
    expect(assess(SPORTS_CAR(), 'gemini_bridges').status).toBe('considerations')
    expect(assess(BUILT_4X4(), 'gemini_bridges').status).toBe('compatible')
  })
})

describe('OHV rules and width limits', () => {
  it('Shafer Trail rejects UTVs (not permitted in the park)', () => {
    const r = assess(UTV_64(), 'shafer_trail')
    expect(r.status).toBe('beyond')
    expect(r.items.find((i) => i.topic === 'ohv')?.basis).toBe('official')
  })

  it('Behind the Reef: full-size vehicles are told to turn around before the 50-inch section', () => {
    const width = assess(BUILT_4X4(), 'behind_the_reef').items.find((i) => i.topic === 'width')
    expect(width?.level).toBe('caution')
    expect(width?.text).toMatch(/50 inches/)
  })

  it('Behind the Reef: a 64-inch UTV is blocked by the width limit; a 48-inch ATV fits', () => {
    expect(assess(UTV_64(), 'behind_the_reef').items.find((i) => i.topic === 'width')?.level).toBe('blocker')
    expect(assess(UTV_50(), 'behind_the_reef').items.find((i) => i.topic === 'width')?.level).toBe('ok')
  })

  it('Paiute: network width limits surface for full-size vehicles', () => {
    const w = assess(AWD_WAGON(), 'paiute_main_loop').items.find((i) => i.topic === 'width')
    expect(w?.level).toBe('caution')
    expect(w?.text).toMatch(/50" and 60"/)
  })
})

describe('EV vs ICE range', () => {
  it('asks an EV with no range entered for it, and notes charging is not tracked', () => {
    const ev = { ...EV_CROSSOVER(), rangeMiles: null }
    const r = assess(ev, 'metal_masher')
    const range = r.items.find((i) => i.topic === 'range')
    expect(range?.level).toBe('unknown')
    expect(range?.text).toMatch(/does not track charging/)
  })
  it('compares the gateway round trip with an entered range', () => {
    const shortRange = { ...EV_CROSSOVER(), rangeMiles: 50 }
    expect(assess(shortRange, 'metal_masher').items.find((i) => i.topic === 'range')?.level).toBe('caution')
    expect(assess(STOCK_4X4(), 'metal_masher').items.find((i) => i.topic === 'range')?.level).toBe('ok')
  })
})

describe('missing data and no vehicle', () => {
  it('produces unknowns and asks for the missing details instead of guessing', () => {
    const r = assess(BARE(), 'fins_and_things')
    expect(r.status).toBe('unknown')
    expect(r.missing).toEqual(expect.arrayContaining(['Drivetrain', 'Ground clearance']))
  })
  it('with no vehicle, shows the published access and asks for one', () => {
    const r = assess(null, 'hells_revenge')
    expect(r.status).toBe('no_vehicle')
    expect(r.headline).toMatch(/Add a vehicle/)
  })
  it('ACCESS STATUS UNKNOWN routes stay a caution for every vehicle', () => {
    for (const v of [BUILT_4X4(), SPORTS_CAR()]) {
      expect(assess(v, 'chimney_rock_swell').items.some((i) => /ACCESS STATUS UNKNOWN/.test(i.text))).toBe(true)
    }
  })
})

describe('provenance on every line', () => {
  it('every consideration carries a basis', () => {
    for (const id of Object.keys(ADVENTURES_BY_ID)) {
      for (const item of assess(STOCK_4X4(), id).items) {
        expect(['official', 'vehicle_spec', 'user', 'estimate', 'community']).toContain(item.basis)
      }
    }
  })
  it('equipment suggestions are labelled as TREAD estimates', () => {
    const eq = assess(AWD_WAGON(), 'hells_revenge').items.find((i) => i.topic === 'equipment')
    expect(eq?.basis).toBe('estimate')
  })
})
