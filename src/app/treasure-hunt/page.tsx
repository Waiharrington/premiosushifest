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
        <div className="min-h-screen bg-background text-white relative overflow-x-hidden pb-20">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image src="/bg-home.jpg" alt="BG" fill className="object-cover opacity-20" unoptimized />
                <Particles color="#0537BB" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-10">
                {/* Header */}
                <header className="text-center mb-8 space-y-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex justify-center"
                    >
                        <Image src="/logo.png" alt="Sushifest" width={80} height={80} className="rounded-full" />
                    </motion.div>
                    
                    <div className="space-y-1">
                        <h1 className="text-4xl font-lilita uppercase tracking-tight leading-none text-white drop-shadow-lg">
                            Búsqueda del <span className="text-secondary">Tesoro</span>
                        </h1>
                        <p className="text-white/60 text-xs uppercase font-bold tracking-[0.2em]">
                            Sushifest Panamá 2026
                        </p>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mt-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy size={80} />
                        </div>
                        
                        <div className="relative flex justify-between items-end mb-4">
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">Tu Progreso</p>
                                <h3 className="text-2xl font-lilita uppercase">{visitedIds.length} / {locales.length} <span className="text-sm font-sans text-white/40">Locales</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-lilita text-secondary">{Math.round(progress)}%</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-blue-600 shadow-[0_0_15px_rgba(5,55,187,0.5)]"
                            />
                        </div>

                        <p className="mt-4 text-[10px] text-white/40 uppercase font-medium leading-tight">
                            ¡Visita todos los locales para participar por el <span className="text-primary font-bold">PREMIO MAYOR</span>!
                        </p>
                    </div>
                </header>

                {/* Map Section */}
                <section className="bg-background/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-4 mb-10 min-h-[400px]">
                    <div className="flex items-center gap-2 mb-6 px-4">
                        <MapIcon className="text-primary" size={18} />
                        <h2 className="text-lg font-lilita uppercase tracking-wider">Mapa de la Ruta</h2>
                    </div>

                    <TreasureMap 
                        locales={locales} 
                        visitedIds={visitedIds} 
                        onLocaleClick={(l) => {
                            if (!visitedIds.includes(l.id)) {
                                alert(`Visita "${l.name}" y escanea su código QR para desbloquearlo.`)
                            } else {
                                // show prize ?
                                const p = prizes.find(p => p.locale_id === l.id)
                                alert(`Has visitado "${l.name}". ${p ? `Ganaste: ${p.prize_name}` : ""}`)
                            }
                        }} 
                    />
                </section>

                {/* Instructions */}
                <section className="space-y-4 mb-20 px-4">
                    <h3 className="text-sm font-lilita uppercase text-white/60 tracking-widest text-center">¿Cómo funciona?</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: QrCode, text: "Escanea el código QR oficial en el local." },
                            { icon: Gift, text: "Gana un premio instantáneo con el raspadito." },
                            { icon: CheckCircle2, text: "Completa la ruta y sé el primero en ganar el iPhone." }
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                    <step.icon size={20} />
                                </div>
                                <p className="text-xs font-medium text-white/80">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 px-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full max-w-xs bg-gradient-to-r from-primary to-blue-700 text-white font-lilita text-xl py-5 rounded-2xl shadow-[0_15px_30px_rgba(5,55,187,0.4)] border border-white/20 flex items-center justify-center gap-3"
                >
                    <QrCode size={24} />
                    ESCANEAR VISITA 🔥
                </motion.button>
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
