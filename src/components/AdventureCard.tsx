import type { Adventure } from '../domain/adventure'
import { DIFFICULTY_LABEL } from '../domain/adventure'
import type { VehicleAssessment } from '../engine/matching'
import { REGIONS_BY_ID } from '../data'
import { VEHICLE_LABEL } from '../engine/drive'
import { formatMeasure } from '../engine/measure'
import { formatDuration } from '../engine/time'
import type { SeasonVerdict } from '../engine/season'
import { FitChip } from './VehicleFit'
import { IconChevron } from './Icons'
import { Landscape } from './Landscape'
import { sceneFor } from './scenes'

const KIND_LABEL: Record<Adventure['kind'], string> = {
  ohv_route: 'Off-road route',
  scenic_drive: 'Scenic drive',
  destination: 'Destination',
  hike: 'Hike',
  network: 'Trail network',
  ski_area: 'Ski area',
}

export function AdventureCard({
  adventure,
  assessment,
  season,
  transitMinutes,
  transitMiles,
  reasons = [],
  scenic = false,
  showFit = true,
  onOpen,
}: {
  adventure: Adventure
  assessment: VehicleAssessment
  season?: SeasonVerdict
  transitMinutes?: number | null
  transitMiles?: number | null
  reasons?: string[]
  /** Lead with a landscape of the place's country (the home screen does). */
  scenic?: boolean
  /** Hide the fit chip, e.g. when there is no vehicle to compare yet. */
  showFit?: boolean
  onOpen: () => void
}) {
  const region = REGIONS_BY_ID[adventure.regionId]
  return (
    <button type="button" className={scenic ? 'card card--tap card--scenic' : 'card card--tap'} onClick={onOpen}>
      {scenic && <Landscape scene={sceneFor(adventure)} align="middle" className="card__art" />}
      <div className="card__row">
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">
            {KIND_LABEL[adventure.kind]} · {region?.name}
          </div>
          <h3 className="headline" style={{ marginTop: 4 }}>
            {adventure.name}
          </h3>
          <p className="tiny faint" style={{ margin: '4px 0 0' }}>
            {adventure.tagline}
          </p>
        </div>
        <IconChevron width={20} height={20} className="faint" style={{ flex: 'none', marginTop: 4 }} />
      </div>

      <div className="chips" style={{ marginTop: 10 }}>
        {showFit && <FitChip assessment={assessment} />}
        {adventure.difficulty && (
          <span className={`chip ${['very_difficult', 'extreme'].includes(adventure.difficulty.level) ? 'chip--blocker' : adventure.difficulty.level === 'difficult' ? 'chip--caution' : ''}`}>
            {DIFFICULTY_LABEL[adventure.difficulty.level]}
          </span>
        )}
        <span className="chip">{VEHICLE_LABEL[adventure.requirements.access]}</span>
        {adventure.route?.miles !== undefined && adventure.route?.miles !== null && (
          <span className="chip">{formatMeasure(adventure.route.miles, 'mi', { decimals: 1 })}</span>
        )}
        {season === 'out_of_season' && <span className="chip chip--caution">Out of season</span>}
        {season === 'shoulder' && <span className="chip chip--caution">Shoulder season</span>}
        {transitMinutes !== null && transitMinutes !== undefined && transitMinutes > 0 && (
          <span className="chip chip--sand">
            ~{formatDuration(transitMinutes)} · {transitMiles} mi est.
          </span>
        )}
      </div>
      {reasons.length > 0 && (
        <p className="tiny faint" style={{ margin: '8px 0 0' }}>
          {reasons.slice(0, 2).join(' · ')}
        </p>
      )}
    </button>
  )
}
