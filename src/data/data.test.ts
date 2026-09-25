import { describe, expect, it } from 'vitest'
import {
  ADVENTURES,
  ADVENTURES_BY_ID,
  CAMPS,
  CAMPS_BY_ID,
  FOOD,
  FOOD_BY_ID,
  GATEWAYS,
  GATEWAYS_BY_ID,
  HIKES,
  HIKES_BY_ID,
  NETWORKS,
  NETWORKS_BY_ID,
  REGIONS,
  REGIONS_BY_ID,
  STOPS,
  STOPS_BY_ID,
  adventuresInRegion,
} from './index'
import { SOURCES, trustOf } from './sources'
import { CATEGORY_BY_ID } from './categories'
import type { Sourced } from '../domain/types'
import { high, low } from '../engine/measure'

const ALL_SOURCED: Array<{ what: string; record: Sourced }> = [
  ...REGIONS.map((r) => ({ what: `region ${r.id}`, record: r })),
  ...GATEWAYS.map((g) => ({ what: `gateway ${g.id}`, record: g })),
  ...NETWORKS.flatMap((n) => [
    { what: `network ${n.id}`, record: n as Sourced },
    { what: `network ${n.id} season`, record: n.season },
    ...n.trailheads.map((t) => ({ what: `trailhead ${t.id}`, record: t as Sourced })),
  ]),
  ...HIKES.flatMap((h) => [
    { what: `hike ${h.id}`, record: h as Sourced },
    { what: `hike ${h.id} parking`, record: h.parking },
    { what: `hike ${h.id} season`, record: h.season },
  ]),
  ...CAMPS.flatMap((c) => [
    { what: `camp ${c.id}`, record: c as Sourced },
    { what: `camp ${c.id} season`, record: c.season },
  ]),
  ...FOOD.map((f) => ({ what: `food ${f.id}`, record: f })),
  ...STOPS.map((s) => ({ what: `stop ${s.id}`, record: s })),
  ...ADVENTURES.flatMap((a) => [
    { what: `adventure ${a.id}`, record: a as Sourced },
    { what: `adventure ${a.id} season`, record: a.season },
    { what: `adventure ${a.id} requirements`, record: a.requirements },
    ...(a.route ? [{ what: `adventure ${a.id} route`, record: a.route as Sourced }] : []),
    ...(a.difficulty ? [{ what: `adventure ${a.id} difficulty`, record: a.difficulty as Sourced }] : []),
    ...a.fees.map((f) => ({ what: `adventure ${a.id} fee ${f.label}`, record: f as Sourced })),
    ...a.access.map((s, i) => ({ what: `adventure ${a.id} access leg ${i}`, record: s as Sourced })),
  ]),
]

describe('provenance', () => {
  it('every record cites at least one source', () => {
    for (const { what, record } of ALL_SOURCED) expect(record.sources.length, `${what} has no sources`).toBeGreaterThan(0)
  })
  it('every cited source exists', () => {
    for (const { what, record } of ALL_SOURCED)
      for (const id of record.sources) expect(SOURCES[id], `${what} cites unknown source "${id}"`).toBeDefined()
  })
  it('every record carries a check date', () => {
    for (const { what, record } of ALL_SOURCED) expect(record.lastChecked, `${what}`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('every source has an https URL and an organisation', () => {
    for (const s of Object.values(SOURCES)) {
      expect(s.url).toMatch(/^https:\/\//)
      expect(s.org.length).toBeGreaterThan(0)
    }
  })
  it('reports the strongest kind of source behind a fact', () => {
    expect(trustOf(['rr4w', 'blm_moab'])).toBe('agency')
    expect(trustOf(['rr4w'])).toBe('community')
    expect(trustOf([])).toBe('none')
  })
  it('official-basis requirements cite at least one agency source', () => {
    for (const a of ADVENTURES) {
      if (a.requirements.basis !== 'official') continue
      expect(trustOf(a.requirements.sources), `${a.id} is labelled official`).toBe('agency')
    }
  })
  it('official-basis difficulty ratings cite an agency', () => {
    for (const a of ADVENTURES) {
      if (a.difficulty?.basis === 'official') expect(trustOf(a.difficulty.sources), a.id).toBe('agency')
    }
  })
})

describe('referential integrity', () => {
  it('adventures point at things that exist', () => {
    for (const a of ADVENTURES) {
      expect(REGIONS_BY_ID[a.regionId], `${a.id} region`).toBeDefined()
      expect(GATEWAYS_BY_ID[a.gatewayId], `${a.id} gateway`).toBeDefined()
      if (a.networkId) expect(NETWORKS_BY_ID[a.networkId], `${a.id} network`).toBeDefined()
      a.hikeIds.forEach((id) => expect(HIKES_BY_ID[id], `${a.id} hike ${id}`).toBeDefined())
      a.stopIds.forEach((id) => expect(STOPS_BY_ID[id], `${a.id} stop ${id}`).toBeDefined())
      a.campIds.forEach((id) => expect(CAMPS_BY_ID[id], `${a.id} camp ${id}`).toBeDefined())
      a.foodIds.forEach((id) => expect(FOOD_BY_ID[id], `${a.id} food ${id}`).toBeDefined())
      a.categories.forEach((c) => expect(CATEGORY_BY_ID[c], `${a.id} category ${c}`).toBeDefined())
    }
  })
  it('regions list gateways that exist', () => {
    for (const r of REGIONS) r.gatewayIds.forEach((g) => expect(GATEWAYS_BY_ID[g], `${r.id} -> ${g}`).toBeDefined())
  })
  it('networks list access communities that exist', () => {
    for (const n of NETWORKS) n.accessCommunityIds.forEach((g) => expect(GATEWAYS_BY_ID[g]).toBeDefined())
  })
  it('adventures never recommend a closed food stop', () => {
    for (const a of ADVENTURES) for (const id of a.foodIds) expect(FOOD_BY_ID[id].closed, `${a.id} -> ${id}`).toBeNull()
  })
})

describe('measures are sane', () => {
  it('ranges are ordered and non-negative', () => {
    for (const a of ADVENTURES) {
      if (!a.route) continue
      const lo = low(a.route.miles)
      const hi = high(a.route.miles)
      if (lo !== null && hi !== null) {
        expect(lo).toBeGreaterThanOrEqual(0)
        expect(hi).toBeGreaterThanOrEqual(lo)
      }
    }
  })
  it('seasons use real month numbers', () => {
    for (const a of ADVENTURES) for (const m of a.season.months ?? []) expect(m >= 1 && m <= 12).toBe(true)
  })
  it('coordinates in Utah regions fall inside Utah', () => {
    for (const a of ADVENTURES.filter((x) => REGIONS_BY_ID[x.regionId].state === 'UT')) {
      expect(a.anchor.lat, a.id).toBeGreaterThan(37)
      expect(a.anchor.lat, a.id).toBeLessThan(42)
      expect(a.anchor.lon, a.id).toBeGreaterThan(-114.1)
      expect(a.anchor.lon, a.id).toBeLessThan(-109.04)
    }
  })
})

describe('Utah: Moab & Sand Flats', () => {
  const required = ['hells_revenge', 'fins_and_things', 'moab_rim', 'pritchett_canyon', 'poison_spider_mesa', 'metal_masher', 'seven_mile_rim', 'gemini_bridges', 'kane_creek', 'sand_flats_recreation_area']
  it('includes every named route', () => {
    for (const id of required) expect(ADVENTURES_BY_ID[id], id).toBeDefined()
  })
  it("represents Hell's Revenge as an extreme, official 4WD route -- not generic off-road", () => {
    const hr = ADVENTURES_BY_ID.hells_revenge
    expect(hr.difficulty?.level).toBe('extreme')
    expect(hr.difficulty?.basis).toBe('official')
    expect(hr.requirements.access).toBe('four_wd_low_range')
    expect(hr.route?.miles).toBe(6.5)
    expect(hr.landManager).toMatch(/Grand County/)
  })
  it('keeps Fins & Things one-way at 9.4 mi per the county', () => {
    const f = ADVENTURES_BY_ID.fins_and_things
    expect(f.route?.shape).toBe('one_way')
    expect(f.route?.miles).toBe(9.4)
  })
  it('does not flatten difficulty: routes differ', () => {
    const levels = new Set(required.map((id) => ADVENTURES_BY_ID[id].difficulty?.level ?? 'none'))
    expect(levels.size).toBeGreaterThanOrEqual(4)
  })
  it('leaves unverified figures UNKNOWN rather than inventing them', () => {
    expect(ADVENTURES_BY_ID.pritchett_canyon.route?.miles).toBeNull()
    expect(ADVENTURES_BY_ID.seven_mile_rim.difficulty).toBeNull()
  })
  it('labels club-sourced route requirements as community', () => {
    for (const id of ['moab_rim', 'pritchett_canyon', 'poison_spider_mesa', 'metal_masher']) {
      expect(ADVENTURES_BY_ID[id].requirements.basis).toBe('community')
      expect(ADVENTURES_BY_ID[id].requirements.notForStock).toBe(true)
    }
  })
  it('Sand Flats carries its fees with sources', () => {
    expect(ADVENTURES_BY_ID.sand_flats_recreation_area.fees.length).toBeGreaterThan(0)
  })
})

describe('Utah: San Rafael Swell', () => {
  it('is a region with a designated route network', () => {
    const net = NETWORKS_BY_ID.srs_designated_routes
    expect(net.regionId).toBe('ut_san_rafael')
    expect(net.mainRouteMiles).toBe(1355)
  })
  it('includes the representative destinations, linked to the network', () => {
    for (const id of ['behind_the_reef', 'buckhorn_wash', 'wedge_overlook', 'temple_mountain', 'chimney_rock_swell']) {
      expect(ADVENTURES_BY_ID[id], id).toBeDefined()
      expect(ADVENTURES_BY_ID[id].networkId).toBe('srs_designated_routes')
    }
  })
  it('records the Behind the Reef 50-inch width limit and 4WD requirement', () => {
    const btr = ADVENTURES_BY_ID.behind_the_reef.requirements
    expect(btr.maxWidthIn).toBe(50)
    expect(btr.access).toBe('four_wd')
  })
  it('marks conflicting Chimney Rock access as unknown', () => {
    expect(ADVENTURES_BY_ID.chimney_rock_swell.requirements.access).toBe('unknown')
  })
})

describe('Utah: Paiute Trail', () => {
  const net = NETWORKS_BY_ID.paiute_trail
  it('is a network, not a single trail', () => {
    expect(net).toBeDefined()
    expect(ADVENTURES_BY_ID.paiute_main_loop.kind).toBe('network')
    expect(adventuresInRegion('ut_paiute').filter((a) => a.networkId === 'paiute_trail').length).toBeGreaterThanOrEqual(3)
  })
  it('lists access communities and trailheads', () => {
    expect(net.accessCommunityIds).toEqual(expect.arrayContaining(['richfield', 'marysvale', 'beaver']))
    expect(net.trailheads.length).toBeGreaterThanOrEqual(2)
  })
  it('keeps the published spread on the main loop length', () => {
    expect(net.mainRouteMiles).toEqual({ min: 240, max: 275 })
  })
  it('records width limits and OHV applicability', () => {
    expect(net.widthLimitsIn).toEqual([50, 60])
    expect(ADVENTURES_BY_ID.paiute_main_loop.requirements.ohvAllowed).toBe(true)
  })
  it('has a documented snow season', () => {
    expect(net.season.months).not.toContain(1)
    expect(net.season.note).toMatch(/early July/)
  })
})

describe('architecture: regions are data', () => {
  it('supports more than one state through the same structure', () => {
    expect(new Set(REGIONS.map((r) => r.state)).size).toBeGreaterThanOrEqual(2)
  })
  it('ids are unique across all packs', () => {
    const ids = ADVENTURES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
