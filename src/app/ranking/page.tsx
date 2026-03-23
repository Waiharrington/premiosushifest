"use client"

import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trophy, Flame } from "lucide-react"
import { getRanking, RankedLocale } from "@/actions/ranking"
import { Particles } from "@/components/Particles"
import { useSearchParams } from "next/navigation"

import { SponsorBackground } from "@/components/SponsorBackground"

function RankingContent() {
    // Temporarily disabled at the request of the client
    // redirect("/")

    const [ranking, setRanking] = useState<RankedLocale[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()

    // Get user's vote from context
    const votedName = searchParams.get('votedName')
    // const votedVotes = searchParams.get('votedVotes')

    useEffect(() => {
        const fetchData = async () => {
            const data = await getRanking()
            setRanking(data)
            setLoading(false)
        }
        fetchData()

        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [])

    const getRankIcon = (index: number) => {
        if (index === 0) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-primary to-blue-700 flex items-center justify-center text-white font-bold border border-white/20 shadow-[0_0_15px_rgba(0,102,255,0.5)]">1</div>
        if (index === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center text-black font-bold border border-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.5)]">2</div>
        if (index === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-secondary to-red-600 flex items-center justify-center text-white font-bold border border-white/20 shadow-[0_0_10px_rgba(255,77,0,0.5)]">3</div>
        return <span className="text-white/40 font-bold text-lg w-8 text-center">{index + 1}.</span>
    }

    return (
        <div className="min-h-screen bg-background text-white relative overflow-hidden font-sans selection:bg-primary/30">

            {/* Background Layer (Same as Home) */}
            <div className="fixed inset-0 z-0">
                {/* Mobile Background */}
                <div className="absolute inset-0 block md:hidden">
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
                {/* Desktop Background */}
                <div className="absolute inset-0 hidden md:block">
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
                <div className="absolute inset-0 bg-background/60" /> {/* Slight overlay for readability */}
                <Particles color="#0537BB" />
                <SponsorBackground />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gradient-to-b from-background/40 to-background/80">

                {/* Golden Frame Container - Narrower (max-w-md) to match reference */}
                <div className="w-full max-w-xl relative">

                    {/* Outer Glow */}
                    <div className="absolute -inset-[3px] bg-gradient-to-b from-primary via-blue-400 to-primary rounded-[2rem] opacity-60 blur-sm" />

                    {/* Main Card */}
                    <div className="relative bg-background/90 backdrop-blur-xl border-2 border-primary/50 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(5,55,187,0.2)] flex flex-col max-h-[85vh]">

                        {/* Decoration Top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(5,55,187,1)]" />

                        {/* Header */}
                        <div className="text-center mb-6 flex-shrink-0">
                            <div className="flex justify-center mb-3">
                                <Trophy className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-1 font-lilita drop-shadow-sm">
                                Ranking Oficial – Sushifest 2026
                            </h1>
                            <div className="flex items-center justify-center gap-2 opacity-80">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
                                <p className="text-xs text-blue-100/70 font-medium tracking-widest uppercase">
                                    Resultados en tiempo real
                                </p>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
                            </div>
                        </div>

                        {/* Ranking List - Scrollable */}
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-6">
                            {loading ? (
                                <div className="text-center py-12 text-white/40 animate-pulse flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Cargando posiciones...
                                </div>
                            ) : ranking.map((locale, index) => (
                                <motion.div
                                    key={locale.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${index < 3
                                        ? "bg-gradient-to-r from-primary/20 to-transparent border-primary/30"
                                        : "bg-transparent border-slate-800 hover:bg-white/5"
                                        }`}
                                >
                                    {/* Rank Number */}
                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>

                                    {/* Logo */}
                                    <div className={`relative w-10 h-10 rounded-full border overflow-hidden bg-black p-0.5 ${index < 3 ? 'border-primary/40' : 'border-slate-700'}`}>
                                        <Image
                                            src={locale.image_url}
                                            alt={locale.name}
                                            fill
                                            className="object-contain p-0.5"
                                        />
                                    </div>

                                    {/* Name & Stars */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className={`font-bold truncate text-sm uppercase tracking-wide ${index < 3 ? "text-white" : "text-slate-200"}`}>
                                            {locale.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="flex text-primary text-[10px]">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < Math.round(locale.total_avg) ? "opacity-100" : "opacity-30"}>★</span>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {locale.total_avg.toFixed(1)} / 5.0
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] text-white/40 uppercase">Sabor</span>
                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-secondary" style={{ width: `${(locale.avg_flavor / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] text-white/40 uppercase">Servicio</span>
                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${(locale.avg_service / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] text-white/40 uppercase">Presentación</span>
                                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/60" style={{ width: `${(locale.avg_presentation / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-[8px] text-slate-600 font-bold mt-1 uppercase tracking-tighter">
                                            {locale.rating_count.toLocaleString()} CALIFICACIONES
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer Section (Fixed at bottom of card) */}
                        <div className="flex-shrink-0 space-y-3 pt-4 border-t border-white/10">

                            {/* User Vote Info */}
                            {votedName && (
                                <div className="py-2 px-3 rounded-lg bg-gradient-to-r from-blue-950/50 to-background/20 border border-primary/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-primary animate-pulse" />
                                        <span className="text-blue-200 text-xs font-medium">Tu voto:</span>
                                        <span className="text-white font-bold text-sm uppercase tracking-wide">{votedName}</span>
                                    </div>
                                    <div className="text-blue-200/80 text-xs">
                                        {/* Place for user specific count if we had it, or just generic check */}
                                        ✅
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <Link href="/" className="block">
                                <button className="w-full py-3 rounded-full border border-primary/30 bg-black/40 hover:bg-primary/10 text-white text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
                                    Volver al Inicio
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

export default function RankingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center text-primary">
                <Trophy className="w-10 h-10 animate-bounce" />
            </div>
        }>
            <RankingContent />
        </Suspense>
    )
}
