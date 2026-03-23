"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Link as LinkIcon, Share2, Instagram } from "lucide-react"
import html2canvas from "html2canvas"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    votedLocalName: string
    votedLocalImage: string
}

export function ShareModal({ isOpen, onClose, votedLocalName, votedLocalImage }: ShareModalProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    if (!isOpen) return null

    const handleShare = async (platform: 'whatsapp' | 'instagram' | 'copy') => {
        setIsGenerating(true)

        try {
            // Generate Image
            const canvas = await html2canvas(cardRef.current!, {
                scale: 2, // High resolution
                backgroundColor: "#0a0a0a",
                useCORS: true // Important for external images (Supabase)
            })

            const imageData = canvas.toDataURL("image/png")
            const blob = await (await fetch(imageData)).blob()
            const file = new File([blob], "voto-sushifest.png", { type: "image/png" })

            const shareText = `¡Acabo de votar por *${votedLocalName}* en el Sushifest 2026! 🍣👑\nVota tú también aquí: https://sushifest.vercel.app`

            if (platform === 'whatsapp') {
                // WhatsApp URL Scheme
                const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
                window.open(waUrl, '_blank')
            }
            else if (platform === 'instagram') {
                // Mobile Web limitation: Can't direct share to Stories with image.
                // We fallback to downloading the image and identifying it's for stories.
                const link = document.createElement('a')
                link.href = imageData
                link.download = `Voto-${votedLocalName.replace(/\s+/g, '-')}.png`
                link.click()
                alert("📸 Imagen guardada. ¡Ahora súbela a tus Historia de Instagram!")
            }
            else if (platform === 'copy') {
                // Try native share if available (best for mobile)
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Sushifest 2026',
                            text: shareText,
                            files: [file],
                            url: 'https://sushifest.vercel.app'
                        })
                        return // Success
                    } catch {
                        // Fallback if sharing fails or cancelled
                    }
                }

                await navigator.clipboard.writeText(shareText + " https://sushifest.vercel.app")
                alert("¡Enlace copiado al portapapeles!")
            }

        } catch (error) {
            console.error("Error sharing:", error)
            alert("Hubo un error al generar la imagen. Intenta de nuevo.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">

                {/* Main Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-background border border-primary/30 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(0,102,255,0.2)]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-3 -right-3 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors z-50 border border-slate-600 shadow-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-bold text-center text-white mb-1 flex items-center justify-center gap-2">
                        <span>📢</span> Comparte tu voto
                    </h2>
                    <p className="text-center text-slate-400 text-sm mb-6">
                        Apoya a tu local favorito y corre la voz 🔥
                    </p>

                    {/* CAPTURE AREA (The Card) */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl">
                        <div
                            ref={cardRef}
                            className="w-full aspect-[4/5] bg-gradient-to-br from-background to-black relative flex flex-col items-center justify-center p-6 border-2 border-primary/50 rounded-2xl"
                        >
                            {/* Background Elements */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black z-0" />
                            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("/particles.png")' }} />

                            {/* Header Crown */}
                            <div className="relative z-10 mb-4 animate-pulse">
                                <Image src="/crown.png" alt="Crown" width={80} height={60} className="w-20 drop-shadow-[0_0_15px_rgba(0,102,255,0.8)]" />
                            </div>

                            {/* Title */}
                            <h3 className="relative z-10 text-white font-bold text-center text-xl mb-4 leading-tight font-lilita tracking-wide drop-shadow-md">
                                Yo ya voté en el<br />
                                <span className="text-secondary text-2xl drop-shadow-[0_0_10px_rgba(255,77,0,0.8)]">Sushifest 2026</span>
                            </h3>

                            {/* Voted Local Image */}
                            <div className="relative z-10 w-32 h-32 mb-6 p-2 bg-black/50 rounded-xl border border-primary/30 backdrop-blur-sm shadow-[0_0_30px_rgba(0,102,255,0.1)]">
                                <div className="w-full h-full relative rounded-lg overflow-hidden">
                                    <Image
                                        src={votedLocalImage}
                                        alt={votedLocalName}
                                        fill
                                        className="object-contain"
                                        crossOrigin="anonymous" // Helpful for external images in canvas
                                    />
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="relative z-10 bg-gradient-to-r from-primary to-blue-700 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg shadow-primary/40">
                                ✅ Votación Abierta
                            </div>

                            {/* Bottom Branding */}
                            <div className="absolute bottom-4 z-10 opacity-70">
                                <span className="text-[10px] text-primary tracking-[0.2em] font-medium">SUSHIFEST.VERCEL.APP</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            disabled={isGenerating}
                            onClick={() => handleShare('whatsapp')}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_0_15px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform">
                                <Share2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-white">WhatsApp</span>
                        </button>

                        <button
                            disabled={isGenerating}
                            onClick={() => handleShare('instagram')}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                                <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-white">Stories</span>
                        </button>

                        <button
                            disabled={isGenerating}
                            onClick={() => handleShare('copy')}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <LinkIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-white">Copiar</span>
                        </button>
                    </div>

                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-primary text-sm font-bold animate-pulse">Creando imagen...</span>
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </AnimatePresence>
    )
}
