import { describe, expect, it } from 'vitest'
import { ADVENTURES, ADVENTURES_BY_ID } from '../data'
import { sceneFor } from './scenes'

describe('landscape scenes', () => {
  it('gives every adventure a scene', () => {
    for (const a of ADVENTURES) expect(['arch', 'canyon', 'alpine', 'flats', 'mesa']).toContain(sceneFor(a))
  })

  it('matches the country of well-known places', () => {
    expect(sceneFor(ADVENTURES_BY_ID.arches_scenic_drive)).toBe('arch')
    expect(sceneFor(ADVENTURES_BY_ID.beaver_canyon_byway)).toBe('canyon')
    expect(sceneFor(ADVENTURES_BY_ID.ophir_pass)).toBe('alpine')
    expect(sceneFor(ADVENTURES_BY_ID.hells_revenge)).toBe('flats')
  })
})
