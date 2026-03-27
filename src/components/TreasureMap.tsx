'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { Locale } from "@/types"
import { X } from "lucide-react"

interface TreasureMapProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

export function TreasureMap({ locales, visitedIds, onLocaleClick }: TreasureMapProps) {
    // Coordinate mapping for 23 locales (approximate path from Chiriquí to Panamá City)
    const getCoordinates = (index: number) => {
        const total = locales.length;
        const shuffledIndex = (index * 17) % total;
        const t = shuffledIndex / (total - 1 || 1); 
        const track = shuffledIndex % 3;
        const xBase = 5 + t * 90;
        const xOffset = (track - 1) * 3;
        const curve = Math.sin(t * Math.PI * 2.1); 
        const baseY = 50 + (curve * 15);
        const yOffset = (track - 1) * 18;
        return { x: `${xBase + xOffset}%`, y: `${baseY + yOffset}%` };
    };

    const pathData = locales.map((_, i) => {
        const { x, y } = getCoordinates(i);
        return `${i === 0 ? 'M' : 'L'} ${parseFloat(x)} ${parseFloat(y)}`;
    }).join(' ');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full min-h-[400px] md:aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner bg-black/20"
        >
            {/* Map Background (Enhanced Contrast) */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <Image
                    src="/panama-map.png"
                    alt="Mapa de Panamá"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* SVG Path Layer (The Digital Connection) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Background (Locked) Path - Subtly visible infrastructure */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="0.4"
                    strokeDasharray="2 2"
                />
                
                {/* Active (Visited) Path Segment by Segment */}
                {locales.map((_, i) => {
                    if (i === 0 || !visitedIds.includes(locales[i].id) || !visitedIds.includes(locales[i-1].id)) return null;
                    const p1 = getCoordinates(i-1);
                    const p2 = getCoordinates(i);
                    return (
                        <g key={`path-group-${i}`}>
                            {/* Inner Glow Line */}
                            <motion.line
                                x1={parseFloat(p1.x)}
                                y1={parseFloat(p1.y)}
                                x2={parseFloat(p2.x)}
                                y2={parseFloat(p2.y)}
                                stroke="#00B2FF"
                                strokeWidth="0.8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.8 }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
                                className="drop-shadow-[0_0_12px_rgba(0,178,255,1)]"
                            />
                            {/* Outer Soft Glow */}
                            <motion.line
                                x1={parseFloat(p1.x)}
                                y1={parseFloat(p1.y)}
                                x2={parseFloat(p2.x)}
                                y2={parseFloat(p2.y)}
                                stroke="#0047FF"
                                strokeWidth="2.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                transition={{ duration: 2, delay: i * 0.1 }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Locale Nodes (The Interaction Points) */}
            {locales.map((locale, i) => {
                const isVisited = visitedIds.includes(locale.id);
                const { x, y } = getCoordinates(i);
                
                return (
                    <motion.div
                        key={locale.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.5, type: "spring", damping: 15 }}
                        style={{ left: x, top: y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                        <div className="relative group">
                            {/* Digital Radar Pulses */}
                            {isVisited ? (
                                <>
                                    <motion.div 
                                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                                        className="absolute inset-0 bg-primary rounded-full blur-md"
                                    />
                                    <motion.div 
                                        animate={{ scale: [1, 2], opacity: [0.2, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                                        className="absolute inset-0 bg-secondary rounded-full blur-sm"
                                    />
                                </>
                            ) : (
                                // Subtle beacon for unvisited nodes
                                <motion.div 
                                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/20 rounded-full blur-sm"
                                />
                            )}

                            <motion.button
                                whileHover={{ scale: 1.3, zIndex: 30 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onLocaleClick(locale)}
                                className={`
                                    relative w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 
                                    ${isVisited 
                                        ? 'border-secondary shadow-[0_0_30px_rgba(255,122,0,0.5)] ring-4 ring-secondary/10' 
                                        : 'border-white/10 grayscale brightness-[0.3] opacity-40 hover:opacity-60 transition-opacity'
                                    }
                                    bg-black transition-all duration-700
                                `}
                            >
                                <Image
                                    src={locale.image_url}
                                    alt={locale.name}
                                    fill
                                    className="object-cover"
                                />
                                {!isVisited && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <X size={14} className="text-white/20" />
                                    </div>
                                )}
                            </motion.button>

                            {/* Floating Label (Cinematic HUD Style) */}
                            <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <span className="bg-black/90 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl block">
                                    {locale.name}
                                </span>
                                {/* Small pointer arrow */}
                                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-black/90 mx-auto -mt-[22px] rotate-180 mb-20" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
