'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Constellation node positions (10 rows × 3 cols = 30 nodes) ────────────────
const ROW_YS  = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150]
const X_RTL   = [80, 50, 20]   // right → left (even rows)
const X_LTR   = [20, 50, 80]   // left  → right (odd rows)

const NODE_POS: { x: number; y: number }[] = []
for (let row = 0; row < 10; row++) {
    const xs = row % 2 === 0 ? X_LTR : X_RTL
    for (let col = 0; col < 3; col++) {
        NODE_POS.push({ x: xs[col], y: ROW_YS[row] })
    }
}

// Decorative nautical/map emojis scattered between path curves
const DECOS = [
    { emoji: '⛵', x: 50, y: 35 },
    { emoji: '🗺️', x: 12, y: 65 },
    { emoji: '⚓', x: 88, y: 95 },
    { emoji: '🐉', x: 10, y: 125 },
    { emoji: '✨', x: 88, y: 155 },
    { emoji: '🏝️', x: 50, y: 170 },
]

// ── Helper to generate the path dynamically based on node count ───────────
function getDynamicPath(numNodes: number): string {
    if (numNodes <= 0) return ""
    
    let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`
    const numRows = Math.ceil(numNodes / 3)
    
    for (let r = 0; r < numRows; r++) {
        const isLastRow = r === numRows - 1
        const nodesInThisRow = isLastRow ? (numNodes % 3 || 3) : 3
        
        // Draw horizontal line for the row
        const targetX = NODE_POS[r * 3 + nodesInThisRow - 1].x
        const targetY = NODE_POS[r * 3 + nodesInThisRow - 1].y
        d += ` L ${targetX} ${targetY}`
        
        // Draw curve to next row if exists
        if (!isLastRow) {
            const nextRowStart = NODE_POS[(r + 1) * 3]
            const isCurveRight = r % 2 === 0
            const curveX = isCurveRight ? 95 : 5
            d += ` C ${curveX} ${targetY}, ${curveX} ${nextRowStart.y}, ${nextRowStart.x} ${nextRowStart.y}`
        }
    }
    return d
}


export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)
    const dynamicPath = getDynamicPath(nodes.length)

    return (
        <div className="relative w-full overflow-hidden">
            <style jsx>{`
                @keyframes dash-flow {
                    to { stroke-dashoffset: -20; }
                }
                .constellation-path {
                    animation: dash-flow 2s linear infinite;
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative group antialiased">
                {/* Map Frame/Glow */}
                <div className="absolute -inset-2 bg-[#00D1FF]/10 rounded-xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative w-full rounded-lg overflow-hidden border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                    {/* Background Panama Image - Original Aspect 9:16 */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/panama-map-bg.png"
                            alt="Mapa de Panamá"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* SVG canvas — Fixed 100% Width, Aspect Ratio 9:16 (Height 177.7 for Width 100) */}
                    <div className="relative z-10 w-full" style={{ paddingBottom: '177.7%' }}>
                        <svg
                            viewBox={`0 0 100 177.7`}
                            className="absolute inset-0 w-full h-full"
                            preserveAspectRatio="xMidYMid slice"
                        >
                    <defs>
                        {/* Clip paths for circular logos */}
                        {nodes.map((locale, i) => (
                            <clipPath key={`clip-${locale.id}`} id={`clipN-${i}`}>
                                <circle cx={NODE_POS[i].x} cy={NODE_POS[i].y} r="5.2" />
                            </clipPath>
                        ))}

                        {/* Neon Blue Gradient for the constellation */}
                        <linearGradient id="neonBlueGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00D1FF" />
                            <stop offset="50%" stopColor="#0066FF" />
                            <stop offset="100%" stopColor="#00D1FF" />
                        </linearGradient>

                        {/* Blur + Grayscale filter for mystery nodes */}
                        <filter id="mystery-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feColorMatrix type="saturate" values="0" />
                            <feGaussianBlur stdDeviation="2.5" />
                        </filter>

                        {/* Intense Neon Glow for path edges */}
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="0.8" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* ── CONSTELLATION PATH LAYERS ── */}
                    {/* Glow Layer */}
                    <path 
                        d={dynamicPath} 
                        fill="none" 
                        stroke="#00D1FF" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeDasharray="0.5 4"
                        opacity="0.8" 
                        filter="url(#neon-glow)" 
                        className="constellation-path"
                    />
                    
                    {/* Core Path (Dashed) */}
                    <path 
                        d={dynamicPath} 
                        fill="none" 
                        stroke="url(#neonBlueGrad)" 
                        strokeWidth="1" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeDasharray="4 6"
                        className="constellation-path"
                    />

                    {/* ── DECORATIVE MAP ELEMENTS ── */}
                    {DECOS.map((d, i) => (
                        <text key={i} x={d.x} y={d.y} textAnchor="middle" fontSize="4.5" opacity="0.2">
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
                                <circle cx={pos.x} cy={pos.y} r="8" fill="transparent" />

                                {/* Subtle Aura for nodes */}
                                <circle 
                                    cx={pos.x} cy={pos.y} r="7" 
                                    fill="rgba(0,209,255,0.05)" 
                                    stroke={isVisited ? "rgba(255,75,31,0.3)" : "rgba(255,255,255,0.05)"}
                                    strokeWidth="0.5"
                                />

                                {/* Node Plate */}
                                <circle
                                    cx={pos.x} cy={pos.y} r="5.8"
                                    fill="#0a0a1a"
                                    stroke={isVisited ? '#FF4B1F' : 'rgba(255,255,255,0.1)'}
                                    strokeWidth={isVisited ? 1.5 : 0.5}
                                />

                                {/* Restaurant Logo with Mystery Filter */}
                                <image
                                    href={locale.image_url || '/logo-fest.png'}
                                    x={pos.x - 4.5} y={pos.y - 4.5}
                                    width="9" height="9"
                                    clipPath={`url(#clipN-${i})`}
                                    style={{ 
                                        opacity: isVisited ? 1 : 0.3, 
                                        filter: isVisited ? '' : 'url(#mystery-blur)' 
                                    }}
                                />

                                {/* Checkmark (bottom-right) */}
                                {isVisited && (
                                    <g>
                                        <circle cx={pos.x + 4.5} cy={pos.y + 4.2} r="2.2" fill="#4BCF2D" stroke="#001B4D" strokeWidth="0.4" />
                                        <text x={pos.x + 4.5} y={pos.y + 5.2} textAnchor="middle" fontSize="2.8" fill="#00350a" fontWeight="900">✓</text>
                                    </g>
                                )}

                                {/* Mystery Name Label */}
                                <text
                                    x={pos.x} y={pos.y + 11.5}
                                    textAnchor="middle" fontSize="2.6"
                                    fill={isVisited ? '#FFFFFF' : 'rgba(255,255,255,0.2)'}
                                    fontFamily="Arial, sans-serif" fontWeight="900"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,1)' }}
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
