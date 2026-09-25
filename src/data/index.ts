import type {
  Adventure,
  Camp,
  FoodStop,
  Gateway,
  Hike,
  Region,
  RegionPack,
  Stop,
  TrailNetwork,
} from '../domain/adventure'
import { MOAB } from './regions/utah/moab'
import { SAN_RAFAEL } from './regions/utah/sanRafael'
import { PAIUTE } from './regions/utah/paiute'
import { SAN_JUANS } from './regions/colorado/sanJuans'

/**
 * The regional registry. Adding a region -- or a whole state -- is writing
 * a RegionPack and listing it here. Nothing in the engine or the screens
 * names a specific region.
 */
export const REGION_PACKS: RegionPack[] = [MOAB, SAN_RAFAEL, PAIUTE, SAN_JUANS]

function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  const out: Record<string, T> = {}
  for (const item of items) {
    if (out[item.id]) throw new Error(`Duplicate id in dataset: ${item.id}`)
    out[item.id] = item
  }
  return out
}

export const REGIONS: Region[] = REGION_PACKS.map((p) => p.region)
export const ADVENTURES: Adventure[] = REGION_PACKS.flatMap((p) => p.adventures)
export const NETWORKS: TrailNetwork[] = REGION_PACKS.flatMap((p) => p.networks)
export const GATEWAYS: Gateway[] = REGION_PACKS.flatMap((p) => p.gateways)
export const HIKES: Hike[] = REGION_PACKS.flatMap((p) => p.hikes)
export const CAMPS: Camp[] = REGION_PACKS.flatMap((p) => p.camps)
export const FOOD: FoodStop[] = REGION_PACKS.flatMap((p) => p.food)
export const STOPS: Stop[] = REGION_PACKS.flatMap((p) => p.stops)

export const REGIONS_BY_ID = byId(REGIONS)
export const ADVENTURES_BY_ID = byId(ADVENTURES)
export const NETWORKS_BY_ID = byId(NETWORKS)
export const GATEWAYS_BY_ID = byId(GATEWAYS)
export const HIKES_BY_ID = byId(HIKES)
export const CAMPS_BY_ID = byId(CAMPS)
export const FOOD_BY_ID = byId(FOOD)
export const STOPS_BY_ID = byId(STOPS)

/** States with at least one region, in display order. */
export function statesWithRegions(): Array<{ state: string; stateName: string; regions: Region[] }> {
  const out: Array<{ state: string; stateName: string; regions: Region[] }> = []
  for (const region of REGIONS) {
    let bucket = out.find((s) => s.state === region.state)
    if (!bucket) {
      bucket = { state: region.state, stateName: region.stateName, regions: [] }
      out.push(bucket)
    }
    bucket.regions.push(region)
  }
  return out
}

export function adventuresInRegion(regionId: string): Adventure[] {
  return ADVENTURES.filter((a) => a.regionId === regionId)
}
