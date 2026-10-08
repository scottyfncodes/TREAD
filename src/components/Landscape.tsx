import { useId, type ReactNode } from 'react'
import type { Scene } from './scenes'

/*
 * Procedural landscapes, one per kind of country TREAD covers. Flat dusk
 * layers in the brand's red-rock and sandstone palette, so every place
 * card reads as the same set of illustrations. Decorative only: the card
 * text carries the facts.
 */
const SKY: Record<Scene, [string, string, string]> = {
  arch: ['#0f1a26', '#33324a', '#ef9a5a'],
  canyon: ['#101a28', '#2e3247', '#e48a50'],
  alpine: ['#0e1c33', '#34496c', '#e3a27c'],
  flats: ['#121d2e', '#3a3448', '#f0a35e'],
  mesa: ['#111b2b', '#30344a', '#e08b52'],
}

/**
 * `sky` adds that many units of sky above the 400x200 scene, for frames
 * that carry text over the top. `rig` puts a small vehicle on the road.
 * Tall frames keep the ground (`bottom`); thin strips (`middle`) centre
 * on the band between the landmark and the road.
 */
export function Landscape({
  scene,
  sky = 0,
  rig = false,
  align = 'bottom',
  className,
}: {
  scene: Scene
  sky?: number
  rig?: boolean
  align?: 'bottom' | 'middle'
  className?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [top, mid, low] = SKY[scene]
  return (
    <svg
      className={className}
      viewBox={align === 'bottom' ? `0 ${-sky} 400 ${200 + sky}` : '0 18 400 200'}
      preserveAspectRatio={align === 'bottom' ? 'xMidYMax slice' : 'xMidYMid slice'}
      aria-hidden="true"
      focusable="false"
      data-scene={scene}
    >
      <defs>
        <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="0.82" stopColor={low} />
        </linearGradient>
        <linearGradient id={`${uid}sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9824a" />
          <stop offset="1" stopColor="#7d3d22" />
        </linearGradient>
      </defs>
      <rect x="0" y={-sky} width="400" height={200 + sky} fill={`url(#${uid}sky)`} />
      {SCENES[scene](uid)}
      {rig && <Rig />}
    </svg>
  )
}

const SCENES: Record<Scene, (uid: string) => ReactNode> = {
  arch: () => (
    <>
      <circle cx="274" cy="122" r="19" fill="#ffd59a" opacity="0.9" />
      <path d="M0 128 L40 128 L46 117 L104 117 L110 128 L176 128 L182 112 L238 112 L244 126 L400 126 L400 200 L0 200Z" fill="#4a2f3d" />
      <path d="M0 150 Q100 138 200 146 T400 142 L400 200 L0 200Z" fill="#7a3424" />
      <path
        fillRule="evenodd"
        fill="#b9502c"
        d="M206 162 L210 104 Q216 62 270 58 Q330 56 340 106 L346 162 Z M232 162 L236 116 Q242 86 272 84 Q306 84 312 116 L316 162 Z"
      />
      <path d="M210 104 Q216 62 270 58 Q330 56 340 106" fill="none" stroke="#e98149" strokeWidth="3" opacity="0.65" />
      <path d="M316 162 L312 116 Q306 84 272 84 Q298 90 302 118 L305 162Z" fill="#7a3424" opacity="0.7" />
      <path d="M0 172 Q80 160 160 170 T320 166 T400 168 L400 200 L0 200Z" fill="#2b1610" />
      <path d="M0 182 Q200 172 400 182" fill="none" stroke="#c98b55" strokeWidth="3" opacity="0.45" />
    </>
  ),
  canyon: () => (
    <>
      <circle cx="205" cy="92" r="14" fill="#ffd59a" opacity="0.85" />
      <path d="M0 110 L140 110 L150 98 L250 98 L262 112 L400 112 L400 200 L0 200Z" fill="#5a3442" />
      <path d="M0 30 L52 34 L58 60 L96 66 L104 98 L138 108 L150 140 L176 160 L186 200 L0 200Z" fill="#8e3f2a" />
      <path d="M58 60 L96 66 L104 98 L138 108 L150 140 L176 160 L186 200 L170 200 L140 150 L120 118 L90 104 L80 72Z" fill="#c4683a" opacity="0.55" />
      <path d="M400 24 L344 30 L338 58 L300 64 L292 96 L258 106 L248 138 L224 158 L214 200 L400 200Z" fill="#6e2f20" />
      <path d="M0 96 L92 102 M0 132 L128 138 M400 92 L296 100 M400 128 L262 134" stroke="#5b2416" strokeWidth="2" opacity="0.6" />
      <path d="M150 200 Q190 170 200 150 Q210 170 250 200Z" fill="#3a1d14" />
      <g fill="#3f5b3a">
        <circle cx="186" cy="182" r="4" />
        <circle cx="214" cy="176" r="3.5" />
        <circle cx="196" cy="166" r="3" />
        <circle cx="222" cy="190" r="4.5" />
      </g>
      <path d="M182 200 Q196 182 200 166 Q204 154 200 146" fill="none" stroke="#e9c46a" strokeWidth="2.5" opacity="0.55" />
    </>
  ),
  alpine: () => (
    <>
      <circle cx="206" cy="100" r="14" fill="#ffe2b8" opacity="0.8" />
      <path d="M0 140 L40 100 L70 118 L110 70 L150 112 L180 92 L220 126 L260 80 L300 110 L340 66 L380 104 L400 96 L400 200 L0 200Z" fill="#4b5a78" />
      <g fill="#dfe6ee" opacity="0.9">
        <path d="M110 70 L98 86 L105 83 L111 90 L117 82 L123 86Z" />
        <path d="M260 80 L249 94 L256 91 L262 97 L267 90 L272 93Z" />
        <path d="M340 66 L327 82 L334 79 L341 87 L347 78 L354 82Z" />
      </g>
      <path d="M0 162 L60 118 L100 140 L150 104 L200 150 L250 120 L300 150 L360 112 L400 136 L400 200 L0 200Z" fill="#26354a" />
      <g fill="#e8edf3">
        <path d="M150 104 L138 116 L146 114 L151 120 L156 113 L163 116Z" />
        <path d="M360 112 L349 123 L356 121 L361 127 L366 120 L372 123Z" />
      </g>
      <path d="M0 176 Q100 164 200 172 T400 170 L400 200 L0 200Z" fill="#14231d" />
      <g fill="#0f1b17">
        {[8, 26, 44, 70, 92, 236, 258, 282, 310, 336, 362, 386].map((x, i) => (
          <path key={x} d={`M${x} ${178 - (i % 3) * 3} l7 -${16 + (i % 2) * 6} l7 ${16 + (i % 2) * 6}Z`} />
        ))}
      </g>
      <path d="M70 200 L150 188 L104 180 L176 170 L140 162 L200 152" fill="none" stroke="#e9c46a" strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
    </>
  ),
  flats: (uid) => (
    <>
      <circle cx="120" cy="130" r="26" fill="#ffd59a" opacity="0.9" />
      <path d="M210 132 L254 102 L274 114 L300 90 L328 110 L352 98 L400 122 L400 132Z" fill="#6a5470" />
      <g fill="#e6dce8" opacity="0.75">
        <path d="M300 90 L292 98 L298 97 L302 101 L306 96Z" />
        <path d="M254 102 L247 108 L252 107 L256 110 L259 106Z" />
      </g>
      <rect x="0" y="130" width="400" height="70" fill={`url(#${uid}sand)`} />
      <path d="M196 130 L204 130 L256 200 L144 200Z" fill="#2b1a14" opacity="0.55" />
      <path d="M200 132 L200 200" stroke="#e9c46a" strokeWidth="1.6" strokeDasharray="5 6" opacity="0.7" />
      <path d="M0 172 Q40 140 90 160 Q124 138 168 164 L176 200 L0 200Z" fill="#a84e2c" />
      <path d="M8 168 Q44 148 86 164 M14 182 Q60 164 120 176" fill="none" stroke="#7d3520" strokeWidth="2" opacity="0.7" />
      <path d="M262 178 Q310 150 358 168 Q384 156 400 160 L400 200 L256 200Z" fill="#9a4528" />
    </>
  ),
  mesa: () => (
    <>
      <circle cx="364" cy="94" r="18" fill="#ffd59a" opacity="0.88" />
      <path d="M0 120 L30 120 L36 104 L120 104 L128 120 L210 120 L216 96 L230 96 L236 120 L400 120 L400 200 L0 200Z" fill="#5a3a4a" />
      <path d="M0 150 L20 150 L28 128 L170 128 L182 150 L400 150 L400 200 L0 200Z" fill="#8e3f2a" />
      <path d="M28 128 L170 128 L172 134 L26 134Z" fill="#c4683a" />
      <path d="M272 150 L284 110 L316 110 L328 150Z" fill="#7a3424" />
      <path d="M284 110 L316 110 L317 116 L283 116Z" fill="#b4552f" />
      <path d="M0 200 L0 176 L120 170 L180 180 L230 176 L400 186 L400 200Z" fill="#241310" />
      <path d="M0 190 Q150 178 400 192" fill="none" stroke="#c98b55" strokeWidth="2.5" opacity="0.4" />
    </>
  ),
}

/** A small rig crawling along the foreground road, kicking up dust. */
function Rig() {
  return (
    <g className="scene__rig">
      <g transform="translate(0 181) scale(1.35)">
        <g className="scene__dust" fill="#d59a62">
          <ellipse cx="-5" cy="-2" rx="5" ry="2.4" opacity="0.35" />
          <ellipse cx="-12" cy="-3.5" rx="6" ry="3" opacity="0.2" />
        </g>
        <path d="M3 -7 L5.5 -11 L12 -11 L14.5 -7Z" fill="#120a08" />
        <rect x="0" y="-7.5" width="18" height="5.5" rx="1.5" fill="#120a08" />
        <circle cx="4" cy="-1.6" r="2.4" fill="#120a08" />
        <circle cx="14" cy="-1.6" r="2.4" fill="#120a08" />
        <circle cx="17.6" cy="-5.6" r="0.9" fill="#ffd59a" />
      </g>
    </g>
  )
}
