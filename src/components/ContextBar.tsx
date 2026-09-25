import { vehicleName } from '../domain/vehicle'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { IconCar, IconPin } from './Icons'

/**
 * The two things that personalise everything: which vehicle, and where
 * from. Always visible on discovery screens, always one tap to change.
 * Empty states say "not set" plainly -- nothing is filled in by default.
 */
export function ContextBar({ go }: { go: Go }) {
  const { activeVehicle, vehicles, start } = useStore()
  return (
    <div className="context">
      <button type="button" className="ctx" onClick={() => go(vehicles.length ? 'garage' : 'vehicle/new')} aria-label="Change vehicle">
        <IconCar className="ctx__icon" />
        <span>
          <span className="ctx__label">Vehicle</span>
          <span className={activeVehicle ? 'ctx__value' : 'ctx__value ctx__value--empty'}>
            {activeVehicle ? vehicleName(activeVehicle) : 'Add a vehicle'}
          </span>
        </span>
      </button>
      <button type="button" className="ctx" onClick={() => go('location')} aria-label="Change starting location">
        <IconPin className="ctx__icon" />
        <span>
          <span className="ctx__label">Starting from</span>
          <span className={start ? 'ctx__value' : 'ctx__value ctx__value--empty'}>{start ? start.label : 'Not set'}</span>
        </span>
      </button>
    </div>
  )
}
