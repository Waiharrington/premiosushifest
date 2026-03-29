'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Maximum Spacing Coordinates (30 rows, 1 node per row, extreme zigzag) ────────
const NODE_POS: { x: number; y: number }[] = []
const ROW_SPACING = 12
const START_Y = 15

for (let i = 0; i < 30; i++) {
    const y = START_Y + i * ROW_SPACING
    // Extreme zigzag: Left (25%) <-> Right (75%)
    const x = i % 2 === 0 ? 25 : 75
    NODE_POS.push({ x, y })
}

// ── Helper to generate a flowing neon path ──────────────────────────────
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
                @keyframes pulse-neon {
                    0%, 100% { filter: drop-shadow(0 0 2px #00D1FF) brightness(1); }
                    50% { filter: drop-shadow(0 0 8px #00D1FF) brightness(1.2); }
                }
                @keyframes flow-path {
                    to { stroke-dashoffset: -100; }
                }
                .node-pulse { animation: pulse-neon 3s ease-in-out infinite; }
                .flowing-path { 
                    stroke-dasharray: 200; 
                    animation: flow-path 12s linear infinite; 
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-3xl overflow-hidden border border-white/10 bg-[#010a1a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                
                {/* Background Map (Original High Visibility V3) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá"
                        fill
                        className="object-cover opacity-100 brightness-110 contrast-100"
                        priority
                    />
                    {/* Minimalist overlay only to ensure text legibility */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                </div>

                {/* SVG canvas — 30 rows tall for maximum breathing room */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '380%' }}>
                    <svg
                        viewBox={`0 0 100 380`}
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id="neonPathGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.7" />
                                <stop offset="50%" stopColor="#0066FF" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#00D1FF" stopOpacity="0.7" />
                            </linearGradient>

                            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── FLOWING ENERGY PATH ── */}
                        <path 
                            d={dynamicPath} 
                            fill="none" 
                            stroke="url(#neonPathGrad)" 
                            strokeWidth="0.8" 
                            strokeLinecap="round" 
                            opacity="0.5"
                            className="flowing-path"
                            filter="url(#neon-glow)"
                        />

                        {/* ── NEON LIGHT NODES ── */}
                        {nodes.map((locale, i) => {
                            const pos    = NODE_POS[i]
                            const isVisited = visitedIds.includes(locale.id)
                            const label     = locale.name.length > 15 ? locale.name.slice(0, 15) + '…' : locale.name

                            return (
                                <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer', outline: 'none' }} className="touch-manipulation group">
                                    {/* Interaction Hitbox */}
                                    <circle cx={pos.x} cy={pos.y} r="10" fill="transparent" />

                                    {/* Pulse Aura */}
                                    <circle 
                                        cx={pos.x} cy={pos.y} r="6" 
                                        fill={isVisited ? "rgba(255,122,0,0.1)" : "rgba(0,209,255,0.05)"}
                                        className={isVisited ? "" : "node-pulse"}
                                    />

                                    {/* Core Circle */}
                                    <circle
                                        cx={pos.x} cy={pos.y} r="5"
                                        fill="#000"
                                        stroke={isVisited ? '#FF7A00' : '#00D1FF'}
                                        strokeWidth={isVisited ? 1.5 : 0.6}
                                        opacity={isVisited ? 1 : 0.8}
                                    />

                                    {/* Logo Container */}
                                    <clipPath id={`clip-${i}`}>
                                        <circle cx={pos.x} cy={pos.y} r="4.2" />
                                    </clipPath>
                                    <image
                                        href={locale.image_url || '/logo-fest.png'}
                                        x={pos.x - 4.2} y={pos.y - 4.2}
                                        width="8.4" height="8.4"
                                        clipPath={`url(#clip-${i})`}
                                        style={{ 
                                            opacity: isVisited ? 1 : 0.2, 
                                            filter: isVisited ? '' : 'grayscale(100%)' 
                                        }}
                                    />

                                    {/* Success Badge */}
                                    {isVisited && (
                                        <g>
                                            <circle cx={pos.x + 3.5} cy={pos.y + 3.5} r="2.2" fill="#4BCF2D" stroke="#000" strokeWidth="0.3" />
                                            <text x={pos.x + 3.5} y={pos.y + 4.3} textAnchor="middle" fontSize="2.8" fill="#000" fontWeight="900">✓</text>
                                        </g>
                                    )}

                                    {/* Clean Label (No overlap possible in 1-node row) */}
                                    <text
                                        x={pos.x} y={pos.y + 12}
                                        textAnchor="middle" fontSize="3.5"
                                        fill={isVisited ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                                        className="font-lilita"
                                        style={{ 
                                            textShadow: '0 2px 8px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1)' 
                                        }}
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
