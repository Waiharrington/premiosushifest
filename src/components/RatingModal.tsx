import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Stars } from "./Stars"
import { getUserLocaleStatus } from "@/actions/user_status"
import { useAuth } from "@/context/AuthContext"

interface RatingModalProps {
    isOpen: boolean
    onClose: () => void
    onRating: (ratings: { flavor: number, service: number, presentation: number }, wantToVote: boolean, confirmMove?: boolean) => void
    localeId: string
    localeName: string
    isSubmitting: boolean
}

export function RatingModal({ isOpen, onClose, onRating, localeId, localeName, isSubmitting }: RatingModalProps) {
    const { user } = useAuth()
    const [flavor, setFlavor] = useState(0)
    const [service, setService] = useState(0)
    const [presentation, setPresentation] = useState(0)
    const [wantToVote, setWantToVote] = useState(false)
    const [hasRating, setHasRating] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)

    // Reset and Fetch Status when Modal opens
    useEffect(() => {
        let isMounted = true;
        
        async function fetchData() {
            if (!isOpen || !user || !localeId) return
            
            setIsLoadingData(true)
            try {
                const status = await getUserLocaleStatus(user.id, localeId)
                if (status && isMounted) {
                    if (status.rating) {
                        setFlavor(status.rating.flavor)
                        setService(status.rating.service)
                        setPresentation(status.rating.presentation)
                        setHasRating(true)
                    } else {
                        setFlavor(0)
                        setService(0)
                        setPresentation(0)
                        setHasRating(false)
                    }
                    setWantToVote(status.hasVoteHere)
                }
            } finally {
                if (isMounted) setIsLoadingData(false)
            }
        }

        fetchData()

        return () => { isMounted = false }
    }, [isOpen, user, localeId])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (flavor === 0 || service === 0 || presentation === 0) {
            alert("Por favor califica las 3 categorías")
            return
        }

        onRating({ flavor, service, presentation }, wantToVote)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-background border border-primary/50 rounded-3xl shadow-[0_0_80px_rgba(5,55,187,0.2)] p-8 overflow-hidden"
            >
                {/* Floating Crown */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
                    <Image
                        src="/crown.png"
                        alt="Crown"
                        width={140}
                        height={100}
                        className="w-[140px] h-auto drop-shadow-lg"
                    />
                </div>

                <div className="text-center mt-12 mb-8">
                    <h2 className="text-2xl font-lilita text-white mb-2">CALIFICA TU EXPERIENCIA</h2>
                    <p className="text-white/40 text-sm uppercase tracking-widest">{localeName}</p>
                </div>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Cargando tus datos...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <Stars label="Sabor" value={flavor} onChange={setFlavor} readOnly={hasRating} />
                            <Stars label="Servicio / Atención" value={service} onChange={setService} readOnly={hasRating} />
                            <Stars label="Presentación" value={presentation} onChange={setPresentation} readOnly={hasRating} />
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="can-vote"
                                    checked={wantToVote}
                                    onChange={(e) => setWantToVote(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                />
                                <label htmlFor="can-vote" className="text-sm font-bold text-white/90">
                                    ¿ES TU FAVORITO PARA GANAR?
                                </label>
                            </div>
                            <p className="text-[10px] text-white/40 leading-tight">
                                {wantToVote 
                                    ? "¡Este restaurante tiene actualmente tu voto para ganar! 🏆" 
                                    : "Si marcas esta casilla, este será tu único favorito para ganar el Sushifest 2026."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-primary to-blue-700 text-white font-lilita text-xl py-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? "GUARDANDO..." : "ENVIAR CALIFICACIÓN 🍣"}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    )
}
