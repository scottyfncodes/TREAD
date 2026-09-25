import { useMemo } from 'react'
import { CATEGORIES } from '../data/categories'
import { ADVENTURES_BY_ID, statesWithRegions, adventuresInRegion } from '../data'
import { vehicleName } from '../domain/vehicle'
import { discover, vehicleSummary } from '../engine/discovery'
import { capabilityChips } from '../engine/capability'
import { formatClock } from '../engine/time'
import { useStore } from '../state/store'
import { useWeather } from '../state/useWeather'
import type { Go } from '../state/useRoute'
import { shortDate } from '../state/dates'
import { ContextBar } from '../components/ContextBar'
import { AdventureCard } from '../components/AdventureCard'
import { WeatherPanel } from '../components/WeatherPanel'
import { SectionTitle } from '../components/Bits'
import { IconChevron, IconFlag, TreadMark } from '../components/Icons'
import { suggestedTripName } from '../engine/tripPlan'

export function Home({ go }: { go: Go }) {
  const { activeVehicle, vehicles, start, date, trips, online, prefs, onboarded, finishOnboarding } = useStore()

  // Weather only for a place the user chose. There is no default city.
  const weather = useWeather(start?.lat ?? null, start?.lon ?? null, null)

  const summary = useMemo(() => (activeVehicle ? vehicleSummary(activeVehicle, date) : null), [activeVehicle, date])
  const picks = useMemo(
    () => discover({ vehicle: activeVehicle, start, date, preferences: prefs }).slice(0, 3),
    [activeVehicle, start, date, prefs],
  )

  const upcoming = [...trips].filter((t) => t.date >= date).sort((a, b) => a.date.localeCompare(b.date))[0]
  const isNew = vehicles.length === 0 && !onboarded

  return (
    <div>
      <header className="masthead">
        <div>
          <div className="wordmark">
            <TreadMark className="wordmark__mark" />
            <span className="wordmark__text">TREAD</span>
          </div>
          <div className="tagline">Your vehicle. Your adventure.</div>
        </div>
      </header>

      {!online && <div className="banner">Offline. Saved trips still open; live weather, place search and maps need a signal.</div>}

      {isNew ? (
        <section className="hero" aria-label="Get started">
          <div className="eyebrow" style={{ color: 'var(--brand)' }}>Welcome</div>
          <h1 style={{ marginTop: 6 }}>What can you do with the vehicle you have?</h1>
          <p>Add your vehicle -- year, make, model -- and TREAD will show which adventures it suits, and why. It takes about twenty seconds.</p>
          <div className="sheet-actions" style={{ marginTop: 14 }}>
            <button type="button" className="btn btn--primary" onClick={() => go('vehicle/new')}>
              Add my vehicle
            </button>
            <button type="button" className="btn btn--ghost" onClick={finishOnboarding}>
              Just browse for now
            </button>
          </div>
        </section>
      ) : (
        <ContextBar go={go} />
      )}

      {upcoming && (
        <button type="button" className="card card--tap card--brand" onClick={() => go(`trip/${upcoming.id}`)} style={{ marginTop: 12 }}>
          <div className="card__row">
            <div>
              <div className="eyebrow" style={{ color: 'var(--brand)' }}>
                {upcoming.confirmed ? 'Up next' : 'Planned'} · {shortDate(upcoming.date)}
              </div>
              <h3 className="headline" style={{ marginTop: 4 }}>
                {upcoming.name || suggestedTripName(upcoming)}
              </h3>
              <p className="tiny faint" style={{ margin: '4px 0 0' }}>
                {upcoming.stops.length} stop{upcoming.stops.length === 1 ? '' : 's'} · leave {formatClock(upcoming.departMinutes)}
                {upcoming.start ? ` from ${upcoming.start.label}` : ''}
              </p>
            </div>
            <span className="chip chip--brand">
              <IconFlag width={14} height={14} /> Ready?
            </span>
          </div>
        </button>
      )}

      {activeVehicle && summary && (
        <>
          <SectionTitle>With your {vehicleName(activeVehicle)}</SectionTitle>
          <div className="card">
            <div className="chips" style={{ marginBottom: 10 }}>
              {capabilityChips(activeVehicle).map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
            <div className="stats">
              <button type="button" className="stat" style={{ textAlign: 'left', color: 'inherit' }} onClick={() => go('explore')}>
                <div className="stat__value" style={{ color: 'var(--ok)' }}>{summary.compatible}</div>
                <div className="stat__label">Appear compatible</div>
              </button>
              <button type="button" className="stat" style={{ textAlign: 'left', color: 'inherit' }} onClick={() => go('explore')}>
                <div className="stat__value" style={{ color: 'var(--caution)' }}>{summary.considerations + summary.unknown}</div>
                <div className="stat__label">Need a closer look</div>
              </button>
              <button type="button" className="stat" style={{ textAlign: 'left', color: 'inherit' }} onClick={() => go('explore')}>
                <div className="stat__value" style={{ color: 'var(--blocker)' }}>{summary.beyond}</div>
                <div className="stat__label">Likely beyond it</div>
              </button>
            </div>
            <p className="tiny faint" style={{ margin: 0 }}>
              Based on published route requirements and what you have entered about this vehicle. More detail in the garage gives sharper answers.
            </p>
          </div>
        </>
      )}

      <SectionTitle action={<button type="button" className="chip" onClick={() => go('explore')}>See all</button>}>
        {activeVehicle ? 'Good places to start' : 'Places to start'}
      </SectionTitle>
      {picks.map((d) => (
        <AdventureCard
          key={d.adventure.id}
          adventure={d.adventure}
          assessment={d.assessment}
          season={d.season}
          transitMinutes={d.transitMinutes}
          transitMiles={d.transitMiles}
          reasons={d.reasons}
          onOpen={() => go(`adventure/${d.adventure.id}`)}
        />
      ))}
      {!start && (
        <p className="tiny faint">
          Set a starting location to see drive times. TREAD never assumes where you are.{' '}
          <button type="button" className="chip" onClick={() => go('location')}>
            Set start
          </button>
        </p>
      )}

      <SectionTitle>Explore by type</SectionTitle>
      <div className="cat-grid">
        {CATEGORIES.slice(0, 9).map((c) => (
          <button key={c.id} type="button" className="cat" onClick={() => go(`explore/${c.id}`)}>
            <span className="cat__emoji" aria-hidden="true">
              {c.emoji}
            </span>
            {c.label}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn--ghost" style={{ marginTop: 10 }} onClick={() => go('explore')}>
        All categories
      </button>

      <SectionTitle>Regions</SectionTitle>
      {statesWithRegions().map((s) => (
        <div key={s.state}>
          <div className="eyebrow" style={{ margin: '4px 0 8px' }}>{s.stateName}</div>
          {s.regions.map((r) => (
            <button key={r.id} type="button" className="card card--tap" onClick={() => go(`region/${r.id}`)}>
              <div className="card__row">
                <div>
                  <h3 className="headline">{r.name}</h3>
                  <p className="tiny faint" style={{ margin: '4px 0 0' }}>
                    {adventuresInRegion(r.id).length} adventures · {r.landManagers.slice(0, 2).join(', ')}
                  </p>
                </div>
                <IconChevron width={20} height={20} className="faint" />
              </div>
            </button>
          ))}
        </div>
      ))}

      {start && (
        <>
          <SectionTitle>Weather at your start · {shortDate(date)}</SectionTitle>
          <WeatherPanel state={weather} isoDate={date} elevationFt={null} place={start.label} />
        </>
      )}

      <p className="tiny faint" style={{ marginTop: 20 }}>
        {Object.keys(ADVENTURES_BY_ID).length} researched adventures. Every figure carries a source and a check date, community information is labelled
        as such, and anything that could not be verified says UNKNOWN.
      </p>
    </div>
  )
}
