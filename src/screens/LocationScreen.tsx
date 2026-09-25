import { useMemo, useState } from 'react'
import type { Place } from '../domain/types'
import { makePlace, offlineSearch, onlineSearch, parseCoordinates, requestDeviceLocation } from '../services/geocode'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { BackLink, SectionTitle } from '../components/Bits'
import { MapView } from '../components/MapView'
import { IconLocate, IconPin, IconSearch, IconStar } from '../components/Icons'

const ORIGIN_LABEL: Record<Place['origin'], string> = {
  manual: 'Entered by you',
  search: 'From place search',
  map: 'Picked on the map',
  device: 'From your device, when you asked',
  saved: 'Saved place',
}

/**
 * Choosing where a trip starts. Every path here is an explicit user action:
 * typing, searching, tapping the map, pressing "use my location", or picking
 * a saved place. Nothing on this screen -- or anywhere in TREAD -- reads
 * the device location without that press.
 */
export function LocationScreen({ back }: { go: Go; back: () => void }) {
  const { start, setStart, savedPlaces, savePlace, removePlace, online } = useStore()
  const [query, setQuery] = useState('')
  const [online_results, setOnlineResults] = useState<Place[] | null>(null)
  const [busy, setBusy] = useState<'search' | 'device' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickOnMap, setPickOnMap] = useState(false)

  const local = useMemo(() => offlineSearch(query), [query])
  const coords = useMemo(() => parseCoordinates(query), [query])

  const choose = (p: Place) => {
    setStart(p)
    setError(null)
    back()
  }

  const searchOnline = async () => {
    setBusy('search')
    setError(null)
    try {
      setOnlineResults(await onlineSearch(query))
    } catch {
      setError('Place search needs a connection. The offline town list still works.')
    } finally {
      setBusy(null)
    }
  }

  const useDevice = async () => {
    setBusy('device')
    setError(null)
    try {
      choose(await requestDeviceLocation())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not get your location.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <BackLink onClick={back} />
      <h1 className="display">Starting location</h1>
      <p className="tiny faint" style={{ margin: '6px 0 14px' }}>
        Where your trips begin. TREAD never assumes this -- it stays empty until you choose, and you can change it any time.
      </p>

      <div className={start ? 'card card--brand' : 'card card--flat'}>
        <div className="eyebrow">Current start</div>
        {start ? (
          <>
            <h3 className="headline" style={{ marginTop: 4 }}>
              {start.label}
            </h3>
            <p className="tiny faint" style={{ margin: '4px 0 10px' }}>
              {ORIGIN_LABEL[start.origin]} · {start.lat.toFixed(4)}, {start.lon.toFixed(4)}
            </p>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button type="button" className="btn" onClick={() => savePlace(start)} disabled={savedPlaces.some((p) => p.id === start.id)}>
                <IconStar width={16} height={16} /> Save
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setStart(null)}>
                Clear
              </button>
            </div>
          </>
        ) : (
          <p className="small muted" style={{ margin: '6px 0 0' }}>
            Not set. Adventures still work -- plans begin at each area’s gateway town until you choose a start.
          </p>
        )}
      </div>

      <SectionTitle>Type a town or coordinates</SectionTitle>
      <label className="field">
        <span className="sr-only">Town, city or coordinates</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. Dallas, Moab, or 38.57, -109.55"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOnlineResults(null)
          }}
        />
      </label>

      {coords && (
        <button type="button" className="card card--tap" onClick={() => choose(coords)}>
          <strong>Use coordinates {coords.label}</strong>
        </button>
      )}

      {local.length > 0 && (
        <ul className="list" aria-label="Matching towns">
          {local.map((p) => (
            <li key={p.id}>
              <button type="button" className="btn btn--ghost" style={{ justifyContent: 'flex-start' }} onClick={() => choose(p)}>
                <IconPin width={18} height={18} /> {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.trim().length >= 2 && (
        <button type="button" className="btn" onClick={searchOnline} disabled={busy !== null || !online}>
          <IconSearch width={18} height={18} /> {busy === 'search' ? 'Searching…' : online ? `Search online for “${query.trim()}”` : 'Online search needs a connection'}
        </button>
      )}

      {online_results && (
        <ul className="list" aria-label="Search results" style={{ marginTop: 8 }}>
          {online_results.length === 0 && <li className="tiny faint">No places found.</li>}
          {online_results.map((p) => (
            <li key={p.id}>
              <button type="button" className="btn btn--ghost" style={{ justifyContent: 'flex-start' }} onClick={() => choose(p)}>
                <IconPin width={18} height={18} /> {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <div className="banner" role="alert">{error}</div>}

      <SectionTitle>Other ways</SectionTitle>
      <div className="sheet-actions">
        <button type="button" className="btn" onClick={useDevice} disabled={busy !== null}>
          <IconLocate width={18} height={18} /> {busy === 'device' ? 'Asking your device…' : 'Use my current location'}
        </button>
        <p className="tiny faint" style={{ margin: 0 }}>
          Only when you press this. Your browser will ask permission first; TREAD stores just the point you choose, on this device.
        </p>
        <button type="button" className="btn" onClick={() => setPickOnMap((s) => !s)} aria-expanded={pickOnMap}>
          <IconPin width={18} height={18} /> {pickOnMap ? 'Hide map' : 'Pick on a map'}
        </button>
      </div>
      {pickOnMap && (
        <>
          <MapView
            tall
            markers={start ? [{ id: 'start', lat: start.lat, lon: start.lon, label: start.label, tone: 'start' }] : []}
            label="Tap the map to choose a starting point"
            onPick={(lat, lon) => choose(makePlace(`Map point (${lat.toFixed(3)}, ${lon.toFixed(3)})`, lat, lon, 'map'))}
          />
          <p className="tiny faint">Tap anywhere on the map to set your start there.</p>
        </>
      )}

      <SectionTitle>Saved places</SectionTitle>
      {savedPlaces.length === 0 ? (
        <p className="tiny faint">Save a start to reuse it in one tap.</p>
      ) : (
        <ul className="list">
          {savedPlaces.map((p) => (
            <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn btn--ghost" style={{ justifyContent: 'flex-start', flex: 1 }} onClick={() => choose({ ...p, origin: 'saved' })}>
                <IconStar width={16} height={16} /> {p.label}
              </button>
              <button type="button" className="icon-btn" aria-label={`Remove ${p.label}`} onClick={() => removePlace(p.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
