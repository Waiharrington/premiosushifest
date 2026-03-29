'use client'

import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Fixed Path Slots (30 slots in a compact 9:16 grid) ────────────────
const NODE_POS: { x: number; y: number }[] = []
const ROWS = 10
const COLS = 3
const Y_START = 15
const Y_STEP = 15 // Fits 10 rows in 177.7 comfortably

for (let r = 0; r < ROWS; r++) {
    const y = Y_START + r * Y_STEP
    const isEvenRow = r % 2 === 0
    for (let c = 0; c < COLS; c++) {
        // Snake pattern: 1-2-3 then 6-5-4
        const colIdx = isEvenRow ? c : (COLS - 1 - c)
        let x = 20 + colIdx * 30 // 20, 50, 80
        NODE_POS.push({ x, y })
    }
}

// ── Path Helper (Connects slots in perfectly ordered sequence) ──────────
function getDynamicPath(visitedCount: number): string {
    if (visitedCount <= 1) return ""
    let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`
    for (let i = 1; i < visitedCount; i++) {
        const prev = NODE_POS[i-1]
        const curr = NODE_POS[i]
        // Smooth curve for the snake turn
        const cpY = (prev.y + curr.y) / 2
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`
    }
    return d
}


export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const nodes = locales.slice(0, 30)
    const activePath = getDynamicPath(visitedIds.length)

    return (
        <div className="relative w-full">
            <style jsx>{`
                @keyframes pin-drop {
                    0% { transform: translateY(-10px) scale(0.5); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes energy-glow {
                    0%, 100% { filter: drop-shadow(0 0 5px #FF4B1F); opacity: 0.8; }
                    50% { filter: drop-shadow(0 0 12px #FF4B1F); opacity: 1; }
                }
                .pin-pop { animation: pin-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .energy-trail { 
                    stroke-dasharray: 4 6; 
                    animation: flow-route 4s linear infinite; 
                }
                @keyframes flow-route {
                    to { stroke-dashoffset: -40; }
                }
            `}</style>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#010a1a] shadow-[0_45px_120px_rgba(0,0,0,1)]">
                
                {/* Background Map (Original 9:16 Height) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/panama-map-v3.png"
                        alt="Mapa de Panamá"
                        fill
                        className="object-cover opacity-100 brightness-110"
                        priority
                    />
                </div>

                {/* SVG canvas — Locked at 9:16 Aspect (177.7% height) */}
                <div className="relative z-10 w-full" style={{ paddingBottom: '177.7%' }}>
                    <svg
                        viewBox={`0 0 100 177.7`}
                        className="absolute inset-0 w-full h-full overflow-visible"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id="samuraiPath" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF4B1F" />
                                <stop offset="100%" stopColor="#FF9000" />
                            </linearGradient>

                            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="0.8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── PATH OF CONQUEST (Snake Logic) ── */}
                        <path 
                            d={activePath} 
                            fill="none" 
                            stroke="url(#samuraiPath)" 
                            strokeWidth="0.8" 
                            strokeLinecap="round" 
                            opacity="0.75"
                            className="energy-trail"
                            filter="url(#neon-glow)"
                        />

                        {/* ── SLOT RENDERER (30 SLOTS) ── */}
                        {Array.from({ length: 30 }).map((_, i) => {
                            const pos = NODE_POS[i]
                            const vId = visitedIds[i]
                            const locale = vId ? locales.find(l => l.id === vId) : null
                            const isRevealed = !!locale
                            const label = isRevealed ? (locale.name.length > 18 ? locale.name.slice(0, 18) + '…' : locale.name) : ""

                            return (
                                <g key={i} onClick={() => isRevealed && onLocaleClick(locale)} style={{ cursor: isRevealed ? 'pointer' : 'default', outline: 'none' }}>
                                    
                                    {/* Slot Visuals */}
                                    {!isRevealed ? (
                                        <g opacity="0.12">
                                            <circle cx={pos.x} cy={pos.y} r="1.8" fill="#FFF" />
                                            <circle cx={pos.x} cy={pos.y} r="2.8" fill="none" stroke="#FFF" strokeWidth="0.2" />
                                            <text x={pos.x} y={pos.y + 0.6} textAnchor="middle" fontSize="1.8" fill="#FFF" fontWeight="700" opacity="0.2">?</text>
                                        </g>
                                    ) : (
                                        <g className="pin-pop">
                                            {/* Shadow */}
                                            <ellipse cx={pos.x} cy={pos.y + 1} rx="1.8" ry="0.5" fill="rgba(0,0,0,0.5)" />
                                            
                                            {/* Enhanced Teardrop Pin (Larger for Brand Impact) */}
                                            <g transform={`translate(${pos.x}, ${pos.y})`}>
                                                <path 
                                                    d="M0 0 C-2.5 -5 -6 -7 -6 -12 C-6 -16 -3.5 -19 -0 -19 C3.5 -19 6 -16 6 -12 C6 -7 2.5 -5 0 0 Z" 
                                                    fill="#FF4B1F"
                                                    stroke="#FFF"
                                                    strokeWidth="0.6"
                                                    filter="url(#neon-glow)"
                                                />
                                                
                                                {/* Logo Plate (White background to pop the logo) */}
                                                <circle cx="0" cy="-12" r="4.8" fill="#FFF" />
                                                
                                                {/* Logo Clip */}
                                                <clipPath id={`clip-samurai-v3-${i}`}>
                                                    <circle cx="0" cy="-12" r="4.5" />
                                                </clipPath>
                                                <image
                                                    href={locale.image_url || '/logo-fest.png'}
                                                    x="-4.5" y="-16.5"
                                                    width="9" height="9"
                                                    clipPath={`url(#clip-samurai-v3-${i})`}
                                                    className="object-cover"
                                                />
 
                                                {/* Conquest Order Badge (Matching Scale) */}
                                                <circle cx="5.2" cy="-6" r="2.2" fill="#FFB800" stroke="#000" strokeWidth="0.35" />
                                                <text x="5.2" y="-5.2" textAnchor="middle" fontSize="3" fill="#000" fontWeight="900" className="font-lilita">{i + 1}</text>
                                            </g>

                                            {/* Label (Above Pin for Visibility) */}
                                            <text
                                                x={pos.x} y={pos.y - 17}
                                                textAnchor="middle" fontSize="3.1"
                                                fill="#FFFFFF"
                                                className="font-lilita"
                                                style={{ 
                                                    textShadow: '0 2px 8px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.5)' 
                                                }}
                                            >
                                                {label}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        </div>
    )
}
