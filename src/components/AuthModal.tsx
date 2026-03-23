"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const { register, login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(true);
    const [name, setName] = useState("");
    const [cedula, setCedula] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isRegistering) {
                if (!name || !cedula || !phone) {
                    setError("Por favor completa todos los campos");
                    setLoading(false);
                    return;
                }
                const res = await register(name, cedula, phone);
                if (res) {
                    onSuccess?.();
                    onClose();
                } else {
                    setError("Error al registrar usualmente porque la cédula ya existe");
                }
            } else {
                if (!cedula) {
                    setError("Por favor ingresa tu cédula");
                    setLoading(false);
                    return;
                }
                const success = await login(cedula);
                if (success) {
                    onSuccess?.();
                    onClose();
                } else {
                    setError("Cédula no encontrada. ¿Ya te registraste?");
                }
            }
        } catch {
            setError("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-background border border-primary/30 rounded-3xl overflow-hidden p-8 shadow-2xl shadow-primary/10"
                    >
                        <h2 className="text-3xl font-lilita text-white text-center mb-2">
                            {isRegistering ? "¡REGÍSTRATE!" : "¡BIENVENIDO!"}
                        </h2>
                        <p className="text-white/60 text-center mb-8 text-sm uppercase tracking-widest">
                            {isRegistering ? "Para votar y ganar premios" : "Ingresa tus datos para continuar"}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegistering && (
                                <div className="space-y-1">
                                    <label className="text-xs text-primary/70 font-bold ml-2 uppercase">Nombre Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Pérez"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-white/20"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs text-primary/70 font-bold ml-2 uppercase">Cédula</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 8-888-888"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-white/20"
                                />
                            </div>

                            {isRegistering && (
                                <div className="space-y-1">
                                    <label className="text-xs text-primary/70 font-bold ml-2 uppercase">Teléfono</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej: 6666-6666"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-white/20"
                                    />
                                </div>
                            )}

                            {error && (
                                <p className="text-red-400 text-sm text-center pt-2">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-blue-700 text-white font-lilita text-xl py-4 rounded-2xl mt-4 hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {loading ? "PROCESANDO..." : (isRegistering ? "REGISTRARME" : "INGRESAR")}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-sm text-primary/70 hover:text-primary underline underline-offset-4"
                            >
                                {isRegistering ? "¿Ya tienes cuenta? Ingresa aquí" : "¿Eres nuevo? Regístrate aquí"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
