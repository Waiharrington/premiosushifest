'use client'

import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Locale } from "@/types"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

interface SushiProp {
    id: number;
    x: number;
    y: number;
    rotate: number;
    duration: number;
    delay: number;
    emoji: string;
}

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [props, setProps] = useState<SushiProp[]>([])

    useEffect(() => {
        const newProps = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 90,
            y: Math.random() * 100,
            rotate: Math.random() * 360,
            duration: 10 + Math.random() * 20,
            delay: i * 2,
            emoji: ['🍣', '✨', '🍱', '🍘', '⭐'][i % 5]
        }))
        
        // Use a small delay or requestAnimationFrame to satisfy strict linting 
        // about synchronous setState in useEffect
        const timer = setTimeout(() => {
            setProps(newProps)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    // Calculate node position (Space-Neon winding path)
    const getNodePosition = (index: number) => {
        const sequence = [0, 1, 2, 3, 2, 1]; // Indices of horizontal grid columns
        const colIndex = sequence[index % sequence.length];
        const xPos = 15 + colIndex * 23.3; // Distribute across 4 logical columns (15% to 85%)
        
        // ULTRADENSE vertical spacing (index * 5 instead of index * 12)
        return { x: xPos, y: index * 5.5 }; 
    }

    return (
        <div ref={containerRef} className="relative w-full py-20 px-4 md:px-0 min-h-[2000px]">
            {/* The Space Illustrated Background */}
            <div className="absolute inset-0 z-0 h-full">
                <Image 
                    src="/sushi_saga_background.png" 
                    alt="Space Background" 
                    fill 
                    className="object-cover object-top"
                    priority
                />
                <div className="absolute inset-0 bg-[#0A0A0B]/30" />
            </div>

            {/* The Saga Glowing Path (SVG) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                        <filter id="neon-glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* The Neon Energy Trail */}
                    <motion.path 
                        d={locales.map((_, i) => {
                            const pos = getNodePosition(i);
                            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="#FF7A00" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#neon-glow)"
                        className="drop-shadow-[0_0_12px_rgba(255,122,0,0.9)]"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            {/* No Floating Props for now to keep background clean */}

            {/* Saga Milestones (Nodes) */}
            <div className="absolute inset-0 pointer-events-none">
                {locales.map((locale, index) => {
                    const pos = getNodePosition(index);
                    return (
                        <div 
                            key={locale.id} 
                            style={{ 
                                position: 'absolute',
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                pointerEvents: 'auto'
                            }}
                        >
                            <QuestMilestone 
                                locale={locale}
                                isVisited={visitedIds.includes(locale.id)}
                                onLocaleClick={() => onLocaleClick(locale)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Final Prize Milestone */}
            <div className="mt-48 relative z-20 flex flex-col items-center">
                <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="w-32 h-32 bg-gradient-to-br from-secondary to-orange-600 rounded-full flex items-center justify-center p-1 border-8 border-white/20 shadow-[0_0_70px_rgba(255,122,0,0.6)] animate-pulse"
                >
                    <div className="w-full h-full rounded-full border-4 border-dashed border-white/40 flex items-center justify-center">
                       
                    </div>
                </motion.div>
                <div className="mt-10 px-8 py-3 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-3xl text-center">
                    <h3 className="text-2xl font-lilita text-white uppercase tracking-widest">El Tesoro Final</h3>
                    <p className="text-[11px] font-black text-secondary uppercase tracking-[0.4em] mt-2">Completa la Saga para desbloquearlo</p>
                </div>
            </div>
        </div>
    )
}

const QuestMilestone = ({ locale, isVisited, onLocaleClick }: { locale: Locale, isVisited: boolean, onLocaleClick: (l: Locale) => void }) => {
    const cardRef = useRef(null)

    return (
        <motion.div 
            ref={cardRef} 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLocaleClick(locale)}
            style={{ 
                x: "-50%",
                y: "-50%"
            }}
            className="z-30"
        >
            <div className="relative group flex flex-col items-center">
                {/* LEVEL NODE (Neon Pin Style) */}
                <div className={`
                    relative w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-700
                    ${isVisited 
                        ? 'border-[3px] border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.8)]' 
                        : 'border-[3px] border-white/20 grayscale opacity-40'
                    }
                    bg-black/60 backdrop-blur-sm
                `}>
                    <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center p-2">
                        <Image 
                            src={locale.image_url} 
                            alt={locale.name} 
                            fill 
                            className={`object-contain p-2`}
                        />
                    </div>
                </div>

                {/* Level Label below node */}
                <div className="mt-2 flex flex-col items-center">
                    <span className="text-[10px] text-white font-bold drop-shadow-lg uppercase tracking-tight text-center max-w-[80px] line-clamp-1">
                        {locale.name}
                    </span>
                    {isVisited && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] mt-0.5" />
                    )}
                </div>

            </div>
        </motion.div>
    )
}
