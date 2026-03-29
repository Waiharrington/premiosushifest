'use client'

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// ── Fixed Path Slots (30 slots in a spacious 4-column 9:16 grid) ────────
const NODE_POS: { x: number; y: number }[] = []
const ROWS = 8
const COLS = 4
const Y_START = 22 // Safe margin for top pins
const Y_STEP = 21 // Spacious vertical rows

for (let r = 0; r < ROWS; r++) {
    const y = Y_START + r * Y_STEP
    const isEvenRow = r % 2 === 0
    for (let c = 0; c < COLS; c++) {
        const colIdx = isEvenRow ? c : (COLS - 1 - c)
        let x = 16 + colIdx * 23 // Distributed columns
        if (NODE_POS.length < 30) {
            NODE_POS.push({ x, y })
        }
    }
}

// ── Path Helper (Connects slots in perfectly ordered sequence) ──────────
function getDynamicPath(visitedCount: number): string {
    if (visitedCount <= 1) return ""
    let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`
    for (let i = 1; i < visitedCount; i++) {
        const prev = NODE_POS[i-1]
        const curr = NODE_POS[i]
        const cpY = (prev.y + curr.y) / 2
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`
    }
    return d
}

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null)
    const activePath = getDynamicPath(visitedIds.length)

    return (
        <div className="relative w-full flex flex-col pt-8">
            <style jsx>{`
                @keyframes pin-drop {
                    0% { transform: translateY(-10px) scale(0.5); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .pin-pop { animation: pin-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .energy-trail { 
                    stroke-dasharray: 4 6; 
                    animation: flow-route 4s linear infinite; 
                }
                @keyframes flow-route { to { stroke-dashoffset: -40; } }
            `}</style>

            {/* Minimalist Instruction Label */}
            <div className="w-full text-center mb-4 px-4 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative py-2"
                >
                    <span className="text-white/60 font-lilita text-xs md:text-sm tracking-[0.2em] uppercase">
                        — Toca un negocio para ver sus detalles —
                    </span>
                    {/* Subtle glow underneath */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                </motion.div>
            </div>
            
            <div className="w-full max-w-lg mx-auto mb-12 relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#010a1a] shadow-[0_45px_120px_rgba(0,0,0,1)]">
                
                {/* Background Map (Strict 9:16 Original Height) */}
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

                            <filter id="neon-glow-trail" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1.1" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Interactive transparent surface for bg-clicks */}
                        <rect width="100" height="177.7" fill="transparent" onClick={() => setSelectedLocale(null)} />

                        {/* ── PATH OF CONQUEST ── */}
                        <path 
                            d={activePath} 
                            fill="none" 
                            stroke="url(#samuraiPath)" 
                            strokeWidth="1.1" 
                            strokeLinecap="round" 
                            opacity="0.8"
                            className="energy-trail"
                            filter="url(#neon-glow-trail)"
                        />

                        {/* ── SLOT RENDERER (30 SLOTS) ── */}
                        {Array.from({ length: 30 }).map((_, i) => {
                            const pos = NODE_POS[i]
                            const vId = visitedIds[i]
                            const locale = vId ? locales.find(l => l.id === vId) : null
                            const isRevealed = !!locale

                            return (
                                <g key={i}>
                                    {!isRevealed ? (
                                        // Mystery Slot
                                        <g filter="url(#neon-glow-trail)" opacity="0.65">
                                            <circle cx={pos.x} cy={pos.y} r="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
                                            <circle cx={pos.x} cy={pos.y} r="1.8" fill="rgba(255,255,255,0.2)" />
                                            <text x={pos.x} y={pos.y + 0.8} textAnchor="middle" fontSize="2.5" fill="#FFF" fontWeight="900" opacity="0.8">?</text>
                                        </g>
                                    ) : (
                                        <g 
                                            className="pin-pop" 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedLocale(locale)
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {/* Shadow */}
                                            <ellipse cx={pos.x} cy={pos.y + 1} rx="2.5" ry="0.8" fill="rgba(0,0,0,0.4)" />
                                            
                                            {/* The Orb of Conquest (Minimalist & High Impact) */}
                                            <g transform={`translate(${pos.x}, ${pos.y})`}>
                                                {/* Outer Glow Ring */}
                                                <circle cx="0" cy="-8.5" r="8.2" fill="#FF4B1F" stroke="#FFF" strokeWidth="0.8" filter="url(#neon-glow-trail)" />
                                                
                                                {/* Logo Container (White background to pop the logo) */}
                                                <circle cx="0" cy="-8.5" r="7.4" fill="#FFF" />
                                                
                                                <clipPath id={`clip-saga-orb-${i}`}>
                                                    <circle cx="0" cy="-8.5" r="7.2" />
                                                </clipPath>
                                                
                                                <image
                                                    href={locale.image_url || '/logo-fest.png'}
                                                    x="-7.2" y="-15.7"
                                                    width="14.4" height="14.4"
                                                    clipPath={`url(#clip-saga-orb-${i})`}
                                                    className="object-cover"
                                                />
                                                
                                                {/* Quest Rank Badge (Integrated with Orb) */}
                                                <circle cx="6.5" cy="-3.5" r="2.8" fill="#FFB800" stroke="#000" strokeWidth="0.4" />
                                                <text x="6.5" y="-2.5" textAnchor="middle" fontSize="3.8" fill="#000" fontWeight="900" className="font-lilita">{i + 1}</text>
                                            </g>
                                        </g>
                                    )}
                                </g>
                            )
                        })}
                    </svg>

                    {/* ── INTERACTIVE INFO WINDOW OVERLAY (Now FIXED to screen for zero scroll) ── */}
                    <AnimatePresence>
                        {selectedLocale && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-[4px]"
                                onClick={() => setSelectedLocale(null)}
                            >
                                <motion.div 
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="w-full max-w-[320px] bg-[#020d1f]/98 border border-orange-500/40 rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button 
                                        onClick={() => setSelectedLocale(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                                    >
                                        <X size={18} className="text-white/60" />
                                    </button>

                                    <div className="flex flex-col items-center text-center">
                                        {/* Logo Container */}
                                        <div className="w-24 h-24 rounded-full border-2 border-orange-500/50 p-1 mb-4 shadow-[0_0_20px_rgba(255,75,31,0.2)]">
                                            <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                                <Image 
                                                    src={selectedLocale.image_url || '/logo-fest.png'} 
                                                    alt={selectedLocale.name} 
                                                    width={96} height={96} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl text-white font-lilita mb-2 tracking-wide uppercase">
                                            {selectedLocale.name}
                                        </h3>

                                        <p className="text-white/80 text-sm leading-relaxed font-inter italic">
                                            {selectedLocale.description || "¡Este restaurante guarda una parte esencial de la Saga de Sushi Fest! Visítalo para reclamar tu premio."}
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
