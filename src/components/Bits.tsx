import type { ReactNode } from 'react'
import type { Basis, Measure, Warning } from '../domain/types'
import { BASIS_LABEL } from '../domain/types'
import { formatMeasure } from '../engine/measure'
import { sourcesFor } from '../data/sources'
import { IconBack } from './Icons'

export function Stat({ label, value, unit = '', decimals = 0 }: { label: string; value: Measure; unit?: string; decimals?: number }) {
  const unknown = value === null
  return (
    <div className="stat">
      <div className={unknown ? 'stat__value stat__value--unknown' : 'stat__value'}>
        {unknown ? 'UNKNOWN' : formatMeasure(value, unit, { decimals })}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

export function TextStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className={value === 'UNKNOWN' ? 'stat__value stat__value--unknown' : 'stat__value'}>{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

export type Level = 'ok' | 'caution' | 'blocker' | 'unknown' | 'info'

const MARK: Record<Level, string> = { ok: '✓', caution: '!', blocker: '✕', unknown: '?', info: 'i' }
const MARK_LABEL: Record<Level, string> = { ok: 'OK', caution: 'Caution', blocker: 'Problem', unknown: 'Unknown', info: 'Note' }

export function Mark({ level }: { level: Level }) {
  return (
    <span className={`mark mark--${level}`} role="img" aria-label={MARK_LABEL[level]}>
      {MARK[level]}
    </span>
  )
}

export function BasisTag({ basis }: { basis: Basis | 'unknown' }) {
  if (basis === 'unknown') return <span className="basis">Unknown</span>
  return <span className={`basis basis--${basis}`}>{BASIS_LABEL[basis]}</span>
}

export function WarningList({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) return null
  const order = { blocker: 0, caution: 1, info: 2 }
  const sorted = [...warnings].sort((a, b) => order[a.level] - order[b.level])
  return (
    <div>
      {sorted.map((w, i) => (
        <div key={i} className={`warn warn--${w.level}`}>
          <Mark level={w.level} />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  )
}

/** Sources render next to the facts they back, not in a footer. */
export function SourceLine({ ids, lastChecked, prefix = 'Source' }: { ids: string[]; lastChecked?: string; prefix?: string }) {
  const sources = sourcesFor(ids)
  if (sources.length === 0) return <p className="source">{prefix}: none recorded.</p>
  return (
    <p className="source">
      {prefix}:{' '}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ', '}
          <a href={s.url} target="_blank" rel="noreferrer noopener">
            {s.label}
          </a>
          {s.kind === 'community' ? ' (community)' : ''}
        </span>
      ))}
      {lastChecked ? ` · checked ${lastChecked}` : null}
    </p>
  )
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (next: T) => void }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" className="seg__btn" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {help && <span className="field__help">{help}</span>}
    </label>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <h2 className="section-title">
      <span>{children}</span>
      {action}
    </h2>
  )
}

export function BackLink({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="backlink" onClick={onClick}>
      <IconBack width={18} height={18} /> {label}
    </button>
  )
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon && <div className="empty__icon">{icon}</div>}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

/** Hands off to the phone's maps app. TREAD never navigates itself. */
export function navigateUrl(lat: number, lon: number, origin?: { lat: number; lon: number } | null): string {
  const params = new URLSearchParams({ api: '1', destination: `${lat},${lon}`, travelmode: 'driving' })
  if (origin) params.set('origin', `${origin.lat},${origin.lon}`)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function appleMapsUrl(lat: number, lon: number, label: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lon}&q=${encodeURIComponent(label)}`
}
