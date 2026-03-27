'use client'

import { Locale } from "@/types"


interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Serpentine node positions (6 rows × 5 cols = 30 nodes) ────────────────
const ROW_YS  = [14, 47, 80, 113, 146, 179]
const X_RTL   = [82, 66, 50, 34, 18]   // right → left (even rows)
const X_LTR   = [18, 34, 50, 66, 82]   // left  → right (odd rows)

const NODE_POS: { x: number; y: number }[] = []
for (let row = 0; row < 6; row++) {
    const xs = row % 2 === 0 ? X_RTL : X_LTR
    for (let col = 0; col < 5; col++) {
        NODE_POS.push({ x: xs[col], y: ROW_YS[row] })
    }
}

// Decorative sushi emojis scattered between path curves
const DECOS = [
    { emoji: '🍣', x: 50, y: 31 },
    { emoji: '🥢', x: 12, y: 64 },
    { emoji: '🍱', x: 88, y: 97 },
    { emoji: '🍜', x: 10, y: 130 },
    { emoji: '✨', x: 88, y: 163 },
    { emoji: '🍘', x: 50, y: 192 },
]

// ── SVG snake path ────────────────────────────────────────────────────────
const PATH = [
    'M 82 14 L 66 14 L 50 14 L 34 14 L 18 14',
    'C 4 14, 4 47, 18 47',
    'L 34 47 L 50 47 L 66 47 L 82 47',
    'C 96 47, 96 80, 82 80',
    'L 66 80 L 50 80 L 34 80 L 18 80',
    'C 4 80, 4 113, 18 113',
    'L 34 113 L 50 113 L 66 113 L 82 113',
    'C 96 113, 96 146, 82 146',
    'L 66 146 L 50 146 L 34 146 L 18 146',
    'C 4 146, 4 179, 18 179',
    'L 34 179 L 50 179 L 66 179 L 82 179',
].join(' ')

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)

    // No sequence logic needed for Mystery Mode


    return (
        <div className="relative w-full">
            {/* SVG canvas — 100:195 aspect ratio (portrait phone) */}
            <div className="relative w-full" style={{ paddingBottom: '195%' }}>
                <svg
                    viewBox="0 0 100 200"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Clip paths for circular logos */}
                        {nodes.map((locale, i) => (
                            <clipPath key={`clip-${locale.id}`} id={`clipN-${i}`}>
                                <circle cx={NODE_POS[i].x} cy={NODE_POS[i].y} r="5.2" />
                            </clipPath>
                        ))}

                        {/* Neon Blue Gradient for the path */}
                        <linearGradient id="neonBlueGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#0038A8" />
                            <stop offset="50%" stopColor="#0066FF" />
                            <stop offset="100%" stopColor="#0038A8" />
                        </linearGradient>

                        {/* Salmon Gradient for accents */}
                        <linearGradient id="salmonGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FF8A5B" />
                            <stop offset="100%" stopColor="#E66A3E" />
                        </linearGradient>

                        {/* Blur + Grayscale filter for mystery nodes */}
                        <filter id="mystery-blur">
                            <feColorMatrix type="saturate" values="0" />
                            <feGaussianBlur stdDeviation="2.5" />
                        </filter>

                        {/* Intense Neon Glow for path edges */}
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1.2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        {/* Outer Blue Shadow for depth */}
                        <filter id="blue-shadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#001B4D" floodOpacity="0.8" />
                        </filter>
                    </defs>


                    {/* ── ROAD LAYERS (Neo-Blue Version) ── */}
                    {/* Glow Layer */}
                    <path d={PATH} fill="none" stroke="#00D1FF" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter="url(#neon-glow)" />
                    {/* Deep Blue Border */}
                    <path d={PATH} fill="none" stroke="#001B4D" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" filter="url(#blue-shadow)" />
                    {/* Royal Blue Surface */}
                    <path d={PATH} fill="none" stroke="url(#neonBlueGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Cream Dash Pattern (Sushi Rice style) */}
                    <path d={PATH} fill="none" stroke="#FFF8E7" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 5" opacity="0.6" />


                    {/* ── DECORATIVE SUSHI EMOJIS ── */}
                    {DECOS.map((d, i) => (
                        <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="5.5" opacity="0.35">
                            {d.emoji}
                        </text>
                    ))}


                    {/* ── NODES ── */}
                    {nodes.map((locale, i) => {
                        const pos    = NODE_POS[i]
                        const isVisited = visitedIds.includes(locale.id)
                        const label     = locale.name.length > 10 ? locale.name.slice(0, 10) + '…' : locale.name


                        return (
                            <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer', outline: 'none' }} className="touch-manipulation">

                                {/* Invisible Hitbox - Makes clicking much easier on mobile */}
                                <circle cx={pos.x} cy={pos.y} r="10" fill="transparent" />

                                {/* Glow for visited */}

                                {isVisited && (
                                    <circle cx={pos.x} cy={pos.y} r="8" fill="rgba(0,209,255,0.15)" />
                                )}

                                {/* Node Plate (Deep Blue & Salmon) */}
                                <circle
                                    cx={pos.x} cy={pos.y} r="6.8"
                                    fill="#0a0a1a"
                                    stroke={isVisited ? '#FF8A5B' : 'rgba(255,255,255,0.15)'}
                                    strokeWidth={isVisited ? 2.5 : 0.7}
                                    filter={isVisited ? 'url(#blue-shadow)' : ''}
                                />

                                {/* Restaurant Logo with Mystery Filter */}
                                <image
                                    href={locale.image_url || '/logo-fest.png'}
                                    x={pos.x - 5.4} y={pos.y - 5.4}
                                    width="10.8" height="10.8"
                                    clipPath={`url(#clipN-${i})`}
                                    style={{ 
                                        opacity: isVisited ? 1 : 0.4, 
                                        filter: isVisited ? '' : 'url(#mystery-blur)' 
                                    }}
                                />

                                {/* Checkmark/Wasabi Status (bottom-right) */}
                                <circle cx={pos.x + 5.2} cy={pos.y + 4.8} r="2.8" 
                                    fill={isVisited ? '#4BCF2D' : '#1f2937'} 
                                    stroke="#001B4D" strokeWidth="0.5"
                                />
                                {isVisited && (
                                    <text x={pos.x + 5.2} y={pos.y + 6.1} textAnchor="middle" fontSize="3.5" fill="#00350a">✓</text>
                                )}

                                {/* Mystery Name Label */}
                                <text
                                    x={pos.x} y={pos.y + 11.5}
                                    textAnchor="middle" fontSize="2.8"
                                    fill={isVisited ? '#FF8A5B' : 'rgba(255,255,255,0.2)'}
                                    fontFamily="Arial, sans-serif" fontWeight="900"
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                                >
                                    {isVisited ? label : '???'}
                                </text>
                            </g>
                        )


                    })}
                </svg>
            </div>
        </div>
    )
}
