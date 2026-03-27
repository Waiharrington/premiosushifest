'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { RiceParticles } from "@/components/RiceParticles"
import { SponsorBackground } from "@/components/SponsorBackground"
import { Trophy, ArrowRight, Map as MapIcon, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
    const { user } = useAuth()
    return (
        <div className="min-h-[100svh] bg-[#000B2A] text-white relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Layer (New Treasure Image) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/bg-welcome.png"
                        alt="Fondo de Festival"
                        fill
                        className="object-cover opacity-90"
                        priority
                        quality={100}
                    />
                </div>
                {/* Cinematic filters for depth and focus */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                <div className="absolute inset-0 backdrop-blur-[1px]" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.7)_100%)]" />

            {/* Main Content */}
            <main className="relative z-40 flex flex-col items-center justify-center min-h-[100svh] px-6 text-center pt-8 pb-12">
                
                {/* Logo Section (Refined for the new dark background) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="relative w-full max-w-[155px] aspect-[4/3] mb-8"
                >
                    {/* Pulsing blue glow behind logo */}
                    <motion.div 
                        animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.85, 1.15, 0.85] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-[-40%] inset-y-[-40%] bg-[#0066FF]/25 blur-[90px] rounded-full" 
                    />
                    
                    <Image
                        src="/logo-fest.png"
                        alt="Sushi Fest 2026 Logo"
                        width={220}
                        height={160}
                        className="w-full h-auto drop-shadow-[0_0_40px_rgba(0,178,255,0.8)] brightness-125 relative z-10"
                        priority
                    />

                    {/* Compass Icon - Repositioned to be above the text, not overlapping */}
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0], 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute top-[60%] left-1/2 -translate-x-1/2 z-[30] w-[120%] max-w-[240px]"
                    >
                        <Image 
                            src="/compass.png" 
                            alt="Brújula del Tesoro" 
                            width={240} 
                            height={240} 
                            className="w-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <div className="mt-20 space-y-4 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 1 }}
                    >
                        <h2 className="text-secondary font-lilita text-2xl md:text-3xl tracking-[0.2em] uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            Búsqueda del <span className="text-white">Tesoro</span>
                        </h2>
                        <h1 
                            className="text-5xl md:text-7xl font-lilita uppercase tracking-tight leading-[0.95] text-white my-3 drop-shadow-[0_10px_40px_rgba(0,0,0,1)]"
                            style={{ textShadow: '0 8px 32px rgba(0,0,0,1), 0 0 80px rgba(0,0,0,1)' }}
                        >
                            ¡GANA <span className="text-secondary italic">PREMIOS</span> INCREIBLES!
                        </h1>
                        <p className="text-white/80 text-sm md:text-base font-medium tracking-wide max-w-[440px] mx-auto leading-relaxed drop-shadow-md">
                            Explora la ciudad, descubre nuevos sabores y desbloquea descuentos exclusivos en cada restaurante que visites.
                        </p>
                    </motion.div>
                </div>

                {/* Features Badges (Premium Glass Design) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-wrap justify-center gap-3 mt-12 mb-4"
                >
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-2xl">
                        <MapIcon size={18} className="text-primary" />
                        <span className="text-[11px] uppercase font-black tracking-[0.2em] text-white/70">Mapa Interactivo</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-2xl">
                        <Trophy size={18} className="text-secondary" />
                        <span className="text-[11px] uppercase font-black tracking-[0.2em] text-white/70">Premios Reales</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-2xl">
                        <Sparkles size={18} className="text-blue-400" />
                        <span className="text-[11px] uppercase font-black tracking-[0.2em] text-white/70">Experiencia Pro</span>
                    </div>
                </motion.div>

                {/* CTA Button (Enhanced for depth) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 1 }}
                    className="mt-12 w-full max-w-sm px-4"
                >
                    <Link href="/treasure-hunt" className="group relative block">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
                        <div className="relative h-20 w-full rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(0,178,255,0.5)] transition-all duration-500 group-hover:shadow-[0_0_80px_rgba(0,178,255,0.7)] group-hover:scale-[1.05] active:scale-95">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] bg-[length:200%_auto] animate-gradient-x" />
                            {/* Inner Border */}
                            <div className="absolute inset-[2px] rounded-full border border-white/40" />
                            
                            <span className="relative z-10 text-white font-black text-2xl lg:text-3xl drop-shadow-2xl uppercase tracking-tighter flex items-center justify-center gap-3">
                                {user ? "SEGUIR LA RUTA" : "COMENZAR RUTA"} <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform duration-500 ease-out" />
                            </span>
                            
                            {/* Shimmer Effect */}
                            <motion.div 
                                animate={{ x: ['150%', '-150%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] z-20" 
                            />
                        </div>
                    </Link>
                </motion.div>

                <footer className="mt-auto pt-16 pb-8 text-center text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">
                    <p>© 2026 SUSHIFEST • PANAMÁ</p>
                </footer>
            </main>
        </div>
    )
}
