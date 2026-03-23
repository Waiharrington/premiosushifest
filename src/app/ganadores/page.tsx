"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trophy, Crown, Medal } from "lucide-react"
import { getRanking, RankedLocale } from "@/actions/ranking"
import { Particles } from "@/components/Particles"
import { SponsorBackground } from "@/components/SponsorBackground"

export default function WinnersPage() {
    const [winners, setWinners] = useState<RankedLocale[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWinners = async () => {
            const data = await getRanking()
            // Take top 3
            setWinners(data.slice(0, 3))
            setLoading(false)
        }
        fetchWinners()
    }, [])

    const first = winners[0]
    const second = winners[1]
    const third = winners[2]

    return (
        <div className="min-h-screen bg-background text-white relative overflow-hidden font-sans selection:bg-primary/30 flex flex-col">

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 block md:hidden">
                    <Image
                        src="/bg-home-mobile-4k.jpg"
                        alt="Mobile Background"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>
                <div className="absolute inset-0 hidden md:block">
                    <Image
                        src="/bg-home-4k.jpg"
                        alt="Desktop Background"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>
                <div className="absolute inset-0 bg-black/60" />
                <Particles />
                <SponsorBackground />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 pb-20">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 mt-8"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_25px_rgba(0,102,255,0.6)] font-lilita mb-2">
                        Ganadores
                    </h1>
                    <p className="text-xl md:text-2xl text-white font-medium tracking-widest uppercase opacity-90">
                        Sushifest 2026
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center gap-4 text-primary animate-pulse mt-20">
                        <Trophy className="w-16 h-16" />
                        <span className="text-xl font-lilita tracking-wider">Calculando resultados...</span>
                    </div>
                ) : (
                    <div className="flex flex-row items-end justify-center gap-2 md:gap-8 w-full max-w-5xl px-0 md:px-4 mt-8 md:mt-0">

                        {/* 2nd Place (Left) */}
                        {second && (
                            <div className="order-1 md:order-1 flex flex-col items-center w-1/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    {/* Avatar */}
                                    <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.4)] overflow-hidden bg-black mb-2 md:mb-4 z-20">
                                        <Image src={second.image_url} alt={second.name} fill className="object-cover" />
                                    </div>
                                    <h3 className="text-[10px] md:text-xl font-bold text-slate-200 text-center mb-1 uppercase tracking-wide px-1 line-clamp-2 min-h-[2rem] md:min-h-[3.5rem] flex items-center justify-center leading-tight">
                                        {second.name}
                                    </h3>
                                    <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-sm font-mono font-bold mb-1 md:mb-2 backdrop-blur-sm border border-slate-600">
                                        {second.votes.toLocaleString()}
                                    </span>

                                    {/* Podium Block */}
                                    <div className="w-full h-24 md:h-64 bg-gradient-to-b from-slate-300 to-slate-600 rounded-t-lg relative shadow-2xl flex flex-col justify-start pt-2 md:pt-4 items-center border-t border-white/10">
                                        <Medal className="w-6 h-6 md:w-12 md:h-12 text-white/20 drop-shadow-sm mb-1 md:mb-2 opacity-50" />
                                        <span className="text-3xl md:text-6xl font-lilita text-white/10">2</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* 1st Place (Center) */}
                        {first && (
                            <div className="order-2 md:order-2 flex flex-col items-center w-1/3 -mt-6 md:-mt-24 z-10">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="flex flex-col items-center w-full"
                                >
                                    <div className="mb-1 md:mb-2 animate-bounce">
                                        <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary drop-shadow-[0_0_15px_rgba(0,102,255,0.8)]" fill="currentColor" />
                                    </div>

                                    {/* Avatar */}
                                    <div className="relative w-20 h-20 md:w-48 md:h-48 rounded-full border-2 md:border-4 border-primary shadow-[0_0_40px_rgba(0,102,255,0.6)] overflow-hidden bg-black mb-2 md:mb-6 z-20 ring-2 md:ring-4 ring-primary/20">
                                        <Image src={first.image_url} alt={first.name} fill className="object-cover" />
                                    </div>

                                    <h3 className="text-xs md:text-3xl font-black text-white text-center mb-1 uppercase tracking-wider px-1 line-clamp-2 min-h-[2.5rem] md:min-h-[4rem] flex items-center justify-center drop-shadow-md leading-tight">
                                        {first.name}
                                    </h3>
                                    <span className="bg-primary/80 text-white px-2 py-0.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-base font-mono font-bold mb-2 md:mb-4 backdrop-blur-sm border border-primary/50 shadow-[0_0_15px_rgba(0,102,255,0.3)]">
                                        {first.votes.toLocaleString()}
                                    </span>

                                    {/* Podium Block */}
                                    <div className="w-full h-32 md:h-80 bg-gradient-to-b from-primary via-blue-700 to-blue-900 rounded-t-xl relative shadow-[0_0_50px_rgba(0,102,255,0.2)] flex flex-col justify-start pt-3 md:pt-6 items-center border-t border-white/20">
                                        <Trophy className="w-8 h-8 md:w-16 md:h-16 text-white/40 drop-shadow-sm mb-1 md:mb-2 opacity-60" fill="currentColor" />
                                        <span className="text-4xl md:text-8xl font-lilita text-white/20">1</span>

                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 rounded-t-xl" />
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* 3rd Place (Right) */}
                        {third && (
                            <div className="order-3 md:order-3 flex flex-col items-center w-1/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    {/* Avatar */}
                                    <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-secondary shadow-[0_0_20px_rgba(255,77,0,0.4)] overflow-hidden bg-black mb-2 md:mb-4 z-20">
                                        <Image src={third.image_url} alt={third.name} fill className="object-cover" />
                                    </div>
                                    <h3 className="text-[10px] md:text-xl font-bold text-white text-center mb-1 uppercase tracking-wide px-1 line-clamp-2 min-h-[2rem] md:min-h-[3.5rem] flex items-center justify-center leading-tight">
                                        {third.name}
                                    </h3>
                                    <span className="bg-secondary/80 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-sm font-mono font-bold mb-1 md:mb-2 backdrop-blur-sm border border-secondary/50">
                                        {third.votes.toLocaleString()}
                                    </span>

                                    {/* Podium Block */}
                                    <div className="w-full h-16 md:h-48 bg-gradient-to-b from-secondary to-red-800 rounded-t-lg relative shadow-2xl flex flex-col justify-start pt-2 md:pt-4 items-center border-t border-white/10">
                                        <Medal className="w-6 h-6 md:w-12 md:h-12 text-white/20 drop-shadow-sm mb-1 md:mb-2 opacity-50" />
                                        <span className="text-3xl md:text-6xl font-lilita text-white/10">3</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                    </div>
                )}

                {/* Back Button */}
                <Link href="/" className="fixed bottom-8 z-50">
                    <button className="bg-black/60 hover:bg-black/80 text-white/50 hover:text-white px-6 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all text-sm uppercase tracking-widest hover:border-white/30">
                        Volver al Inicio
                    </button>
                </Link>

            </main>
        </div>
    )
}
