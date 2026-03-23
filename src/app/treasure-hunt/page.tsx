'use client'

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { AuthModal } from "@/components/AuthModal"
import { Particles } from "@/components/Particles"
import { TreasureMap } from "@/components/TreasureMap"
import { QRScannerUI } from "@/components/QRScannerUI"
import { ScratchCard } from "@/components/ScratchCard"
import { SponsorBackground } from "@/components/SponsorBackground"
import { registerVisit, getTreasureHuntStatus, generateScratchPrize } from "@/actions/treasure-hunt"
import { supabase } from "@/lib/supabase"
import { Locale, TreasureHuntPrize } from "@/types"
import { Trophy, QrCode, Map as MapIcon, Gift, CheckCircle2 } from "lucide-react"

export default function TreasureHuntPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [locales, setLocales] = useState<Locale[]>([])
    const [visitedIds, setVisitedIds] = useState<string[]>([])
    const [prizes, setPrizes] = useState<TreasureHuntPrize[]>([])
    const [loading, setLoading] = useState(true)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [activePrizeLocale, setActivePrizeLocale] = useState<Locale | null>(null)
    const [currentPrize, setCurrentPrize] = useState<TreasureHuntPrize | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const { data: localesData } = await supabase.from('locales').select('*').order('name')
            setLocales(localesData || [])

            if (user) {
                const status = await getTreasureHuntStatus(user.id)
                setVisitedIds(status.visits.map(v => v.locale_id))
                setPrizes(status.prizes)
            }
        } catch (err) {
            console.error("Error fetching treasure hunt data:", err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true)
        }
    }, [user, authLoading])

    const handleScan = async (decodedText: string) => {
        // Assume decodedText is either the Locale ID or a URL containing it
        let localeId = decodedText
        if (decodedText.includes('id=')) {
            localeId = decodedText.split('id=')[1].split('&')[0]
        }

        const locale = locales.find(l => l.id === localeId || l.name.toLowerCase() === decodedText.toLowerCase())
        
        if (!locale) {
            alert("Código QR no reconocido. Asegúrate de estar escaneando el código oficial del restaurante.")
            return
        }

        if (!user) {
            setIsAuthModalOpen(true)
            return
        }

        const res = await registerVisit(user.id, locale.id)
        if (res.success) {
            if (!res.alreadyVisited) {
                // New visit! Show scratch card
                setActivePrizeLocale(locale)
                const prizeRes = await generateScratchPrize(user.id, locale.id)
                if (prizeRes.success && prizeRes.prize) {
                    setCurrentPrize(prizeRes.prize as TreasureHuntPrize)
                }
            } else {
                alert(`¡Ya has registrado tu visita en ${locale.name}!`)
            }
            fetchData()
        } else {
            alert(res.error)
        }
    }

    const handleScratchComplete = () => {
        // Feedback logic if needed
    }

    const closePrizeModal = () => {
        setActivePrizeLocale(null)
        setCurrentPrize(null)
    }

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-lilita uppercase tracking-widest text-white/60">Cargando el mapa...</p>
            </div>
        )
    }

    const progress = locales.length > 0 ? (visitedIds.length / locales.length) * 100 : 0

    return (
        <div className="h-[100svh] bg-background text-white relative overflow-hidden selection:bg-primary/30 font-sans">
            {/* Background Layer (Synchronized with Home) */}
            <div className="fixed top-0 left-0 w-full h-[100svh] md:h-screen md:inset-0 z-0 text-white">
                <div className="absolute inset-0 z-0 block md:hidden">
                    <Image
                        src="/bg-home-mobile.jpg"
                        alt="Mobile Background"
                        fill
                        className="object-cover opacity-50"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>
                <div className="absolute inset-0 z-0 hidden md:block">
                    <Image
                        src="/bg-home.jpg"
                        alt="Desktop Background"
                        fill
                        className="object-cover opacity-30"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>
                <Particles color="#0537BB" />
                <SponsorBackground />
            </div>

            {/* Main Content Layer */}
            <div className="relative z-10 flex flex-col h-full bg-gradient-to-b from-background/40 to-background/80 overflow-y-auto overflow-x-hidden">
                <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12 text-center max-w-lg md:max-w-4xl mx-auto w-full">
                    
                    {/* Header: Logo (Same as Home) */}
                    <div className="relative w-full max-w-[120px] md:max-w-[150px] aspect-square flex justify-center items-center mb-4">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="relative w-[100%] h-[100%] z-10"
                        >
                            <motion.div
                                className="w-full h-full relative"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Image
                                    src="/logo.png"
                                    alt="Sushifest"
                                    fill
                                    className="object-cover rounded-full drop-shadow-[0_0_25px_rgba(5,55,187,0.5)] filter brightness-110"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Golden Crown (Same as Home) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1, type: "spring" }}
                        className="-mt-12 relative z-20 mb-4"
                    >
                        <Image src="/crown.png" alt="Crown" width={100} height={80} className="w-[80px] md:w-[100px] h-auto drop-shadow-lg mx-auto" />
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-1 mb-8">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-lilita uppercase tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        >
                            Búsqueda del <span className="text-secondary">Tesoro</span>
                        </motion.h1>
                        <p className="text-white/60 text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] font-sans">
                            Sushifest Panamá 2026
                        </p>
                    </div>

                    {/* Progress Card (Stylized to match) */}
                    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 mb-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy size={60} />
                        </div>
                        
                        <div className="relative flex justify-between items-end mb-4 px-2">
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">Tu Ruta</p>
                                <h3 className="text-2xl font-lilita uppercase text-white">{visitedIds.length} / {locales.length} <span className="text-xs font-sans text-white/40 lowercase">lugares</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-lilita text-secondary drop-shadow-[0_0_10px_rgba(255,77,0,0.3)]">{Math.round(progress)}%</p>
                            </div>
                        </div>

                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary via-blue-500 to-blue-400 shadow-[0_0_15px_rgba(5,55,187,0.5)]"
                            />
                        </div>
                    </div>

                    {/* Map Section */}
                    <section className="w-full bg-background/20 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-4 mb-10 min-h-[400px]">
                        <div className="flex items-center gap-2 mb-6 px-4">
                            <MapIcon className="text-primary" size={18} />
                            <h2 className="text-lg font-lilita uppercase tracking-wider text-white/80">Mapa de la Victoria</h2>
                        </div>

                        <TreasureMap 
                            locales={locales} 
                            visitedIds={visitedIds} 
                            onLocaleClick={(l) => {
                                if (!visitedIds.includes(l.id)) {
                                    alert(`Visita "${l.name}" y escanea su código QR para desbloquearlo.`)
                                } else {
                                    const p = prizes.find(p => p.locale_id === l.id)
                                    alert(`Has visitado "${l.name}". ${p ? `Ganaste: ${p.prize_name}` : ""}`)
                                }
                            }} 
                        />
                    </section>

                    {/* CTA Button (Same Style as Home Start Voting) */}
                    <div className="w-full max-w-xs mb-20">
                        <motion.button
                            onClick={() => setIsScannerOpen(true)}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: 1,
                                boxShadow: ["0 0 10px rgba(5,55,187,0.25)", "0 0 30px rgba(5,55,187,0.45)", "0 0 10px rgba(5,55,187,0.25)"]
                            }}
                            whileHover={{ scale: 1.1, boxShadow: "0 0 50px rgba(5,55,187,0.8)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                default: { type: "spring", stiffness: 200, damping: 20 },
                                boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="group relative w-full bg-gradient-to-r from-primary to-blue-700 text-white font-lilita text-xl py-5 rounded-full border border-white/20 overflow-hidden flex items-center justify-center gap-3"
                        >
                            <QrCode size={24} className="relative z-10" />
                            <span className="relative z-10">ESCANEAR CÓDIGO QR 🔥</span>
                            
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </motion.button>
                    </div>

                    <footer className="pb-8 pt-4 text-center text-white/40 text-[10px] uppercase tracking-[0.2em] w-full">
                        <p>© 2026 SUSHIFEST • BY EPIC MARKETING • PANAMÁ</p>
                    </footer>
                </main>
            </div>

            {/* Modals */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onSuccess={fetchData}
            />

            <QRScannerUI 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />

            {/* Prize Modal */}
            <AnimatePresence>
                {activePrizeLocale && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-md bg-background border border-primary/30 rounded-[2.5rem] p-8 text-center overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                            
                            <p className="text-secondary font-lilita text-xl mb-2">¡NUEVO LOCAL DESBLOQUEADO!</p>
                            <h2 className="text-3xl font-lilita uppercase text-white mb-6">{activePrizeLocale.name}</h2>
                            
                            <ScratchCard onComplete={handleScratchComplete}>
                                <div className="space-y-4">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Tu premio es:</p>
                                    <h3 className="text-4xl font-lilita text-primary leading-tight">
                                        {currentPrize?.prize_name || "PROCESANDO..."}
                                    </h3>
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-primary border border-white/10">
                                            <Gift size={32} />
                                        </div>
                                    </div>
                                </div>
                            </ScratchCard>

                            <p className="mt-8 text-white/50 text-xs italic">
                                Raspa la tarjeta para descubrir tu premio.
                            </p>

                            <button
                                onClick={closePrizeModal}
                                className="mt-10 w-full bg-white/10 hover:bg-white/20 text-white font-lilita py-4 rounded-xl transition-colors uppercase tracking-widest text-sm"
                            >
                                Continuar mi viaje 🗺️
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
