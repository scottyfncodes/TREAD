import { useState } from 'react'
import { vehicleName, vehicleTitle, VEHICLE_TYPE_LABEL } from '../domain/vehicle'
import { capabilityChips, profileCompleteness } from '../engine/capability'
import { lastService } from '../engine/prep'
import { GEAR_GROUP_LABEL, GEAR_LIBRARY } from '../engine/gear'
import type { GearGroup } from '../domain/trip'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { EmptyState, SectionTitle } from '../components/Bits'
import { IconCar, IconPlus, IconStar } from '../components/Icons'

/**
 * MY GARAGE: every vehicle, which one is preferred, which one is driving
 * discovery right now, and the gear the user owns (independent of any
 * one vehicle).
 */
export function Garage({ go }: { go: Go }) {
  const { vehicles, preferredVehicleId, activeVehicle, selectVehicle, setPreferredVehicle, ownedGear, toggleGear, customGear, addCustomGear, removeCustomGear } = useStore()
  const [newGear, setNewGear] = useState('')

  const allGear = [...GEAR_LIBRARY, ...customGear]
  const groups = [...new Set(allGear.map((g) => g.group))] as GearGroup[]

  return (
    <div>
      <h1 className="display" style={{ marginTop: 10 }}>
        My garage
      </h1>
      <p className="tiny faint" style={{ margin: '6px 0 12px' }}>
        Your vehicles personalise every recommendation. Tap one to use it for exploring; star it to make it your default.
      </p>

      {vehicles.length === 0 && (
        <EmptyState icon={<IconCar width={40} height={40} />} title="No vehicles yet" action={<button type="button" className="btn btn--primary" onClick={() => go('vehicle/new')}>Add a vehicle</button>}>
          Add a car, truck, van, EV, bike or side-by-side. Year, make and model is enough to start.
        </EmptyState>
      )}

      {vehicles.map((v) => {
        const active = activeVehicle?.id === v.id
        const preferred = preferredVehicleId === v.id
        const completeness = profileCompleteness(v)
        const oil = lastService(v, 'oil')
        return (
          <div key={v.id} className={active ? 'card card--brand' : 'card'}>
            <div className="card__row">
              <div style={{ minWidth: 0 }}>
                <div className="eyebrow">
                  {VEHICLE_TYPE_LABEL[v.type]}
                  {active ? ' · exploring with this' : ''}
                </div>
                <h3 className="headline" style={{ marginTop: 4 }}>
                  {vehicleName(v)}
                </h3>
                {v.nickname && <p className="tiny faint" style={{ margin: '2px 0 0' }}>{vehicleTitle(v)}</p>}
              </div>
              <button type="button" className="icon-btn" aria-label={preferred ? 'Preferred vehicle' : 'Make preferred vehicle'} aria-pressed={preferred} onClick={() => setPreferredVehicle(v.id)} style={{ color: preferred ? 'var(--sand)' : 'var(--text-faint)' }}>
                <IconStar filled={preferred} width={20} height={20} />
              </button>
            </div>
            <div className="chips" style={{ margin: '10px 0' }}>
              {capabilityChips(v).map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
            <div className="tiny faint">
              Profile {completeness.filled}/{completeness.total}
              {completeness.missing.length > 0 ? ` · missing ${completeness.missing.slice(0, 3).join(', ').toLowerCase()}` : ''}
              {v.odometer !== null ? ` · ${v.odometer.toLocaleString()} mi` : ''}
              {oil ? ` · oil ${oil.date}` : ''}
            </div>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${(completeness.filled / completeness.total) * 100}%` }} />
            </div>
            <div className="btn-row">
              <button type="button" className="btn" disabled={active} onClick={() => { selectVehicle(v.id); go('') }}>
                {active ? 'In use' : 'Use this one'}
              </button>
              <button type="button" className="btn" onClick={() => go(`vehicle/${v.id}`)}>
                Edit
              </button>
            </div>
          </div>
        )
      })}

      {vehicles.length > 0 && (
        <button type="button" className="btn btn--primary" onClick={() => go('vehicle/new')}>
          <IconPlus width={18} height={18} /> Add another vehicle
        </button>
      )}

      <SectionTitle>Gear I own</SectionTitle>
      <p className="tiny faint" style={{ marginTop: -4 }}>
        Tick what you have. Packing lists mark these as already covered.
      </p>
      {groups.map((group) => (
        <div key={group} style={{ marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{GEAR_GROUP_LABEL[group]}</div>
          <div className="chips">
            {allGear
              .filter((g) => g.group === group)
              .map((g) => (
                <button key={g.id} type="button" className="chip" aria-pressed={ownedGear.includes(g.id)} onClick={() => toggleGear(g.id)}>
                  {g.label}
                </button>
              ))}
          </div>
        </div>
      ))}
      <form
        className="grid-2"
        style={{ gridTemplateColumns: '1fr auto' }}
        onSubmit={(e) => {
          e.preventDefault()
          const label = newGear.trim()
          if (!label) return
          addCustomGear({ id: `custom_${Date.now().toString(36)}`, label, group: 'other' })
          setNewGear('')
        }}
      >
        <input type="text" value={newGear} placeholder="Add your own item" onChange={(e) => setNewGear(e.target.value)} aria-label="Custom gear item" />
        <button type="submit" className="btn btn--small">
          Add
        </button>
      </form>
      {customGear.length > 0 && (
        <p className="tiny faint" style={{ marginTop: 8 }}>
          Remove custom:{' '}
          {customGear.map((g) => (
            <button key={g.id} type="button" className="chip" style={{ marginRight: 6 }} onClick={() => removeCustomGear(g.id)}>
              ✕ {g.label}
            </button>
          ))}
        </p>
      )}
    </div>
  )
}
