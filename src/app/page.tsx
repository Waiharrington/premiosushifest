'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { RiceParticles } from "@/components/RiceParticles"
import { SponsorBackground } from "@/components/SponsorBackground"
import { Trophy, ArrowRight, Map as MapIcon, Sparkles } from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-[100svh] bg-background text-white relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Layer (Cinematic) */}
            <div className="absolute inset-0 z-0">
                <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/bg-welcome-premium.png"
                        alt="Fondo de Festival"
                        fill
                        className="object-cover opacity-80"
                        priority
                        quality={100}
                    />
                </motion.div>
                {/* Dark overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-6 text-center">
                
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.2, type: "spring" }}
                    className="relative w-full max-w-[200px] aspect-[4/3] mb-8"
                >
                    {/* Pulsing blue glow behind logo */}
                    <motion.div 
                        animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.2, 0.9] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-[-30%] inset-y-[-30%] bg-[#0066FF]/30 blur-[100px] rounded-full" 
                    />
                    
                    <Image
                        src="/logo-fest.png"
                        alt="Sushi Fest 2026 Logo"
                        width={250}
                        height={180}
                        className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,178,255,0.7)] brightness-110 relative z-10"
                        priority
                    />

                    {/* Golden crown below logo */}
                    <motion.div
                        animate={{ y: [0, -8, 0], scale: [1, 1.1, 1], rotate: [0, 3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 w-52"
                    >
                        <Image 
                            src="/crown.png" 
                            alt="Corona" 
                            width={200} 
                            height={160} 
                            className="w-full drop-shadow-[0_10px_30px_rgba(255,183,0,0.7)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <div className="mt-16 space-y-4 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-secondary font-lilita text-2xl md:text-3xl tracking-wider uppercase drop-shadow-lg">
                            Búsqueda del <span className="text-white">Tesoro</span>
                        </h2>
                        <h1 
                            className="text-5xl md:text-7xl font-lilita uppercase tracking-tight leading-[0.9] text-white my-2"
                            style={{ textShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,1)' }}
                        >
                            ¡GANA <span className="text-primary italic">PREMIOS</span> MIERCOLES!
                        </h1>
                        <p className="text-white/70 text-sm md:text-base font-medium tracking-wide max-w-[400px] mx-auto leading-relaxed">
                            Explora la ciudad, descubre nuevos sabores y desbloquea descuentos exclusivos en cada restaurante que visites.
                        </p>
                    </motion.div>
                </div>

                {/* Features Badges */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap justify-center gap-4 mt-12"
                >
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                        <MapIcon size={16} className="text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 text-nowrap">Mapa Interactivo</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-nowrap">
                        <Trophy size={16} className="text-secondary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 text-nowrap">Premios Reales</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-nowrap">
                        <Sparkles size={16} className="text-blue-400 text-nowrap" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Experiencia Pro</span>
                    </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-16 w-full max-w-xs"
                >
                    <Link href="/treasure-hunt" className="group relative block">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative h-20 w-full rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(0,178,255,0.4)] transition-all group-hover:shadow-[0_0_60px_rgba(0,178,255,0.6)] group-hover:scale-[1.02] active:scale-95">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-[#00B2FF] to-[#0066FF] bg-[length:200%_auto] animate-gradient-x" />
                            {/* Inner Border */}
                            <div className="absolute inset-[2px] rounded-full border border-white/30" />
                            
                            <span className="relative z-10 text-white font-black text-2xl drop-shadow-lg uppercase tracking-tight flex items-center justify-center gap-3">
                                DESCUBRE LOS PREMIOS <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                            </span>
                            
                            {/* Shimmer Effect */}
                            <motion.div 
                                animate={{ x: ['150%', '-150%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] z-20" 
                            />
                        </div>
                    </Link>
                </motion.div>

                <footer className="mt-auto py-12 text-center text-white/30 text-[10px] uppercase tracking-[0.2em]">
                    <p>© 2026 SUSHIFEST • BY EPIC MARKETING • PANAMÁ</p>
                </footer>
            </main>
        </div>
    )
}
