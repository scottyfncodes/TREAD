# TREAD

**Your vehicle. Your adventure.**

TREAD is a vehicle-aware adventure companion. It answers one question:

> What can I do with the vehicle I have?

Add a vehicle (year → make → model → trim is enough), choose where you start — or don't — and TREAD shows off-road routes, scenic drives, camping, hikes and trips, each compared against the vehicle's known capabilities and the route's *published* requirements.

## Principles

- **Never assume a starting location.** There is no default city and no automatic GPS. A start comes only from typing a town or coordinates, a place search, tapping the map, pressing "use my location", or a saved place. With no start, plans begin at each area's gateway town and say so.
- **Never invent a fact.** Every measurement is a `Measure`: a number, a range when sources disagree, or `null` → `UNKNOWN`. Every record carries sources and a check date.
- **Label where each claim comes from.** Vehicle considerations are tagged *Official*, *Vehicle spec*, *You entered*, *TREAD estimate* or *Community*. Club and trail-app data is always shown as community information.
- **Never say "safe".** The best TREAD will say is that a vehicle *appears compatible with the published requirements* — and it still flags when route difficulty remains high.

## Architecture

```
src/
  domain/    types: vehicle profiles, places, adventures/regions/networks, trips, preferences
  data/      region packs (Utah: Moab, San Rafael Swell, Paiute; Colorado: San Juans),
             sources, categories, vehicle catalogue, offline town list
  engine/    pure logic, fully tested:
             capability  -- the ONLY place that interprets a vehicle profile
             matching    -- published requirements vs. capabilities, with provenance
             discovery   -- vehicle-aware ranking; nothing hidden, everything labelled
             itinerary   -- timed day plans from a user-chosen start (or the gateway)
             tripPlan    -- multi-stop road trips, range checks
             readiness   -- READY TO GO summary
             gear, prep  -- packing lists and pre-trip checks
             drive, hike, measure, season, depth, time, geo -- models
  services/  weather (Open-Meteo, destination timezone), place search, persistence
  state/     store (garage, location, trips, gear, preferences kept separate), router
  components/, screens/  mobile-first UI
```

Regions are data: adding a state is writing a `RegionPack` and listing it in `src/data/index.ts`.

## Development

```bash
npm install
npm run dev     # local dev server
npm test        # full suite (engine, data integrity, services, UI in jsdom)
npm run lint
npm run build   # production build to dist/
npm run icons   # re-render PNG icons from public/icons/icon.svg (needs Playwright)
```

## Deployment

`.github/workflows/deploy.yml` runs lint, tests and the build, then publishes `dist/` to GitHub Pages. The build uses a relative base so it works at the Pages project path and as a home-screen PWA. Offline, saved trips still open; weather, maps and place search need a connection.

## Data sources

Land managers first — BLM (Moab, Price, Richfield), Fishlake National Forest, National Park Service, Utah State Parks, Grand County (Sand Flats), Utah Division of Outdoor Recreation, UDOT — then operators and reference sites, then clearly labelled community sources such as the Red Rock 4-Wheelers. Conditions change: every adventure links to the land manager's current-conditions page.
