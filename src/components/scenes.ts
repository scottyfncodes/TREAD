import type { Adventure } from '../domain/adventure'

/** The kinds of country a landscape can show; see Landscape.tsx. */
export type Scene = 'arch' | 'canyon' | 'alpine' | 'flats' | 'mesa'

/** Places whose country is not the region's usual look. */
const SCENE_BY_ADVENTURE: Record<string, Scene> = {
  arches_scenic_drive: 'arch',
  gemini_bridges: 'arch',
  kane_creek: 'canyon',
  pritchett_canyon: 'canyon',
  shafer_trail: 'canyon',
  buckhorn_wash: 'canyon',
  beaver_canyon_byway: 'canyon',
  paiute_marysvale: 'canyon',
  paiute_koosharem: 'canyon',
  goblin_valley: 'flats',
  temple_mountain: 'flats',
  behind_the_reef: 'flats',
  mesa_verde_chapin_mesa: 'mesa',
}

const SCENE_BY_REGION: Record<string, Scene> = {
  ut_moab: 'flats',
  ut_san_rafael: 'mesa',
  ut_paiute: 'alpine',
  co_san_juans: 'alpine',
}

export function sceneFor(adventure: Pick<Adventure, 'id' | 'regionId'>): Scene {
  return SCENE_BY_ADVENTURE[adventure.id] ?? SCENE_BY_REGION[adventure.regionId] ?? 'mesa'
}
