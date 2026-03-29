'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Static Journey Coordinates (30 nodes, 1 per row for a long scroll) ────────
const ROW_YS  = Array.from({ length: 30 }, (_, i) => 25 + i * 20)
const NODE_POS: { x: number; y: number }[] = []

for (let row = 0; row < 30; row++) {
    // Zigzag single node: Left → Center → Right → Center → Left...
    const cycle = row % 4
    let x = 50
    if (cycle === 1) x = 75
    else if (cycle === 3) x = 25
    NODE_POS.push({ x, y: ROW_YS[row] })
}

// Decorative nautical/map emojis
const DECOS = [
    { emoji: '⛵', x: 25, y: 100 },
    { emoji: '🗺️', x: 75, y: 200 },
    { emoji: '⚓', x: 15, y: 300 },
    { emoji: '🐉', x: 80, y: 400 },
    { emoji: '🏝️', x: 50, y: 500 },
    { emoji: '🌴', x: 20, y: 580 },
]

// ── Helper to generate a single-line path ─────────────────────────────────
function getDynamicPath(numNodes: number): string {
    if (numNodes <= 0) return ""
    let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`
    for (let i = 1; i < numNodes; i++) {
        const prev = NODE_POS[i-1]
        const curr = NODE_POS[i]
        const cpY = (prev.y + curr.y) / 2
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
            
            <div className="w-full max-w-lg mx-auto mb-12 relative">
                {/* Scrollable Container with Sticky Map */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#050510]/80 shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                    
                    {/* Sticky Panama Image (V2) - Stays in view while nodes move */}
                    <div className="sticky top-0 left-0 w-full h-[70vh] z-0 pointer-events-none flex items-center justify-center p-8">
                        <Image
                            src="/panama-map-bg-v2.png"
                            alt="Mapa de Panamá"
                            fill
                            className="object-contain opacity-80 brightness-90 transition-opacity"
                            priority
                        />
                        {/* Lighter gradient to ensure visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/60 via-transparent to-[#050510]/60 opacity-40" />
                    </div>

                    {/* SVG canvas — Very tall for 30 nodes single column */}
                    <div className="relative z-10 w-full -mt-[70vh]" style={{ paddingBottom: '620%' }}>
                        <svg
                            viewBox={`0 0 100 620`}
                            className="absolute inset-0 w-full h-full"
                            preserveAspectRatio="xMidYMid slice"
                        >
                            <defs>
                                {/* Clip paths for circular logos */}
                                {nodes.map((locale, i) => (
                                    <clipPath key={`clip-${locale.id}`} id={`clipN-${i}`}>
                                        <circle cx={NODE_POS[i].x} cy={NODE_POS[i].y} r="4.2" />
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

                            {/* ── SINGLE SNAKE PATH ── */}
                            <path 
                                d={dynamicPath} 
                                fill="none" 
                                stroke="url(#neonBlueGrad)" 
                                strokeWidth="0.8" 
                                strokeLinecap="round" 
                                strokeDasharray="4 6"
                                opacity="0.6"
                                filter="url(#neon-glow)" 
                                className="constellation-path"
                            />

                            {/* ── DECORATIVE EMOJIS ── */}
                            {DECOS.map((d, i) => (
                                <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="5" opacity="0.3">
                                    {d.emoji}
                                </text>
                            ))}

                            {/* ── NODES ── */}
                            {nodes.map((locale, i) => {
                                const pos    = NODE_POS[i]
                                const isVisited = visitedIds.includes(locale.id)
                                const label     = locale.name.length > 12 ? locale.name.slice(0, 12) + '…' : locale.name

                                return (
                                    <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer', outline: 'none' }} className="touch-manipulation">
                                        {/* Invisible Hitbox */}
                                        <circle cx={pos.x} cy={pos.y} r="7" fill="transparent" />

                                        {/* Subtle Aura */}
                                        <circle 
                                            cx={pos.x} cy={pos.y} r="6" 
                                            fill="rgba(0,178,255,0.05)" 
                                            stroke={isVisited ? "rgba(255,122,0,0.3)" : "rgba(255,255,255,0.05)"}
                                            strokeWidth="0.3"
                                        />

                                        {/* Node Plate */}
                                        <circle
                                            cx={pos.x} cy={pos.y} r="4.8"
                                            fill="#000"
                                            stroke={isVisited ? '#FF7A00' : 'rgba(255,255,255,0.1)'}
                                            strokeWidth={isVisited ? 1.2 : 0.4}
                                        />

                                        {/* Logo with Mystery Filter */}
                                        <image
                                            href={locale.image_url || '/logo-fest.png'}
                                            x={pos.x - 3.8} y={pos.y - 3.8}
                                            width="7.6" height="7.6"
                                            clipPath={`url(#clipN-${i})`}
                                            style={{ 
                                                opacity: isVisited ? 1 : 0.25, 
                                                filter: isVisited ? '' : 'url(#mystery-blur)' 
                                            }}
                                        />

                                        {/* Checkmark */}
                                        {isVisited && (
                                            <g>
                                                <circle cx={pos.x + 3.5} cy={pos.y + 3.5} r="1.8" fill="#4BCF2D" stroke="#000" strokeWidth="0.3" />
                                                <text x={pos.x + 3.5} y={pos.y + 4.3} textAnchor="middle" fontSize="2.2" fill="#000" fontWeight="900">✓</text>
                                            </g>
                                        )}

                                        {/* Mystery Name Label - Below Node */}
                                        <text
                                            x={pos.x} y={pos.y + 10}
                                            textAnchor="middle" fontSize="3"
                                            fill={isVisited ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                                            fontFamily="Lilita One, sans-serif"
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
            </div>
        </div>
    )
}
