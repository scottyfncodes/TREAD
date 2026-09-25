import { useMemo, useState } from 'react'
import type { CatalogField, Drivetrain, EquipmentId, Lockers, MaintenanceEntry, Powertrain, TireType, VehicleProfile, VehicleType } from '../domain/vehicle'
import {
  blankVehicle,
  DRIVETRAIN_LABEL,
  EQUIPMENT_IDS,
  EQUIPMENT_LABEL,
  isVehicleComplete,
  LOCKERS_LABEL,
  POWERTRAIN_LABEL,
  TIRE_LABEL,
  VEHICLE_TYPE_LABEL,
  vehicleTitle,
} from '../domain/vehicle'
import { findCatalogModel, MAKES, modelsFor, yearOptions } from '../data/vehicleCatalog'
import { HIGH_CLEARANCE_IN, profileCompleteness } from '../engine/capability'
import { preTripChecklist } from '../engine/prep'
import { useStore } from '../state/store'
import type { Go } from '../state/useRoute'
import { todayIso } from '../state/dates'
import { BackLink, BasisTag, EmptyState, Field, Segmented } from '../components/Bits'

const TYPES = Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]
const DRIVETRAINS = Object.keys(DRIVETRAIN_LABEL) as Drivetrain[]
const POWERTRAINS = Object.keys(POWERTRAIN_LABEL) as Powertrain[]
const TIRES = Object.keys(TIRE_LABEL) as TireType[]
const LOCKERS = Object.keys(LOCKERS_LABEL) as Lockers[]

function numOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Add / edit a vehicle. The first screen asks only for year, make, model and
 * trim; the catalogue then suggests body type and drivetrain, which the user
 * can confirm or change. Everything else sits behind "More details" and is
 * optional -- TREAD works with what it is given and says what is missing.
 */
export function VehicleEditor({ id, go, back }: { id: string | null; go: Go; back: () => void }) {
  const { vehicles, saveVehicle, deleteVehicle, preferredVehicleId, setPreferredVehicle, finishOnboarding } = useStore()
  const existing = id ? vehicles.find((v) => v.id === id) : undefined
  const [v, setV] = useState<VehicleProfile>(() => existing ?? blankVehicle())
  const [confirmDelete, setConfirmDelete] = useState(false)

  const catalogModel = useMemo(() => findCatalogModel(v.make, v.model), [v.make, v.model])
  const models = useMemo(() => modelsFor(v.make), [v.make])

  if (id && !existing) {
    return (
      <div>
        <BackLink onClick={back} />
        <EmptyState title="Vehicle not found">It may have been deleted.</EmptyState>
      </div>
    )
  }

  const set = (patch: Partial<VehicleProfile>, userFields: CatalogField[] = []) =>
    setV((cur) => ({ ...cur, ...patch, catalogFields: cur.catalogFields.filter((f) => !userFields.includes(f)) }))

  /** Picking a known model pre-fills only what is true of the whole model line. */
  const applyModel = (model: string) => {
    const hit = findCatalogModel(v.make, model)
    if (!hit) {
      setV((cur) => ({ ...cur, model, catalogFields: [] }))
      return
    }
    const filled: CatalogField[] = ['type']
    const patch: Partial<VehicleProfile> = { model: hit.model, type: hit.type }
    if (hit.drivetrains.length === 1) {
      patch.drivetrain = hit.drivetrains[0]
      filled.push('drivetrain')
      const is4wd = hit.drivetrains[0].startsWith('4wd')
      if (is4wd && hit.lowRangeWith4wd) {
        patch.lowRange = true
        filled.push('lowRange')
      }
    }
    if (hit.powertrains.length === 1) {
      patch.powertrain = hit.powertrains[0]
      filled.push('powertrain')
    }
    setV((cur) => ({ ...cur, ...patch, catalogFields: filled }))
  }

  const chooseDrivetrain = (d: Drivetrain) => {
    const patch: Partial<VehicleProfile> = { drivetrain: d }
    const fields: CatalogField[] = ['drivetrain']
    if (d.startsWith('4wd') && catalogModel?.lowRangeWith4wd && v.lowRange === null) {
      patch.lowRange = true
      setV((cur) => ({ ...cur, ...patch, catalogFields: [...cur.catalogFields.filter((f) => f !== 'drivetrain'), 'lowRange'] }))
      return
    }
    set(patch, fields)
  }

  const toggleEquipment = (e: EquipmentId) =>
    set({ equipment: v.equipment.includes(e) ? v.equipment.filter((x) => x !== e) : [...v.equipment, e] })

  const complete = isVehicleComplete(v)
  const completeness = profileCompleteness(v)

  const save = () => {
    saveVehicle(v)
    finishOnboarding()
    go(existing ? 'garage' : '')
  }

  const addService = () =>
    set({
      maintenance: [
        ...v.maintenance,
        { id: `svc_${Date.now().toString(36)}`, date: todayIso(), kind: 'oil', miles: v.odometer, note: '' },
      ],
    })

  const updateService = (sid: string, patch: Partial<MaintenanceEntry>) =>
    set({ maintenance: v.maintenance.map((m) => (m.id === sid ? { ...m, ...patch } : m)) })

  return (
    <div>
      <BackLink onClick={back} label={existing ? 'Garage' : 'Back'} />
      <h1 className="display">{existing ? 'Edit vehicle' : 'Add a vehicle'}</h1>
      <p className="tiny faint" style={{ margin: '6px 0 16px' }}>
        {existing ? vehicleTitle(v) : 'Year, make and model are enough to start. Everything else is optional and can be added later.'}
      </p>

      <div className="card">
        <div className="grid-2">
          <Field label="Year">
            <select value={v.year ?? ''} onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })} aria-label="Year">
              <option value="">Year</option>
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Make">
            <input type="text" list="makes" value={v.make} placeholder="e.g. Subaru" autoComplete="off" onChange={(e) => set({ make: e.target.value })} aria-label="Make" />
            <datalist id="makes">
              {MAKES.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Model">
            <input type="text" list="models" value={v.model} placeholder="e.g. Outback" autoComplete="off" onChange={(e) => applyModel(e.target.value)} aria-label="Model" />
            <datalist id="models">
              {models.map((m) => (
                <option key={m.model} value={m.model} />
              ))}
            </datalist>
          </Field>
          <Field label="Trim">
            <input type="text" value={v.trim} placeholder="optional" onChange={(e) => set({ trim: e.target.value })} aria-label="Trim" />
          </Field>
        </div>

        {models.length > 0 && !catalogModel && (
          <div className="chips" style={{ marginBottom: 12 }}>
            {models.map((m) => (
              <button key={m.model} type="button" className="chip" onClick={() => applyModel(m.model)}>
                {m.model}
              </button>
            ))}
          </div>
        )}

        <Field label="Type">
          <select value={v.type} onChange={(e) => set({ type: e.target.value as VehicleType }, ['type'])} aria-label="Vehicle type">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {VEHICLE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <div className="field">
          <span className="field__label">
            Drivetrain {v.catalogFields.includes('drivetrain') && <BasisTag basis="vehicle_spec" />}
          </span>
          <div className="seg" role="group" aria-label="Drivetrain">
            {(catalogModel ? [...catalogModel.drivetrains, 'unknown' as Drivetrain] : DRIVETRAINS).map((d) => (
              <button key={d} type="button" className="seg__btn" aria-pressed={v.drivetrain === d} onClick={() => chooseDrivetrain(d)}>
                {DRIVETRAIN_LABEL[d]}
              </button>
            ))}
          </div>
          {catalogModel && <span className="field__help">Options offered on the {catalogModel.model}. Pick yours.</span>}
        </div>

        {(v.drivetrain === '4wd_part_time' || v.drivetrain === '4wd_full_time') && (
          <Segmented
            label="Low range (4LO)"
            value={v.lowRange === null ? 'unknown' : v.lowRange ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'unknown', label: 'Not sure' },
            ]}
            onChange={(x) => set({ lowRange: x === 'unknown' ? null : x === 'yes' }, ['lowRange'])}
          />
        )}

        <Field label="Powertrain">
          <select value={v.powertrain} onChange={(e) => set({ powertrain: e.target.value as Powertrain }, ['powertrain'])} aria-label="Powertrain">
            {POWERTRAINS.map((p) => (
              <option key={p} value={p}>
                {POWERTRAIN_LABEL[p]}
              </option>
            ))}
          </select>
        </Field>

        {v.catalogFields.length > 0 && (
          <p className="tiny faint" style={{ margin: 0 }}>
            Fields marked <BasisTag basis="vehicle_spec" /> were suggested from the model line. Confirm they match your vehicle.
          </p>
        )}
      </div>

      <button type="button" className="btn btn--primary" disabled={!complete} onClick={save}>
        {existing ? 'Save changes' : 'Save vehicle'}
      </button>
      {!complete && <p className="tiny faint" style={{ marginTop: 6 }}>Year, make and model are needed to save.</p>}

      <h2 className="section-title">
        <span>More details</span>
        <span className="chip">
          {completeness.filled}/{completeness.total}
        </span>
      </h2>
      <p className="tiny faint" style={{ marginTop: -4 }}>
        Optional. Each one sharpens the vehicle checks -- without them TREAD says "unknown" rather than guessing.
      </p>

      <details className="more">
        <summary>Capability</summary>
        <div className="more__body">
          <Field label="Ground clearance (in)" help={`TREAD treats ${HIGH_CLEARANCE_IN} in or more as high clearance. Use your owner’s manual or a measurement.`}>
            <input type="number" inputMode="decimal" value={v.groundClearanceIn ?? ''} onChange={(e) => set({ groundClearanceIn: numOrNull(e.target.value) })} aria-label="Ground clearance in inches" />
          </Field>
          <Field label="Overall width (in)" help="Matters on width-limited OHV trails (50 in, 60 in).">
            <input type="number" inputMode="decimal" value={v.widthIn ?? ''} onChange={(e) => set({ widthIn: numOrNull(e.target.value) })} aria-label="Width in inches" />
          </Field>
          <div className="grid-2">
            <Field label="Tire type">
              <select value={v.tireType} onChange={(e) => set({ tireType: e.target.value as TireType })} aria-label="Tire type">
                {TIRES.map((t) => (
                  <option key={t} value={t}>
                    {TIRE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tire size">
              <input type="text" value={v.tireSize} placeholder="e.g. 255/70R17" onChange={(e) => set({ tireSize: e.target.value })} aria-label="Tire size" />
            </Field>
          </div>
          <Field label="Lockers">
            <select value={v.lockers} onChange={(e) => set({ lockers: e.target.value as Lockers })} aria-label="Lockers">
              {LOCKERS.map((l) => (
                <option key={l} value={l}>
                  {LOCKERS_LABEL[l]}
                </option>
              ))}
            </select>
          </Field>
          <Segmented
            label="Street-legal"
            value={v.streetLegal === null ? 'unknown' : v.streetLegal ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'unknown', label: 'Not sure' },
            ]}
            onChange={(x) => set({ streetLegal: x === 'unknown' ? null : x === 'yes' })}
          />
        </div>
      </details>

      <details className="more">
        <summary>Fuel, charge & range</summary>
        <div className="more__body">
          <Field label={v.powertrain === 'ev' ? 'Full-charge range (mi)' : 'Full-tank range (mi)'} help="What you actually get, not the brochure. Used for range checks.">
            <input type="number" inputMode="numeric" value={v.rangeMiles ?? ''} onChange={(e) => set({ rangeMiles: numOrNull(e.target.value) })} aria-label="Range in miles" />
          </Field>
          {v.powertrain !== 'ev' && (
            <Field label="Fuel capacity (gal)">
              <input type="number" inputMode="decimal" value={v.fuelCapacityGal ?? ''} onChange={(e) => set({ fuelCapacityGal: numOrNull(e.target.value) })} aria-label="Fuel capacity in gallons" />
            </Field>
          )}
        </div>
      </details>

      <details className="more">
        <summary>Camping & cargo</summary>
        <div className="more__body">
          <div className="grid-2">
            <Field label="Sleeps">
              <input type="number" inputMode="numeric" value={v.sleeps ?? ''} onChange={(e) => set({ sleeps: numOrNull(e.target.value) })} aria-label="Sleeps" />
            </Field>
            <Field label="Cargo (cu ft)">
              <input type="number" inputMode="decimal" value={v.cargoCuFt ?? ''} onChange={(e) => set({ cargoCuFt: numOrNull(e.target.value) })} aria-label="Cargo in cubic feet" />
            </Field>
          </div>
        </div>
      </details>

      <details className="more">
        <summary>Equipment & modifications</summary>
        <div className="more__body">
          <div className="chips">
            {EQUIPMENT_IDS.map((e) => (
              <button key={e} type="button" className="chip" aria-pressed={v.equipment.includes(e)} onClick={() => toggleEquipment(e)}>
                {EQUIPMENT_LABEL[e]}
              </button>
            ))}
          </div>
        </div>
      </details>

      <details className="more">
        <summary>Prep & maintenance</summary>
        <div className="more__body">
          <Field label="Odometer (mi)">
            <input type="number" inputMode="numeric" value={v.odometer ?? ''} onChange={(e) => set({ odometer: numOrNull(e.target.value) })} aria-label="Odometer" />
          </Field>
          <div className="eyebrow" style={{ margin: '4px 0 8px' }}>Service log</div>
          {v.maintenance.length === 0 && <p className="tiny faint">No entries yet.</p>}
          {v.maintenance.map((m) => (
            <div key={m.id} className="card card--flat" style={{ padding: 12 }}>
              <div className="grid-2">
                <input type="date" value={m.date} onChange={(e) => updateService(m.id, { date: e.target.value })} aria-label="Service date" />
                <select value={m.kind} onChange={(e) => updateService(m.id, { kind: e.target.value as MaintenanceEntry['kind'] })} aria-label="Service type">
                  {['oil', 'tires', 'brakes', 'fluids', 'inspection', 'battery', 'other'].map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <input type="text" style={{ marginTop: 8 }} value={m.note} placeholder="Note" onChange={(e) => updateService(m.id, { note: e.target.value })} aria-label="Service note" />
              <button type="button" className="btn btn--ghost btn--small" style={{ marginTop: 8 }} onClick={() => set({ maintenance: v.maintenance.filter((x) => x.id !== m.id) })}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--small" onClick={addService}>
            Add service entry
          </button>
          <Field label="Notes">
            <textarea value={v.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Anything worth remembering about this vehicle" aria-label="Vehicle notes" />
          </Field>
          <div className="eyebrow" style={{ margin: '4px 0 8px' }}>General pre-trip checklist</div>
          <ul className="tiny muted" style={{ paddingLeft: 18 }}>
            {preTripChecklist(v).map((i) => (
              <li key={i.id}>{i.label}</li>
            ))}
          </ul>
        </div>
      </details>

      <button type="button" className="btn btn--primary" disabled={!complete} onClick={save} style={{ marginTop: 6 }}>
        {existing ? 'Save changes' : 'Save vehicle'}
      </button>

      {existing && (
        <div className="sheet-actions" style={{ marginTop: 18 }}>
          {preferredVehicleId !== existing.id && (
            <button type="button" className="btn" onClick={() => setPreferredVehicle(existing.id)}>
              Make preferred vehicle
            </button>
          )}
          {confirmDelete ? (
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button type="button" className="btn btn--danger" onClick={() => { deleteVehicle(existing.id); go('garage') }}>
                Delete for good
              </button>
              <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>
              Delete vehicle
            </button>
          )}
        </div>
      )}
    </div>
  )
}
