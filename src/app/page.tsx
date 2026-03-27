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
                
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="relative w-full max-w-[130px] aspect-[4/3] mb-6"
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
                </motion.div>

                {/* Compass Icon - Now in the regular flow for better spacing */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: 1,
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0],
                        y: [0, -6, 0]
                    }}
                    transition={{ 
                        opacity: { delay: 0.5, duration: 1 },
                        scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="z-[30] w-full max-w-[140px] mb-8"
                >
                    <Image 
                        src="/compass.png" 
                        alt="Brújula del Tesoro" 
                        width={200} 
                        height={200} 
                        className="w-full drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
                    />
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4 max-w-xl mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        <h2 className="text-secondary font-lilita text-xl md:text-2xl tracking-[0.2em] uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            Búsqueda del <span className="text-white">Tesoro</span>
                        </h2>
                        <h1 
                            className="text-4xl md:text-6xl font-lilita uppercase tracking-tight leading-[0.95] text-white my-3 drop-shadow-[0_10px_40px_rgba(0,0,0,1)]"
                            style={{ textShadow: '0 8px 32px rgba(0,0,0,1), 0 0 80px rgba(0,0,0,1)' }}
                        >
                            ¡GANA <span className="text-secondary italic">PREMIOS</span> INCREIBLES!
                        </h1>
                        <p className="text-white/80 text-xs md:text-sm font-medium tracking-wide max-w-[340px] mx-auto leading-relaxed drop-shadow-md">
                            Explora la ciudad, descubre nuevos sabores y desbloquea descuentos exclusivos en cada restaurante que visites.
                        </p>
                    </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 1 }}
                    className="w-full max-w-sm px-6 mb-10"
                >
                    <Link href="/treasure-hunt" className="group relative block">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
                        <div className="relative h-16 w-full rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(0,178,255,0.4)] transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(0,178,255,0.6)] group-hover:scale-[1.03] active:scale-95">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] bg-[length:200%_auto] animate-gradient-x" />
                            {/* Inner Border */}
                            <div className="absolute inset-[1px] rounded-full border border-white/30" />
                            
                            <span className="relative z-10 text-white font-black text-xl lg:text-2xl drop-shadow-2xl uppercase tracking-tighter flex items-center justify-center gap-2">
                                {user ? "SEGUIR LA RUTA" : "COMENZAR RUTA"} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500 ease-out" />
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

                {/* Features Badges */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-wrap justify-center gap-3 mb-10"
                >
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <MapIcon size={14} className="text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/70">Mapa</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <Trophy size={14} className="text-secondary" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/70">Premios</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-white/70">Pro</span>
                    </div>
                </motion.div>

                <footer className="mt-4 pb-6 text-center text-white/30 text-[9px] uppercase tracking-[0.2em] font-black">
                    <p>© 2026 SUSHIFEST • PANAMÁ</p>
                </footer>
            </main>
        </div>
    )
}
