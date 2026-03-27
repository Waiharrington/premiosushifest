'use client'

import { motion } from "framer-motion"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Serpentine node positions ──────────────────────────────────────────────
// 6 rows × 5 columns = 30 nodes in a snake shape
// Even rows go RIGHT→LEFT, odd rows LEFT→RIGHT
const ROW_YS = [12, 45, 78, 111, 144, 177]
const X_RTL = [82, 66, 50, 34, 18]   // right-to-left
const X_LTR = [18, 34, 50, 66, 82]   // left-to-right

const NODE_POSITIONS: { x: number; y: number }[] = []
for (let row = 0; row < 6; row++) {
    const xs = row % 2 === 0 ? X_RTL : X_LTR
    for (let col = 0; col < 5; col++) {
        NODE_POSITIONS.push({ x: xs[col], y: ROW_YS[row] })
    }
}

// ── The single SVG snake path ──────────────────────────────────────────────
const PATH = [
    'M 82 12 L 66 12 L 50 12 L 34 12 L 18 12',
    'C 4 12, 4 45, 18 45',
    'L 34 45 L 50 45 L 66 45 L 82 45',
    'C 96 45, 96 78, 82 78',
    'L 66 78 L 50 78 L 34 78 L 18 78',
    'C 4 78, 4 111, 18 111',
    'L 34 111 L 50 111 L 66 111 L 82 111',
    'C 96 111, 96 144, 82 144',
    'L 66 144 L 50 144 L 34 144 L 18 144',
    'C 4 144, 4 177, 18 177',
    'L 34 177 L 50 177 L 66 177 L 82 177',
].join(' ')

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)

    return (
        <div className="relative w-full">
            {/* No background here — the page background shows through */}

            {/* SVG viewport — aspect ratio 100:192 keeps proportional on any phone */}
            <div className="relative w-full" style={{ paddingBottom: '192%' }}>
                <svg
                    viewBox="0 0 100 192"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* ── Clip paths for circular logos ── */}
                    <defs>
                        {nodes.map((locale, i) => (
                            <clipPath key={`clip-${locale.id}`} id={`clip-${i}`}>
                                <circle cx={NODE_POSITIONS[i].x} cy={NODE_POSITIONS[i].y} r="5.2" />
                            </clipPath>
                        ))}
                    </defs>

                    {/* ── ROAD ── */}
                    {/* Shadow / border */}
                    <path d={PATH} fill="none" stroke="#061236" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Blue base road */}
                    <path d={PATH} fill="none" stroke="#1e40af" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Orange tile dashes — alternates with blue to create tile effect */}
                    <path d={PATH} fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="5 5" />
                    {/* Thin white center dashes */}
                    <path d={PATH} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 4" />

                    {/* ── START badge ── */}
                    <circle cx="82" cy="12" r="6" fill="#fbbf24" stroke="white" strokeWidth="0.8" />
                    <text x="82" y="14" textAnchor="middle" fontSize="3" fill="#1e1e1e" fontWeight="bold" fontFamily="Arial, sans-serif">START</text>

                    {/* ── FINISH badge ── */}
                    <circle cx="82" cy="177" r="6" fill="#22c55e" stroke="white" strokeWidth="0.8" />
                    <text x="82" y="179" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">META</text>

                    {/* ── NODES ── */}
                    {nodes.map((locale, i) => {
                        const pos = NODE_POSITIONS[i]
                        const isVisited = visitedIds.includes(locale.id)
                        const label = locale.name.length > 9 ? locale.name.slice(0, 9) + '…' : locale.name

                        return (
                            <motion.g
                                key={locale.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                                onClick={() => onLocaleClick(locale)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Outer glow for visited */}
                                {isVisited && (
                                    <circle cx={pos.x} cy={pos.y} r="8" fill="rgba(251,191,36,0.25)" />
                                )}

                                {/* White plate (background circle) */}
                                <circle
                                    cx={pos.x} cy={pos.y} r="6.5"
                                    fill="#0d1b3e"
                                    stroke={isVisited ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                                    strokeWidth={isVisited ? 1.5 : 0.8}
                                />

                                {/* Restaurant logo */}
                                <image
                                    href={locale.image_url || '/logo-fest.png'}
                                    x={pos.x - 5.2} y={pos.y - 5.2}
                                    width="10.4" height="10.4"
                                    clipPath={`url(#clip-${i})`}
                                    style={{ opacity: isVisited ? 1 : 0.35 }}
                                />

                                {/* Number badge (top-right corner) */}
                                <circle cx={pos.x + 5.5} cy={pos.y - 5.5} r="2.8" fill={isVisited ? '#16a34a' : '#374151'} />
                                <text x={pos.x + 5.5} y={pos.y - 4.2} textAnchor="middle" fontSize="2.8" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">
                                    {i + 1}
                                </text>

                                {/* Name label */}
                                <text
                                    x={pos.x} y={pos.y + 10.5}
                                    textAnchor="middle" fontSize="2.6"
                                    fill={isVisited ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)'}
                                    fontFamily="Arial, sans-serif" fontWeight="600"
                                >
                                    {label}
                                </text>
                            </motion.g>
                        )
                    })}

                    {/* Trophy at end */}
                    <text x="68" y="180" fontSize="6" textAnchor="middle">🏆</text>
                </svg>
            </div>
        </div>
    )
}
