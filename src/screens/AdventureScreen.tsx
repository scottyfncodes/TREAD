import { useMemo, useState } from 'react'
import { ADVENTURES_BY_ID, CAMPS_BY_ID, FOOD_BY_ID, GATEWAYS_BY_ID, HIKES_BY_ID, NETWORKS_BY_ID, REGIONS_BY_ID, STOPS_BY_ID } from '../data'
import { CATEGORY_BY_ID } from '../data/categories'
import { DIFFICULTY_LABEL } from '../domain/adventure'
import { vehicleName } from '../domain/vehicle'
import { assessVehicle } from '../engine/matching'
import { buildItinerary, roundTripFromGateway, formatDurationRange } from '../engine/itinerary'
import { ROAD_CLASS_LABEL, VEHICLE_LABEL } from '../engine/drive'
import { estimateHike } from '../engine/hike'
import { formatMeasure, high } from '../engine/measure'
import { formatSeasonMonths } from '../engine/season'
import { blankTrip, suggestedTripName } from '../engine/tripPlan'
import { useStore } from '../state/store'
import { useWeather } from '../state/useWeather'
import type { Go } from '../state/useRoute'
import { DayControls, settingsFromPrefs } from '../components/DayControls'
import { VehicleFit } from '../components/VehicleFit'
import { Timeline } from '../components/Timeline'
import { WeatherPanel } from '../components/WeatherPanel'
import { MapView } from '../components/MapView'
import { appleMapsUrl, BackLink, BasisTag, EmptyState, navigateUrl, SectionTitle, SourceLine, Stat, TextStat, WarningList } from '../components/Bits'
import { ContextBar } from '../components/ContextBar'

export function AdventureScreen({ id, go, back }: { id: string; go: Go; back: () => void }) {
  const { activeVehicle, start, date, setDate, prefs, trips, saveTrip } = useStore()
  const adventure = ADVENTURES_BY_ID[id]
  const [settings, setSettings] = useState(() => settingsFromPrefs(prefs, date))
  const [overnight, setOvernight] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const anchorElevation = useMemo(() => {
    if (!adventure) return null
    const hike = adventure.hikeIds.map((h) => HIKES_BY_ID[h]).find(Boolean)
    return high(hike?.highPointFt ?? null)
  }, [adventure])

  const weather = useWeather(adventure?.anchor.lat ?? null, adventure?.anchor.lon ?? null, anchorElevation)
  const daySettings = { ...settings, date }
  const daylight = useMemo(() => {
    const day = weather.data?.daily.find((d) => d.date === date)
    return day && day.sunrise !== null && day.sunset !== null ? { sunrise: day.sunrise, sunset: day.sunset } : null
  }, [weather.data, date])

  const itinerary = useMemo(
    () => (adventure ? buildItinerary({ adventure, start, settings: daySettings, overnight, daylight }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adventure, start, JSON.stringify(daySettings), overnight, daylight],
  )

  if (!adventure || !itinerary) {
    return (
      <div>
        <BackLink onClick={back} />
        <EmptyState title="Adventure not found">It may have been renamed or removed in an update.</EmptyState>
      </div>
    )
  }

  const network = adventure.networkId ? NETWORKS_BY_ID[adventure.networkId] : null
  const assessment = assessVehicle(activeVehicle, adventure, { network, roundTripMiles: roundTripFromGateway(adventure) })
  const region = REGIONS_BY_ID[adventure.regionId]
  const gateway = GATEWAYS_BY_ID[adventure.gatewayId]
  const req = adventure.requirements
  const hike = itinerary.hikeId ? HIKES_BY_ID[itinerary.hikeId] : null
  const food = itinerary.foodId ? FOOD_BY_ID[itinerary.foodId] : null
  const camps = adventure.campIds.map((c) => CAMPS_BY_ID[c]).filter(Boolean)

  const addToNewTrip = () => {
    const trip = blankTrip({ date, start, vehicleId: activeVehicle?.id ?? null })
    trip.stops = [{ adventureId: adventure.id, day: 0, note: '' }]
    trip.departMinutes = settings.departMinutes
    trip.overnight = overnight
    trip.name = suggestedTripName(trip)
    saveTrip(trip)
    go(`trip/${trip.id}`)
  }

  const addToTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return
    if (!trip.stops.some((s) => s.adventureId === adventure.id)) {
      const lastDay = Math.max(0, ...trip.stops.map((s) => s.day))
      saveTrip({ ...trip, stops: [...trip.stops, { adventureId: adventure.id, day: lastDay, note: '' }] })
    }
    go(`trip/${trip.id}`)
  }

  return (
    <div>
      <BackLink onClick={back} />
      <div className="eyebrow">
        {region?.name} · {region?.stateName}
      </div>
      <h1 className="display" style={{ marginTop: 4 }}>
        {adventure.name}
      </h1>
      <p className="muted" style={{ marginTop: 6 }}>
        {adventure.tagline}
      </p>
      <div className="chips" style={{ marginTop: 10 }}>
        {adventure.difficulty && (
          <span className={`chip ${['very_difficult', 'extreme'].includes(adventure.difficulty.level) ? 'chip--blocker' : adventure.difficulty.level === 'difficult' ? 'chip--caution' : ''}`}>
            {DIFFICULTY_LABEL[adventure.difficulty.level]}
          </span>
        )}
        <span className={req.access === 'unknown' ? 'chip chip--unknown' : 'chip'}>{VEHICLE_LABEL[req.access]}</span>
        <span className="chip">{formatSeasonMonths(adventure.season)}</span>
        {adventure.categories.slice(0, 3).map((c) => (
          <span key={c} className="chip">
            {CATEGORY_BY_ID[c].label}
          </span>
        ))}
      </div>

      <ContextBar go={go} />

      <VehicleFit
        assessment={assessment}
        vehicleLabel={activeVehicle ? vehicleName(activeVehicle) : null}
        onAddDetails={activeVehicle ? () => go(`vehicle/${activeVehicle.id}`) : undefined}
      />
      {!activeVehicle && (
        <button type="button" className="btn btn--primary" onClick={() => go('vehicle/new')}>
          Add a vehicle to compare
        </button>
      )}

      <SectionTitle>Why go</SectionTitle>
      <p className="muted">{adventure.why}</p>
      {adventure.highlights.length > 0 && (
        <ul className="small muted" style={{ paddingLeft: 18 }}>
          {adventure.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {(adventure.route || adventure.difficulty) && (
        <>
          <SectionTitle>The route</SectionTitle>
          <div className="card">
            {adventure.route && (
              <>
                <div className="stats">
                  <Stat label="Distance" value={adventure.route.miles} unit="mi" decimals={1} />
                  <Stat label="Time on route" value={adventure.route.hours} unit="h" decimals={1} />
                  <TextStat label="Shape" value={adventure.route.shape.replace(/_/g, ' ')} />
                </div>
                <p className="tiny faint" style={{ marginTop: -4 }}>
                  {adventure.route.milesNote}
                </p>
                {adventure.route.terrain.length > 0 && (
                  <p className="small muted">
                    <strong>Terrain:</strong> {adventure.route.terrain.join(' · ')}
                  </p>
                )}
                {adventure.route.obstacles.length > 0 && (
                  <p className="small muted">
                    <strong>Obstacles:</strong> {adventure.route.obstacles.join(' · ')}
                  </p>
                )}
                <SourceLine ids={adventure.route.sources} lastChecked={adventure.route.lastChecked} />
              </>
            )}
            {adventure.difficulty && (
              <div style={{ marginTop: 12 }}>
                <div className="eyebrow">
                  Difficulty: {DIFFICULTY_LABEL[adventure.difficulty.level]} <BasisTag basis={adventure.difficulty.basis} />
                </div>
                <p className="small muted" style={{ margin: '6px 0 0' }}>
                  {adventure.difficulty.wording}
                </p>
                <p className="tiny faint" style={{ margin: '4px 0 0' }}>
                  Rated by {adventure.difficulty.ratedBy}.
                </p>
                <SourceLine ids={adventure.difficulty.sources} lastChecked={adventure.difficulty.lastChecked} />
              </div>
            )}
          </div>
        </>
      )}

      <SectionTitle>Vehicle requirements</SectionTitle>
      <div className="card">
        <dl className="kv">
          <dt>Access</dt>
          <dd>
            {VEHICLE_LABEL[req.access]} ({req.strength}) <BasisTag basis={req.basis} />
          </dd>
          {req.maxWidthIn !== null && (
            <>
              <dt>Width limit</dt>
              <dd>{req.maxWidthIn} in on part of the route</dd>
            </>
          )}
          <dt>ATVs / UTVs</dt>
          <dd>{req.ohvAllowed === true ? 'Allowed' : req.ohvAllowed === false ? 'Not permitted' : 'Not recorded'}</dd>
          {req.recommendedEquipment.length > 0 && (
            <>
              <dt>Carry</dt>
              <dd>{req.recommendedEquipment.map((e) => e.replace(/_/g, ' ')).join(', ')}</dd>
            </>
          )}
          <dt>Land manager</dt>
          <dd>{adventure.landManager}</dd>
          {adventure.permits && (
            <>
              <dt>Permits</dt>
              <dd>{adventure.permits}</dd>
            </>
          )}
        </dl>
        <p className="small muted">{req.notes}</p>
        {req.conditional.map((c) => (
          <div key={c} className="warn warn--caution">
            <span className="mark mark--caution">!</span>
            <span>{c}</span>
          </div>
        ))}
        {adventure.fees.map((f) => (
          <div key={f.label} style={{ marginTop: 8 }}>
            <div className="eyebrow">{f.label}</div>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              {f.amount}
            </p>
            <SourceLine ids={f.sources} lastChecked={f.lastChecked} />
          </div>
        ))}
        <SourceLine ids={req.sources} lastChecked={req.lastChecked} />
        <a className="btn btn--small" style={{ marginTop: 10 }} href={adventure.conditionsUrl} target="_blank" rel="noreferrer noopener">
          Verify current conditions
        </a>
      </div>

      <SectionTitle>Plan the day</SectionTitle>
      <div className="card card--flat">
        <DayControls settings={settings} onChange={setSettings} date={date} onDate={setDate} />
        {camps.length > 0 && (
          <label className="toggle-row">
            <span className="small">Camp overnight ({camps[0].name})</span>
            <input type="checkbox" checked={overnight} onChange={(e) => setOvernight(e.target.checked)} aria-label="Camp overnight" />
          </label>
        )}
      </div>
      {itinerary.warnings.length > 0 && <WarningList warnings={itinerary.warnings} />}
      <Timeline itinerary={itinerary} />
      <p className="tiny faint">Times marked est. come from disclosed models: road-class speeds, straight-line distance for the drive to the gateway, and your hiking pace.</p>

      <SectionTitle>Weather at the destination</SectionTitle>
      <WeatherPanel state={weather} isoDate={date} elevationFt={anchorElevation} place={adventure.anchor.label} />

      {adventure.access.length > 0 && (
        <>
          <SectionTitle>Getting there from {gateway?.name ?? 'the gateway'}</SectionTitle>
          {adventure.access.map((segment, i) => (
            <div key={i} className="card card--flat">
              <div className="eyebrow">Leg {i + 1}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{segment.via}</h3>
              <div className="chips" style={{ margin: '8px 0' }}>
                <span className="chip">{formatMeasure(segment.miles, 'mi', { decimals: 1 })}</span>
                <span className="chip">{ROAD_CLASS_LABEL[segment.roadClass]}</span>
                <span className={segment.vehicle === 'unknown' ? 'chip chip--unknown' : 'chip'}>{VEHICLE_LABEL[segment.vehicle]}</span>
              </div>
              {segment.notes && <p className="tiny muted" style={{ margin: '0 0 6px' }}>{segment.notes}</p>}
              <SourceLine ids={segment.sources} lastChecked={segment.lastChecked} />
            </div>
          ))}
        </>
      )}

      {hike && (
        <>
          <SectionTitle>The hike</SectionTitle>
          <div className="card">
            <h3 className="headline">{hike.name}</h3>
            <div className="stats">
              <Stat label="Distance" value={hike.miles} unit="mi" decimals={1} />
              <Stat label="Gain" value={hike.gainFt} unit="ft" />
              <Stat label="High point" value={hike.highPointFt} unit="ft" />
            </div>
            <p className="tiny muted">
              Estimated {formatDurationRange(estimateHike(hike, prefs.paceMph).minutesWithBreaks)} at your {prefs.paceMph} mph pace, including breaks
              and a thin-air allowance. A model, not a measurement.
            </p>
            {hike.hazards.length > 0 && (
              <ul className="tiny muted" style={{ paddingLeft: 18 }}>
                {hike.hazards.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            {hike.permits && <p className="tiny muted">Permits: {hike.permits}</p>}
            <SourceLine ids={hike.sources} lastChecked={hike.lastChecked} />
          </div>
        </>
      )}

      {camps.length > 0 && (
        <>
          <SectionTitle>Camping</SectionTitle>
          {camps.map((camp) => (
            <div key={camp.id} className="card card--flat">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{camp.name}</h3>
              <div className="chips" style={{ margin: '8px 0' }}>
                <span className="chip">{camp.kind === 'dispersed' ? 'Dispersed' : camp.kind === 'designated' ? 'Designated sites' : 'Campground'}</span>
                <span className="chip">{VEHICLE_LABEL[camp.access]}</span>
                {camp.fee && <span className="chip">{camp.fee}</span>}
              </div>
              {camp.vehicleFitNotes && <p className="tiny muted">{camp.vehicleFitNotes}</p>}
              {camp.restrictions.length > 0 && (
                <ul className="tiny muted" style={{ paddingLeft: 18 }}>
                  {camp.restrictions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
              <SourceLine ids={camp.sources} lastChecked={camp.lastChecked} />
            </div>
          ))}
          <p className="tiny faint">A site appearing here does not make camping there legal on a given night. Signs on site and current fire restrictions decide.</p>
        </>
      )}

      {adventure.stopIds.length > 0 && (
        <>
          <SectionTitle>Worth stopping for</SectionTitle>
          {adventure.stopIds.map((sid) => {
            const stop = STOPS_BY_ID[sid]
            if (!stop) return null
            return (
              <div key={sid} className="card card--flat">
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{stop.name}</h3>
                <p className="tiny muted" style={{ margin: '6px 0' }}>
                  {stop.blurb}
                </p>
                <SourceLine ids={stop.sources} lastChecked={stop.lastChecked} />
              </div>
            )
          })}
        </>
      )}

      {food && (
        <>
          <SectionTitle>Refuel</SectionTitle>
          <div className="card card--flat">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{food.name}</h3>
            <p className="tiny muted" style={{ margin: '4px 0' }}>
              {food.town}
              {food.address ? ` · ${food.address}` : ''}
            </p>
            <p className="tiny" style={{ color: 'var(--caution)' }}>
              {food.hoursNote ?? 'Hours not verified.'} Hours change -- this app does not treat them as fact.
            </p>
            <SourceLine ids={food.sources} lastChecked={food.lastChecked} />
          </div>
        </>
      )}

      {adventure.hazards.length > 0 && (
        <>
          <SectionTitle>Hazards</SectionTitle>
          <ul className="small muted" style={{ paddingLeft: 18 }}>
            {adventure.hazards.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}

      <SectionTitle>Map & navigation</SectionTitle>
      <MapView
        markers={[
          { id: 'anchor', lat: adventure.anchor.lat, lon: adventure.anchor.lon, label: adventure.anchor.label },
          ...(start ? [{ id: 'start', lat: start.lat, lon: start.lon, label: `Start: ${start.label}`, tone: 'start' as const }] : []),
        ]}
        zoom={11}
        label={`Map of ${adventure.name}`}
      />
      <div className="btn-row">
        <a className="btn btn--primary" href={navigateUrl(adventure.anchor.lat, adventure.anchor.lon, start)} target="_blank" rel="noreferrer noopener">
          Google Maps
        </a>
        <a className="btn" href={appleMapsUrl(adventure.anchor.lat, adventure.anchor.lon, adventure.anchor.label)} target="_blank" rel="noreferrer noopener">
          Apple Maps
        </a>
      </div>
      <p className="tiny faint" style={{ marginTop: 8 }}>
        Hands off to your maps app for the drive to {adventure.anchor.label}. Coordinates are approximate. TREAD does not navigate off-road routes --
        carry an offline map from the land manager.
      </p>

      <SectionTitle>Save it</SectionTitle>
      <div className="sheet-actions">
        <button type="button" className="btn btn--primary" onClick={addToNewTrip}>
          Start a trip with this
        </button>
        {trips.length > 0 && (
          <button type="button" className="btn" onClick={() => setShowAdd((s) => !s)} aria-expanded={showAdd}>
            Add to an existing trip
          </button>
        )}
        {showAdd &&
          trips.map((t) => (
            <button key={t.id} type="button" className="btn btn--ghost" onClick={() => addToTrip(t.id)}>
              {t.name || suggestedTripName(t)} · {t.date}
            </button>
          ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <SourceLine ids={adventure.sources} lastChecked={adventure.lastChecked} prefix="Adventure sources" />
      </div>
    </div>
  )
}
