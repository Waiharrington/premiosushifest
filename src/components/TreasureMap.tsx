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
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4"
        >
            {locales.map((locale) => {
                const isVisited = visitedIds.includes(locale.id)
                return (
                    <motion.div
                        key={locale.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onLocaleClick(locale)}
                        className="relative cursor-pointer group"
                    >
                        <div className={`
                            relative aspect-square rounded-full overflow-hidden border-4 
                            ${isVisited ? 'border-secondary shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'border-white/10 grayscale opacity-50'}
                            transition-all duration-700 ease-in-out
                        `}>
                            <Image
                                src={locale.image_url}
                                alt={locale.name}
                                fill
                                className="object-cover"
                            />
                            {!isVisited && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white/40 text-2xl">🔒</span>
                                </div>
                            )}
                        </div>
                        <p className={`
                            text-[10px] mt-2 text-center font-lilita uppercase tracking-tighter truncate
                            ${isVisited ? 'text-white' : 'text-white/30'}
                        `}>
                            {locale.name}
                        </p>
                    </motion.div>
                )
            })}
        </motion.div>
    )
}
