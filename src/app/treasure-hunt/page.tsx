'use client'

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "@/components/AuthModal"
import { RiceParticles } from "@/components/RiceParticles"
import { TreasureMap } from "@/components/TreasureMap"
import { QRScannerUI } from "@/components/QRScannerUI"
import { ScratchCard } from "@/components/ScratchCard"
import { SponsorBackground } from "@/components/SponsorBackground"
import { registerVisit, getTreasureHuntStatus, generateScratchPrize } from "@/actions/treasure-hunt"
import { supabase } from "@/lib/supabase"
import { Locale, TreasureHuntPrize } from "@/types"
import { Trophy, QrCode, Map as MapIcon, Gift, CheckCircle2, LogOut, Sparkles, ArrowRight, X, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

export default function TreasureHuntPage() {
    const router = useRouter()
    const { user, isLoading: authLoading, logout } = useAuth()
    const [locales, setLocales] = useState<Locale[]>([])
    const [visitedIds, setVisitedIds] = useState<string[]>([])
    const [prizes, setPrizes] = useState<TreasureHuntPrize[]>([])
    const [loading, setLoading] = useState(true)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [activePrizeLocale, setActivePrizeLocale] = useState<Locale | null>(null)
    const [currentPrize, setCurrentPrize] = useState<TreasureHuntPrize | null>(null)
    const [isScratched, setIsScratched] = useState(false)
    const [viewingPrize, setViewingPrize] = useState<TreasureHuntPrize | null>(null)
    const [viewingPrizeIndex, setViewingPrizeIndex] = useState(1)

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

    const [prizeLoading, setPrizeLoading] = useState(false)
    const [prizeVisitNumber, setPrizeVisitNumber] = useState(1)

    const handleScan = async (decodedText: string) => {
        let localeId = decodedText
        if (decodedText.includes('id=')) {
            localeId = decodedText.split('id=')[1].split('&')[0]
        }

        const locale = locales.find(l => l.id === localeId || l.name.toLowerCase() === decodedText.toLowerCase())
        if (!locale) return

        if (!user) {
            setIsAuthModalOpen(true)
            return
        }

        setPrizeLoading(true)
        const res = await registerVisit(user.id, locale.id)
        if (res.success) {
            if (!res.alreadyVisited) {
                setActivePrizeLocale(locale)
                const prizeRes = await generateScratchPrize(user.id, locale.id)
                if (prizeRes.success && prizeRes.prize) {
                    setCurrentPrize(prizeRes.prize as TreasureHuntPrize)
                    if (prizeRes.visitNumber) setPrizeVisitNumber(prizeRes.visitNumber)
                } else {
                    alert(prizeRes.error || "Ocurrió un error al generar tu premio. Por favor intenta de nuevo.")
                    setActivePrizeLocale(null)
                }
            } else {
                alert(`¡Ya has registrado tu visita en ${locale.name}!`)
            }
            fetchData()
        } else {
            alert(res.error)
        }
        setPrizeLoading(false)
    }

    const handleScratchComplete = () => {
        setIsScratched(true)
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0066FF', '#00B2FF', '#FFFFFF', '#FFD700']
        })
    }

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-[100svh] bg-[#000B2A] flex flex-col items-center justify-center gap-6">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_rgba(0,178,255,0.4)]"
                />
                <p className="font-lilita uppercase tracking-[0.3em] text-white/40 text-sm animate-pulse">Cargando la Ruta...</p>
            </div>
        )
    }

    const progress = locales.length > 0 ? (visitedIds.length / locales.length) * 100 : 0

    return (
        <div className="min-h-[100svh] bg-[#000B2A] text-white relative overflow-hidden selection:bg-primary/30 font-sans">
            {/* Background Layer (Synchronized with Home) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/bg-treasure-home.png"
                        alt="Fondo de Festival"
                        fill
                        className="object-cover opacity-80"
                        priority
                        quality={100}
                    />
                </div>
                {/* Cinematic filters for depth and focus */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
                <div className="absolute inset-0 backdrop-blur-[1px]" />
            </div>

            <RiceParticles />
            <SponsorBackground />

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.6)_100%)]" />

            {/* Main Content Layer (Scrollable Wrapper) */}
            <div className="relative z-40 h-[100svh] overflow-y-auto custom-scrollbar">
                
                {/* Fixed Top Bar for UI utility */}
                <div className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <Link href="/" className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-black/60 transition-all active:scale-95 shadow-2xl">
                            <ArrowRight size={14} className="rotate-180" /> Inicio
                        </Link>
                    </div>
                    <div className="pointer-events-auto">
                        <button 
                            onClick={() => {
                                logout()
                                router.push('/')
                            }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-black/60 transition-all active:scale-95 shadow-2xl"
                        >
                            <LogOut size={14} /> Salir
                        </button>
                    </div>
                </div>

                <main className="flex flex-col items-center px-4 pb-24 text-center max-w-lg md:max-w-4xl mx-auto w-full pt-4">
                    
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full max-w-[140px] aspect-[4/3] mb-4 flex items-center justify-center"
                    >
                        <Image
                            src="/logo-fest.png"
                            alt="Sushi Fest 2026 Logo"
                            width={180}
                            height={130}
                            className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,178,255,0.5)] brightness-125 relative z-10"
                            priority
                        />
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2 mb-10">
                        <motion.h1 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-4xl md:text-6xl font-lilita uppercase tracking-tight leading-none text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]"
                        >
                            Tu Ruta al <span className="text-secondary italic">Tesoro</span>
                        </motion.h1>
                        <p className="text-white/40 text-[10px] md:text-xs uppercase font-black tracking-[0.4em] font-sans">
                            Sushifest Panamá • 2026 Edition
                        </p>
                    </div>

                    {/* Progress Card (Premium HUD Design) */}
                    <div className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 mb-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        {/* Internal pulse background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
                        
                        <div className="relative flex justify-between items-center mb-8 px-2 gap-4">
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-2">Restaurantes Visitados</p>
                                <h3 className="text-3xl md:text-4xl font-lilita uppercase text-white tracking-widest flex items-center gap-3">
                                    {visitedIds.length} <span className="text-white/20 text-xl font-sans">/</span> {locales.length}
                                </h3>
                            </div>
                            
                            <div className="text-right">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-20 h-20 -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="stroke-white/5 fill-none" strokeWidth="6" />
                                        <motion.circle 
                                            cx="40" cy="40" r="36" 
                                            className="stroke-primary fill-none shadow-[0_0_15px_rgba(0,71,255,0.5)]" 
                                            strokeWidth="6" 
                                            strokeDasharray="226.2"
                                            animate={{ strokeDashoffset: 226.2 - (226.2 * progress) / 100 }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-lilita text-secondary drop-shadow-[0_0_10px_rgba(255,122,0,0.4)]">{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Linear Progress Bar as backup/accent */}
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-8">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary animate-gradient-x shadow-[0_0_15px_rgba(0,71,255,0.6)]"
                            />
                        </div>

                        {/* Scan Button (Large Action) */}
                        <motion.button
                            onClick={() => setIsScannerOpen(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full relative h-20 rounded-2xl overflow-hidden flex items-center justify-center group shadow-[0_0_40px_rgba(0,178,255,0.3)] hover:shadow-[0_0_60px_rgba(0,178,255,0.5)] transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] bg-[length:200%_auto] animate-gradient-x" />
                            <div className="absolute inset-[2px] rounded-xl border border-white/40" />
                            <span className="relative z-10 text-white font-black text-xl md:text-2xl drop-shadow-2xl uppercase tracking-tighter flex items-center justify-center gap-4">
                                <QrCode size={28} className="group-hover:rotate-12 transition-transform duration-300" /> ESCANEAR QR PARA GANAR 🔥
                            </span>
                        </motion.button>
                    </div>

                    {/* Map Section (The HUD Map) */}
                    <section className="w-full bg-black/30 backdrop-blur-xl border border-white/5 rounded-[3rem] p-6 mb-16 min-h-[500px] shadow-inner relative">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-[3rem]" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <MapIcon className="text-secondary" size={20} />
                                <h2 className="text-xl font-lilita uppercase tracking-widest text-white/80">Mapa de la Victoria</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(0,71,255,0.8)]" />
                                    <span className="text-[10px] uppercase font-black text-white/50 tracking-wider">Visitado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-white/30" />
                                    <span className="text-[10px] uppercase font-black text-white/50 tracking-wider">Pendiente</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 p-2 md:p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <TreasureMap 
                                locales={locales} 
                                visitedIds={visitedIds} 
                                onLocaleClick={(l) => {
                                    if (!visitedIds.includes(l.id)) {
                                        // Cinematic Alert replacement or improved interaction
                                        alert(`Visita "${l.name}" y escanea su código QR para desbloquearlo.`)
                                    } else {
                                        const p = prizes.find(p => p.locale_id === l.id)
                                        // Future: Show a small "Memory card" for visited locales
                                    }
                                }} 
                            />
                        </div>
                    </section>

                    {/* Prizes / Recompensas Section (The Vault) */}
                    {prizes.filter(p => p.prize_type !== 'try_again').length > 0 && (
                        <div className="w-full mt-2 mb-20 text-left relative z-20">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-10">
                                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Gift className="text-primary w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-lilita uppercase tracking-tight text-white m-0">Mis Recompensas</h2>
                                    <p className="text-[10px] font-black uppercase text-secondary tracking-[0.3em] font-sans">The Vault • Panamá 2026</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {prizes.filter(p => p.prize_type !== 'try_again').map((prize, idx) => {
                                    const locale = locales.find(l => l.id === prize.locale_id)
                                    const isRedeemed = prize.is_redeemed
                                    
                                    return (
                                        <motion.div 
                                            key={prize.id} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => { setViewingPrize(prize); setViewingPrizeIndex(idx + 1) }}
                                            className={`group relative overflow-hidden rounded-3xl border p-5 flex items-center gap-6 transition-all duration-500 cursor-pointer shadow-2xl ${
                                                isRedeemed 
                                                    ? 'bg-black/40 border-white/5 grayscale opacity-60' 
                                                    : 'bg-black/60 border-white/10 hover:border-primary/50'
                                            }`}
                                        >
                                            {/* Glow effect on hover */}
                                            {!isRedeemed && (
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                            )}

                                            <div className="relative w-20 h-20 rounded-2xl bg-white/5 p-2 flex-shrink-0 flex items-center justify-center border border-white/10 overflow-hidden group-hover:bg-white/10 transition-colors shadow-inner">
                                                <Image 
                                                    src={locale?.image_url || "/logo-fest.png"} 
                                                    alt={locale?.name || "Restaurante"} 
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            <div className="flex-grow">
                                                <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-1">
                                                    {locale?.name || "RESTAURANTE"}
                                                </p>
                                                <h4 className={`text-xl font-lilita uppercase leading-none tracking-tight mb-3 ${isRedeemed ? 'text-white/60' : 'text-white'}`}>
                                                    {prize.prize_name}
                                                </h4>
                                                
                                                {isRedeemed ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Canjeado</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <motion.div 
                                                            animate={{ scale: [1, 1.2, 1] }} 
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="w-2 h-2 rounded-full bg-[#00FF85] shadow-[0_0_8px_#00FF85]" 
                                                        />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF85]">Disponible</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-shrink-0">
                                                <div className={`p-3 rounded-full border ${isRedeemed ? 'border-white/5 bg-white/5' : 'border-primary/20 bg-primary/10 group-hover:bg-primary/20 transition-colors'}`}>
                                                    {isRedeemed ? <CheckCircle2 className="w-5 h-5 text-white/20" /> : <Gift className="w-5 h-5 text-primary group-hover:animate-bounce" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <footer className="mt-auto py-12 text-center text-white/20 text-[10px] uppercase tracking-[0.5em] font-black">
                        <p>© 2026 SUSHIFEST • PANAMÁ</p>
                    </footer>
                </main>
            </div>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {isAuthModalOpen && (
                    <AuthModal 
                        onClose={() => setIsAuthModalOpen(false)} 
                        onSuccess={fetchData}
                    />
                )}
            </AnimatePresence>

            <QRScannerUI 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                locales={locales}
                visitedIds={visitedIds}
            />

            {/* Prize Unlocking Modal (Cinematic Reveal) */}
            <AnimatePresence>
                {activePrizeLocale && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                        />
                        
                        {/* Animated background particles for modal */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: [0, 0.5, 0], y: -200, x: Math.random() * 400 - 200 }}
                                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
                                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full blur-sm"
                                />
                            ))}
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 40, opacity: 0 }}
                            className="relative w-full max-w-xl bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-14 shadow-[0_0_120px_rgba(0,71,255,0.4)] overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
                            
                            <AnimatePresence mode="wait">
                                {isScratched && currentPrize ? (
                                    <motion.div
                                        key="success-content"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative z-10"
                                    >
                                        <div className="flex items-center justify-center gap-3 text-secondary mb-6">
                                            <Sparkles className="w-6 h-6 animate-pulse" />
                                            <span className="font-lilita text-2xl tracking-[0.3em] uppercase drop-shadow-lg">
                                                {currentPrize.prize_type === 'gift' ? '¡LEYENDA!' : '¡ÉXITO!'}
                                            </span>
                                            <Sparkles className="w-6 h-6 animate-pulse" />
                                        </div>

                                        <h2 className="text-4xl md:text-6xl font-lilita text-white italic tracking-tighter mb-4 uppercase leading-none drop-shadow-2xl">
                                            {currentPrize.prize_type === 'gift' ? 'TREMENDO PREMIO' : 'UN NUEVO DESCUENTO'}
                                        </h2>
                                        
                                        <p className="text-blue-200/60 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black mb-10 leading-relaxed">
                                            Has desbloqueado este beneficio en <span className="text-white">{activePrizeLocale.name}</span>
                                        </p>

                                        {/* Prize Visual Unit */}
                                        <div className="relative w-full aspect-video max-w-md mx-auto mb-10 group rounded-[2.5rem] overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50" />
                                            <div className="relative h-full w-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                                {currentPrize.prize_image ? (
                                                    <Image 
                                                        src={currentPrize.prize_image} 
                                                        alt="Premio" 
                                                        fill 
                                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                ) : (
                                                    <Gift className="text-secondary w-24 h-24 drop-shadow-[0_0_30px_rgba(255,122,0,0.6)]" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-8">
                                                    <h3 className="text-2xl md:text-3xl font-lilita text-white uppercase tracking-tight drop-shadow-md">
                                                        {currentPrize.prize_name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setActivePrizeLocale(null)
                                                setCurrentPrize(null)
                                                setIsScratched(false)
                                            }}
                                            className="w-full relative h-20 rounded-2xl overflow-hidden group shadow-[0_15px_40px_rgba(0,71,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] bg-[length:200%_auto] animate-gradient-x" />
                                            <span className="relative z-10 text-white font-lilita text-2xl uppercase tracking-widest flex items-center justify-center gap-4">
                                                GUARDAR EN MI VAULT <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
                                            </span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="scratch-content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="relative z-10"
                                    >
                                        <div className="mb-8">
                                            <p className="text-secondary font-lilita text-2xl mb-2 tracking-widest uppercase italic">¡DESTINO ALCANZADO!</p>
                                            <h2 className="text-3xl md:text-4xl font-lilita uppercase text-white/95 tracking-tight">{activePrizeLocale?.name}</h2>
                                        </div>

                                        <div className="relative group mb-8 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-white/10">
                                            <ScratchCard onComplete={handleScratchComplete}>
                                                <div className="absolute inset-0 w-full h-full bg-black">
                                                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                                                        {prizeLoading ? (
                                                            <div className="flex flex-col items-center gap-6">
                                                                <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                                <p className="font-lilita text-white/40 uppercase tracking-[0.4em] text-[10px]">Consultando a los Dioses del Sushi...</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Image
                                                                    src={currentPrize?.prize_type === 'gift' 
                                                                        ? `/demo-prize-${((prizeVisitNumber - 1) % 4) + 1}.jpg`
                                                                        : `/discount-${((prizeVisitNumber - 1) % 3) + 1}.jpeg`
                                                                    }
                                                                    alt="Desbloqueado"
                                                                    fill
                                                                    className="object-cover"
                                                                    priority
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="text-center p-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl transform rotate-3 shadow-2xl">
                                                                        <Gift size={40} className="text-secondary mx-auto mb-2" />
                                                                        <h4 className="text-white font-lilita text-xl uppercase tracking-tighter leading-none">Tu Sorpresa</h4>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </ScratchCard>
                                        </div>

                                        <div className="flex flex-col items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.5em]">Raspa para revelar</p>
                                                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
                                            </div>

                                            <button
                                                onClick={() => setActivePrizeLocale(null)}
                                                className="text-white/30 hover:text-white/60 font-black text-[10px] uppercase tracking-[0.3em] transition-colors py-4 px-8 border border-white/5 rounded-full hover:bg-white/5"
                                            >
                                                Cerrar por ahora
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reward Viewer Modal (The Vault Detail) */}
            <AnimatePresence>
                {viewingPrize && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingPrize(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-[30px]"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="relative w-full max-w-sm aspect-[3/4] bg-[#000B2A] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)]"
                        >
                            {/* Glass Close Button */}
                            <button 
                                onClick={() => setViewingPrize(null)}
                                className="absolute top-6 right-6 z-[130] bg-black/40 backdrop-blur-2xl border border-white/10 p-4 rounded-full text-white shadow-2xl hover:bg-black/60 hover:scale-110 active:scale-90 transition-all group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>

                            <div className="relative w-full h-full">
                                <Image
                                    src={viewingPrize.prize_type === 'gift' 
                                        ? `/demo-prize-${((viewingPrizeIndex - 1) % 4) + 1}.jpg`
                                        : `/discount-${((viewingPrizeIndex - 1) % 3) + 1}.jpeg`
                                    }
                                    alt="Benefit"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Bottom Info Fade */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-10 left-0 w-full px-10 text-center">
                                    <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
                                    <h3 className="text-3xl md:text-4xl font-lilita text-white uppercase tracking-tight leading-none mb-4 drop-shadow-xl">
                                        {viewingPrize.prize_name}
                                    </h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Cupón ID: SF-{viewingPrize.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 71, 255, 0.2);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 71, 255, 0.4);
                }
            `}</style>
        </div>
    )
}
