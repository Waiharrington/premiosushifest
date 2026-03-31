'use client'

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiceParticles } from "@/components/RiceParticles"
import { SponsorBackground } from "@/components/SponsorBackground"
import { Trophy, ArrowRight, Map as MapIcon, Tag } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
    const router = useRouter()
    const { user, login, register, isLoading: authLoading } = useAuth()

    useEffect(() => {
        const processSSO = async () => {
            const search = window.location.search
            if (search.includes('cedula=')) {
                const params = new URLSearchParams(search)
                const ssoCedula = params.get('cedula')
                const ssoNombre = params.get('nombre')
                const ssoTel = params.get('tel')
                
                if (ssoCedula && !user) {
                    const loginSuccess = await login(ssoCedula)
                    if (!loginSuccess && ssoNombre && ssoTel) {
                        try {
                            await register(ssoNombre, ssoCedula, ssoTel)
                        } catch (e) {
                            console.error("SSO Register error", e)
                        }
                    }
                }
                router.replace('/', { scroll: false })
            }
        }
        
        if (!authLoading) {
            processSSO()
        }
    }, [authLoading, user, login, register, router])

    return (
        <div className="min-h-[100svh] bg-[#000B2A] text-white relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Layer (New Treasure Image with Cinematic Zoom) */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 will-change-transform"
                >
                    <Image
                        src="/bg-welcome.png"
                        alt="Fondo de Festival"
                        fill
                        className="object-cover opacity-100"
                        priority
                        quality={80}
                    />
                </motion.div>
                {/* Cinematic filters for depth and focus */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />

                {/* Golden radiant light from the bottom (Chest glow - Optimized blur) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[350px] bg-[radial-gradient(circle_at_center,rgba(255,183,0,0.12)_0%,transparent_70%)] blur-[60px] z-[5]" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

            {/* Main Content */}
            <main className="relative z-40 flex flex-col items-center justify-center min-h-[100svh] px-6 text-center pt-8 pb-12">
                
                {/* Logo Section (Refined for maximum prominence) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, type: "spring" }}
                    className="relative w-full max-w-[160px] aspect-[4/3] mb-4 flex items-center justify-center will-change-transform"
                >
                    {/* Glowing background to emulate logo drop shadow without CPU penalty */}
                    <motion.div 
                        animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-[-20%] inset-y-[-20%] bg-[#0066FF]/60 blur-[60px] rounded-full" 
                    />
                    
                    <Image
                        src="/logo-fest.png"
                        alt="Sushi Fest 2026 Logo"
                        width={280}
                        height={210}
                        className="w-full h-auto brightness-110 relative z-10"
                        priority
                    />

                    {/* Compass Icon - Independent Floating Parallax (Simplified) */}
                    <motion.div
                        animate={{ 
                            y: [0, -6, 0], 
                            rotate: [0, 3, -3, 0]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute top-[60%] left-1/2 -translate-x-1/2 z-[30] w-[100%] max-w-[180px]"
                    >
                        {/* Fake glow placeholder avoiding heavy CSS filter drop-shadow, moved up and constrained to prevent bleeding into text */}
                        <div className="absolute inset-x-8 inset-y-8 bg-yellow-500/30 blur-[15px] rounded-full -translate-y-4" />
                        <Image 
                            src="/compass.png" 
                            alt="Brújula del Tesoro" 
                            width={180} 
                            height={180} 
                            className="w-full relative z-10"
                        />
                    </motion.div>
                </motion.div>

                {/* Text Content - Simplified para performance */}
                <div className="mt-16 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="space-y-3"
                    >
                        <h2 className="text-white font-lilita text-xl md:text-2xl tracking-[0.25em] uppercase" style={{ textShadow: "0 4px 8px rgba(0,0,0,1)" }}>
                            Búsqueda del <span className="text-white">Tesoro</span>
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-lilita uppercase tracking-tight leading-[0.95] text-white my-2" style={{ textShadow: "0 10px 30px rgba(0,0,0,1)" }}>
                            ¡GANA <span className="italic">PREMIOS</span> INCREÍBLES!
                        </h1>
                        <p className="text-white/90 text-xs md:text-sm font-medium tracking-wide max-w-[380px] mx-auto leading-relaxed opacity-90" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                            Explora la ciudad, descubre nuevos sabores y desbloquea descuentos exclusivos en cada restaurante que visites.
                        </p>
                    </motion.div>
                </div>

                {/* CTA Button (Optimized Shimmer) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 1 }}
                    className="mt-10 w-full max-w-[280px] px-4 will-change-transform"
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
