'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Manual Nautical Coordinates (30 nodes following landmass accurately) ────────
const NODE_POS = [
    { x: 18, y: 40 }, { x: 22, y: 38 }, { x: 25, y: 45 }, { x: 22, y: 52 }, { x: 18, y: 56 }, // Western Arc (Bocas/Chiriquí)
    { x: 25, y: 65 }, { x: 32, y: 70 }, { x: 38, y: 75 }, { x: 44, y: 82 }, { x: 35, y: 88 }, // Central-West (Veraguas)
    { x: 42, y: 95 }, { x: 50, y: 102 }, { x: 58, y: 105 }, { x: 62, y: 98 }, { x: 55, y: 92 }, // Central (Coclé/Azuero)
    { x: 65, y: 115 }, { x: 72, y: 120 }, { x: 78, y: 110 }, { x: 85, y: 105 }, { x: 80, y: 95 }, // Central-East (Pma City/Colón)
    { x: 72, y: 90 }, { x: 78, y: 85 }, { x: 85, y: 80 }, { x: 92, y: 75 }, { x: 88, y: 65 }, // Darien Arc
    { x: 82, y: 58 }, { x: 88, y: 52 }, { x: 94, y: 45 }, { x: 90, y: 38 }, { x: 85, y: 32 }, // Eastern End
]

// Decorative nautical/map labels (matching the V3 map aesthetic)
const DECOS = [
    { text: 'CARIBE', x: 50, y: 25 },
    { text: 'PACÍFICO', x: 50, y: 165 },
]

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
                    50% { filter: drop-shadow(0 0 10px #00D1FF) brightness(1.5); }
                }
                @keyframes pulse-conquered {
                    0%, 100% { filter: drop-shadow(0 0 5px #FF7A00) brightness(1); }
                    50% { filter: drop-shadow(0 0 15px #FF7A00) brightness(1.3); }
                }
                @keyframes flow-path {
                    to { stroke-dashoffset: -100; }
                }
                .node-pulse { animation: pulse-neon 3s ease-in-out infinite; }
                .conquered-pulse { animation: pulse-conquered 3s ease-in-out infinite; }
                .flowing-path { 
                    stroke-dasharray: 200; 
                    animation: flow-path 10s linear infinite; 
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-3xl overflow-hidden border border-white/5 bg-[#010a1a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                
                {/* Background Map (Darkened for Contrast) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá"
                        fill
                        className="object-cover opacity-80 brightness-50 contrast-125"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#000818] opacity-60" />
                </div>

                {/* SVG canvas — 100x200 fixed aspect */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '200%' }}>
                    <svg
                        viewBox={`0 0 100 200`}
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <clipPath key={`clip-master`} id={`clipMaster`}>
                                <circle r="3.2" />
                            </clipPath>

                            <linearGradient id="neonPathGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#0066FF" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#00D1FF" stopOpacity="0.8" />
                            </linearGradient>

                            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
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
                            opacity="0.6"
                            className="flowing-path"
                            filter="url(#neon-glow)"
                        />

                        {/* ── NAUTICAL LABELS ── */}
                        {DECOS.map((d, i) => (
                            <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="5" className="font-lilita fill-white/10 tracking-[0.5em]">
                                {d.text}
                            </text>
                        ))}

                        {/* ── NEON LIGHT NODES ── */}
                        {nodes.map((locale, i) => {
                            const pos    = NODE_POS[i] || { x: 50, y: 50 }
                            const isVisited = visitedIds.includes(locale.id)
                            const label     = locale.name.length > 12 ? locale.name.slice(0, 12) + '…' : locale.name

                            return (
                                <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer', outline: 'none' }} className="touch-manipulation group">
                                    {/* Interaction Hitbox */}
                                    <circle cx={pos.x} cy={pos.y} r="8" fill="transparent" />

                                    {/* Pulse Aura (Magic) */}
                                    <circle 
                                        cx={pos.x} cy={pos.y} r="5" 
                                        fill={isVisited ? "rgba(255,122,0,0.15)" : "rgba(0,209,255,0.1)"}
                                        className={isVisited ? "conquered-pulse" : "node-pulse"}
                                    />

                                    {/* Core Light Point */}
                                    <circle
                                        cx={pos.x} cy={pos.y} r="4"
                                        fill="#000"
                                        stroke={isVisited ? '#FF7A00' : '#00D1FF'}
                                        strokeWidth={isVisited ? 1.5 : 0.6}
                                        className={isVisited ? "" : "opacity-80"}
                                    />

                                    {/* Restaurant Token (Clipped) */}
                                    <clipPath id={`clip-${i}`}>
                                        <circle cx={pos.x} cy={pos.y} r="3.2" />
                                    </clipPath>
                                    <image
                                        href={locale.image_url || '/logo-fest.png'}
                                        x={pos.x - 3.2} y={pos.y - 3.2}
                                        width="6.4" height="6.4"
                                        clipPath={`url(#clip-${i})`}
                                        style={{ 
                                            opacity: isVisited ? 1 : 0.25, 
                                            filter: isVisited ? '' : 'grayscale(100%) blur(1px)' 
                                        }}
                                        className="transition-all duration-500"
                                    />

                                    {/* Success Badge */}
                                    {isVisited && (
                                        <g>
                                            <circle cx={pos.x + 3.2} cy={pos.y + 3.2} r="1.8" fill="#4BCF2D" stroke="#000" strokeWidth="0.3" />
                                            <text x={pos.x + 3.2} y={pos.y + 3.9} textAnchor="middle" fontSize="2" fill="#000" fontWeight="900">✓</text>
                                        </g>
                                    )}

                                    {/* Mystery Label with Glow */}
                                    <text
                                        x={pos.x} y={pos.y + 10}
                                        textAnchor="middle" fontSize="3"
                                        fill={isVisited ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                                        className="font-lilita"
                                        style={{ 
                                            textShadow: isVisited 
                                                ? '0 0 10px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8)' 
                                                : '0 2px 4px rgba(0,0,0,0.9)' 
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
