'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Trophy, CheckCircle2, Clock, LogOut, Download, Gift, User, Phone, CreditCard, Sparkles, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PREMIER_PIN = "1234"

interface Winner {
    id: string
    prize_name: string
    prize_type: string
    is_redeemed: boolean
    redeemed_at: string | null
    created_at: string
    locale_id: string
    locale_name?: string
    user_name?: string
    user_cedula?: string
    user_phone?: string
}

export default function PremierDashboard() {
    const [pin, setPin] = useState("")
    const [isAuth, setIsAuth] = useState(false)
    const [pinError, setPinError] = useState(false)
    const [winners, setWinners] = useState<Winner[]>([])
    const [loading, setLoading] = useState(false)
    const [markingId, setMarkingId] = useState<string | null>(null)

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (pin === PREMIER_PIN) {
            setIsAuth(true)
            setPinError(false)
        } else {
            setPinError(true)
            setPin("")
        }
    }

    const fetchWinners = async () => {
        setLoading(true)
        const { data: prizes } = await supabase
            .from('treasure_hunt_prizes')
            .select('*')
            .in('prize_type', ['sponsor_gift', 'gift'])
            .order('created_at', { ascending: false })

        if (!prizes) { setLoading(false); return }

        // Enrich with locale and user data
        const enriched: Winner[] = await Promise.all(prizes.map(async (prize) => {
            const { data: locale } = await supabase
                .from('locales').select('name').eq('id', prize.locale_id).single()
            const { data: profile } = await supabase
                .from('profiles').select('full_name, cedula, phone').eq('id', prize.user_id).single()
            return {
                ...prize,
                locale_name: locale?.name || 'N/A',
                user_name: profile?.full_name || 'Desconocido',
                user_cedula: profile?.cedula || 'N/A',
                user_phone: profile?.phone || 'N/A',
            }
        }))

        setWinners(enriched)
        setLoading(false)
    }

    useEffect(() => {
        if (isAuth) fetchWinners()
    }, [isAuth])

    const handleMarkDelivered = async (prizeId: string) => {
        if (!confirm("¿Confirmar entrega de este premio?")) return
        setMarkingId(prizeId)
        await supabase
            .from('treasure_hunt_prizes')
            .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
            .eq('id', prizeId)
        setWinners(prev => prev.map(w => w.id === prizeId ? { ...w, is_redeemed: true, redeemed_at: new Date().toISOString() } : w))
        setMarkingId(null)
    }

    const exportCSV = () => {
        const headers = ["Premio", "Ganador", "Cédula", "WhatsApp", "Restaurante", "Estado", "Fecha"]
        const rows = winners.map(w => [
            w.prize_name, w.user_name, w.user_cedula, w.user_phone,
            w.locale_name, w.is_redeemed ? "ENTREGADO" : "PENDIENTE",
            new Date(w.created_at).toLocaleDateString('es-PA')
        ])
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'ganadores-premier.csv'; a.click()
    }

    const pending = winners.filter(w => !w.is_redeemed)
    const delivered = winners.filter(w => w.is_redeemed)

    // Login Screen
    if (!isAuth) {
        return (
            <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    <div className="text-center mb-10">
                        <div className="relative w-32 h-20 mx-auto mb-6">
                            <Image src="/Logo tiendas premier.png" alt="Tiendas Premier" fill className="object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Panel Premier</h1>
                        <p className="text-white/40 text-xs uppercase tracking-[0.3em] mt-1">Gestión de Ganadores</p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="PIN de acceso"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            className={`w-full bg-white/5 border ${pinError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-white/30 transition-all`}
                            maxLength={4}
                            autoFocus
                        />
                        {pinError && <p className="text-red-400 text-xs text-center uppercase tracking-widest">PIN incorrecto</p>}
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl uppercase tracking-widest hover:from-blue-500 hover:to-blue-700 transition-all active:scale-95"
                        >
                            Ingresar
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    // Dashboard
    return (
        <div className="min-h-screen bg-[#0A0A1A] text-white p-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-14">
                        <Image src="/Logo tiendas premier.png" alt="Premier" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Ganadores</h1>
                        <p className="text-white/40 text-xs uppercase tracking-widest">Sushifest 2026</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchWinners}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                        title="Refrescar"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/20 transition-all text-sm font-bold"
                    >
                        <Download size={16} /> Exportar CSV
                    </button>
                    <button
                        onClick={() => setIsAuth(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold"
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-6xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Gift size={16} className="text-blue-400" />
                        <span className="text-white/50 text-xs uppercase tracking-widest">Total Premios</span>
                    </div>
                    <span className="text-4xl font-bold text-white">{winners.length}</span>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-orange-400" />
                        <span className="text-white/50 text-xs uppercase tracking-widest">Pendientes</span>
                    </div>
                    <span className="text-4xl font-bold text-orange-400">{pending.length}</span>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-white/50 text-xs uppercase tracking-widest">Entregados</span>
                    </div>
                    <span className="text-4xl font-bold text-green-400">{delivered.length}</span>
                </div>
            </div>

            {/* Winners Table */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {winners.map((winner, idx) => (
                                <motion.div
                                    key={winner.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`bg-white/[0.03] border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 ${winner.is_redeemed ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-blue-500/30 transition-colors'}`}
                                >
                                    {/* Prize Badge */}
                                    <div className={`flex items-center gap-3 flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${winner.is_redeemed ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                                        {winner.is_redeemed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {winner.is_redeemed ? 'Entregado' : 'Pendiente'}
                                    </div>

                                    {/* Prize Info */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Trophy size={14} className="text-yellow-400 flex-shrink-0" />
                                            <span className="text-white font-bold text-sm">{winner.prize_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-blue-400 flex-shrink-0" />
                                            <span className="text-white/70 text-sm">{winner.user_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className="text-purple-400 flex-shrink-0" />
                                            <span className="text-white/70 text-sm font-mono">{winner.user_cedula}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-green-400 flex-shrink-0" />
                                            <span className="text-white/70 text-sm font-mono">{winner.user_phone}</span>
                                        </div>
                                    </div>

                                    {/* Date & Action */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-white/30 text-[10px] uppercase tracking-widest">Restaurante</p>
                                            <p className="text-white/60 text-xs font-bold">{winner.locale_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/30 text-[10px] uppercase tracking-widest">Ganado el</p>
                                            <p className="text-white/60 text-xs">{new Date(winner.created_at).toLocaleDateString('es-PA')}</p>
                                        </div>
                                        {!winner.is_redeemed && (
                                            <button
                                                onClick={() => handleMarkDelivered(winner.id)}
                                                disabled={markingId === winner.id}
                                                className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <Sparkles size={12} />
                                                {markingId === winner.id ? '...' : 'Marcar Entregado'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {winners.length === 0 && (
                            <div className="text-center py-20 text-white/30">
                                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="uppercase tracking-widest text-sm">Aún no hay ganadores registrados</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
