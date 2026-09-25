import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findCatalogModel, modelsFor, MAKES } from '../data/vehicleCatalog'

/**
 * Guards against the hidden assumptions TREAD was built to remove. These
 * scan the actual source, so a future change that quietly reintroduces a
 * fixed home, a fixed timezone or automatic location fails the build.
 */
const ROOT = join(__dirname, '..')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(ts|tsx|css)$/.test(name) && !/\.test\.tsx?$/.test(name) && !path.includes(`${join('src', 'test')}`) ? [path] : []
  })
}

const SOURCE = files(ROOT).map((path) => ({ path, text: readFileSync(path, 'utf8') }))
const APP_ROOT = join(ROOT, '..')
const PUBLIC = ['index.html', 'public/manifest.webmanifest', 'public/sw.js'].map((p) => ({ path: p, text: readFileSync(join(APP_ROOT, p), 'utf8') }))

describe('no inherited identity', () => {
  it('no reTire branding, retirement or personal framing anywhere shipped', () => {
    for (const { path, text } of [...SOURCE, ...PUBLIC]) {
      expect(text, path).not.toMatch(/retire/i)
      expect(text, path).not.toMatch(/\bFIL\b|finance guy|investment memo|condo|the two of you|both phones/i)
    }
  })

  it('"Bronco" appears only as a catalogue model, never as an assumption', () => {
    for (const { path, text } of SOURCE) {
      if (path.endsWith('vehicleCatalog.ts')) continue
      expect(text, path).not.toMatch(/Bronco/)
    }
    expect(findCatalogModel('Ford', 'Bronco')).not.toBeNull()
  })
})

describe('no assumed location', () => {
  it('there is no fixed home base or default start in the code', () => {
    for (const { path, text } of SOURCE) {
      expect(text, path).not.toMatch(/export const HOME\b/)
      expect(text, path).not.toMatch(/America\/Denver/)
    }
  })

  it('geolocation is only touched by the explicit "use my location" function', () => {
    for (const { path, text } of SOURCE) {
      if (path.endsWith(join('services', 'geocode.ts'))) continue
      expect(text, path).not.toMatch(/geolocation/)
    }
    const geocode = SOURCE.find((s) => s.path.endsWith(join('services', 'geocode.ts')))!
    expect(geocode.text.match(/getCurrentPosition/g)).toHaveLength(1)
    expect(geocode.text).not.toMatch(/watchPosition/)
  })

  it('weather uses the destination timezone', () => {
    const weather = SOURCE.find((s) => s.path.endsWith(join('services', 'weather.ts')))!
    expect(weather.text).toMatch(/timezone: 'auto'/)
  })
})

describe('vehicle catalogue stays factual', () => {
  it('carries no clearance, range or dimension figures', () => {
    const catalog = SOURCE.find((s) => s.path.endsWith('vehicleCatalog.ts'))!
    expect(catalog.text).not.toMatch(/clearance\s*:|rangeMiles|widthIn/)
  })
  it('covers many makes and body styles, not one kind of vehicle', () => {
    expect(MAKES.length).toBeGreaterThan(15)
    const types = new Set(MAKES.flatMap((m) => modelsFor(m).map((x) => x.type)))
    for (const t of ['wagon', 'suv', 'pickup', 'sports_car', 'camper_van', 'utv', 'crossover']) expect(types.has(t as never), t).toBe(true)
  })
})
