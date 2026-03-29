'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Fixed Geographic Positions (30 locales across Panama landmass) ────────
const NODE_POS: { x: number; y: number }[] = [
    { x: 18, y: 35 }, { x: 22, y: 32 }, { x: 25, y: 40 }, { x: 22, y: 48 }, { x: 18, y: 52 }, // West
    { x: 25, y: 60 }, { x: 32, y: 65 }, { x: 38, y: 70 }, { x: 44, y: 78 }, { x: 35, y: 84 }, // Mid-West
    { x: 42, y: 92 }, { x: 50, y: 100 }, { x: 58, y: 102 }, { x: 62, y: 95 }, { x: 55, y: 88 }, // Central
    { x: 65, y: 110 }, { x: 72, y: 115 }, { x: 78, y: 105 }, { x: 85, y: 100 }, { x: 80, y: 90 }, // Mid-East
    { x: 72, y: 85 }, { x: 78, y: 80 }, { x: 85, y: 75 }, { x: 92, y: 70 }, { x: 88, y: 60 }, // East
    { x: 82, y: 54 }, { x: 88, y: 48 }, { x: 94, y: 41 }, { x: 90, y: 34 }, { x: 85, y: 28 }, // Far-East
]

// ── Helper to generate path by visited order ──────────────────────────
function getDynamicPath(orderOfVisit: number[]): string {
    if (orderOfVisit.length <= 1) return ""
    let d = `M ${NODE_POS[orderOfVisit[0]].x} ${NODE_POS[orderOfVisit[0]].y + 2}` // Offset slightly down from Pin tip
    for (let i = 1; i < orderOfVisit.length; i++) {
        const prev = NODE_POS[orderOfVisit[i-1]]
        const curr = NODE_POS[orderOfVisit[i]]
        const cpY = (prev.y + curr.y) / 2
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y + 2}`
    }
    return d
}

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)
    
    // STRICT VISIBILITY: Only show what is in visitedIds
    // We maintain their order of visit for the path
    const visitOrderIndices = visitedIds
        .map(vId => nodes.findIndex(n => n.id === vId))
        .filter(idx => idx !== -1)

    const activePath = getDynamicPath(visitOrderIndices)

    return (
        <div className="relative w-full">
            <style jsx>{`
                @keyframes pin-drop {
                    0% { transform: translateY(-20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes energy-flow {
                    to { stroke-dashoffset: -40; }
                }
                .pin-animation { animation: pin-drop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .energy-path { 
                    stroke-dasharray: 4 6; 
                    animation: energy-flow 4s linear infinite; 
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#010a1a] shadow-[0_45px_120px_rgba(0,0,0,1)]">
                
                {/* Fixed 9:16 Original Aspect Background */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá"
                        fill
                        className="object-cover opacity-100 brightness-110"
                        priority
                    />
                    {/* Clear Atmosphere (No dark overlays, just raw photo quality) */}
                    <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* SVG canvas — 9:16 Aspect (177.7% height) */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '177.7%' }}>
                    <svg
                        viewBox={`0 0 100 177.7`}
                        className="absolute inset-0 w-full h-full overflow-visible"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            {/* Pin Shape Template */}
                            <path id="pin-shape" d="M0 0 C-4 -6 -10 -8 -10 -15 C-10 -21 -5 -25 0 -25 C5 -25 10 -21 10 -15 C10 -8 4 -6 0 0 Z" />
                            
                            <linearGradient id="neonPath" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF4B1F" />
                                <stop offset="100%" stopColor="#FF9000" />
                            </linearGradient>

                            <filter id="p-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── DYNAMIC ENERGY PATH (Follows visit order) ── */}
                        <path 
                            d={activePath} 
                            fill="none" 
                            stroke="url(#neonPath)" 
                            strokeWidth="1.2" 
                            strokeLinecap="round" 
                            opacity="0.9"
                            className="energy-path"
                            filter="url(#p-glow)"
                        />

                        {/* ── CONQUERED PINS ── */}
                        {visitOrderIndices.map((nIdx, i) => {
                            const locale = nodes[nIdx]
                            const pos    = NODE_POS[nIdx]
                            const label  = locale.name.length > 14 ? locale.name.slice(0, 14) + '…' : locale.name

                            return (
                                <g 
                                    key={locale.id} 
                                    onClick={() => onLocaleClick(locale)} 
                                    style={{ cursor: 'pointer', outline: 'none' }} 
                                    className="touch-manipulation pin-animation"
                                >
                                    {/* Interaction Hitbox */}
                                    <circle cx={pos.x} cy={pos.y - 12} r="12" fill="transparent" />

                                    {/* Shadow under Pin */}
                                    <ellipse cx={pos.x} cy={pos.y + 1} rx="3" ry="1" fill="rgba(0,0,0,0.6)" />

                                    {/* Teardrop Pin (Google Maps Style) */}
                                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                                        <path 
                                            d="M0 0 C-2.5 -4.5 -6 -7.5 -6 -12 C-6 -15.5 -3.5 -18 -0 -18 C3.5 -18 6 -15.5 6 -12 C6 -7.5 2.5 -4.5 0 0 Z" 
                                            fill="#FF4B1F"
                                            stroke="#FFF"
                                            strokeWidth="0.6"
                                            filter="url(#p-glow)"
                                        />
                                        
                                        {/* Logo Container Inside Pin */}
                                        <clipPath id={`clip-${locale.id}`}>
                                            <circle cx="0" cy="-12" r="4.2" />
                                        </clipPath>
                                        <rect x="-4.2" y="-16.2" width="8.4" height="8.4" fill="#000" rx="4.2" />
                                        <image
                                            href={locale.image_url || '/logo-fest.png'}
                                            x="-4.2" y="-16.2"
                                            width="8.4" height="8.4"
                                            clipPath={`url(#clip-${locale.id})`}
                                            className="object-cover"
                                        />

                                        {/* Badge Score/Check Mark on top for flair */}
                                        <circle cx="4.5" cy="-7.5" r="1.8" fill="#4BCF2D" stroke="#000" strokeWidth="0.3" />
                                        <text x="4.5" y="-6.8" textAnchor="middle" fontSize="2.2" fill="#000" fontWeight="900">✓</text>
                                    </g>

                                    {/* Label Positioning Above Pin */}
                                    <text
                                        x={pos.x} y={pos.y - 20}
                                        textAnchor="middle" fontSize="3.2"
                                        fill="#FFFFFF"
                                        className="font-lilita"
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}
                                    >
                                        {label}
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
