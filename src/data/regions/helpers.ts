import type { SeasonWindow } from '../../domain/types'
import type { VehicleRequirements } from '../../domain/adventure'

/**
 * Small builders so region files read as data rather than boilerplate.
 * They fill structure, never facts: every factual field is still passed in
 * explicitly by the region file.
 */
export function requirements(
  fields: Pick<VehicleRequirements, 'access' | 'strength' | 'basis' | 'notes' | 'sources' | 'lastChecked'> &
    Partial<VehicleRequirements>,
): VehicleRequirements {
  return {
    maxWidthIn: null,
    ohvAllowed: null,
    ohvOnly: false,
    recommendedEquipment: [],
    notForStock: false,
    conditional: [],
    ...fields,
  }
}

export function unknownSeason(
  sources: string[],
  lastChecked: string,
  note = 'No published season found. Verify access before you go.',
): SeasonWindow {
  return { months: null, note, confidence: 'unknown', sources, lastChecked }
}

export const ALL_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
