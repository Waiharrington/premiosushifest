'use client'

import { motion } from "framer-motion"
import { RiceParticles } from "./RiceParticles"

export function SushifestLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0B] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Particles */}
            <RiceParticles />
            
            {/* Main Spinner Container */}
            <div className="relative flex flex-col items-center gap-8 z-10">

                {/* Glowing Aura behind Sushi */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-24 bg-primary/20 blur-[40px] rounded-full"
                />


                {/* Spinning Sushi Emoji */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-5xl md:text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(0,178,255,0.6)]"
                >
                    🍣
                </motion.div>


                {/* Loading Text */}
                <div className="flex flex-col items-center gap-3">
                    <motion.p 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="font-lilita text-lg md:text-xl text-white uppercase tracking-[0.4em] drop-shadow-xl"
                    >
                        Cargando la Ruta
                    </motion.p>

                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-2 h-2 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 text-white/20 text-[10px] uppercase font-black tracking-[0.3em]">
                Sushi Fest 2026 • Premios
            </div>
        </div>
    )
}
