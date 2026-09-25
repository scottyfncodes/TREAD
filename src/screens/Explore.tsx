import { useMemo, useState } from 'react'
import type { CategoryId } from '../domain/adventure'
import { CATEGORIES, CATEGORY_BY_ID, FOOD_CATEGORIES } from '../data/categories'
import { REGIONS } from '../data'
import { discover, discoverFood } from '../engine/discovery'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { ContextBar } from '../components/ContextBar'
import { AdventureCard } from '../components/AdventureCard'
import { EmptyState, SourceLine } from '../components/Bits'
import { IconSearch } from '../components/Icons'

export function Explore({ go, category }: { go: Go; category: string | null }) {
  const { activeVehicle, start, date, prefs } = useStore()
  const [regionId, setRegionId] = useState<string | null>(null)
  const [suitedOnly, setSuitedOnly] = useState(false)
  const [query, setQuery] = useState('')

  const cat = category && CATEGORY_BY_ID[category as CategoryId] ? (category as CategoryId) : null
  const isFood = cat !== null && FOOD_CATEGORIES.includes(cat)

  const results = useMemo(() => {
    if (isFood) return []
    const q = query.trim().toLowerCase()
    return discover({ vehicle: activeVehicle, start, date, categories: cat ? [cat] : [], regionId, preferences: prefs, suitedOnly }).filter(
      (d) => !q || d.adventure.name.toLowerCase().includes(q) || d.adventure.tagline.toLowerCase().includes(q),
    )
  }, [activeVehicle, start, date, cat, regionId, prefs, suitedOnly, query, isFood])

  const food = useMemo(() => (isFood && cat ? discoverFood(cat as 'food' | 'coffee' | 'breweries', regionId) : []), [isFood, cat, regionId])

  return (
    <div>
      <h1 className="display" style={{ marginTop: 10 }}>
        {cat ? `${CATEGORY_BY_ID[cat].emoji} ${CATEGORY_BY_ID[cat].label}` : 'Explore'}
      </h1>
      <p className="tiny faint" style={{ margin: '4px 0 0' }}>
        {cat ? CATEGORY_BY_ID[cat].blurb : 'Every adventure, checked against your vehicle.'}
      </p>
      <ContextBar go={go} />

      <div className="chips chips--scroll" role="group" aria-label="Category" style={{ marginTop: 10 }}>
        <button type="button" className="chip" aria-pressed={cat === null} onClick={() => go('explore')}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => go(`explore/${c.id}`)}>
            <span aria-hidden="true">{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      <div className="chips chips--scroll" role="group" aria-label="Region">
        <button type="button" className="chip" aria-pressed={regionId === null} onClick={() => setRegionId(null)}>
          All regions
        </button>
        {REGIONS.map((r) => (
          <button key={r.id} type="button" className="chip" aria-pressed={regionId === r.id} onClick={() => setRegionId(r.id)}>
            {r.name}
          </button>
        ))}
      </div>

      {!isFood && (
        <>
          <label className="field" style={{ marginTop: 6 }}>
            <span className="sr-only">Search adventures</span>
            <input type="search" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {activeVehicle && (
            <label className="toggle-row">
              <span className="small">Only show what suits my vehicle</span>
              <input type="checkbox" checked={suitedOnly} onChange={(e) => setSuitedOnly(e.target.checked)} aria-label="Only show what suits my vehicle" />
            </label>
          )}
        </>
      )}

      {isFood ? (
        food.length === 0 ? (
          <EmptyState icon={<IconSearch width={40} height={40} />} title="Nothing verified here yet">
            TREAD only lists places it could attribute to a source, with hours treated as a note rather than fact. Try another region, or the Breweries
            category.
          </EmptyState>
        ) : (
          food.map((f) => (
            <div key={f.id} className="card card--flat">
              <div className="eyebrow">{f.town}</div>
              <h3 className="headline" style={{ marginTop: 4 }}>
                {f.name}
              </h3>
              {f.address && <p className="tiny muted" style={{ margin: '4px 0' }}>{f.address}</p>}
              <p className="tiny" style={{ color: 'var(--caution)', margin: '4px 0' }}>
                {f.hoursNote ?? 'Hours not verified.'} Hours change -- check before you go.
              </p>
              {f.url && (
                <a className="chip" href={f.url} target="_blank" rel="noreferrer noopener">
                  Website
                </a>
              )}
              <SourceLine ids={f.sources} lastChecked={f.lastChecked} />
            </div>
          ))
        )
      ) : results.length === 0 ? (
        <EmptyState icon={<IconSearch width={40} height={40} />} title="No matches">
          {suitedOnly ? 'Nothing here appears to suit this vehicle. Turn off the filter to see everything, labelled.' : 'Try a different category or region.'}
        </EmptyState>
      ) : (
        <div style={{ marginTop: 12 }}>
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
      )}

      <p className="tiny faint">
        Routes that don’t suit the selected vehicle are labelled rather than hidden, so you can see what it would take.
      </p>
    </div>
  )
}
