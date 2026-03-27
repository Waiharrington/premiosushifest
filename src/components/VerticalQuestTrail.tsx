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
        <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '9/16', maxHeight: '85vh' }}>
            {/* The Space Illustrated Background */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/sushi_saga_background.png" 
                    alt="Space Background" 
                    fill 
                    className="object-cover object-top"
                    priority
                />
                <div className="absolute inset-0 bg-[#0A0A0B]/10" />
            </div>

            {/* The Space Path Trail (thin dashed star trail) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                        <filter id="soft-glow">
                            <feGaussianBlur stdDeviation="0.4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Thin dashed path between nodes */}
                    <motion.path 
                        d={locales.map((_, i) => {
                            const pos = getNodePosition(i);
                            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="rgba(255,255,255,0.25)" 
                        strokeWidth="0.6" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="1.5 2"
                        filter="url(#soft-glow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Small glowing dots along the path at each node */}
                    {locales.map((locale, i) => {
                        const pos = getNodePosition(i);
                        return (
                            <circle
                                key={locale.id}
                                cx={pos.x}
                                cy={pos.y}
                                r="0.8"
                                fill="rgba(255,180,0,0.5)"
                                filter="url(#soft-glow)"
                            />
                        );
                    })}
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
