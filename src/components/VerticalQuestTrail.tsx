'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { Locale } from "@/types"
import { CheckCircle2, Lock } from "lucide-react"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

// Column positions for zigzag: left, center, right, center, left, ...
const COLS = ['left', 'center', 'right', 'center'] as const
type ColPos = typeof COLS[number]

const colClass: Record<ColPos, string> = {
    left:   'self-start ml-2',
    center: 'self-center',
    right:  'self-end mr-2',
}

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    return (
        <div
            className="relative w-full"
            style={{
                backgroundImage: "url('/sushi_saga_background.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay so text/nodes are readable */}
            <div className="absolute inset-0 bg-[#050A1A]/55 pointer-events-none" />

            {/* Node grid */}
            <div className="relative z-10 flex flex-col items-stretch gap-0 px-4 py-8">
                {locales.map((locale, i) => {
                    const colPos = COLS[i % COLS.length]
                    const isVisited = visitedIds.includes(locale.id)
                    const isLast = i === locales.length - 1

                    return (
                        <div key={locale.id} className="flex flex-col" style={{ minHeight: 100 }}>
                            {/* Connector line from previous node */}
                            {i > 0 && (
                                <div className="flex justify-center w-full" style={{ height: 32 }}>
                                    <div
                                        className={`w-[2px] ${isVisited ? 'bg-yellow-400/70' : 'bg-white/15'}`}
                                        style={{
                                            background: isVisited
                                                ? 'repeating-linear-gradient(to bottom, rgba(255,190,0,0.6) 0px, rgba(255,190,0,0.6) 6px, transparent 6px, transparent 12px)'
                                                : 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 6px, transparent 6px, transparent 12px)',
                                            width: 2,
                                            height: 32,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Node */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: '-40px' }}
                                whileTap={{ scale: 0.93 }}
                                onClick={() => onLocaleClick(locale)}
                                className={`flex flex-col items-center gap-1.5 cursor-pointer ${colClass[colPos]}`}
                                style={{ width: 76 }}
                            >
                                {/* Circle */}
                                <div
                                    className={`relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-[3px] transition-all duration-500 ${
                                        isVisited
                                            ? 'border-yellow-400 shadow-[0_0_18px_rgba(255,190,0,0.6)]'
                                            : 'border-white/20 grayscale opacity-55'
                                    } bg-black/50 backdrop-blur-sm`}
                                >
                                    <Image
                                        src={locale.image_url || '/logo-fest.png'}
                                        alt={locale.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                    {isVisited && (
                                        <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                    {!isVisited && (
                                        <div className="absolute bottom-0 right-0 bg-white/20 rounded-full p-0.5">
                                            <Lock size={12} className="text-white/60" />
                                        </div>
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-bold uppercase text-center leading-tight max-w-[80px] line-clamp-2 drop-shadow ${
                                    isVisited ? 'text-white' : 'text-white/50'
                                }`}>
                                    {locale.name}
                                </span>
                            </motion.button>

                            {/* Horizontal connector between non-center adjacent nodes */}
                            {!isLast && (() => {
                                const nextCol = COLS[(i + 1) % COLS.length]
                                if (colPos === 'center' || nextCol === 'center') return null
                                // left ↔ right via center — skip, covered by vertical lines
                                return null
                            })()}
                        </div>
                    )
                })}

                {/* End treasure marker */}
                <div className="flex flex-col items-center mt-6 mb-4 gap-3">
                    <div className="text-3xl drop-shadow-xl">🏆</div>
                    <span className="text-[10px] font-black uppercase text-yellow-400/80 tracking-[0.3em] text-center">
                        El Tesoro Final
                    </span>
                </div>
            </div>
        </div>
    )
}
