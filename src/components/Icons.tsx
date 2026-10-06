import type { SVGProps } from 'react'

/** Line icons drawn for TREAD. 24px grid, 2px stroke, currentColor. */
type P = SVGProps<SVGSVGElement>

const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>
)
export const IconCompass = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>
)
export const IconRoute = (p: P) => (
  <svg {...base(p)}><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h7a3 3 0 000-6H9a3 3 0 010-6h7" /></svg>
)
export const IconGarage = (p: P) => (
  <svg {...base(p)}><path d="M3 9l9-5 9 5v11H3z" /><path d="M7 20v-7h10v7" /><path d="M7 16h10" /></svg>
)
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
)
export const IconCar = (p: P) => (
  <svg {...base(p)}><path d="M5 16l1.5-5.5A2 2 0 018.4 9h7.2a2 2 0 011.9 1.5L19 16" /><rect x="3" y="14" width="18" height="5" rx="1.5" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="16.5" cy="19.5" r="1.5" /></svg>
)
export const IconPin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
)
export const IconLocate = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
)
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
)
export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconStar = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
)
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const IconChevron = (p: P) => (
  <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
)
export const IconBack = (p: P) => (
  <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>
)
export const IconFlag = (p: P) => (
  <svg {...base(p)}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
)
export const IconMap = (p: P) => (
  <svg {...base(p)}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
)

/** The TREAD mark: a tire tread of chevrons inside a wheel. */
export function TreadMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#151a1f" stroke="#fb923c" strokeWidth="4" />
      <g fill="none" stroke="#fb923c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 22l8 7-8 7" />
        <path d="M31 22l8 7-8 7" opacity="0.75" />
      </g>
      <path d="M17 44h30" stroke="#e9c46a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
