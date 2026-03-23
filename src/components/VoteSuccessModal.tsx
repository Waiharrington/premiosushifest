"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, X } from "lucide-react"

interface VoteSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    localeName: string
    localeImage: string
}

export function VoteSuccessModal({ isOpen, onClose, localeName, localeImage }: VoteSuccessModalProps) {


    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-md relative flex flex-col items-center">

                    {/* Header Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-8"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-white font-lilita uppercase tracking-wide drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            ¡VOTO REGISTRADO!
                        </h2>
                        <div className="bg-green-500 rounded-full p-1 shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                            <CheckCircle2 className="w-6 h-6 text-white stroke-[3]" />
                        </div>
                    </motion.div>

                    {/* Main Card */}
                    <div className="w-full bg-background border-2 border-primary/50 rounded-3xl shadow-[0_0_50px_rgba(0,102,255,0.15)] p-8 relative overflow-hidden">

                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-primary shadow-[0_0_20px_rgba(0,102,255,1)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

                        {/* Locale Image / Logo */}
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl transform rotate-3" />
                            <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl transform -rotate-3" />
                            <div className="relative h-full w-full bg-black rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(0,102,255,0.2)] overflow-hidden p-2">
                                <div className="w-full h-full relative rounded-xl overflow-hidden bg-white">
                                    <Image
                                        src={localeImage || "/logo.png"}
                                        alt={localeName}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center space-y-4">
                            <div>
                                <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-1">Votaste por</p>
                                <h3 className="text-2xl md:text-3xl font-black text-white font-lilita uppercase tracking-wide leading-none">
                                    {localeName}
                                </h3>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                            <p className="text-white/80 text-sm leading-relaxed px-2">
                                Tu voto ha sido registrado correctamente y cuenta para el <span className="text-secondary font-bold">SUSHIFEST 2026</span>.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full mt-8 space-y-4 px-4">
                        <Button
                            className="w-full h-14 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-lg font-black uppercase tracking-wider rounded-full shadow-[0_0_25px_rgba(0,102,255,0.4)] border border-white/10 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => window.location.href = `/ranking?votedName=${encodeURIComponent(localeName)}`}
                        >
                            <span className="flex items-center gap-2">
                                🔥 Ver Ranking
                            </span>
                        </Button>


                    </div>

                    {/* Footer / Close Button */}
                    <div className="w-full mt-6 flex justify-center">
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white text-sm font-medium transition-colors uppercase tracking-widest hover:underline decoration-primary/50 underline-offset-4"
                        >
                            Volver al Inicio
                        </button>
                    </div>

                    {/* Close Icon Absolute */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white p-2"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>


        </AnimatePresence>
    )
}
