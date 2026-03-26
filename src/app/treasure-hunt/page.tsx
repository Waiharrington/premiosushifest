'use client'

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
import { Trophy, QrCode, Map as MapIcon, Gift, CheckCircle2, Tag, HelpCircle, LogOut, Heart, Sparkles, ArrowRight, X } from "lucide-react"
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
        // ... decodedText logic ...
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

    const closePrizeModal = () => {
        setActivePrizeLocale(null)
        setCurrentPrize(null)
        setIsScratched(false)
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
          {/* Overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>

        <RiceParticles />
        <SponsorBackground />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.5)_100%)]" />

            {/* Main Content Layer */}
            <div className="relative z-10 flex flex-col h-full bg-gradient-to-b from-background/40 to-background/80 overflow-y-auto overflow-x-hidden">
                {/* Logout Button (Floating Top Right) */}
                <div className="absolute top-4 right-4 z-50">
                    <button 
                        onClick={() => {
                            logout()
                            router.push('/')
                        }}
                        className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 transition-colors"
                    >
                        <LogOut size={14} /> Salir
                    </button>
                </div>

                <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12 text-center max-w-lg md:max-w-4xl mx-auto w-full">
                    
                    {/* Header: Logo (Same as Home) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative w-full max-w-[155px] aspect-[4/3] mb-4 flex items-center justify-center"
                    >
                        {/* Pulsing blue glow behind logo */}
                        <motion.div 
                            animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.8, 1.1, 0.8] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-x-[-20%] inset-y-[-20%] bg-[#0066FF]/40 blur-[85px] rounded-full" 
                        />
                        
                        <Image
                            src="/logo-fest.png"
                            alt="Sushi Fest 2026 Logo"
                            width={200}
                            height={150}
                            className="w-full h-auto drop-shadow-[0_0_20px_rgba(0,178,255,0.6)] brightness-110 relative z-10"
                            priority
                        />

                        {/* Golden crown below logo - Independent Parallax */}
                        <motion.div
                            animate={{ y: [0, -6, 0], x: [0, 2, 0], scale: [1, 1.1, 1], rotate: [0, 2, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 z-20 w-44 h-auto"
                        >
                            <Image 
                                src="/crown.png" 
                                alt="Corona" 
                                width={160} 
                                height={130} 
                                className="w-full drop-shadow-[0_8px_25px_rgba(255,183,0,0.6)]"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-1 mb-8 mt-14">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-lilita uppercase tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                            style={{ textShadow: '0 8px 16px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,1)' }}
                        >
                            Búsqueda del <span className="text-[#00B2FF]">Tesoro</span>
                        </motion.h1>
                        <p className="text-white/90 text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] font-sans">
                            Sushifest Panamá 2026
                        </p>
                    </div>

                    {/* Progress Card (Stylized to match) */}
                    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 mb-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy size={60} />
                        </div>
                        
                        <div className="relative flex justify-between items-center mb-4 px-2 gap-2 md:gap-4">
                            <div className="text-left flex-shrink-0">
                                <p className="text-[10px] md:text-xs uppercase font-bold text-primary tracking-widest mb-1">Tu Ruta</p>
                                <h3 className="text-xl md:text-2xl font-lilita uppercase text-white">{visitedIds.length} / {locales.length}</h3>
                            </div>
                            
                            {/* Scan Button inside Header */}
                            <motion.button
                                onClick={() => setIsScannerOpen(true)}
                                whileTap={{ scale: 0.95 }}
                                className="group relative h-10 md:h-12 px-3 md:px-6 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(0,178,255,0.4)] flex-grow max-w-[220px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-[#00B2FF] to-[#0066FF] bg-[length:200%_auto] animate-gradient-x" />
                                <div className="absolute inset-[1px] rounded-full border border-white/30" />
                                <span className="relative z-10 text-white font-black text-[12px] md:text-sm drop-shadow-md uppercase tracking-tight flex items-center justify-center gap-2">
                                    <QrCode size={16} /> <span className="hidden sm:inline">ESCANEAR CÓDIGO</span><span className="sm:hidden">SCAN</span> 🔥
                                </span>
                            </motion.button>

                            <div className="text-right flex-shrink-0">
                                <p className="text-2xl md:text-3xl font-lilita text-secondary drop-shadow-[0_0_10px_rgba(255,77,0,0.3)]">{Math.round(progress)}%</p>
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

                    {/* Prizes / Giftcards Section */}
                    {prizes.filter(p => Math.random() > -1 && p.prize_type !== 'try_again').length > 0 && (
                        <div className="w-full mt-2 mb-20 text-left relative z-20">
                            <h2 className="text-2xl font-lilita uppercase tracking-wider text-white mb-6 flex items-center gap-3 justify-center md:justify-start">
                                <Gift className="text-primary w-6 h-6" /> Mis Recompensas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {prizes.filter(p => p.prize_type !== 'try_again').map(prize => {
                                    const locale = locales.find(l => l.id === prize.locale_id)
                                    const isRedeemed = prize.is_redeemed
                                    
                                    return (
                                        <div 
                                            key={prize.id} 
                                            onClick={() => setViewingPrize(prize)}
                                            className={`relative overflow-hidden rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                                isRedeemed 
                                                    ? 'bg-slate-900/80 border-slate-800 grayscale opacity-70' 
                                                    : 'bg-gradient-to-br from-blue-900/60 to-primary/30 border-primary/50 shadow-[0_4px_20px_rgba(0,102,255,0.3)] backdrop-blur-md'
                                            }`}
                                        >
                                            <div className="w-16 h-16 rounded-xl bg-white/10 p-2 flex-shrink-0 flex items-center justify-center border border-white/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={locale?.image_url || "/logo.png"} 
                                                    alt={locale?.name || "Restaurante"} 
                                                    className="w-full h-full object-contain drop-shadow-md"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] font-bold uppercase text-white/60 tracking-[0.2em] mb-1">
                                                    {locale?.name || "Desconocido"}
                                                </p>
                                                <h4 className={`text-lg font-black uppercase leading-tight drop-shadow-md ${isRedeemed ? 'text-white' : 'text-[#00B2FF]'}`}>
                                                    {prize.prize_name}
                                                </h4>
                                                {isRedeemed ? (
                                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded shadow-inner">
                                                        <CheckCircle2 className="w-3 h-3 inline mr-1" /> Usado
                                                    </span>
                                                ) : (
                                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 shadow-sm backdrop-blur-sm">
                                                        Válido para canjear
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {!prizes.some(p => p.prize_type !== 'try_again') && (
                        <div className="mb-20" /> // Spacer if no prizes to maintain footer distance
                    )}

                    <footer className="pb-8 pt-4 text-center text-white/40 text-[10px] uppercase tracking-[0.2em] w-full">
                        <p>© 2026 SUSHIFEST • BY EPIC MARKETING • PANAMÁ</p>
                    </footer>
                </main>
            </div>

            {/* Modals */}
            {isAuthModalOpen && (
                <AuthModal 
                    onClose={() => setIsAuthModalOpen(false)} 
                    onSuccess={fetchData}
                />
            )}

            <QRScannerUI 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                locales={locales}
                visitedIds={visitedIds}
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
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full max-w-lg bg-[#000B2A]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,71,255,0.3)] overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                            
                            <AnimatePresence mode="wait">
                                {isScratched && currentPrize ? (
                                    <motion.div
                                        key="success-content"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-secondary mb-4">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                            <span className="font-lilita text-xl tracking-widest uppercase">
                                                {currentPrize.prize_type === 'gift' ? '¡INCREÍBLE!' : '¡GENIAL!'}
                                            </span>
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                        </div>

                                        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 font-lilita uppercase leading-tight">
                                            {currentPrize.prize_type === 'gift' ? '¡TE GANASTE UN PREMIO!' : '¡TIENES UN DESCUENTO!'}
                                        </h2>
                                        <p className="text-blue-200 text-sm uppercase tracking-[0.3em] font-bold mb-8">
                                            {currentPrize.prize_type === 'gift' ? 'NUEVO REGALO DESBLOQUEADO' : 'CUPÓN DE DESCUENTO ACTIVO'}
                                        </p>

                                        {/* Prize Image/Icon */}
                                        <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-8 group">
                                            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl group-hover:bg-primary/30 transition-colors" />
                                            <div className="relative h-full w-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                                {currentPrize.prize_image ? (
                                                    <Image 
                                                        src={currentPrize.prize_image} 
                                                        alt="Premio" 
                                                        fill 
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Trophy className="text-secondary w-24 h-24 drop-shadow-[0_0_20px_rgba(255,122,0,0.5)]" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 transform hover:scale-[1.02] transition-transform">
                                            <p className="text-secondary font-lilita text-xs mb-2 uppercase tracking-widest">Contenido del Cupón</p>
                                            <h3 className="text-2xl font-black text-white uppercase font-lilita tracking-tight">
                                                {currentPrize.prize_name}
                                            </h3>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setActivePrizeLocale(null)
                                                setCurrentPrize(null)
                                                setIsScratched(false)
                                            }}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-lilita text-xl py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,71,255,0.4)] transition-all active:scale-[0.98] group flex items-center justify-center gap-3"
                                        >
                                            {currentPrize.prize_type === 'gift' ? '¡LO QUIERO!' : '¡GENIAL!'}
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="normal-content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center"
                                    >
                                        <div className="mb-6">
                                            <p className="text-secondary font-lilita text-xl mb-1 tracking-wider">¡NUEVO LOCAL DESBLOQUEADO!</p>
                                            <h2 className="text-3xl font-lilita uppercase text-white/90">{activePrizeLocale?.name}</h2>
                                        </div>

                                        <div className="relative group mb-6">
                                            <ScratchCard onComplete={handleScratchComplete}>
                                                <div className="absolute inset-0 w-full h-full bg-black">
                                                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                                                        {prizeLoading ? (
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                                <p className="font-lilita text-white/60 uppercase tracking-widest text-xs">Preparando tu regalo...</p>
                                                            </div>
                                                        ) : currentPrize?.prize_type === 'gift' ? (
                                                            // Grand prize - show 1 of 4 prize posters based on visitNumber
                                                            <Image
                                                                src={`/demo-prize-${((prizeVisitNumber - 1) % 4) + 1}.jpg`}
                                                                alt="Premio"
                                                                fill
                                                                className="object-cover"
                                                                priority
                                                            />
                                                        ) : currentPrize?.prize_type === 'discount' ? (
                                                            // Discount - cycle through 3 discount images
                                                            <Image
                                                                src={`/discount-${((prizeVisitNumber - 1) % 3) + 1}.jpeg`}
                                                                alt="Descuento"
                                                                fill
                                                                className="object-cover"
                                                                priority
                                                            />
                                                        ) : (
                                                            <div className="text-center p-8 bg-gradient-to-br from-blue-900/40 to-black h-full w-full flex flex-col items-center justify-center">
                                                                <Gift size={80} className="text-primary drop-shadow-[0_0_20px_rgba(0,102,255,0.5)]" />
                                                                <h4 className="text-white font-lilita text-2xl uppercase tracking-wider mt-4">Tu Premio</h4>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </ScratchCard>
                                            {isScratched && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute -top-4 -right-4 z-50 bg-secondary text-white p-3 rounded-full shadow-xl rotate-12"
                                                >
                                                    <Heart size={24} fill="white" className="animate-bounce" />
                                                </motion.div>
                                            )}
                                        </div>

                                        <p className="text-white/50 text-xs italic tracking-widest uppercase mb-8">
                                            Raspa la tarjeta para descubrir tu premio
                                        </p>

                                        <button
                                            onClick={() => setActivePrizeLocale(null)}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-lilita py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-sm"
                                        >
                                            Continuar mi viaje 🗺️
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Prize Viewer Modal (For already earned prizes) */}
            <AnimatePresence>
                {viewingPrize && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingPrize(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-sm aspect-[3/4] bg-background border border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                        >
                            {/* Close Button - High Contrast Glassmorphism */}
                            <button 
                                onClick={() => setViewingPrize(null)}
                                className="absolute top-5 right-5 z-[130] bg-white/20 backdrop-blur-xl p-3 rounded-full text-white shadow-lg hover:bg-white/30 transition-all active:scale-95 group"
                                aria-label="Cerrar"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <div className="relative w-full h-full flex items-center justify-center">
                                {viewingPrize.prize_image ? (
                                    <Image src={viewingPrize.prize_image} alt="Premio" fill className="object-cover" priority />
                                ) : viewingPrize.prize_name === "Proyector Smart" ? (
                                    <Image src="/demo-prize-1.jpg" alt="Premio" fill className="object-cover" priority />
                                ) : viewingPrize.prize_name === "Barra de Sonido" ? (
                                    <Image src="/demo-prize-2.jpg" alt="Premio" fill className="object-cover" priority />
                                ) : viewingPrize.prize_name === "Aire Acondicionado" ? (
                                    <Image src="/demo-prize-3.jpg" alt="Premio" fill className="object-cover" priority />
                                ) : viewingPrize.prize_name === "Smart TV 50\"" ? (
                                    <Image src="/demo-prize-4.jpg" alt="Premio" fill className="object-cover" priority />
                                ) : (
                                    /* Fallback UI - Clean & High Contrast */
                                    <div className="text-center p-10 bg-gradient-to-t from-blue-950 via-blue-900 to-primary/40 h-full w-full flex flex-col items-center justify-center">
                                        <div className="bg-white/10 p-8 rounded-full mb-6 backdrop-blur-sm border border-white/10">
                                            {viewingPrize.prize_type === 'gift' ? (
                                                <Gift className="text-white w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                            ) : (
                                                <Tag className="text-white w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                            )}
                                        </div>
                                        <h3 className="text-white font-lilita text-4xl uppercase tracking-wider drop-shadow-lg leading-tight">
                                            {viewingPrize.prize_name}
                                        </h3>
                                        <div className="mt-8 px-6 py-2 bg-secondary/80 rounded-full">
                                            <p className="text-white font-lilita text-sm uppercase tracking-[0.2em]">CUPÓN DISPONIBLE</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Only show overlay if MUST (e.g. no image or not one of the special ones) */}
                            {(!viewingPrize.prize_image && !["Proyector Smart", "Barra de Sonido", "Aire Acondicionado", "Smart TV 50\""].includes(viewingPrize.prize_name)) && (
                                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <p className="text-secondary font-lilita text-sm mb-1 uppercase tracking-widest">
                                        {viewingPrize.prize_type === 'gift' ? 'Premio Desbloqueado' : 'Descuento Activo'}
                                    </p>
                                    <h3 className="text-2xl font-black text-white uppercase font-lilita tracking-tight">{viewingPrize.prize_name}</h3>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
