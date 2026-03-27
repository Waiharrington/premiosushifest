'use client'

import { motion } from "framer-motion"
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

    // Find index of the first unvisited node = "next mission"
    const nextIndex = nodes.findIndex(l => !visitedIds.includes(l.id))

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

                        {/* Gold gradient for tiles */}
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>

                        {/* Pulsing glow filter for next node */}
                        <filter id="pulse-glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Subtle drop shadow for road */}
                        <filter id="road-shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.5" />
                        </filter>
                    </defs>

                    {/* ── ROAD LAYERS ── */}
                    {/* Outer shadow/border */}
                    <path d={PATH} fill="none" stroke="#1a0a00" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" filter="url(#road-shadow)" />
                    {/* Dark base road surface */}
                    <path d={PATH} fill="none" stroke="#1c1c2e" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Gold tile dashes — alternates with dark to create premium tile effect */}
                    <path d={PATH} fill="none" stroke="url(#goldGrad)" strokeWidth="11" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="4.5 4.5" />
                    {/* Thin white center line */}
                    <path d={PATH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3.5" />

                    {/* ── DECORATIVE SUSHI EMOJIS ── */}
                    {DECOS.map((d, i) => (
                        <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="5.5" opacity="0.35">
                            {d.emoji}
                        </text>
                    ))}

                    {/* ── START BADGE ── */}
                    <circle cx="82" cy="14" r="7" fill="#fbbf24" stroke="white" strokeWidth="1" filter="url(#road-shadow)" />
                    <text x="82" y="15" textAnchor="middle" fontSize="2.8" fill="#1a1a1a" fontWeight="bold" fontFamily="Arial, sans-serif">START</text>
                    <text x="82" y="6" textAnchor="middle" fontSize="4.5">🏁</text>

                    {/* ── FINISH / META BADGE ── */}
                    <circle cx="82" cy="179" r="7" fill="#16a34a" stroke="white" strokeWidth="1" filter="url(#road-shadow)" />
                    <text x="82" y="180" textAnchor="middle" fontSize="2.8" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">META</text>
                    <text x="82" y="191" textAnchor="middle" fontSize="4.5">🏆</text>

                    {/* ── NODES ── */}
                    {nodes.map((locale, i) => {
                        const pos    = NODE_POS[i]
                        const isVisited = visitedIds.includes(locale.id)
                        const isNext    = i === nextIndex
                        const label     = locale.name.length > 10 ? locale.name.slice(0, 10) + '…' : locale.name

                        return (
                            <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer' }}>

                                {/* Pulsing ring for "next mission" node */}
                                {isNext && (
                                    <motion.circle
                                        cx={pos.x} cy={pos.y} r="9"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="1.5"
                                        animate={{ r: [9, 11, 9], opacity: [0.9, 0.3, 0.9] }}
                                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                )}

                                {/* Gold outer glow for visited */}
                                {isVisited && (
                                    <circle cx={pos.x} cy={pos.y} r="8" fill="rgba(251,191,36,0.2)" />
                                )}

                                {/* Node plate */}
                                <circle
                                    cx={pos.x} cy={pos.y} r="6.5"
                                    fill={isVisited ? '#0d1b3e' : '#12121f'}
                                    stroke={isVisited ? '#fbbf24' : isNext ? '#22c55e' : 'rgba(255,255,255,0.15)'}
                                    strokeWidth={isVisited || isNext ? 1.5 : 0.7}
                                />

                                {/* Restaurant logo */}
                                <image
                                    href={locale.image_url || '/logo-fest.png'}
                                    x={pos.x - 5.2} y={pos.y - 5.2}
                                    width="10.4" height="10.4"
                                    clipPath={`url(#clipN-${i})`}
                                    style={{ opacity: isVisited ? 1 : isNext ? 0.75 : 0.3 }}
                                />

                                {/* Status icon (bottom-right corner) */}
                                {isVisited ? (
                                    <circle cx={pos.x + 5} cy={pos.y + 4.5} r="2.5" fill="#16a34a" />
                                ) : isNext ? (
                                    <circle cx={pos.x + 5} cy={pos.y + 4.5} r="2.5" fill="#22c55e" />
                                ) : (
                                    <circle cx={pos.x + 5} cy={pos.y + 4.5} r="2.5" fill="#374151" />
                                )}

                                {/* Number badge (top-right) */}
                                <circle cx={pos.x + 5.5} cy={pos.y - 5} r="2.8"
                                    fill={isVisited ? '#fbbf24' : '#374151'}
                                    stroke={isVisited ? '#1a1a1a' : 'none'}
                                    strokeWidth="0.5"
                                />
                                <text x={pos.x + 5.5} y={pos.y - 3.8}
                                    textAnchor="middle" fontSize="2.7"
                                    fill={isVisited ? '#1a1a1a' : 'white'}
                                    fontWeight="bold" fontFamily="Arial, sans-serif"
                                >
                                    {i + 1}
                                </text>

                                {/* Name label */}
                                <text
                                    x={pos.x} y={pos.y + 10.5}
                                    textAnchor="middle" fontSize="2.5"
                                    fill={isVisited ? 'rgba(255,215,100,0.9)' : isNext ? 'rgba(134,239,172,0.9)' : 'rgba(255,255,255,0.35)'}
                                    fontFamily="Arial, sans-serif" fontWeight="600"
                                >
                                    {label}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>
        </div>
    )
}
