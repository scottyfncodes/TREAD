import { describe, expect, it, vi } from 'vitest'
import { makePlace, offlineSearch, parseCoordinates, parseGeocode, requestDeviceLocation } from './geocode'

describe('manual starting location', () => {
  it('finds towns offline by name', () => {
    const dallas = offlineSearch('Dallas')
    expect(dallas[0].label).toBe('Dallas, TX')
    expect(dallas[0].origin).toBe('manual')
    expect(offlineSearch('moab')[0].label).toBe('Moab, UT')
  })
  it('ignores one-letter queries', () => {
    expect(offlineSearch('d')).toEqual([])
  })
  it('parses typed coordinates and rejects impossible ones', () => {
    expect(parseCoordinates('38.5733, -109.5498')?.lat).toBeCloseTo(38.5733)
    expect(parseCoordinates('38.5 -109.5')?.lon).toBeCloseTo(-109.5)
    expect(parseCoordinates('95, 10')).toBeNull()
    expect(parseCoordinates('Moab')).toBeNull()
  })
  it('makes stable ids from coordinates', () => {
    expect(makePlace('A', 1, 2, 'map').id).toBe(makePlace('B', 1, 2, 'manual').id)
  })
})

describe('online place search parsing', () => {
  it('reads Open-Meteo geocoder results', () => {
    const places = parseGeocode({ results: [{ name: 'Green River', latitude: 38.99, longitude: -110.16, admin1: 'Utah', country_code: 'US' }] })
    expect(places[0].label).toBe('Green River, Utah')
    expect(places[0].origin).toBe('search')
  })
  it('survives garbage', () => {
    expect(parseGeocode(null)).toEqual([])
    expect(parseGeocode({ results: [{ name: 'x' }] })).toEqual([])
  })
})

describe('device location is explicit', () => {
  it('only resolves through the geolocation it is handed, labelled as a device fix', async () => {
    const geo = {
      getCurrentPosition: vi.fn((ok: PositionCallback) => ok({ coords: { latitude: 38.5, longitude: -109.5 } } as GeolocationPosition)),
    } as unknown as Geolocation
    const place = await requestDeviceLocation(geo)
    expect(geo.getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(place.origin).toBe('device')
    expect(place.label).toMatch(/^My location/)
  })
  it('reports a declined permission plainly', async () => {
    const geo = { getCurrentPosition: (_ok: PositionCallback, fail: PositionErrorCallback) => fail({ code: 1 } as GeolocationPositionError) } as unknown as Geolocation
    await expect(requestDeviceLocation(geo)).rejects.toThrow(/declined/)
  })
  it('fails cleanly with no geolocation API', async () => {
    await expect(requestDeviceLocation(undefined)).rejects.toThrow(/not available/)
  })
})
