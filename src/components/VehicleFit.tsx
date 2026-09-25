import type { VehicleAssessment } from '../engine/matching'
import { FIT_LABEL } from '../engine/matching'
import { BasisTag, Mark, type Level } from './Bits'

const FIT_LEVEL: Record<VehicleAssessment['status'], Level> = {
  compatible: 'ok',
  considerations: 'caution',
  beyond: 'blocker',
  unknown: 'unknown',
  no_vehicle: 'unknown',
}

export function FitChip({ assessment }: { assessment: VehicleAssessment }) {
  const level = FIT_LEVEL[assessment.status]
  return <span className={`chip chip--${level}`}>{FIT_LABEL[assessment.status]}</span>
}

/**
 * The full comparison: headline, then every consideration with where it
 * came from. Official requirements, known specs, user data, estimates and
 * community information are each labelled.
 */
export function VehicleFit({ assessment, vehicleLabel, onAddDetails }: { assessment: VehicleAssessment; vehicleLabel: string | null; onAddDetails?: () => void }) {
  return (
    <section className={`fit fit--${assessment.status}`} aria-label="Vehicle considerations">
      <div className="fit__head">
        <Mark level={FIT_LEVEL[assessment.status]} />
        <span>
          {FIT_LABEL[assessment.status]}
          {vehicleLabel ? <span className="faint" style={{ fontWeight: 600 }}> · {vehicleLabel}</span> : null}
        </span>
      </div>
      <p className="small muted" style={{ margin: '8px 0 0' }}>
        {assessment.headline}
      </p>
      {assessment.items.length > 0 && (
        <ul className="fit__list">
          {assessment.items.map((item, i) => (
            <li key={i} className="fit__item">
              <Mark level={item.level} />
              <span>
                {item.text} <BasisTag basis={item.basis} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {assessment.missing.length > 0 && onAddDetails && (
        <button type="button" className="btn btn--ghost btn--small" style={{ marginTop: 10 }} onClick={onAddDetails}>
          Add {assessment.missing.join(', ').toLowerCase()} to sharpen this
        </button>
      )}
      <p className="tiny faint" style={{ margin: '10px 0 0' }}>
        TREAD compares published requirements with what is known about your vehicle. It cannot tell you a route is safe -- conditions, driving and
        the land manager decide that.
      </p>
    </section>
  )
}
