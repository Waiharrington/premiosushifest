"use client"

import { useState, useRef, useEffect } from "react"
import { addLocale, deleteLocale, editLocale, injectVotes, purgeFraudVotes, removeVotes, toggleVoting, getVotingStatus } from "@/actions/admin"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash2, X, Plus, Syringe, ShieldAlert, Eraser, Lock, Unlock, QrCode } from "lucide-react"

interface Locale {
    id: string
    name: string
    description?: string
    image_url: string
    prize_pool?: number
    pin?: string
}

interface Vote {
    id: string
    locale_id: string
}

interface AdminDashboardProps {
    locales: Locale[]
    votes: Vote[]
}

export function AdminDashboard({ locales, votes }: AdminDashboardProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [editingLocale, setEditingLocale] = useState<Locale | null>(null)
    const [injectingLocale, setInjectingLocale] = useState<Locale | null>(null)
    const [removingLocale, setRemovingLocale] = useState<Locale | null>(null)
    const [votingEnabled, setVotingEnabled] = useState(true) // Default true, syncs on mount
    const [showingQrLocale, setShowingQrLocale] = useState<Locale | null>(null)

    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        getVotingStatus().then(status => setVotingEnabled(status))
    }, [])

    const handleToggleVoting = async () => {
        const newState = !votingEnabled
        const msg = newState
            ? "¿Seguro que quieres ACTIVAR las votaciones? ¡La gente podrá votar de nuevo!"
            : "⚠️ ¿Seguro que quieres DETENER las votaciones? \n\nNadie podrá votar hasta que lo reactives."

        if (!confirm(msg)) return

        setIsSaving(true)
        const res = await toggleVoting(newState)
        setIsSaving(false)

        if (res.success) {
            setVotingEnabled(newState)
        } else {
            alert("Error: " + res.error)
        }
    }

    // Calculate Stats
    const totalVisits = votes.length
    const visitCounts = locales.map(l => ({
        ...l,
        count: votes.filter(v => v.locale_id === l.id).length
    })).sort((a, b) => b.count - a.count)

    const handleSave = async (formData: FormData) => {
        setIsSaving(true)

        // If editing, append the ID and current image URL
        if (editingLocale) {
            formData.append("id", editingLocale.id)
            if (!formData.get("image")?.valueOf()) {
                // logic handled in server action: if no new file, verify if we need to send old url
                // server action reads 'current_image_url' if provided
                formData.append("current_image_url", editingLocale.image_url)
            }
        }

        const res = editingLocale
            ? await editLocale(formData)
            : await addLocale(formData)

        setIsSaving(false)

        if (res.success) {
            formRef.current?.reset()
            setEditingLocale(null)
            alert(editingLocale ? "¡Local actualizado!" : "¡Local agregado!")
        } else {
            alert("Error: " + res.error)
        }
    }

    const handleInject = async (formData: FormData) => {
        if (!injectingLocale) return
        const amount = parseInt(formData.get("amount") as string)

        if (!confirm(`¿Estás seguro de inyectar ${amount} votos a ${injectingLocale.name}?`)) return

        setIsSaving(true)
        const res = await injectVotes(injectingLocale.id, amount)
        setIsSaving(false)

        if (res.success) {
            setInjectingLocale(null)
            alert(`¡Se han inyectado ${amount} votos exitosamente!`)
        } else {
            alert("Error: " + res.error)
        }
    }

    const handleRemove = async (formData: FormData) => {
        if (!removingLocale) return
        const amount = parseInt(formData.get("amount") as string)

        if (!confirm(`⚠️ ¿Estás seguro de ELIMINAR ${amount} votos de ${removingLocale.name}?`)) return

        setIsSaving(true)
        const res = await removeVotes(removingLocale.id, amount)
        setIsSaving(false)

        if (res.success) {
            setRemovingLocale(null)
            alert(res.message)
        } else {
            alert("Error: " + res.error)
        }
    }

    const handlePurge = async (locale: Locale) => {
        if (!confirm(`⚠️ ALERTA DE PURGA ⚠️\n\n¿Estás seguro de escanear y eliminar los votos fraudulentos de "${locale.name}"?\nSe borrarán TODOS los votos de personas que hayan votado más de 3 veces.\n\nEsta acción es irreversible.`)) return

        setIsSaving(true)
        try {
            const res = await purgeFraudVotes(locale.id)
            if (res.success) {
                alert(res.message)
            } else {
                alert("Error: " + res.error)
            }
        } catch (e) {
            console.error(e)
            alert("Error inesperado en la purga.")
        } finally {
            setIsSaving(false)
        }
    }

    const startEditing = (locale: Locale) => {
        setEditingLocale(locale)
        setInjectingLocale(null)
        setRemovingLocale(null)
        // Optionally scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEditing = () => {
        setEditingLocale(null)
        formRef.current?.reset()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que quieres borrar a "${name}"? Esta acción no se puede deshacer.`)) return

        const res = await deleteLocale(id)
        if (res.success) {
            if (editingLocale?.id === id) cancelEditing()
        } else {
            alert("Error: " + res.error)
        }
    }

    return (
        <div className="text-white max-w-6xl mx-auto p-6">
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                        Panel de Control
                    </h1>
                    <p className="text-slate-400">Sushifest 2026 Admin</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Voting Toggle */}
                    <div className="flex flex-col items-end">
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Estado Votación</span>
                        <button
                            onClick={handleToggleVoting}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${votingEnabled
                                ? 'bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                                }`}
                        >
                            {votingEnabled ? (
                                <>
                                    <Unlock className="w-4 h-4" /> ACTIVAS
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" /> DETENIDAS
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Total Visitas</span>
                        <span className="text-2xl font-mono font-bold text-primary">{totalVisits}</span>
                    </div>

                    {/* NEW: Special QR Button */}
                    <button
                        onClick={() => setShowingQrLocale({ id: 'special', name: 'PREMIO DE CORTESÍA (3 Platos)', image_url: '' } as any)}
                        className="bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all h-[52px]"
                    >
                        <QrCode className="w-5 h-5" /> QR CORTESÍA
                    </button>
                </div>
            </header>

            {/* Injection Modal */}
            {injectingLocale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-primary/50 p-6 rounded-xl w-full max-w-md shadow-2xl relative"
                    >
                        <button
                            onClick={() => setInjectingLocale(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                            <Syringe className="w-5 h-5" /> Inyectar Votos
                        </h3>
                        <p className="text-sm text-slate-300 mb-6">
                            Agregando votos manuales para: <span className="font-bold text-white">{injectingLocale.name}</span>
                        </p>

                        <form action={handleInject} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Cantidad de Visitas</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    placeholder="Ej: 50"
                                    required
                                    className="bg-slate-950 border-slate-700 text-lg font-mono text-primary focus:ring-primary/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setInjectingLocale(null)}
                                    className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold"
                                >
                                    {isSaving ? "Inyectando..." : "CONFIRMAR"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Removal Modal */}
            {removingLocale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-red-500/50 p-6 rounded-xl w-full max-w-md shadow-2xl relative"
                    >
                        <button
                            onClick={() => setRemovingLocale(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                            <Eraser className="w-5 h-5" /> Eliminar Votos
                        </h3>
                        <p className="text-sm text-slate-300 mb-6">
                            Eliminando los votos más recientes de: <span className="font-bold text-white">{removingLocale.name}</span>
                        </p>

                        <form action={handleRemove} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Cantidad a Eliminar</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    min="1"
                                    max="5000"
                                    placeholder="Ej: 10"
                                    required
                                    className="bg-slate-950 border-red-900/50 text-lg font-mono text-red-500 focus:ring-red-500/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setRemovingLocale(null)}
                                    className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold border-red-500"
                                >
                                    {isSaving ? "Eliminando..." : "BORRAR VISITAS"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Manage Locales */}
                <div className="space-y-8">
                    <section className={`p-6 rounded-xl border transition-colors ${editingLocale ? 'bg-primary/10 border-primary/50' : 'bg-slate-900/50 border-slate-800'}`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            {editingLocale ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-green-500" />}
                            <span className={editingLocale ? "text-primary" : "text-white"}>
                                {editingLocale ? "Editar Local" : "Nuevo Local"}
                            </span>
                        </h2>

                        <form ref={formRef} action={handleSave} className="space-y-4" key={editingLocale?.id || 'new'}>
                            <Input
                                name="name"
                                placeholder="Nombre del Restaurante"
                                required
                                className="bg-slate-950"
                                defaultValue={editingLocale?.name || ""}
                            />
                            <Input
                                name="description"
                                placeholder="Descripción corta (opcional)"
                                className="bg-slate-950"
                                defaultValue={editingLocale?.description || ""}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    name="prize_pool"
                                    type="number"
                                    min="0"
                                    placeholder="Total Premios (Ej: 15)"
                                    className="bg-slate-950"
                                    defaultValue={editingLocale?.prize_pool || "0"}
                                    title="Cantidad total de regalos físicos"
                                />
                                <Input
                                    name="discount_pool"
                                    type="number"
                                    min="0"
                                    placeholder="Total Descuentos (Ej: 50)"
                                    className="bg-slate-950"
                                    defaultValue={editingLocale?.discount_pool || "0"}
                                    title="Cantidad límite de descuentos permitidos"
                                />
                                <Input
                                    name="pin"
                                    placeholder="PIN (Ej: 1234)"
                                    className="bg-slate-950 font-mono"
                                    defaultValue={editingLocale?.pin || "1234"}
                                    title="PIN de acceso al panel para el restaurante"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 ml-1">Logo / Imagen</label>
                                <div className="flex gap-4 items-center">
                                    {editingLocale?.image_url && (
                                        <div className="relative w-12 h-12 rounded bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={editingLocale.image_url} alt="current" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <Input
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className="bg-slate-950 file:bg-slate-800 file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-sm file:font-medium hover:file:bg-slate-700 flex-grow"
                                    />
                                </div>
                                {editingLocale && <p className="text-xs text-primary/80 ml-1">* Sube una imagen solo si quieres cambiar la actual.</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button disabled={isSaving} className={`flex-1 ${editingLocale ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {isSaving ? "Guardando..." : (editingLocale ? "Actualizar Datos" : "Agregar Participante")}
                                </Button>

                                {editingLocale && (
                                    <Button type="button" variant="outline" onClick={cancelEditing} className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300">
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-slate-300">Participantes Activos ({locales.length})</h2>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {locales.map(locale => (
                                    <motion.div
                                        key={locale.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-lg border flex justify-between items-center group transition-colors ${editingLocale?.id === locale.id ? 'bg-primary/20 border-primary/30' : 'bg-slate-900 border-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={locale.image_url || "/logo.png"} alt="mini" className="w-10 h-10 object-contain rounded bg-white/5 p-1" />
                                            <span className="font-medium">{locale.name}</span>
                                        </div>

                                        <div className="flex items-center gap-2 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handlePurge(locale)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-950/30 font-bold"
                                                title="PURGAR FRAUDE"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setRemovingLocale(locale)}
                                                className="h-8 w-8 p-0 text-orange-500 hover:text-orange-400 hover:bg-orange-950/30 font-bold"
                                                title="Eliminar Votos Manualmente"
                                            >
                                                <Eraser className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setInjectingLocale(locale)}
                                                className="h-8 w-8 p-0 text-primary hover:text-blue-400 hover:bg-blue-950/30"
                                                title="Inyectar Votos"
                                            >
                                                <Syringe className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => window.open(`/admin/restaurante/${locale.id}`, '_blank')}
                                                className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                                                title="Panel del Restaurante"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowingQrLocale(locale)}
                                                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                                title="Mostrar Código QR"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => startEditing(locale)}
                                                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(locale.id, locale.name)}
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                                                title="Borrar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>

                {/* Right Column: Live Data */}
                <div>
                    <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-full">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>🏆</span> Ranking en Vivo
                        </h2>

                        <div className="space-y-6">
                            {visitCounts.map((item, index) => (
                                <div key={item.id} className="relative">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className={`font-bold ${index === 0 ? 'text-yellow-400 text-lg' : 'text-slate-300'}`}>
                                            #{index + 1} {item.name}
                                        </span>
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono text-slate-400">{item.count} visitas</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Inventario: {item.prize_pool || 0}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${totalVisits > 0 ? (item.count / totalVisits) * 100 : 0}%` }}
                                            className={`h-full ${index === 0 ? 'bg-primary' : 'bg-slate-600'}`}
                                        />
                                    </div>
                                </div>
                            ))}

                            {visitCounts.length === 0 && (
                                <p className="text-center text-slate-500 py-10">Aún no hay visitas registradas.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* QR Modal */}
            <AnimatePresence>
                {showingQrLocale && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center relative"
                        >
                            <button
                                onClick={() => setShowingQrLocale(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{showingQrLocale.name}</h3>
                                <p className="text-slate-400 text-sm italic">Escanea este código para registrar la visita</p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl mx-auto inline-block border-8 border-white shadow-2xl">
                                {(() => {
                                    const qrValue = showingQrLocale.id === 'special' 
                                        ? `${window.location.origin}/especial`
                                        : `${window.location.origin}/treasure-hunt?id=${showingQrLocale.id}`
                                    
                                    return (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`} 
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    )
                                })()}
                            </div>

                            <p className="mt-6 text-slate-500 font-mono text-xs break-all opacity-50">
                                {showingQrLocale.id === 'special' ? 'URL de Cortesía' : `ID: ${showingQrLocale.id}`}
                            </p>

                            <Button
                                onClick={() => window.print()}
                                className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2 py-6 rounded-2xl"
                            >
                                <QrCode className="w-4 h-4" /> IMPRIMIR QR
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
        </div>
    )
}
