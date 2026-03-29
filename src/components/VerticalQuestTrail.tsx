'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Organic Constellation Coordinates (30 nodes, 3-2-3-2 alternating) ────────
const NODE_POS: { x: number; y: number }[] = []
const ROW_SPACING = 15
const START_Y = 20

// 12 rows total to reach 30 nodes: 
// 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 = 28 -> adding one more row of 2 = 30
const PATTERN = [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2] 

let nodeIdx = 0
for (let r = 0; r < PATTERN.length; r++) {
    const numInRow = PATTERN[r]
    const y = START_Y + r * ROW_SPACING
    
    for (let c = 0; c < numInRow; c++) {
        if (nodeIdx >= 30) break
        
        let x = 50
        if (numInRow === 3) {
            if (c === 0) x = 20
            else if (c === 1) x = 50
            else x = 80
        } else {
            // Row of 2: Staggered
            if (c === 0) x = 35
            else x = 65
        }
        
        NODE_POS.push({ x, y })
        nodeIdx++
    }
}

// Decorative nautical/map emojis
const DECOS = [
    { emoji: '⛵', x: 15, y: 40 },
    { emoji: '🗺️', x: 85, y: 70 },
    { emoji: '⚓', x: 10, y: 110 },
    { emoji: '🐉', x: 90, y: 150 },
    { emoji: '🏝️', x: 50, y: 185 },
]

// ── Helper to generate an organic snake path ──────────────────────────────
function getDynamicPath(numNodes: number): string {
    if (numNodes <= 0) return ""
    let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`
    for (let i = 1; i < numNodes; i++) {
        const prev = NODE_POS[i-1]
        const curr = NODE_POS[i]
        const cpY = (prev.y + curr.y) / 2
        // Use curves for a more "constellation" feel
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`
    }
    return d
}


export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)
    const dynamicPath = getDynamicPath(nodes.length)

    return (
        <div className="relative w-full">
            <style jsx>{`
                @keyframes dash-flow {
                    to { stroke-dashoffset: -20; }
                }
                .constellation-path {
                    animation: dash-flow 2s linear infinite;
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-3xl overflow-hidden border border-white/5 bg-[#010a1a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                
                {/* Background Map (The New Premium Image V3) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá Premium"
                        fill
                        className="object-cover opacity-100 brightness-100"
                        priority
                    />
                    {/* Very light gradient only at the edges */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 opacity-30" />
                </div>

                {/* SVG canvas — Fixed Aspect for better control */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '200%' }}>
                    <svg
                        viewBox={`0 0 100 200`}
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            {/* Clip paths for circular logos */}
                            {nodes.map((locale, i) => (
                                <clipPath key={`clip-${locale.id}`} id={`clipN-${i}`}>
                                    <circle cx={NODE_POS[i].x} cy={NODE_POS[i].y} r="3.2" />
                                </clipPath>
                            ))}

                            {/* Neon Blue Gradient */}
                            <linearGradient id="neonBlueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00D1FF" />
                                <stop offset="100%" stopColor="#0066FF" />
                            </linearGradient>

                            {/* Blur + Grayscale filter for mystery nodes */}
                            <filter id="mystery-blur" x="-50%" y="-50%" width="200%" height="200%">
                                <feColorMatrix type="saturate" values="0" />
                                <feGaussianBlur stdDeviation="3" />
                            </filter>

                            {/* Intense Neon Glow */}
                            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="0.6" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── CONSTELATION PATH ── */}
                        <path 
                            d={dynamicPath} 
                            fill="none" 
                            stroke="url(#neonBlueGrad)" 
                            strokeWidth="0.6" 
                            strokeLinecap="round" 
                            strokeDasharray="3 5"
                            opacity="0.5"
                            filter="url(#neon-glow)" 
                            className="constellation-path"
                        />

                        {/* ── DECORATIVE EMOJIS ── */}
                        {DECOS.map((d, i) => (
                            <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="4.5" opacity="0.25">
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
                                    {/* Invisible Hitbox */}
                                    <circle cx={pos.x} cy={pos.y} r="6" fill="transparent" />

                                    {/* Subtle Aura */}
                                    <circle 
                                        cx={pos.x} cy={pos.y} r="5" 
                                        fill="rgba(0,178,255,0.03)" 
                                        stroke={isVisited ? "rgba(255,75,31,0.2)" : "rgba(255,255,255,0.03)"}
                                        strokeWidth="0.2"
                                    />

                                    {/* Node Plate */}
                                    <circle
                                        cx={pos.x} cy={pos.y} r="4"
                                        fill="#000"
                                        stroke={isVisited ? '#FF7A00' : 'rgba(255,255,255,0.1)'}
                                        strokeWidth={isVisited ? 1 : 0.3}
                                    />

                                    {/* Logo with Mystery Filter */}
                                    <image
                                        href={locale.image_url || '/logo-fest.png'}
                                        x={pos.x - 3.2} y={pos.y - 3.2}
                                        width="6.4" height="6.4"
                                        clipPath={`url(#clipN-${i})`}
                                        style={{ 
                                            opacity: isVisited ? 1 : 0.2, 
                                            filter: isVisited ? '' : 'url(#mystery-blur)' 
                                        }}
                                    />

                                    {/* Checkmark */}
                                    {isVisited && (
                                        <g>
                                            <circle cx={pos.x + 3} cy={pos.y + 3} r="1.5" fill="#4BCF2D" stroke="#000" strokeWidth="0.2" />
                                            <text x={pos.x + 3} y={pos.y + 3.6} textAnchor="middle" fontSize="2" fill="#000" fontWeight="900">✓</text>
                                        </g>
                                    )}

                                    {/* Mystery Name Label - Below Node */}
                                    <text
                                        x={pos.x} y={pos.y + 8}
                                        textAnchor="middle" fontSize="2.4"
                                        fill={isVisited ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                                        fontFamily="Lilita One, sans-serif"
                                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                                    >
                                        {isVisited ? label : '???'}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        </div>
    )
}
