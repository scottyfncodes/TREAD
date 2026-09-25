import { useMemo } from 'react'
import { GATEWAYS_BY_ID, NETWORKS, REGIONS_BY_ID } from '../data'
import { discover } from '../engine/discovery'
import { formatMeasure } from '../engine/measure'
import { formatSeasonMonths } from '../engine/season'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { AdventureCard } from '../components/AdventureCard'
import { BackLink, EmptyState, SectionTitle, SourceLine } from '../components/Bits'
import { MapView, type MapMarker } from '../components/MapView'
import { ContextBar } from '../components/ContextBar'

export function RegionScreen({ id, go, back }: { id: string; go: Go; back: () => void }) {
  const { activeVehicle, start, date, prefs } = useStore()
  const region = REGIONS_BY_ID[id]
  const results = useMemo(
    () => (region ? discover({ vehicle: activeVehicle, start, date, regionId: region.id, preferences: prefs }) : []),
    [region, activeVehicle, start, date, prefs],
  )

  if (!region) {
    return (
      <div>
        <BackLink onClick={back} />
        <EmptyState title="Region not found">It may have been renamed in an update.</EmptyState>
      </div>
    )
  }

  const networks = NETWORKS.filter((n) => n.regionId === region.id)
  const markers: MapMarker[] = results.map((d) => ({
    id: d.adventure.id,
    lat: d.adventure.anchor.lat,
    lon: d.adventure.anchor.lon,
    label: d.adventure.name,
    href: `#/adventure/${d.adventure.id}`,
    tone: d.assessment.status === 'beyond' ? 'beyond' : d.assessment.status === 'considerations' ? 'considerations' : d.assessment.status === 'unknown' ? 'unknown' : 'brand',
  }))

  return (
    <div>
      <BackLink onClick={back} />
      <div className="eyebrow">{region.stateName}</div>
      <h1 className="display" style={{ marginTop: 4 }}>
        {region.name}
      </h1>
      <p className="muted" style={{ marginTop: 8 }}>
        {region.summary}
      </p>

      <MapView markers={markers} label={`Map of ${region.name}`} />

      <ContextBar go={go} />

      <div className="card card--flat" style={{ marginTop: 12 }}>
        <div className="eyebrow">Before you go</div>
        <ul className="tiny muted" style={{ paddingLeft: 18, margin: '8px 0' }}>
          {region.notes.map((n) => (
            <li key={n} style={{ marginBottom: 4 }}>
              {n}
            </li>
          ))}
        </ul>
        <a className="btn btn--small" href={region.conditionsUrl} target="_blank" rel="noreferrer noopener">
          Current conditions: {region.conditionsLabel}
        </a>
        <p className="tiny faint" style={{ margin: '10px 0 0' }}>
          Gateway towns: {region.gatewayIds.map((g) => GATEWAYS_BY_ID[g]?.name).filter(Boolean).join(', ')}
        </p>
        <SourceLine ids={region.sources} lastChecked={region.lastChecked} />
      </div>

      {networks.map((n) => (
        <div key={n.id} className="card card--sand">
          <div className="eyebrow" style={{ color: 'var(--sand)' }}>Trail network</div>
          <h3 className="headline" style={{ marginTop: 4 }}>
            {n.name}
          </h3>
          <p className="tiny muted">{n.summary}</p>
          <dl className="kv">
            <dt>Main</dt>
            <dd>
              {formatMeasure(n.mainRouteMiles, 'mi')} — {n.mainRouteNote}
            </dd>
            <dt>Connected</dt>
            <dd>
              {formatMeasure(n.connectedMiles, 'mi')} — {n.connectedNote}
            </dd>
            <dt>Access towns</dt>
            <dd>{n.accessCommunityIds.map((g) => GATEWAYS_BY_ID[g]?.name).filter(Boolean).join(', ')}</dd>
            <dt>Season</dt>
            <dd>
              {formatSeasonMonths(n.season)} — {n.season.note}
            </dd>
            {n.widthLimitsIn.length > 0 && (
              <>
                <dt>Width limits</dt>
                <dd>{n.widthLimitsIn.map((w) => `${w}"`).join(', ')} on some segments</dd>
              </>
            )}
          </dl>
          <div className="eyebrow" style={{ marginTop: 10 }}>Vehicle rules</div>
          <ul className="tiny muted" style={{ paddingLeft: 18, margin: '6px 0' }}>
            {n.vehicleRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {n.trailheads.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 10 }}>Trailheads</div>
              <ul className="list tiny">
                {n.trailheads.map((t) => (
                  <li key={t.id}>
                    <strong>{t.name}</strong>
                    <span className="faint"> · {formatMeasure(t.elevationFt, 'ft')}</span>
                    {t.facilities && <div className="muted">{t.facilities}</div>}
                  </li>
                ))}
              </ul>
            </>
          )}
          <SourceLine ids={n.sources} lastChecked={n.lastChecked} />
        </div>
      ))}

      <SectionTitle>Adventures</SectionTitle>
      {results.map((d) => (
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
    </div>
  )
}
