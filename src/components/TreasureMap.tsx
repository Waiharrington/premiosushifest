'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { Locale } from "@/types"

interface TreasureMapProps {
    locales: Locale[]
    visitedIds: string[]
    onLocaleClick: (locale: Locale) => void
}

export function TreasureMap({ locales, visitedIds, onLocaleClick }: TreasureMapProps) {
    // Coordinate mapping for 23 locales (approximate path from Chiriquí to Panamá City)
    // We'll distribute them along the "S" curve of the Isthmus
    const getCoordinates = (index: number) => {
        const total = Math.max(locales.length, 23);
        const t = index / (total - 1); // 0 to 1
        
        // Approximate Panama "S" shape path
        // X goes from West to East (12% to 88%)
        const x = 12 + t * 76;
        
        // Y follows a wave/path
        // Base line is around 50%. We add some curves.
        const y = 50 + Math.sin(t * Math.PI * 2.5) * 15 + (Math.cos(t * Math.PI) * 10);
        
        return { x: `${x}%`, y: `${y}%` };
    };

    // Calculate path for SVG
    const pathData = locales.map((_, i) => {
        const { x, y } = getCoordinates(i);
        return `${i === 0 ? 'M' : 'L'} ${parseFloat(x)} ${parseFloat(y)}`;
    }).join(' ');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full aspect-[16/9] mb-12 rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl bg-black/40"
        >
            {/* Map Background */}
            <Image
                src="/panama-map.png"
                alt="Mapa de Panamá"
                fill
                className="object-cover opacity-60 mix-blend-lighten"
                priority
            />

            {/* SVG Path Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Background (Locked) Path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="0.5"
                    strokeDasharray="1 1"
                />
                
                {/* Active (Visited) Path Segment by Segment */}
                {locales.map((_, i) => {
                    if (i === 0 || !visitedIds.includes(locales[i].id) || !visitedIds.includes(locales[i-1].id)) return null;
                    const p1 = getCoordinates(i-1);
                    const p2 = getCoordinates(i);
                    return (
                        <motion.line
                            key={`path-${i}`}
                            x1={parseFloat(p1.x)}
                            y1={parseFloat(p1.y)}
                            x2={parseFloat(p2.x)}
                            y2={parseFloat(p2.y)}
                            stroke="#FFD700"
                            strokeWidth="0.6"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                        />
                    );
                })}
            </svg>

            {/* Locale Nodes */}
            {locales.map((locale, i) => {
                const isVisited = visitedIds.includes(locale.id);
                const { x, y } = getCoordinates(i);
                
                return (
                    <motion.div
                        key={locale.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.5 }}
                        style={{ left: x, top: y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                        <div className="relative group">
                            {/* Pulse for visited or current */}
                            {isVisited && (
                                <motion.div 
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-secondary rounded-full blur-md"
                                />
                            )}

                            <motion.button
                                whileHover={{ scale: 1.2, zIndex: 20 }}
                                onClick={() => onLocaleClick(locale)}
                                className={`
                                    relative w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-2 
                                    ${isVisited ? 'border-secondary shadow-lg shadow-secondary/50 ring-2 ring-secondary/20' : 'border-white/20 grayscale brightness-50 opacity-40'}
                                    transition-all duration-500
                                `}
                            >
                                <Image
                                    src={locale.image_url}
                                    alt={locale.name}
                                    fill
                                    className="object-cover"
                                />
                                {!isVisited && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white/40 text-[10px]">🔒</span>
                                    </div>
                                )}
                            </motion.button>

                            {/* Label */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black/80 backdrop-blur-md text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded border border-white/10 font-lilita uppercase">
                                    {locale.name}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
