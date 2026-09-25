import { useMemo, useState } from 'react'
import type { Trip } from '../domain/trip'
import { vehicleName } from '../domain/vehicle'
import { ADVENTURES, ADVENTURES_BY_ID } from '../data'
import { summarizeTrip, suggestedTripName } from '../engine/tripPlan'
import { FIT_LABEL } from '../engine/matching'
import { formatDuration } from '../engine/time'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { addDaysIso, shortDate } from '../state/dates'
import { BackLink, EmptyState, Field, Mark, SectionTitle, Segmented } from '../components/Bits'
import { FitChip } from '../components/VehicleFit'
import { MapView, type MapMarker } from '../components/MapView'
import { IconFlag, IconPin } from '../components/Icons'

/**
 * One screen to build and review a trip:
 *   start -> vehicle -> date -> adventures (by day) -> route & vehicle review -> save.
 * Changes save as you go. The start is whatever the user chose; with none,
 * the summary says so and leg estimates begin at the first stop.
 */
export function TripScreen({ id, go, back }: { id: string; go: Go; back: () => void }) {
  const { trips, saveTrip, removeTrip, vehicles, start: globalStart } = useStore()
  const trip = trips.find((t) => t.id === id)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const vehicle = trip ? (vehicles.find((v) => v.id === trip.vehicleId) ?? null) : null
  const summary = useMemo(() => (trip ? summarizeTrip(trip, vehicle) : null), [trip, vehicle])

  if (!trip || !summary) {
    return (
      <div>
        <BackLink onClick={back} />
        <EmptyState title="Trip not found">It may have been deleted.</EmptyState>
      </div>
    )
  }

  const update = (patch: Partial<Trip>) => saveTrip({ ...trip, ...patch })
  const matches = ADVENTURES.filter((a) => !trip.stops.some((s) => s.adventureId === a.id)).filter(
    (a) => !query.trim() || a.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const move = (index: number, delta: number) => {
    const stops = [...trip.stops]
    const target = index + delta
    if (target < 0 || target >= stops.length) return
    ;[stops[index], stops[target]] = [stops[target], stops[index]]
    update({ stops })
  }

  const markers: MapMarker[] = [
    ...(trip.start ? [{ id: 'start', lat: trip.start.lat, lon: trip.start.lon, label: `Start: ${trip.start.label}`, tone: 'start' as const }] : []),
    ...summary.stops.map((s) => ({
      id: s.adventure.id,
      lat: s.adventure.anchor.lat,
      lon: s.adventure.anchor.lon,
      label: s.adventure.name,
      href: `#/adventure/${s.adventure.id}`,
      tone: (s.assessment.status === 'beyond' ? 'beyond' : s.assessment.status === 'considerations' ? 'considerations' : 'brand') as MapMarker['tone'],
    })),
  ]

  return (
    <div>
      <BackLink onClick={() => go('trips')} label="Trips" />
      <label className="field">
        <span className="sr-only">Trip name</span>
        <input
          type="text"
          value={trip.name}
          placeholder={suggestedTripName(trip)}
          onChange={(e) => update({ name: e.target.value })}
          style={{ fontSize: 20, fontWeight: 800, background: 'transparent', border: '1px dashed var(--line)' }}
          aria-label="Trip name"
        />
      </label>

      {trip.stops.length > 0 && (
        <button type="button" className="btn btn--primary" onClick={() => go(`ready/${trip.id}`)}>
          <IconFlag width={18} height={18} /> Ready to go?
        </button>
      )}

      <SectionTitle>1 · Start</SectionTitle>
      <div className="card card--flat">
        {trip.start ? (
          <p className="small" style={{ margin: 0 }}>
            <IconPin width={16} height={16} style={{ verticalAlign: -3 }} /> {trip.start.label}
          </p>
        ) : (
          <p className="small muted" style={{ margin: 0 }}>
            No starting location for this trip. Leg estimates begin at the first stop.
          </p>
        )}
        <div className="chips" style={{ marginTop: 10 }}>
          {globalStart && globalStart.id !== trip.start?.id && (
            <button type="button" className="chip" onClick={() => update({ start: globalStart })}>
              Use {globalStart.label}
            </button>
          )}
          <button type="button" className="chip" onClick={() => go('location')}>
            Choose a start…
          </button>
          {trip.start && (
            <button type="button" className="chip" onClick={() => update({ start: null })}>
              Clear
            </button>
          )}
        </div>
        {trip.start && (
          <label className="toggle-row" style={{ marginTop: 6 }}>
            <span className="small">Return to start at the end</span>
            <input type="checkbox" checked={trip.returnToStart} onChange={(e) => update({ returnToStart: e.target.checked })} aria-label="Return to start" />
          </label>
        )}
        <p className="tiny faint" style={{ margin: '6px 0 0' }}>
          “Choose a start” sets your app-wide start; come back and tap “Use …” to apply it here.
        </p>
      </div>

      <SectionTitle>2 · Vehicle</SectionTitle>
      {vehicles.length === 0 ? (
        <button type="button" className="btn" onClick={() => go('vehicle/new')}>
          Add a vehicle
        </button>
      ) : (
        <div className="seg" role="group" aria-label="Vehicle for this trip">
          {vehicles.map((v) => (
            <button key={v.id} type="button" className="seg__btn" aria-pressed={trip.vehicleId === v.id} onClick={() => update({ vehicleId: v.id })}>
              {vehicleName(v)}
            </button>
          ))}
          <button type="button" className="seg__btn" aria-pressed={trip.vehicleId === null} onClick={() => update({ vehicleId: null })}>
            None
          </button>
        </div>
      )}

      <SectionTitle>3 · When</SectionTitle>
      <div className="grid-2">
        <Field label="Day one">
          <input type="date" value={trip.date} onChange={(e) => e.target.value && update({ date: e.target.value })} />
        </Field>
        <Field label="Days">
          <select value={trip.days} onChange={(e) => update({ days: Number(e.target.value), stops: trip.stops.map((s) => ({ ...s, day: Math.min(s.day, Number(e.target.value) - 1) })) })} aria-label="Number of days">
            {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Segmented
        label="Leave at"
        value={String(trip.departMinutes)}
        options={[5, 6, 7, 8, 9, 10].map((h) => ({ value: String(h * 60), label: `${h}:00` }))}
        onChange={(v) => update({ departMinutes: Number(v) })}
      />

      <SectionTitle>4 · Adventures</SectionTitle>
      {trip.stops.length === 0 && <p className="small muted">Nothing added yet.</p>}
      {trip.stops.map((stop, i) => {
        const adventure = ADVENTURES_BY_ID[stop.adventureId]
        const assessed = summary.stops.find((s) => s.adventure.id === stop.adventureId)
        if (!adventure) return null
        return (
          <div key={stop.adventureId} className="card card--flat">
            <div className="card__row">
              <button type="button" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', minWidth: 0 }} onClick={() => go(`adventure/${adventure.id}`)}>
                <div className="eyebrow">
                  Stop {i + 1}
                  {trip.days > 1 ? ` · ${shortDate(addDaysIso(trip.date, stop.day))}` : ''}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 750, marginTop: 4 }}>{adventure.name}</h3>
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="icon-btn" aria-label="Move down" disabled={i === trip.stops.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
              </div>
            </div>
            <div className="chips" style={{ marginTop: 8 }}>
              {assessed && <FitChip assessment={assessed.assessment} />}
              {trip.days > 1 && (
                <select
                  value={stop.day}
                  onChange={(e) => update({ stops: trip.stops.map((s) => (s.adventureId === stop.adventureId ? { ...s, day: Number(e.target.value) } : s)) })}
                  aria-label={`Day for ${adventure.name}`}
                  style={{ width: 'auto', minHeight: 38, padding: '6px 34px 6px 12px', fontSize: 14 }}
                >
                  {Array.from({ length: trip.days }, (_, d) => (
                    <option key={d} value={d}>
                      Day {d + 1}
                    </option>
                  ))}
                </select>
              )}
              <button type="button" className="chip" onClick={() => go(`ready/${trip.id}/${adventure.id}`)}>
                Ready check
              </button>
              <button type="button" className="chip" onClick={() => update({ stops: trip.stops.filter((s) => s.adventureId !== stop.adventureId) })}>
                Remove
              </button>
            </div>
          </div>
        )
      })}

      <button type="button" className="btn" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
        {adding ? 'Done adding' : 'Add an adventure'}
      </button>
      {adding && (
        <div className="card card--flat" style={{ marginTop: 10 }}>
          <input type="search" value={query} placeholder="Search adventures" onChange={(e) => setQuery(e.target.value)} aria-label="Search adventures to add" />
          <ul className="list" style={{ marginTop: 8, maxHeight: 320, overflowY: 'auto' }}>
            {matches.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ justifyContent: 'space-between' }}
                  onClick={() => update({ stops: [...trip.stops, { adventureId: a.id, day: Math.max(0, ...trip.stops.map((s) => s.day)), note: '' }] })}
                >
                  <span style={{ textAlign: 'left' }}>{a.name}</span>
                  <span className="chip">+ Add</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {trip.stops.length > 0 && (
        <>
          <SectionTitle>5 · Route & vehicle review</SectionTitle>
          <MapView markers={markers} label="Trip map" />
          {summary.legs.length > 0 ? (
            <div className="card card--flat">
              <ul className="list small">
                {summary.legs.map((l, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>
                      {l.fromLabel} → {l.toLabel}
                    </span>
                    <span className="faint num" style={{ whiteSpace: 'nowrap' }}>
                      ~{l.miles} mi · {formatDuration(l.minutes)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="small" style={{ margin: '8px 0 0' }}>
                <strong>About {summary.totalMiles} mi</strong> and {formatDuration(summary.totalDriveMinutes)} between towns (est. from straight-line distance, not
                routed). Access roads to each adventure come on top.
              </p>
            </div>
          ) : (
            <p className="tiny faint">{summary.hasStart ? 'All stops share one gateway town.' : 'Set a start to estimate the drive to the first stop.'}</p>
          )}
          {summary.rangeWarnings.map((w) => (
            <div key={w} className="warn warn--caution">
              <Mark level="caution" />
              <span>{w}</span>
            </div>
          ))}
          {vehicle ? (
            <div className="card card--flat">
              <div className="eyebrow">Vehicle considerations · {vehicleName(vehicle)}</div>
              <ul className="list small" style={{ marginTop: 6 }}>
                {summary.stops.map((s) => (
                  <li key={s.adventure.id} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 8 }}>
                    <Mark level={s.assessment.status === 'compatible' ? 'ok' : s.assessment.status === 'beyond' ? 'blocker' : s.assessment.status === 'considerations' ? 'caution' : 'unknown'} />
                    <span>
                      <strong>{s.adventure.name}</strong> — {FIT_LABEL[s.assessment.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="tiny faint">Pick a vehicle above to check each stop against it.</p>
          )}
        </>
      )}

      <SectionTitle>Notes</SectionTitle>
      <textarea value={trip.notes} placeholder="Who’s coming, where to meet, what to bring." onChange={(e) => update({ notes: e.target.value })} aria-label="Trip notes" />

      <div className="sheet-actions" style={{ marginTop: 14 }}>
        <button type="button" className={trip.confirmed ? 'btn' : 'btn btn--sand'} onClick={() => update({ confirmed: !trip.confirmed })}>
          {trip.confirmed ? 'Mark as not confirmed' : 'Confirm this trip'}
        </button>
        {confirmDelete ? (
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn--danger" onClick={() => { removeTrip(trip.id); go('trips') }}>
              Delete trip
            </button>
            <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>
            Delete trip
          </button>
        )}
      </div>
      <p className="tiny faint" style={{ marginTop: 12 }}>
        Saved automatically on this device. Works offline; weather, maps and place search need a signal.
      </p>
    </div>
  )
}
