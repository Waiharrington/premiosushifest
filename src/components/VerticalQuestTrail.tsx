'use client'

import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Locale } from "@/types"
import { Lock, Sparkles, MapPin } from "lucide-react"

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

    // Calculate node position (Multi-column winding path)
    const getNodePosition = (index: number) => {
        // We create a winding pattern (Left, Center-Left, Center-Right, Right, and back)
        const sequence = [0, 1, 2, 3, 2, 1]; // Indices of horizontal grid columns
        const colIndex = sequence[index % sequence.length];
        const xPos = 15 + colIndex * 23.3; // Distribute across 4 logical columns (15% to 85%)
        
        // Add a bit of natural jitter
        const jitter = Math.sin(index * 2.5) * 3;
        return { x: xPos + jitter, y: index * 12 }; // Vertical spacing
    }

    return (
        <div ref={containerRef} className="relative w-full py-20 px-4 md:px-0 min-h-[3000px]">
            {/* The Sega Illustrated Background */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/sushi_saga_background.png" 
                    alt="Saga Background" 
                    fill 
                    className="object-cover object-top opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/20 via-transparent to-[#0A0A0B]" />
            </div>

            {/* The Saga Glowing Path (SVG) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                        <filter id="saga-glow">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="river-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0047FF" />
                            <stop offset="50%" stopColor="#00B2FF" />
                            <stop offset="100%" stopColor="#0047FF" />
                        </linearGradient>
                    </defs>
                    
                    {/* The 3D River Path (Base) */}
                    <path 
                        d={locales.map((_, i) => {
                            const pos = getNodePosition(i);
                            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="#000B2A" 
                        strokeWidth="18" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50"
                    />
                    
                    {/* The Main River Body */}
                    <motion.path 
                        d={locales.map((_, i) => {
                            const pos = getNodePosition(i);
                            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="url(#river-grad)" 
                        strokeWidth="14" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_15px_rgba(0,178,255,0.4)]"
                    />

                    {/* The Crystalline Center Line */}
                    <motion.path 
                        d={locales.map((_, i) => {
                            const pos = getNodePosition(i);
                            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="#E0F2FF" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-40"
                    />
                </svg>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden origin-top">
                {props.map((p) => (
                    <motion.div
                        key={`prop-${p.id}`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        animate={{ 
                            y: [0, -40, 0],
                            rotate: [p.rotate, p.rotate + 360],
                            opacity: [0.1, 0.4, 0.1]
                        }}
                        transition={{ 
                            duration: p.duration, 
                            repeat: Infinity,
                            delay: p.delay
                        }}
                        className="absolute w-8 h-8 md:w-12 md:h-12 text-3xl"
                        style={{ 
                            left: `${p.x}%`, 
                            top: `${p.y}%`,
                            filter: 'blur(1px)'
                        }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </div>

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
                                onClick={() => onLocaleClick(locale)}
                                nodePos={pos}
                                index={index + 1}
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
                       <Sparkles className="text-white w-14 h-14 drop-shadow-2xl" />
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

function QuestMilestone({ locale, isVisited, onClick, index }: { 
    locale: Locale, isVisited: boolean, onClick: () => void, nodePos: { x: number, y: number }, index: number
}) {
    const cardRef = useRef(null)

    return (
        <motion.div 
            ref={cardRef} 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{ 
                x: "-50%",
                y: "-50%"
            }}
            className="z-30"
        >
            <div className="relative group flex flex-col items-center">
                {/* LEVEL NODE (Candy Crush Style) */}
                <div className={`
                    relative w-24 h-24 md:w-28 md:h-28 rounded-full transition-all duration-700
                    ${isVisited 
                        ? 'bg-gradient-to-br from-yellow-300 via-[#FFD700] to-orange-500 shadow-[0_8px_30px_rgba(255,184,0,0.6)] border-[6px] border-white' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-600 border-[6px] border-white/40 grayscale'
                    }
                `}>
                    {/* Shadow tag below node */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/40 blur-md rounded-full -z-10" />

                    <div className="relative w-full h-full rounded-full overflow-hidden bg-black/10 flex items-center justify-center p-3">
                        <Image 
                            src={locale.image_url} 
                            alt={locale.name} 
                            fill 
                            className={`object-contain p-2 ${!isVisited && 'opacity-20'}`}
                        />
                        {!isVisited && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="text-white/40 w-6 h-6" />
                            </div>
                        )}
                    </div>

                    {/* Level Number Tag */}
                    <div className={`
                        absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border-2 border-white shadow-xl
                        ${isVisited ? 'bg-secondary' : 'bg-gray-700'}
                    `}>
                        <span className="text-white font-lilita text-xs">{index}</span>
                    </div>
                </div>

                {/* Floating Info (Below the level) */}
                <div className={`mt-6 transition-all duration-500 transform group-hover:-translate-y-2 ${isVisited ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="bg-black/90 backdrop-blur-3xl border border-white/10 px-5 py-2 rounded-2xl shadow-2xl text-center whitespace-nowrap min-w-[140px]">
                        <h4 className="text-white font-lilita text-lg leading-none uppercase tracking-tight">
                            {locale.name}
                        </h4>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <MapPin size={9} className="text-secondary" />
                            <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Nivel {locale.id.slice(-2)}</span>
                        </div>
                    </div>
                </div>

                {/* Interaction Pulsing Circle */}
                {!isVisited && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 w-40 h-40 bg-white/10 rounded-full blur-2xl z-[-1] translate-y-[-10%]"
                    />
                )}
            </div>
        </motion.div>
    )
}
