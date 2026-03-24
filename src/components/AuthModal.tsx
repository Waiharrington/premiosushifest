"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { RiceParticles } from "./RiceParticles";
import { useAuth } from "@/context/AuthContext";

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
    
    // Security fields
    const [honeypot, setHoneypot] = useState("");
    const [mathChallenge, setMathChallenge] = useState(() => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        return { a, b, userResult: "" };
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!cedula) return setError("La cédula es obligatoria");

        setLoading(true);
        const trimmedCedula = cedula.trim();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        // Bot check: Honeypot (must be empty)
        if (honeypot) {
            console.warn("Bot detected via honeypot");
            return; // Silent fail for bots
        }

        // Bot check: Math challenge
        if (isRegistering) {
            if (parseInt(mathChallenge.userResult) !== (mathChallenge.a + mathChallenge.b)) {
                setLoading(false);
                return setError("Resultado matemático incorrecto.");
            }
        }

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
        } catch (err) {
            const errorInstance = err as Error;
            if (errorInstance.message === "PHONE_EXISTS") {
                setError("Este número de teléfono ya está registrado.");
            } else {
                setError("Error inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-hidden select-none"
        >
            {/* Backdrop Catch (Fixed & Instant) */}
            <div 
                onClick={onClose}
                className="absolute inset-0 z-0 cursor-pointer pointer-events-auto"
            >
                <Image 
                    src="/modal-bg.png" 
                    alt="Fondo Estampado" 
                    fill 
                    className="object-cover opacity-100" // SHARP PATTERN
                    priority 
                />
                <div className="absolute inset-0 bg-black/10" /> {/* LIGHTER VIGNETTE FOR 100% VISIBILITY */}
                <RiceParticles />
            </div>

            {/* Modal Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 400 
                }}
                className="relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_25px_90px_rgba(0,0,0,1)] overflow-visible pointer-events-auto will-change-transform"
                style={{ willChange: 'transform, opacity' } as React.CSSProperties}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className="absolute top-6 right-8 z-[210] w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Background Glass Layer (SOLIDIFIED FOR READABILITY) */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden z-0 border border-white/20 shadow-2xl bg-black/90 backdrop-blur-3xl">
                    <div className="absolute inset-0 scale-110 blur-xl opacity-60"> {/* BLURRED PATTERN INSIDE */}
                        <Image src="/modal-bg.png" alt="F" fill className="object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/20" /> {/* DARK OVERLAY TO PROTECT TEXT */}
                    <motion.div 
                        animate={{ x: ['-200%', '300%'] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]"
                    />
                </div>

                {/* Character (Lowered and optimized) */}
                <div className="absolute -top-2 left-1/2 -track-x-1/2 w-32 h-auto z-50 pointer-events-none translate-x-[-50%]">
                    <Image src="/sushi-character.png" alt="Character" width={128} height={100} className="w-full h-auto drop-shadow-2xl" priority />
                </div>

                {/* Content */}
                <div className="relative z-10 pt-16">
                    <h2 className="text-4xl font-lilita text-white text-center mb-1 tracking-tight uppercase">
                        {isRegistering ? "¡REGÍSTRATE!" : "¡BIENVENIDO!"}
                    </h2>
                    <p className="text-[#00B2FF] font-black text-center mb-8 text-[11px] uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(0,178,255,0.4)]">
                        {isRegistering ? "Elige el mejor sushi de Panamá" : "Ingresa para votar por tu favorito"}
                    </p>

                    {/* DEMO BUTTON (Testing only) */}
                    <div className="flex justify-center mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setCedula("8-888-888");
                                setName("Demo User");
                                setPhone("6666-6666");
                            }}
                            className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase font-bold tracking-widest flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00B2FF] animate-pulse" />
                            RELLENAR DATOS DEMO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div className="space-y-1 px-1">
                                <label className="text-[10px] text-white/40 font-bold ml-4 uppercase tracking-widest">Nombre Completo</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00B2FF] text-white text-base"
                                />
                            </div>
                        )}
                        <div className="space-y-1 px-1">
                            <label className="text-[10px] text-white/40 font-bold ml-4 uppercase tracking-widest">Cédula</label>
                            <input
                                type="text"
                                placeholder="Ej: 8-888-888"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00B2FF] text-white text-base"
                            />
                        </div>
                        {isRegistering && (
                            <div className="space-y-4 px-1">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/40 font-bold ml-4 uppercase tracking-widest">Teléfono</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej: 6666-6666"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00B2FF] text-white text-base"
                                    />
                                </div>

                                {/* Math Challenge */}
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/40 font-bold ml-4 uppercase tracking-widest">Seguridad: ¿Cuánto es {mathChallenge.a} + {mathChallenge.b}?</label>
                                    <input
                                        type="number"
                                        placeholder="Resultado"
                                        value={mathChallenge.userResult}
                                        onChange={(e) => setMathChallenge(prev => ({ ...prev, userResult: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-[#00B2FF] text-white text-base"
                                    />
                                </div>

                                {/* Honeypot (Hidden) */}
                                <input
                                    type="text"
                                    name="website"
                                    title="website"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    className="hidden"
                                    autoComplete="off"
                                />
                            </div>
                        )}
                        {error && <p className="text-red-400 text-[11px] text-center font-bold uppercase">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-15 rounded-2xl mt-4 bg-gradient-to-r from-[#0066FF] to-[#00B2FF] text-white font-black text-lg uppercase tracking-wider"
                        >
                            {loading ? "..." : (isRegistering ? "REGISTRARME" : "INGRESAR")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-bold transition-all"
                        >
                            {isRegistering ? "¿YA TIENES CUENTA? INGRESA" : "¿ERES NUEVO? REGÍSTRATE"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
