'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Saga Explorer Coordinates (30 nodes, High Contrast 3-2-3-2 Layout) ────────
const NODE_POS: { x: number; y: number }[] = []
const PATTERN = [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2] // To complete 30
const ROW_SPACING = 15
const START_Y = 20

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
            if (c === 0) x = 35
            else x = 65
        }
        NODE_POS.push({ x, y })
        nodeIdx++
    }
}

// ── Path Helper ──────────────────────────────────────────────────────────
function getDynamicPath(nodesIndices: number[]): string {
    if (nodesIndices.length <= 0) return ""
    let d = `M ${NODE_POS[nodesIndices[0]].x} ${NODE_POS[nodesIndices[0]].y}`
    for (let i = 1; i < nodesIndices.length; i++) {
        const prev = NODE_POS[nodesIndices[i-1]]
        const curr = NODE_POS[nodesIndices[i]]
        const cpY = (prev.y + curr.y) / 2
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`
    }
    return d
}


export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)
    
    // Dynamic Reveal: Show visited + 3 next discovered
    const numToReveal = Math.min(visitedIds.length + 3, 30)
    const visibleNodes = nodes.slice(0, numToReveal)
    
    // Path: Only connect visited nodes
    const visitedIndices = nodes.map((n, i) => visitedIds.includes(n.id) ? i : -1).filter(i => i !== -1)
    const activePath = getDynamicPath(visitedIndices)
    
    // Guide: Position near the first non-visited node
    const nextIdx = nodes.findIndex(n => !visitedIds.includes(n.id))
    const guidePos = nextIdx !== -1 ? NODE_POS[nextIdx] : NODE_POS[visitedIndices[visitedIndices.length-1]]

    return (
        <div className="relative w-full">
            <style jsx>{`
                @keyframes pulse-next {
                    0%, 100% { filter: drop-shadow(0 0 5px #00D1FF) brightness(1); r: 3.5; }
                    50% { filter: drop-shadow(0 0 15px #00D1FF) brightness(1.5); r: 4.5; }
                }
                @keyframes flow-active {
                    to { stroke-dashoffset: -40; }
                }
                @keyframes float-guide {
                    0%, 100% { transform: translateY(0) rotate(-12deg); }
                    50% { transform: translateY(-5px) rotate(-15deg); }
                }
                .next-reveal { animation: pulse-next 2s ease-in-out infinite; }
                .active-route { 
                    stroke-dasharray: 4 6; 
                    animation: flow-active 3s linear infinite; 
                }
                .sushi-guide { animation: float-guide 3s ease-in-out infinite; }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-3xl overflow-hidden border border-white/10 bg-[#010a1a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                
                {/* Fixed Aspect Background (Size of Photo) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá"
                        fill
                        className="object-cover opacity-100 brightness-110"
                        priority
                    />
                    {/* Fog of War (Darkens unexplored area) */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-1000"
                        style={{ 
                            maskImage: `radial-gradient(circle at ${guidePos?.x || 50}% ${((guidePos?.y || 0) / 1.777)}%, transparent 20%, black 80%)`,
                            WebkitMaskImage: `radial-gradient(circle at ${guidePos?.x || 50}% ${((guidePos?.y || 0) / 1.777)}%, transparent 20%, black 80%)`
                        }}
                    />
                </div>

                {/* SVG canvas — 9:16 Aspect (177.7% height) */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '177.7%' }}>
                    <svg
                        viewBox={`0 0 100 177.7`}
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id="activeEnergy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00D1FF" />
                                <stop offset="100%" stopColor="#0066FF" />
                            </linearGradient>

                            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="0.8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── ACTIVE CONQUERED PATH ── */}
                        <path 
                            d={activePath} 
                            fill="none" 
                            stroke="url(#activeEnergy)" 
                            strokeWidth="0.8" 
                            strokeLinecap="round" 
                            opacity="0.8"
                            className="active-route"
                            filter="url(#neon-glow)"
                        />

                        {/* ── NODES RENDERING ── */}
                        {visibleNodes.map((locale, i) => {
                            const pos    = NODE_POS[i]
                            const isVisited = visitedIds.includes(locale.id)
                            const isNext    = !isVisited && i === nextIdx
                            const label     = locale.name.length > 10 ? locale.name.slice(0, 10) + '…' : locale.name

                            return (
                                <g key={locale.id} onClick={() => onLocaleClick(locale)} style={{ cursor: 'pointer', outline: 'none' }} className="touch-manipulation group">
                                    <circle cx={pos.x} cy={pos.y} r="6" fill="transparent" />

                                    {/* Aura */}
                                    <circle 
                                        cx={pos.x} cy={pos.y} r={isNext ? 4.5 : 3.5} 
                                        fill={isVisited ? "rgba(255,122,0,0.15)" : "rgba(0,209,255,0.05)"}
                                        className={isNext ? "next-reveal" : ""}
                                        stroke={isVisited ? "#FF7A00" : (isNext ? "#00D1FF" : "rgba(255,255,255,0.1)")}
                                        strokeWidth={isVisited ? 1.2 : 0.4}
                                    />

                                    {/* Token Logo */}
                                    <clipPath id={`clip-${i}`}>
                                        <circle cx={pos.x} cy={pos.y} r="3" />
                                    </clipPath>
                                    <image
                                        href={locale.image_url || '/logo-fest.png'}
                                        x={pos.x - 3} y={pos.y - 3}
                                        width="6" height="6"
                                        clipPath={`url(#clip-${i})`}
                                        style={{ 
                                            opacity: isVisited ? 1 : (isNext ? 0.6 : 0.15), 
                                            filter: isVisited ? '' : 'grayscale(100%)' 
                                        }}
                                    />

                                    {/* Success Mark */}
                                    {isVisited && (
                                        <g>
                                            <circle cx={pos.x + 2.5} cy={pos.y + 2.5} r="1.5" fill="#4BCF2D" stroke="#000" strokeWidth="0.2" />
                                            <text x={pos.x + 2.5} y={pos.y + 3.1} textAnchor="middle" fontSize="1.8" fill="#000" fontWeight="900">✓</text>
                                        </g>
                                    )}

                                    {/* Label (Floating Clean) */}
                                    <text
                                        x={pos.x} y={pos.y + 8}
                                        textAnchor="middle" fontSize="2.8"
                                        fill={isVisited ? '#FFFFFF' : (isNext ? '#00D1FF' : 'rgba(255,255,255,0.3)')}
                                        className="font-lilita"
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}
                                    >
                                        {isVisited || isNext ? label : '???'}
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
