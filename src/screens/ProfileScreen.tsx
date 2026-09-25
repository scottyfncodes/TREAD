import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { SOURCES } from '../data/sources'
import { DEFAULT_PREFERENCES } from '../domain/trip'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { Field, SectionTitle, Segmented } from '../components/Bits'

export function ProfileScreen({ go }: { go: Go }) {
  const { prefs, setPrefs, vehicles, trips, start } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const set = (patch: Partial<typeof prefs>) => setPrefs({ ...prefs, ...patch })

  const agencies = Object.values(SOURCES).filter((s) => s.kind === 'agency').length
  const community = Object.values(SOURCES).filter((s) => s.kind === 'community').length

  return (
    <div>
      <h1 className="display" style={{ marginTop: 10 }}>
        You
      </h1>
      <p className="tiny faint" style={{ margin: '6px 0 12px' }}>
        Adventure preferences. They shape suggestions and warnings; they never change a route’s real numbers.
      </p>

      <div className="card card--flat">
        <dl className="kv" style={{ margin: 0 }}>
          <dt>Vehicles</dt>
          <dd>
            {vehicles.length} · <button type="button" className="chip" onClick={() => go('garage')}>Garage</button>
          </dd>
          <dt>Start</dt>
          <dd>
            {start ? start.label : 'Not set'} · <button type="button" className="chip" onClick={() => go('location')}>Change</button>
          </dd>
          <dt>Trips</dt>
          <dd>{trips.length}</dd>
        </dl>
      </div>

      <SectionTitle>Driving</SectionTitle>
      <Field label={`Longest one-way drive for a day trip — ${Math.floor(prefs.maxDriveMinutes / 60)}h ${String(prefs.maxDriveMinutes % 60).padStart(2, '0')}m`}>
        <input type="range" min="30" max="480" step="15" value={prefs.maxDriveMinutes} onChange={(e) => set({ maxDriveMinutes: Number(e.target.value) })} aria-label="Longest one-way drive" />
      </Field>

      <SectionTitle>On foot</SectionTitle>
      <Field label={`Flat-ground walking pace — ${prefs.paceMph} mph`} help="Every hiking time comes from this, plus a climbing penalty and a thin-air allowance above 10,000 ft.">
        <input type="range" min="1.2" max="3.6" step="0.1" value={prefs.paceMph} onChange={(e) => set({ paceMph: Number(e.target.value) })} aria-label="Walking pace" />
      </Field>
      <Segmented
        label="Usual hiking appetite"
        value={prefs.hikeAppetite}
        options={[
          { value: 'none' as const, label: 'None' },
          { value: 'short' as const, label: 'Short' },
          { value: 'moderate' as const, label: 'Moderate' },
          { value: 'long' as const, label: 'Long' },
        ]}
        onChange={(v) => set({ hikeAppetite: v })}
      />
      <Segmented
        label="Usual food stop"
        value={prefs.food}
        options={[
          { value: 'none' as const, label: 'None' },
          { value: 'coffee' as const, label: 'Coffee' },
          { value: 'lunch' as const, label: 'Lunch' },
          { value: 'brewery' as const, label: 'Brewery' },
          { value: 'dinner' as const, label: 'Dinner' },
        ]}
        onChange={(v) => set({ food: v })}
      />

      <SectionTitle>Interests</SectionTitle>
      <p className="tiny faint" style={{ marginTop: -4 }}>
        Nudges ordering. Leave empty to treat everything equally.
      </p>
      <div className="chips">
        {CATEGORIES.map((c) => {
          const on = prefs.interests.includes(c.id)
          return (
            <button key={c.id} type="button" className="chip" aria-pressed={on} onClick={() => set({ interests: on ? prefs.interests.filter((i) => i !== c.id) : [...prefs.interests, c.id] })}>
              <span aria-hidden="true">{c.emoji}</span> {c.label}
            </button>
          )
        })}
      </div>
      <button type="button" className="btn btn--ghost" style={{ marginTop: 14 }} onClick={() => setPrefs(DEFAULT_PREFERENCES)}>
        Reset preferences
      </button>

      <SectionTitle>How TREAD knows things</SectionTitle>
      <div className="card card--flat small muted">
        <p>
          Access, closures, fees and vehicle requirements come from land managers first -- {agencies} agency sources. Club and community guides ({community}{' '}
          sources) add route character and are always labelled as community information.
        </p>
        <p>
          Every figure carries a source and a check date. Anything nobody credible published shows as UNKNOWN. Drive times from your start are
          estimates from straight-line distance; hiking times are a model based on your pace.
        </p>
        <p style={{ margin: 0 }}>
          TREAD never assumes where you start. It uses a location only when you type one, pick one, or press “use my location”.
        </p>
      </div>

      <SectionTitle>Your data</SectionTitle>
      <p className="tiny faint" style={{ marginTop: -4 }}>
        Everything is stored on this device only. There is no account.
      </p>
      {confirmReset ? (
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              try {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith('tread.'))
                  .forEach((k) => localStorage.removeItem(k))
              } catch {
                /* storage unavailable */
              }
              location.hash = '#/'
              location.reload()
            }}
          >
            Erase everything
          </button>
          <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
          Erase all TREAD data on this device
        </button>
      )}
      <p className="tiny faint" style={{ marginTop: 18, textAlign: 'center' }}>
        TREAD · Your vehicle. Your adventure.
      </p>
    </div>
  )
}
