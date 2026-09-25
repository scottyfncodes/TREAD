import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { blankTrip, suggestedTripName } from '../engine/tripPlan'
import { formatClock } from '../engine/time'
import { shortDate } from '../state/dates'
import { vehicleName } from '../domain/vehicle'
import { EmptyState } from '../components/Bits'
import { IconChevron, IconPlus, IconRoute } from '../components/Icons'

export function Trips({ go }: { go: Go }) {
  const { trips, vehicles, date, start, activeVehicle, saveTrip } = useStore()
  const sorted = [...trips].sort((a, b) => a.date.localeCompare(b.date))
  const upcoming = sorted.filter((t) => t.date >= date)
  const past = sorted.filter((t) => t.date < date).reverse()

  const newTrip = () => {
    const trip = blankTrip({ date, start, vehicleId: activeVehicle?.id ?? null })
    saveTrip(trip)
    go(`trip/${trip.id}`)
  }

  const card = (t: (typeof trips)[number]) => {
    const vehicle = vehicles.find((v) => v.id === t.vehicleId)
    return (
      <button key={t.id} type="button" className={t.confirmed ? 'card card--tap card--brand' : 'card card--tap'} onClick={() => go(`trip/${t.id}`)}>
        <div className="card__row">
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">
              {shortDate(t.date)}
              {t.days > 1 ? ` · ${t.days} days` : ''}
              {t.confirmed ? ' · confirmed' : ''}
            </div>
            <h3 className="headline" style={{ marginTop: 4 }}>
              {t.name || suggestedTripName(t)}
            </h3>
            <p className="tiny faint" style={{ margin: '4px 0 0' }}>
              {t.stops.length} stop{t.stops.length === 1 ? '' : 's'} · leave {formatClock(t.departMinutes)}
              {t.start ? ` from ${t.start.label}` : ' · no start set'}
              {vehicle ? ` · ${vehicleName(vehicle)}` : ''}
            </p>
          </div>
          <IconChevron width={20} height={20} className="faint" />
        </div>
      </button>
    )
  }

  return (
    <div>
      <h1 className="display" style={{ marginTop: 10 }}>
        Trips
      </h1>
      <p className="tiny faint" style={{ margin: '6px 0 12px' }}>
        Day trips and road trips. Saved on this device and available with no signal.
      </p>
      <button type="button" className="btn btn--primary" onClick={newTrip}>
        <IconPlus width={18} height={18} /> New trip
      </button>

      {trips.length === 0 && (
        <EmptyState icon={<IconRoute width={40} height={40} />} title="No trips yet" action={<button type="button" className="btn" onClick={() => go('explore')}>Explore adventures</button>}>
          Start one here, or open any adventure and tap “Start a trip with this”.
        </EmptyState>
      )}

      {upcoming.length > 0 && <h2 className="section-title">Upcoming</h2>}
      {upcoming.map(card)}
      {past.length > 0 && <h2 className="section-title">Past</h2>}
      {past.map(card)}
    </div>
  )
}
