import type { Preferences } from '../domain/trip'
import type { DayPlanSettings } from '../engine/itinerary'
import { Segmented } from './Bits'

export function settingsFromPrefs(prefs: Preferences, date: string): DayPlanSettings {
  return {
    date,
    departMinutes: 8 * 60,
    backByMinutes: null,
    hikeAppetite: prefs.hikeAppetite,
    food: prefs.food,
    maxDriveMinutes: prefs.maxDriveMinutes,
    paceMph: prefs.paceMph,
  }
}

/** The day's shape, in a few taps. */
export function DayControls({
  settings,
  onChange,
  date,
  onDate,
}: {
  settings: DayPlanSettings
  onChange: (s: DayPlanSettings) => void
  date: string
  onDate: (d: string) => void
}) {
  return (
    <>
      <label className="field">
        <span className="field__label">Date</span>
        <input type="date" value={date} onChange={(e) => e.target.value && onDate(e.target.value)} />
      </label>
      <Segmented
        label="Leave at"
        value={String(settings.departMinutes)}
        options={[5, 6, 7, 8, 9, 10].map((h) => ({ value: String(h * 60), label: `${h}:00` }))}
        onChange={(v) => onChange({ ...settings, departMinutes: Number(v) })}
      />
      <Segmented
        label="Back by"
        value={settings.backByMinutes === null ? 'none' : String(settings.backByMinutes)}
        options={[
          { value: 'none', label: 'No limit' },
          { value: String(16 * 60), label: '4 PM' },
          { value: String(18 * 60), label: '6 PM' },
          { value: String(20 * 60), label: '8 PM' },
          { value: String(22 * 60), label: '10 PM' },
        ]}
        onChange={(v) => onChange({ ...settings, backByMinutes: v === 'none' ? null : Number(v) })}
      />
      <Segmented
        label="Hiking"
        value={settings.hikeAppetite}
        options={[
          { value: 'none' as const, label: 'None' },
          { value: 'short' as const, label: 'Short' },
          { value: 'moderate' as const, label: 'Moderate' },
          { value: 'long' as const, label: 'Long' },
        ]}
        onChange={(v) => onChange({ ...settings, hikeAppetite: v })}
      />
      <Segmented
        label="Food stop"
        value={settings.food}
        options={[
          { value: 'none' as const, label: 'None' },
          { value: 'coffee' as const, label: 'Coffee' },
          { value: 'lunch' as const, label: 'Lunch' },
          { value: 'brewery' as const, label: 'Brewery' },
          { value: 'dinner' as const, label: 'Dinner' },
        ]}
        onChange={(v) => onChange({ ...settings, food: v })}
      />
    </>
  )
}
