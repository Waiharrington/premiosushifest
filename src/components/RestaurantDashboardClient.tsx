"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, QrCode, Gift, Search, FileDown, Tag } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { supabase } from "@/lib/supabase"
import { redeemPrize } from "@/actions/treasure-hunt"

interface Profile {
    full_name: string
    phone: string
}

interface Prize {
    id: string
    prize_name: string
    prize_type: string
    is_redeemed: boolean
    redeemed_at: string | null
    created_at: string
    profiles: Profile
}

interface Locale {
    id: string
    name: string
    pin: string
    prize_pool: number
    discount_pool: number
    type?: 'restaurant' | 'sponsor'
}

function PrizeListSection({ 
    title, icon, prizes, loading, searchQuery, handleRedeem 
}: { 
    title: string, icon: React.ReactNode, prizes: Prize[], loading: boolean, searchQuery: string, handleRedeem: (id: string) => void 
}) {
    const filtered = prizes.filter(p => 
        p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.profiles?.phone?.includes(searchQuery)
    )

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {icon} {title} ({prizes.length})
                </h2>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading && <p className="text-center text-slate-500 py-10">Cargando ganadores...</p>}
                
                <AnimatePresence>
                    {!loading && filtered.length === 0 && (
                        <p className="text-center text-slate-500 py-10 italic">No hay ganadores en esta categoría.</p>
                    )}

                    {filtered.map((prize) => (
                        <motion.div
                            key={prize.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors
                                ${prize.is_redeemed 
                                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`
                            }
                        >
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-white mb-1">{prize.profiles?.full_name || 'Usuario'}</h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-400 font-mono">{prize.profiles?.phone || 'Sin número'}</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-yellow-400 font-bold">{prize.prize_name}</span>
                                </div>
                                <span className="text-xs text-slate-600 block mt-2">
                                    Fecha: {new Date(prize.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="w-full md:w-auto">
                                {prize.is_redeemed ? (
                                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl text-sm border border-emerald-500/20 flex items-center justify-center gap-2">
                                        <FileDown className="w-4 h-4" /> ENTREGADO
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => handleRedeem(prize.id)}
                                        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                                    >
                                        CANJEAR
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export function RestaurantDashboardClient({ locale }: { locale: Locale }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [pinInput, setPinInput] = useState("")
    const [error, setError] = useState("")

    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (pinInput === locale.pin || pinInput === process.env.NEXT_PUBLIC_ADMIN_OVERRIDE_PIN) {
            setIsAuthenticated(true)
            fetchPrizes()
        } else {
            setError("PIN Incorrecto.")
            setPinInput("")
        }
    }

    const fetchPrizes = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('treasure_hunt_prizes')
            .select(`
                *,
                profiles (full_name, phone)
            `)
            .eq('locale_id', locale.id)
            .neq('prize_type', 'try_again')
            .order('created_at', { ascending: false })

        if (data && !error) {
            // TypeScript workaround for joined data
            setPrizes(data as unknown as Prize[])
        }
        setLoading(false)
    }

    const handleRedeem = async (prizeId: string) => {
        if (!confirm("¿Seguro que quieres MARCAR COMO ENTREGADO este premio?")) return

        const res = await redeemPrize(prizeId)
        if (res.success) {
            alert("¡Premio canjeado con éxito!")
            fetchPrizes()
        } else {
            alert("Error: " + res.error)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-[100svh] bg-slate-950 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center"
                >
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{locale.name}</h1>
                    <p className="text-slate-400 mb-8">Ingresa el PIN asignado a tu restaurante para acceder.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="****"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            className="bg-slate-950 text-center font-mono text-2xl tracking-widest text-primary placeholder:text-slate-700 h-14"
                            maxLength={8}
                            required
                        />
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-lg">
                            INGRESAR AL PANEL
                        </Button>
                    </form>
                </motion.div>
            </div>
        )
    }

    const redeemedCount = prizes.filter(p => p.is_redeemed).length
    const pool = locale.prize_pool || 0
    const discountPool = locale.discount_pool || 0
    const isSponsor = locale.type === 'sponsor'

    // Si es Patrocinador, filtramos los físicos (sponsor_gift o gift) y los descuentos.
    // Si es Restaurante, filtramos los platos de cortesía (courtesy).
    const giftPrizes = prizes.filter(p => !p.is_redeemed && 
        (isSponsor ? (p.prize_type === 'sponsor_gift' || p.prize_type === 'gift') : p.prize_type === 'courtesy')
    )
    
    const discountPrizes = prizes.filter(p => p.prize_type === 'discount' && !p.is_redeemed)
    const redeemedPrizesList = prizes.filter(p => p.is_redeemed)


    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Panel del Restaurante</h1>
                        <p className="text-xl text-primary font-bold">{locale.name}</p>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 flex-shrink-0">
                            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Premios Asignados</span>
                            <span className="text-2xl font-mono text-white">{pool}</span> <span className="text-slate-500 text-sm">Regalos</span> / <span className="text-2xl font-mono text-blue-400">{discountPool}</span> <span className="text-slate-500 text-sm">Desc.</span>
                        </div>
                        <div className="bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 flex-shrink-0">
                            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Entregados (Canjeados)</span>
                            <span className="text-2xl font-mono text-emerald-400">{redeemedCount}</span> <span className="text-slate-500">/ {prizes.length} ganadores</span>
                        </div>
                    </div>
                </header>


                {/* Global Search Bar on Top */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 flex items-center gap-4 w-full">
                    <Search className="w-6 h-6 text-slate-500" />
                    <Input 
                        placeholder="Buscar a un ganador por nombre o número de celular..." 
                        className="bg-transparent border-none text-xl focus-visible:ring-0 px-0 placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: QR Code */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-primary/20 to-blue-900/20 p-8 rounded-3xl border border-primary/30 text-center flex flex-col items-center shadow-xl h-[500px] justify-center">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                <QrCode className="w-5 h-5" /> Código QR Oficial
                            </h2>
                            <p className="text-sm text-blue-200/60 mb-8">
                                Muestra este código a tus clientes para que registren su visita y ganen premios.
                            </p>
                            
                            <div className="bg-white p-6 rounded-3xl shadow-2xl inline-block w-full aspect-square max-w-[280px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${locale.id}`} 
                                    alt="QR Restaurante"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Premios Principales */}
                    <div className="space-y-8">
                        <PrizeListSection 
                            title={isSponsor ? "Premios Físicos Activos" : "Platos Gratis Activos"}
                            icon={<Gift className="w-5 h-5 text-primary" />}
                            prizes={giftPrizes}
                            loading={loading}
                            searchQuery={searchQuery}
                            handleRedeem={handleRedeem}
                        />
                    </div>

                    {/* Column 3: Descuentos */}
                    {isSponsor && (
                        <div className="space-y-8">
                            <PrizeListSection 
                                title="Descuentos y Giftcards"
                                icon={<Tag className="w-5 h-5 text-blue-400" />}
                                prizes={discountPrizes}
                                loading={loading}
                                searchQuery={searchQuery}
                                handleRedeem={handleRedeem}
                            />
                        </div>
                    )}

                </div>

                {/* Redeemed Prizes Section */}
                <div className="pt-8 mt-8 border-t border-slate-800">
                    <PrizeListSection 
                        title="Historial de Entregados (Canjeados)"
                        icon={<FileDown className="w-5 h-5 text-emerald-400" />}
                        prizes={redeemedPrizesList}
                        loading={loading}
                        searchQuery={searchQuery}
                        handleRedeem={handleRedeem}
                    />
                </div>

            </div>
        </div>
    )
}
