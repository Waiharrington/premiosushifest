"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import * as React from "react"

interface VoteModalProps {
    isOpen: boolean
    onClose: () => void
    onVote: (name: string, contact: string) => void
    localeName: string
    isSubmitting: boolean
}

export function VoteModal({ isOpen, onClose, onVote, localeName, isSubmitting }: VoteModalProps) {
    const [name, setName] = React.useState("")
    const [contact, setContact] = React.useState("")

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name && contact) {
            onVote(name, contact)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-background border border-primary/50 rounded-2xl shadow-[0_0_80px_rgba(0,102,255,0.1)] p-8 relative zoom-in-95 duration-300">

                {/* Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(0,102,255,0.8)]" />

                {/* Bottom Glow Line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                {/* Floating Crown */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <Image
                            src="/crown-modal.png"
                            alt="Crown"
                            width={160}
                            height={100}
                            className="w-[160px] h-auto drop-shadow-[0_0_20px_rgba(0,102,255,0.6)] relative z-10"
                        />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white/30 hover:text-white transition-colors z-10"
                >
                    ✕
                </button>

                <div className="relative z-10 text-center mt-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-sm">
                        Estás a un paso de votar
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                        Ingresa tus datos para registrar tu voto y participar en la elección del <span className="text-secondary font-bold">{localeName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-primary ml-1">Nombre</label>
                        <Input
                            placeholder="Tu nombre completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg h-11"
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-primary ml-1">Teléfono o Email</label>
                        <Input
                            placeholder="3001234567 o correo@ejemplo.com"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg h-11"
                        />
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-transparent hover:bg-white/5 text-white/60 font-medium h-12 border border-transparent hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name || !contact}
                            className="flex-[2] bg-gradient-to-r from-primary to-blue-700 text-white font-bold h-12 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border border-white/10"
                        >
                            {isSubmitting ? "Enviando..." : "Confirmar mi voto 🔥"}
                        </Button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-[10px] text-white/40 flex items-center justify-center gap-1.5">
                            <span>🔒</span> Votación segura • Un voto por persona
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
