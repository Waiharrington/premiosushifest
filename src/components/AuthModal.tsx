"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { RiceParticles } from "./RiceParticles";
import { useAuth } from "@/context/AuthContext";
import { X, User, Phone, CreditCard, Sparkles } from "lucide-react";

interface AuthModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
    const { login, register } = useAuth();
    const [isRegistering, setIsRegistering] = useState(true);
    const [cedula, setCedula] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [honeypot, setHoneypot] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!cedula) return setError("La cédula es obligatoria");

        setLoading(true);
        const trimmedCedula = cedula.trim();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (honeypot) return;

        try {
            if (isRegistering) {
                if (!trimmedName || !trimmedPhone) return setError("Nombre y teléfono obligatorios");
                const success = await register(trimmedName, trimmedCedula, trimmedPhone);
                if (success) { onSuccess?.(); onClose(); }
                else setError("Error al registrar.");
            } else {
                const success = await login(trimmedCedula);
                if (success) { onSuccess?.(); onClose(); }
                else setError("Cédula no encontrada.");
            }
        } catch (err: unknown) {
            const errorInstance = err as Error;
            if (errorInstance.message === "PHONE_EXISTS") {
                setError("Este número de teléfono ya está registrado.");
            } else {
                setError("Ocurrió un error inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 overflow-y-auto"
        >
            {/* Backdrop */}
            <div 
                onClick={onClose}
                className="absolute inset-0 z-0 bg-black/80 backdrop-blur-2xl cursor-pointer"
            >
                <RiceParticles />
            </div>

            {/* Modal Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="relative w-full max-w-md my-auto py-12"
            >
                {/* Character Header - Moved OUTSIDE overflow container to avoid clipping head */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-40 group select-none pointer-events-none">
                    <Image src="/sushi-character.png" alt="Sushi" width={128} height={128} className="w-full h-auto animate-float" priority />
                </div>

                <div className="relative w-full bg-[#000B2A]/90 border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden">
                    {/* Visual Polish */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
                    
                    <div className="relative z-10 pt-20">
                        <button
                            onClick={onClose}
                            className="absolute -top-4 -right-4 bg-white/5 border border-white/10 p-3 rounded-full text-white/40 hover:text-white transition-all active:scale-90"
                            title="Cerrar modal"
                        >
                            <X size={20} />
                        </button>

                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-lilita text-white tracking-tight uppercase mb-1">
                            {isRegistering ? "¡ÚNETE!" : "¡HOLA!"}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                             <Sparkles size={12} className="text-[#00B2FF]" />
                             <p className="text-[#00B2FF] font-black text-[10px] uppercase tracking-[0.3em]">
                                {isRegistering ? "Crea tu perfil de catador" : "Ingresa para continuar"}
                             </p>
                             <Sparkles size={12} className="text-[#00B2FF]" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegistering && (
                            <div className="space-y-2 group">
                                <label className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 transition-colors group-focus-within:text-white">
                                    <User size={12} /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Akio Tanaka"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 text-white placeholder:text-white/10 transition-all font-medium text-lg shadow-inner"
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2 group">
                            <label className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 transition-colors group-focus-within:text-white">
                                <CreditCard size={12} /> Cédula de Identidad
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: 8-888-888"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 text-white placeholder:text-white/10 transition-all font-medium text-lg shadow-inner"
                            />
                        </div>

                        {isRegistering && (
                            <div className="space-y-2 group">
                                <label className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 transition-colors group-focus-within:text-white">
                                    <Phone size={12} /> WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej: 6666-6666"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 text-white placeholder:text-white/10 transition-all font-medium text-lg shadow-inner"
                                />
                                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" autoComplete="off" title="Security field" placeholder="Security" />
                            </div>
                        )}

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative h-16 rounded-2xl mt-4 overflow-hidden group shadow-[0_15px_30px_rgba(0,71,255,0.3)] transition-all active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#00B2FF] to-[#0047FF] animate-gradient-x" />
                            <span className="relative z-10 text-white font-lilita text-xl uppercase tracking-widest">
                                {loading ? "PROCESANDO..." : (isRegistering ? "CREAR CUENTA" : "INGRESAR")}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center flex flex-col items-center gap-6">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-[10px] text-white/30 hover:text-white uppercase tracking-[0.3em] font-black transition-colors"
                        >
                            {isRegistering ? "¿Ya tienes cuenta? Ingresa aquí" : "¿Eres nuevo? Únete a la ruta"}
                        </button>

                        {/* Demo Helper */}
                        <button
                            type="button"
                            onClick={() => {
                                setCedula("8-888-888");
                                setName("Catador Premium");
                                setPhone("6666-6666");
                            }}
                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/20 hover:text-white/40 hover:bg-white/10 transition-all flex items-center gap-2 uppercase tracking-widest font-bold"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            Autocompletar Demo
                        </button>
                    </div>
                </div>
            </div>
            </motion.div>

        </motion.div>
    );
}
