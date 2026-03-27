'use client'

import { motion, useScroll, useSpring } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Locale } from "@/types"
import { CheckCircle2, Lock, Sparkles, MapPin } from "lucide-react"

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
            emoji: ['🍣', '🥢', '🍱', '🍘'][i % 4]
        }))
        
        // Use a small delay or requestAnimationFrame to satisfy strict linting 
        // about synchronous setState in useEffect
        const timer = setTimeout(() => {
            setProps(newProps)
        }, 0)
        return () => clearTimeout(timer)
    }, [])
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    // Calculate node position based on index (Saga style wiggling)
    const getNodePosition = (index: number) => {
        const xOffset = Math.sin(index * 1.2) * 28; // Wavy horizontal offset (-28% to 28%)
        return { x: 50 + xOffset };
    }

    return (
        <div ref={containerRef} className="relative w-full py-20 px-4 md:px-0 min-h-[1500px]">
            {/* The Saga Glowing Path (SVG) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <svg viewBox="0 0 100 100" className="h-full w-full opacity-40" preserveAspectRatio="none">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path 
                        d={locales.map((_, i) => {
                            const x = 50 + Math.sin(i * 1.2) * 28;
                            const total = locales.length > 1 ? locales.length - 1 : 1;
                            const y = (i / total) * 100;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="4" 
                        strokeDasharray="12 12" 
                    />
                    <motion.path 
                        d={locales.map((_, i) => {
                            const x = 50 + Math.sin(i * 1.2) * 28;
                            const total = locales.length > 1 ? locales.length - 1 : 1;
                            const y = (i / total) * 100;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none" 
                        stroke="#00B2FF" 
                        strokeWidth="6"
                        style={{ pathLength: pathLength }}
                        filter="url(#glow)"
                        className="drop-shadow-[0_0_15px_rgba(0,178,255,1)]"
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
            <div className="flex flex-col gap-40 relative z-10 py-10">
                {locales.map((locale, index) => (
                    <div key={locale.id} className="relative flex justify-center w-full">
                        <QuestMilestone 
                            locale={locale}
                            isVisited={visitedIds.includes(locale.id)}
                            onClick={() => onLocaleClick(locale)}
                            nodePos={getNodePosition(index)}
                        />
                    </div>
                ))}
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

function QuestMilestone({ locale, isVisited, onClick, nodePos }: { 
    locale: Locale, isVisited: boolean, onClick: () => void, nodePos: { x: number }
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
                left: `${nodePos.x}%`,
                x: "-50%"
            }}
            className="absolute z-30"
        >
            <div className="relative group flex flex-col items-center">
                {/* LEVEL NODE (Candy Crush Style) */}
                <div className={`
                    relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden p-1.5 transition-all duration-700
                    ${isVisited 
                        ? 'bg-gradient-to-br from-primary to-[#0047FF] shadow-[0_0_40px_rgba(0,178,255,0.6)] border-4 border-white/60' 
                        : 'bg-black/80 border-4 border-white/10 grayscale ring-8 ring-white/5'
                    }
                `}>
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-black/40 backdrop-blur-md">
                        <Image 
                            src={locale.image_url} 
                            alt={locale.name} 
                            fill 
                            className={`object-contain p-4 ${!isVisited && 'opacity-20 translate-y-2'}`}
                        />
                        {!isVisited && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="text-white/20 w-8 h-8" />
                            </div>
                        )}
                        {isVisited && (
                            <div className="absolute top-1 right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce-slow">
                                <CheckCircle2 className="text-white w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Info (Below the level) */}
                <div className={`mt-6 transition-all duration-500 transform group-hover:-translate-y-2 ${isVisited ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="bg-black/90 backdrop-blur-3xl border border-white/10 px-5 py-2 rounded-2xl shadow-2xl text-center whitespace-nowrap min-w-[140px]">
                        <h4 className="text-white font-lilita text-lg leading-none uppercase tracking-tight">
                            {locale.name}
                        </h4>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <MapPin size={9} className="text-primary" />
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
