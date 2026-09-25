import { useMemo } from 'react'
import { ADVENTURES_BY_ID } from '../data'
import { vehicleName } from '../domain/vehicle'
import { buildItinerary } from '../engine/itinerary'
import { buildReadiness } from '../engine/readiness'
import { buildPackList, packProgress } from '../engine/gear'
import { preTripChecklist } from '../engine/prep'
import { capabilitiesOf } from '../engine/capability'
import { high } from '../engine/measure'
import { HIKES_BY_ID } from '../data'
import { findDay } from '../services/weather'
import { useStore } from '../state/store'
import { useWeather } from '../state/useWeather'
import type { Go } from '../state/useRoute'
import { addDaysIso, shortDate } from '../state/dates'
import { settingsFromPrefs } from '../components/DayControls'
import { BackLink, EmptyState, Mark, SectionTitle, WarningList } from '../components/Bits'
import { VehicleFit } from '../components/VehicleFit'
import { Timeline } from '../components/Timeline'

/**
 * READY TO GO: the glanceable answer first, the detail underneath.
 */
export function ReadyScreen({ id, stop, go }: { id: string; stop: string | null; go: Go }) {
  const { trips, vehicles, saveVehicle, saveTrip, prefs, ownedGear } = useStore()
  const trip = trips.find((t) => t.id === id)
  const stopEntry = trip ? (trip.stops.find((s) => s.adventureId === stop) ?? trip.stops[0]) : undefined
  const adventure = stopEntry ? ADVENTURES_BY_ID[stopEntry.adventureId] : undefined
  const vehicle = trip ? (vehicles.find((v) => v.id === trip.vehicleId) ?? null) : null
  const date = trip && stopEntry ? addDaysIso(trip.date, stopEntry.day) : ''

  const elevation = useMemo(() => {
    const hike = adventure?.hikeIds.map((h) => HIKES_BY_ID[h]).find(Boolean)
    return high(hike?.highPointFt ?? null)
  }, [adventure])
  const weather = useWeather(adventure?.anchor.lat ?? null, adventure?.anchor.lon ?? null, elevation)

  const itinerary = useMemo(() => {
    if (!trip || !adventure || !stopEntry) return null
    // Day one leaves from the trip's start; later days begin at the previous stop's gateway.
    const start = stopEntry.day === 0 && trip.stops.indexOf(stopEntry) === 0 ? trip.start : null
    return buildItinerary({
      adventure,
      start,
      settings: { ...settingsFromPrefs(prefs, date), departMinutes: trip.departMinutes },
      overnight: trip.overnight,
    })
  }, [trip, adventure, stopEntry, prefs, date])

  if (!trip || !adventure || !itinerary || !stopEntry) {
    return (
      <div>
        <BackLink onClick={() => go('trips')} label="Trips" />
        <EmptyState title="Nothing to check yet">Add an adventure to this trip first.</EmptyState>
      </div>
    )
  }

  const day = findDay(weather.data, date)
  const readiness = buildReadiness({
    adventure,
    itinerary,
    vehicle,
    weather: day,
    weatherNote: weather.loading ? 'Loading forecast…' : weather.error ? 'Forecast unavailable (offline or service error).' : 'Date is outside the 7-day forecast window.',
  })
  const pack = buildPackList(itinerary, adventure, vehicle, ownedGear)
  const progress = packProgress(pack, trip.packed)
  const togglePacked = (key: string) =>
    saveTrip({ ...trip, packed: trip.packed.includes(key) ? trip.packed.filter((k) => k !== key) : [...trip.packed, key] })

  const overallLevel = readiness.overall === 'ready' ? 'ok' : readiness.overall === 'check' ? 'caution' : 'blocker'

  return (
    <div>
      <BackLink onClick={() => go(`trip/${trip.id}`)} label="Trip" />

      {trip.stops.length > 1 && (
        <div className="chips chips--scroll" role="group" aria-label="Stop">
          {trip.stops.map((s) => (
            <button key={s.adventureId} type="button" className="chip" aria-pressed={s.adventureId === stopEntry.adventureId} onClick={() => go(`ready/${trip.id}/${s.adventureId}`)}>
              {ADVENTURES_BY_ID[s.adventureId]?.name ?? s.adventureId}
            </button>
          ))}
        </div>
      )}

      <section className="ready" aria-label="Ready to go summary">
        <div className="ready__title">
          <div className="eyebrow" style={{ color: 'var(--brand)' }}>Ready to go · {shortDate(date)}</div>
          <h2 style={{ marginTop: 6 }}>{readiness.title}</h2>
          <p className="small" style={{ margin: '8px 0 0', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Mark level={overallLevel} /> {readiness.overallText}
          </p>
        </div>
        {readiness.rows.map((row) => (
          <div key={row.key} className="ready__row">
            <Mark level={row.status} />
            <div>
              <div className="ready__label">{row.label}</div>
              <div className="ready__value">{row.value}</div>
              <div className="ready__detail">{row.detail}</div>
            </div>
          </div>
        ))}
      </section>

      {vehicle && (
        <div className="card card--flat">
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field__label">
              Current {capabilitiesOf(vehicle).ev ? 'charge' : 'fuel'} level: {vehicle.energyPct === null ? 'not entered' : `${Math.round(vehicle.energyPct)}%`}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={vehicle.energyPct ?? 50}
              onChange={(e) => saveVehicle({ ...vehicle, energyPct: Number(e.target.value), energyUpdatedAt: Date.now() })}
              aria-label="Fuel or charge level"
            />
            <span className="field__help">You enter this; TREAD never assumes a level.{vehicle.rangeMiles === null ? ' Add your range in the garage to compare it with the plan.' : ''}</span>
          </label>
        </div>
      )}
      {!vehicle && (
        <button type="button" className="btn" onClick={() => go(`trip/${trip.id}`)}>
          Choose a vehicle for this trip
        </button>
      )}

      <SectionTitle>Vehicle considerations</SectionTitle>
      <VehicleFit assessment={readiness.assessment} vehicleLabel={vehicle ? vehicleName(vehicle) : null} onAddDetails={vehicle ? () => go(`vehicle/${vehicle.id}`) : undefined} />

      <SectionTitle>The day</SectionTitle>
      {itinerary.warnings.length > 0 && <WarningList warnings={itinerary.warnings} />}
      <Timeline itinerary={itinerary} />

      <SectionTitle action={<span className="chip">{progress.done}/{progress.total}</span>}>Packing</SectionTitle>
      {pack.length === 0 ? (
        <p className="tiny faint">Nothing on this plan needs a special kit list.</p>
      ) : (
        pack.map((section) => (
          <div key={section.title} style={{ marginBottom: 16 }}>
            <div className="eyebrow">{section.title}</div>
            <p className="tiny faint" style={{ margin: '2px 0 4px' }}>
              {section.reason}
            </p>
            <ul className="checklist">
              {section.items.map((item) => {
                const key = `${section.title}:${item.id}`
                const done = trip.packed.includes(key)
                return (
                  <li key={key} data-done={done}>
                    <label>
                      <input type="checkbox" checked={done} onChange={() => togglePacked(key)} />
                      <span>
                        {item.label}
                        {item.owned && <span className="chip chip--ok" style={{ marginLeft: 6, minHeight: 22, padding: '0 8px', fontSize: 11 }}>You own this</span>}
                        {item.note && <span className="faint tiny"> — {item.note}</span>}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}

      {vehicle && (
        <>
          <SectionTitle>Vehicle prep</SectionTitle>
          <ul className="checklist">
            {preTripChecklist(vehicle, adventure).map((item) => {
              const key = `prep:${item.id}`
              const done = trip.packed.includes(key)
              return (
                <li key={key} data-done={done}>
                  <label>
                    <input type="checkbox" checked={done} onChange={() => togglePacked(key)} />
                    <span>
                      {item.label}
                      {item.why && <span className="faint tiny"> — {item.why}</span>}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <div className="sheet-actions" style={{ marginTop: 16 }}>
        <a className="btn btn--primary" href={adventure.conditionsUrl} target="_blank" rel="noreferrer noopener">
          Verify current conditions
        </a>
        <button type="button" className="btn" onClick={() => go(`adventure/${adventure.id}`)}>
          Full adventure details
        </button>
      </div>
      <p className="tiny faint" style={{ marginTop: 10 }}>
        Readiness reflects what TREAD knows: published requirements, your vehicle profile and the forecast. It is not a guarantee -- conditions on the
        ground and the land manager have the final word.
      </p>
    </div>
  )
}
