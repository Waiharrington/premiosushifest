'use client'

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "@/components/AuthModal"
import { RiceParticles } from "@/components/RiceParticles"
import { VerticalQuestTrail } from "@/components/VerticalQuestTrail"
import { SushifestLoader } from "@/components/SushifestLoader"
import { QRScannerUI } from "@/components/QRScannerUI"
import { ScratchCard } from "@/components/ScratchCard"
import { SponsorBackground } from "@/components/SponsorBackground"
import { MysteryModal } from "@/components/MysteryModal"
import { registerVisit, getTreasureHuntStatus, generateScratchPrize } from "@/actions/treasure-hunt"



import { supabase } from "@/lib/supabase"
import { Locale, TreasureHuntPrize } from "@/types"
import { QrCode, Map as MapIcon, Gift, CheckCircle2, LogOut, Sparkles, ArrowRight, X } from "lucide-react"
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
    const [hasMounted, setHasMounted] = useState(false)
    const [isMysteryModalOpen, setIsMysteryModalOpen] = useState(false)


    useEffect(() => {
        setHasMounted(true)
    }, [])

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
            colors: ['#0038A8', '#00D1FF', '#FFFFFF', '#FF4B1F']

        })
    }


    const progress = locales.length > 0 ? (visitedIds.length / locales.length) * 100 : 0

    if (!hasMounted || authLoading || (loading && user)) {
        return <SushifestLoader />
    }

    return (
        <div className="min-h-[100svh] bg-[#000818] text-white relative overflow-hidden selection:bg-primary/30 font-sans">

            {/* Background Layer - Sushi Pattern */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                    src="/bg-treasure-home.png"
                    alt="Fondo de Festival"
                    fill
                    className="object-cover opacity-95"
                    priority
                    quality={100}
                />
                {/* Light overlay to keep text readable without hiding the sushi pattern */}
                <div className="absolute inset-0 bg-[#030818]/50" />
            </div>

            <RiceParticles />
            <div className="fixed inset-0 z-10 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,178,255,0.15)_0%,transparent_70%)]" />
            <SponsorBackground />


            {/* Subtle vignette around edges */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)]" />

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
                                       {/* HUD Central Card — Premium Glassmorphism */}
                    <div className="w-full max-w-lg mb-8 relative p-0.5 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
                        <div className="bg-[#0A0A0B]/80 backdrop-blur-3xl rounded-[2.8rem] p-6 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            
                            {/* Top HUD Info — Improved Spacing */}
                            <div className="flex items-center gap-4 mb-6 pr-1">
                                {/* Enhanced Glowing Logo Container */}
                                <div className="relative group shrink-0">
                                    <div className="absolute inset-0 bg-[#FF4B1F]/20 blur-xl rounded-full animate-pulse" />
                                    <div className="relative w-16 h-16 rounded-full border-2 border-[#FF4B1F]/40 shadow-[0_0_30px_rgba(255,75,31,0.4)] bg-black/40 flex items-center justify-center p-1 overflow-hidden ring-4 ring-[#FF4B1F]/5">
                                        <Image src="/logo-fest.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>

                                {/* Dynamic Impact Title */}
                                <div className="flex-grow text-left">
                                    <h1 className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-white/50 tracking-[0.3em] mb-0.5">Tu Búsqueda del</span>
                                        <span className="text-[22px] font-lilita leading-tight text-white uppercase tracking-tight whitespace-nowrap">
                                            ¡Tesoro <span className="text-[#FF4B1F] drop-shadow-[0_0_15px_rgba(255,75,31,0.5)]">Saga!</span>
                                        </span>
                                    </h1>
                                    <p className="text-[7px] font-black uppercase text-[#00D1FF] tracking-[0.3em] mt-0.5 opacity-80">Explora • Escanea • Gana</p>
                                </div>


                                {/* Revelados Counter (Badge Style) — Centering & Padding Fix */}
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] px-4 py-4 flex flex-col items-center justify-center min-w-[80px] backdrop-blur-md shadow-inner shrink-0">
                                    <div className="text-[20px] font-lilita text-white flex items-center justify-center gap-1 leading-none">
                                        <span>{visitedIds.length}</span>
                                        <span className="text-[#00D1FF] opacity-80">/</span>
                                        <span>{locales.length}</span>
                                    </div>
                                    <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5">MAPA</div>
                                </div>
                            </div>

                            {/* Neon Power Progress Bar */}
                            <div className="relative mb-8 pt-1">
                                <div className="flex justify-between items-end mb-2 px-1">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Progreso de la Misión</span>
                                    <span className="text-[11px] font-lilita text-[#00D1FF]">{Math.round(progress)}%</span>
                                </div>
                                <div className="relative h-4 w-full bg-black/60 rounded-full border border-white/5 p-1 overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-[#0038A8] via-[#00D1FF] to-[#0038A8] rounded-full shadow-[0_0_15px_rgba(0,178,255,0.6)] relative overflow-hidden"
                                     >
                                         <motion.div
                                             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"
                                             animate={{ x: ['-200%', '200%'] }}
                                             transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                         />
                                     </motion.div>
                                </div>
                            </div>

                            {/* Big Action Scanner Button — High Contrast */}
                            <motion.button
                                onClick={() => setIsScannerOpen(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-16 rounded-[1.8rem] bg-gradient-to-r from-[#0038A8] via-[#0066FF] to-[#0038A8] shadow-[0_15px_40px_rgba(0,56,168,0.5)] flex items-center justify-center gap-4 border border-white/20 relative overflow-hidden group active:scale-95"
                            >
                                <div className="absolute inset-0 bg-[#00D1FF]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <QrCode size={26} className="text-[#00D1FF]" />
                                <span className="text-white font-lilita text-2xl uppercase tracking-wider drop-shadow-md">Escanear QR <span className="text-white">🚀</span></span>
                            </motion.button>

                        </div>
                    </div>
                    {/* Map Section (The QUEST Trail) */}
                    <section className="w-full relative py-2">
                        <div className="relative z-10 w-full px-4">
                            {locales.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-black/20 backdrop-blur-md rounded-[3rem] border border-white/5">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                        <MapIcon size={32} className="text-white/20" />
                                    </div>
                                    <h3 className="text-xl font-lilita text-white uppercase tracking-wider mb-2">Saga en Mantenimiento</h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] max-w-[240px] leading-relaxed mb-6">
                                        Exploración temporalmente pausada...
                                    </p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2 bg-[#0038A8]/20 hover:bg-[#0038A8]/40 border border-white/10 rounded-full font-bold text-[9px] uppercase tracking-[0.2em] transition-all"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            ) : (
                                <VerticalQuestTrail 
                                    locales={locales} 
                                    visitedIds={visitedIds} 
                                    onLocaleClick={(l) => {
                                        if (!visitedIds.includes(l.id)) {
                                            setIsMysteryModalOpen(true)
                                        }
                                    }} 
                                />

                            )}
                        </div>
                    </section>


                    {/* Prizes / Recompensas Section (Tesoros de la Saga) */}
                    {prizes.filter(p => p.prize_type !== 'try_again').length > 0 && (
                        <div className="w-full mt-12 mb-24 px-4 relative z-20">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#FF4B1F]/30 to-[#FF9000]/10 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,75,31,0.2)]">
                                        <Gift className="text-[#FF4B1F] w-7 h-7" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-lilita uppercase tracking-tight text-white m-0">Mis Recompensas</h2>
                                        <p className="text-[10px] font-black uppercase text-orange-500/80 tracking-[0.4em] font-sans">Tesoros de la Saga • 2026</p>
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {prizes.filter(p => p.prize_type !== 'try_again').map((prize, idx) => {
                                    const locale = locales.find(l => l.id === prize.locale_id)
                                    const isRedeemed = prize.is_redeemed
                                    
                                    return (
                                        <motion.div 
                                            key={prize.id} 
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            onClick={() => { setViewingPrize(prize); setViewingPrizeIndex(idx + 1) }}
                                            className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                                                isRedeemed 
                                                    ? 'bg-black/40 border-white/5 backdrop-blur-md opacity-60' 
                                                    : 'bg-white/5 backdrop-blur-2xl border-white/10 hover:border-orange-500/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-5 p-4 py-5 relative z-10">
                                                {/* Logo Orb */}
                                                <div className="relative w-16 h-16 rounded-2xl bg-white/10 p-2 flex-shrink-0 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                                                    <Image 
                                                        src={locale?.image_url || "/logo-fest.png"} 
                                                        alt={locale?.name || "Restaurante"} 
                                                        width={64}
                                                        height={64}
                                                        className={`w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 ${isRedeemed ? 'grayscale' : ''}`}
                                                    />
                                                </div>

                                                <div className="flex-grow">
                                                    <div className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 mb-1.5">
                                                        <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.25em]">
                                                            {locale?.name || "RESTAURANTE"}
                                                        </span>
                                                    </div>
                                                    <h4 className={`text-xl font-lilita uppercase leading-tight tracking-normal ${isRedeemed ? 'text-white/40 line-through decoration-orange-500/30' : 'text-white'}`}>
                                                        {prize.prize_name}
                                                    </h4>
                                                    
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {isRedeemed ? (
                                                            <div className="px-2 py-0.5 rounded-full border border-white/5 bg-white/5 flex items-center gap-1.5">
                                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">TESORO COBRADO</span>
                                                            </div>
                                                        ) : (
                                                            <div className="px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/5 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF85] shadow-[0_0_8px_#00FF85] animate-pulse" />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#00FF85]">DISPONIBLE</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 pr-2">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                                                        isRedeemed 
                                                            ? 'border-white/5 bg-white/5' 
                                                            : 'border-orange-500/20 bg-orange-500/10 shadow-[0_0_15px_rgba(255,144,0,0.1)] group-hover:bg-orange-500/20 group-hover:scale-110'
                                                    }`}>
                                                        {isRedeemed ? <CheckCircle2 className="w-4 h-4 text-white/20" /> : <Gift className="w-4 h-4 text-[#FF4B1F]" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Minimalist interactive scanline on hover */}
                                            {!isRedeemed && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Map Footer HUD (Mission Pods) — High Impact & Integrated */}
                    <div className="w-full max-w-lg mt-12 grid grid-cols-2 gap-4 relative z-50">
                        {/* Conquistados Card */}
                        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-95 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4B1F] shadow-[0_0_15px_#FF4B1F]" />
                            
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[#FF4B1F] shrink-0" />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest whitespace-nowrap">Conquistados ⛩️</span>
                            </div>
                            
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-lilita text-white">{visitedIds.length}</span>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">Locales</span>
                            </div>
                        </div>

                        {/* Por Descubrir Card */}
                        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-95 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#00D1FF] shadow-[0_0_15px_#00D1FF]" />

                            <div className="flex items-center gap-2">
                                <MapIcon size={14} className="text-[#00D1FF] shrink-0" />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest whitespace-nowrap">Por Descubrir 🗺️</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-lilita text-[#00D1FF]">{locales.length - visitedIds.length}</span>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">Puntos</span>
                            </div>
                        </div>
                    </div>


                    {/* DEBUG BUTTONS - Testing Only */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setVisitedIds(locales.slice(0, 30).map(l => l.id))}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-400 transition-all active:scale-95"
                        >
                            🔓 Desbloquear Todos (Test)
                        </button>
                        <button 
                            onClick={() => setVisitedIds([])}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 transition-all active:scale-95"
                        >
                            🧹 Limpiar Todo (Test)
                        </button>
                    </div>

                    <footer className="mt-12 py-6 text-center text-white/10 text-[8px] uppercase tracking-[0.4em] font-black">
                        <p>© 2026 SUSHIFEST • PANAMÁ</p>
                    </footer>
                </main>
            </div>

            {/* Explorador Mascota Fija (Mobile Guide) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ 
                    x: 0, 
                    opacity: 1,
                    y: [0, -10, 0] 
                }}
                transition={{ 
                    x: { duration: 0.8, ease: "easeOut" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="fixed bottom-6 left-4 z-50 pointer-events-none"
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-[#00D1FF]/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image 
                        src="/assets/character-explorer.png" 
                        alt="Explorador Guide" 
                        width={160} 
                        height={160} 
                        className="w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                    />
                </div>
            </motion.div>



            {/* Modals & Overlays */}
            <AnimatePresence>
                {isAuthModalOpen && (
                    <AuthModal 
                        onClose={() => setIsAuthModalOpen(false)} 
                        onSuccess={fetchData}
                    />
                )}

                
                {isMysteryModalOpen && (
                    <MysteryModal 
                        isOpen={isMysteryModalOpen} 
                        onClose={() => setIsMysteryModalOpen(false)} 
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
                                            Has desbloqueado este beneficio en <span className="text-white">{activePrizeLocale?.name}</span>
                                        </p>

                                        {/* Prize Visual Unit */}
                                        <div className="relative w-full aspect-video max-w-md mx-auto mb-10 group rounded-[2.5rem] overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50" />
                                            <div className="relative h-full w-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                                {currentPrize?.prize_image ? (
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
                                                        {currentPrize?.prize_name}
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
                                title="Cerrar vista de premio"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>

                            <div className="relative w-full h-full">
                                <Image
                                    src={viewingPrize?.prize_type === 'gift' 
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
                                        {viewingPrize?.prize_name}
                                    </h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Cupón ID: SF-{viewingPrize?.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
