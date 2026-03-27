'use client'

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Locale } from "@/types"
import { CheckCircle2, Lock, Sparkles, MapPin } from "lucide-react"

interface VerticalQuestTrailProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

export function VerticalQuestTrail({ locales, visitedIds, onLocaleClick }: VerticalQuestTrailProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <div ref={containerRef} className="relative w-full py-20 px-4 md:px-0">
            {/* The Central Glowing Path (SVG) */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1 z-0">
                <svg className="h-full w-full" preserveAspectRatio="none">
                    <line 
                        x1="50%" y1="0" x2="50%" y2="100%" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="2" 
                        strokeDasharray="8 8" 
                    />
                    <motion.line 
                        x1="50%" y1="0" x2="50%" y2="100%" 
                        stroke="#00B2FF" 
                        strokeWidth="3"
                        style={{ pathLength: pathLength }}
                        className="drop-shadow-[0_0_8px_rgba(0,178,255,0.8)]"
                    />
                </svg>
            </div>

            {/* Locale Milestones */}
            <div className="flex flex-col gap-32 relative z-10">
                {locales.map((locale, index) => (
                    <QuestMilestone 
                        key={locale.id}
                        locale={locale}
                        isVisited={visitedIds.includes(locale.id)}
                        onClick={() => onLocaleClick(locale)}
                        isLeft={index % 2 === 0}
                    />
                ))}
            </div>

            {/* Mystery Reward at the end */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-40 text-center"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(255,122,0,0.4)] border-4 border-white/20 animate-bounce">
                    <Sparkles className="text-white w-10 h-10" />
                </div>
                <h3 className="text-2xl font-lilita text-white mt-6 uppercase tracking-widest">¿El Final del Camino?</h3>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Completa todos para descubrir tu premio final</p>
            </motion.div>
        </div>
    )
}

function QuestMilestone({ locale, isVisited, onClick, isLeft }: { 
    locale: Locale, isVisited: boolean, onClick: () => void, isLeft: boolean 
}) {
    const cardRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "center center"]
    })

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
    const x = useTransform(scrollYProgress, [0, 1], [isLeft ? -50 : 50, 0])

    return (
        <div ref={cardRef} className={`flex w-full items-center ${isLeft ? 'justify-start md:pr-[50%]' : 'justify-end md:pl-[50%]'}`}>
            {/* The Path Connector Dot */}
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-2 border-primary rounded-full z-20 shadow-[0_0_15px_rgba(0,178,255,0.8)]">
                {isVisited && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity }} className="absolute inset-0 bg-primary rounded-full blur-sm" />}
            </div>

            {/* The Card */}
            <motion.div
                style={{ scale, opacity, x }}
                whileHover={{ y: -10 }}
                onClick={onClick}
                className={`
                    relative w-full max-w-[320px] aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer group
                    border transition-all duration-700
                    ${isVisited 
                        ? 'bg-black/60 border-primary/40 shadow-[0_20px_60px_rgba(0,178,255,0.2)]' 
                        : 'bg-black/40 border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-white/20'
                    }
                `}
            >
                {/* Background Image */}
                <Image 
                    src={locale.image_url} 
                    alt={locale.name} 
                    fill 
                    className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Depth Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Floating Logo (The Parallax Item) */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <motion.div 
                        animate={isVisited ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="relative w-full aspect-square drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                    >
                        <Image 
                            src={locale.image_url} 
                            alt={locale.name} 
                            fill 
                            className={`object-contain ${!isVisited && 'brightness-[0.2]'}`}
                        />
                    </motion.div>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isVisited ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                            {isVisited ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isVisited ? 'text-primary' : 'text-white/20'}`}>
                            {isVisited ? 'Destino Alcanzado' : 'Pendiente'}
                        </span>
                    </div>
                    <h4 className="text-2xl font-lilita text-white uppercase tracking-tight leading-none truncate">
                        {locale.name}
                    </h4>
                    
                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 mt-3 opacity-40">
                        <MapPin size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Ver en Mapa</span>
                    </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
        </div>
    )
}
