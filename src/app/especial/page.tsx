'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "@/components/AuthModal"
import { RiceParticles } from "@/components/RiceParticles"
import { SponsorBackground } from "@/components/SponsorBackground"
import { awardGrandPrize } from "@/actions/treasure-hunt"
import { Trophy, Gift, Star, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function SpecialAwardPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")
    const [awardedLocales, setAwardedLocales] = useState<string[]>([])
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true)
        } else if (user && status === 'idle') {
            handleClaim()
        }
    }, [user, authLoading, status])

    const handleClaim = async () => {
        if (!user) return
        setStatus('loading')
        try {
            const res = await awardGrandPrize(user.id)
            if (res.success) {
                setStatus('success')
                setAwardedLocales(res.awardedTo || [])
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0066FF', '#00B2FF', '#FFFFFF', '#FFD700']
                })
            } else {
                setStatus('error')
                setMessage(res.error || "No se pudo procesar el premio.")
            }
        } catch (err) {
            setStatus('error')
            setMessage("Hubo un error de conexión.")
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-[100svh] bg-background text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bg-welcome-premium.png"
                    alt="Fondo"
                    fill
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-background/80 to-background" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
                <AnimatePresence mode="wait">
                    {status === 'loading' && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="relative w-24 h-24 mx-auto">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Star className="text-primary animate-pulse" size={32} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-lilita uppercase tracking-widest animate-pulse">Procesando tu Regalo...</h2>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="max-w-md w-full"
                        >
                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/50 shadow-[0_0_30px_rgba(0,178,255,0.4)]">
                                <Trophy className="text-primary" size={48} />
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-lilita uppercase mb-2 text-white">¡FELICIDADES!</h1>
                            <p className="text-secondary font-lilita text-xl mb-8 tracking-wider">TE GANASTE EL PREMIO DE CORTESÍA</p>
                            
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 mb-8 space-y-6">
                                <p className="text-white/60 text-xs uppercase font-bold tracking-widest">Has ganado 3 platos gratis en:</p>
                                <div className="space-y-3">
                                    {awardedLocales.map((name, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                                                <Gift size={20} />
                                            </div>
                                            <span className="font-lilita uppercase text-lg text-white">{name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-white/40 uppercase tracking-tighter leading-relaxed">
                                    Encuentra tus vales en la sección "Mis Recompensas" de tu mapa.
                                </p>
                            </div>

                            <Link href="/treasure-hunt" className="block w-full">
                                <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-lilita py-6 rounded-2xl text-xl shadow-xl flex items-center justify-center gap-3 group">
                                    VER MIS PREMIOS <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-sm"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                <Star className="text-red-500 opacity-50" size={40} />
                            </div>
                            <h2 className="text-2xl font-lilita uppercase text-white mb-4">Ups...</h2>
                            <p className="text-white/60 mb-8 leading-relaxed italic">{message}</p>
                            <Link href="/treasure-hunt" className="text-primary font-bold uppercase tracking-widest text-sm hover:underline">
                                Volver al Mapa
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {isAuthModalOpen && (
                <AuthModal 
                    onClose={() => setIsAuthModalOpen(false)} 
                    onSuccess={() => setStatus('idle')}
                />
            )}
        </div>
    )
}

function Button({ children, className, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-8 py-4 rounded-xl font-bold transition-all active:scale-95 ${className}`}
        >
            {children}
        </button>
    )
}
