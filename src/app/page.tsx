'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { RiceParticles } from "@/components/RiceParticles"
import { SponsorBackground } from "@/components/SponsorBackground"
import { Trophy, ArrowRight, Map as MapIcon, Tag } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
    const { user } = useAuth()
    return (
        <div className="min-h-[100svh] bg-[#000B2A] text-white relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Layer (New Treasure Image with Cinematic Zoom) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/bg-welcome.png"
                        alt="Fondo de Festival"
                        fill
                        className="object-cover opacity-90"
                        priority
                        quality={100}
                    />
                </motion.div>
                {/* Cinematic filters for depth and focus */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                <div className="absolute inset-0 backdrop-blur-[1px]" />

                {/* Golden radiant light from the bottom (Chest glow) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[400px] bg-[radial-gradient(circle_at_center,rgba(255,183,0,0.15)_0%,transparent_70%)] blur-[100px] z-[5]" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

            {/* Main Content */}
            <main className="relative z-40 flex flex-col items-center justify-center min-h-[100svh] px-6 text-center pt-8 pb-12">
                
                {/* Logo Section (Refined for maximum prominence) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, type: "spring" }}
                    className="relative w-full max-w-[160px] aspect-[4/3] mb-4 flex items-center justify-center"
                >
                    {/* Pulsing blue glow (Intensified Electric Blue) */}
                    <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-[-50%] inset-y-[-50%] bg-[#0066FF]/30 blur-[110px] rounded-full" 
                    />
                    
                    <Image
                        src="/logo-fest.png"
                        alt="Sushi Fest 2026 Logo"
                        width={280}
                        height={210}
                        className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,178,255,0.7)] brightness-125 relative z-10"
                        priority
                    />

                    {/* Compass Icon - Independent Floating Parallax */}
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0], 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute top-[60%] left-1/2 -translate-x-1/2 z-[30] w-[110%] max-w-[200px]"
                    >
                        <Image 
                            src="/compass.png" 
                            alt="Brújula del Tesoro" 
                            width={200} 
                            height={200} 
                            className="w-full drop-shadow-[0_25px_60px_rgba(255,183,0,0.5)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Text Content - Floating Cinematic Parallax */}
                <div className="mt-20 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                            opacity: 1, 
                            y: [0, -4, 0] 
                        }}
                        transition={{ 
                            opacity: { delay: 0.8, duration: 1 },
                            y: { delay: 1.8, duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="space-y-3"
                    >
                        <h2 
                            className="text-white font-lilita text-xl md:text-2xl tracking-[0.25em] uppercase drop-shadow-[0_8px_16px_rgba(0,0,0,1)]"
                            style={{ textShadow: '0 4px 12px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.5)' }}
                        >
                            Búsqueda del <span className="text-white">Tesoro</span>
                        </h2>
                        <h1 
                            className="text-5xl md:text-7xl font-lilita uppercase tracking-tight leading-[0.95] text-white my-2"
                            style={{ textShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,1), 0 0 100px rgba(0,0,0,0.6)' }}
                        >
                            ¡GANA <span className="italic">PREMIOS</span> INCREIBLES!
                        </h1>
                        <p className="text-white/90 text-xs md:text-sm font-medium tracking-wide max-w-[380px] mx-auto leading-relaxed drop-shadow-lg">
                            Explora la ciudad, descubre nuevos sabores y desbloquea descuentos exclusivos en cada restaurante que visites.
                        </p>
                    </motion.div>
                </div>

                {/* CTA Button (Moved higher for visibility) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 1 }}
                    className="mt-8 w-full max-w-[300px] px-4"
                >
                    <Link href="/treasure-hunt" className="group relative block">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-500" />
                        <div className="relative h-16 w-full rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(0,178,255,0.4)] transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(0,178,255,0.6)] group-hover:scale-[1.03] active:scale-95">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] bg-[length:200%_auto] animate-gradient-x" />
                            {/* Inner Border */}
                            <div className="absolute inset-[1px] rounded-full border border-white/40" />
                            
                            <span className="relative z-10 text-white font-black text-xl lg:text-2xl drop-shadow-2xl uppercase tracking-tighter flex items-center justify-center gap-2">
                                {user ? "SEGUIR RUTA 🗺️" : "COMENZAR RUTA 🗺️"} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500 ease-out" />
                            </span>
                            
                            {/* Shimmer Effect */}
                            <motion.div 
                                animate={{ x: ['150%', '-150%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] z-20" 
                            />
                        </div>
                    </Link>
                </motion.div>

                {/* Features Badges (Secondary items moved lower) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="flex flex-wrap justify-center gap-2 mt-8 mb-2"
                >
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <MapIcon size={14} className="text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/60">Mapa</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <Trophy size={14} className="text-secondary" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/60">Premios</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <Tag size={14} className="text-blue-400" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/60">Descuentos</span>
                    </div>
                </motion.div>

                <footer className="relative z-50 mt-4 pt-4 pb-4 text-center text-white/40 text-[9px] uppercase tracking-[0.2em] font-black">
                    <p>© 2026 SUSHIFEST • PANAMÁ</p>
                </footer>
            </main>
        </div>
    )
}
