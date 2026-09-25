import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

/**
 * A small Leaflet map with OpenStreetMap tiles. Loaded lazily so the rest
 * of the app works (and tests run) without it. Tiles need the network; with
 * no signal the map says so instead of showing a grey box.
 *
 * `onPick` turns on tap-to-choose, used for picking a starting location on
 * the map -- an explicit user action, never automatic.
 */
export interface MapMarker {
  id: string
  lat: number
  lon: number
  label: string
  tone?: 'brand' | 'start' | 'beyond' | 'considerations' | 'unknown'
  href?: string
}

export function MapView({
  markers,
  center,
  zoom = 9,
  tall = false,
  onPick,
  label,
}: {
  markers: MapMarker[]
  center?: { lat: number; lon: number }
  zoom?: number
  tall?: boolean
  onPick?: (lat: number, lon: number) => void
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => {
    let disposed = false
    let map: import('leaflet').Map | null = null
    if (!ref.current || typeof window === 'undefined') return

    import('leaflet')
      .then((L) => {
        if (disposed || !ref.current) return
        map = L.map(ref.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false })
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        const points: Array<[number, number]> = []
        for (const m of markers) {
          const icon = L.divIcon({ className: '', html: `<div class="tread-pin tread-pin--${m.tone ?? 'brand'}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] })
          const marker = L.marker([m.lat, m.lon], { icon, title: m.label, keyboard: true }).addTo(map)
          const safe = m.label.replace(/[<>&]/g, '')
          marker.bindPopup(m.href ? `<a href="${m.href}">${safe}</a>` : safe)
          points.push([m.lat, m.lon])
        }

        if (center) map.setView([center.lat, center.lon], zoom)
        else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 12 })
        else if (points.length === 1) map.setView(points[0], zoom)
        else map.setView([39.5, -98.35], 4) // whole US; not anyone's location

        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
          pickRef.current?.(e.latlng.lat, e.latlng.lng)
        })
      })
      .catch(() => setFailed(true))

    return () => {
      disposed = true
      map?.remove()
    }
    // Rebuild when the marker set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), center?.lat, center?.lon, zoom])

  return (
    <div className={tall ? 'map map--tall' : 'map'} role="region" aria-label={label}>
      {failed ? <div className="map__fallback">Map unavailable. Locations are still listed below.</div> : <div ref={ref} style={{ height: '100%' }} />}
    </div>
  )
}
