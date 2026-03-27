'use client'

import { motion, AnimatePresence } from "framer-motion"
import { X, HelpCircle, Sparkles } from "lucide-react"

interface MysteryModalProps {
    isOpen: boolean
    onClose: () => void
}

export function MysteryModal({ isOpen, onClose }: MysteryModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                    {/* Backdrop with Heavy Blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00D1FF]/10 blur-[60px] rounded-full" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FF4B1F]/10 blur-[60px] rounded-full" />


                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
                            aria-label="Cerrar modal"
                            title="Cerrar modal"
                        >
                            <X size={18} />
                        </button>


                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Icon Orb */}
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-[#00D1FF]/20 blur-2xl rounded-full"
                                />
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#0038A8] flex items-center justify-center border-2 border-white/20 shadow-[0_0_30px_rgba(0,209,255,0.4)]">
                                    <HelpCircle size={40} className="text-white" />
                                </div>
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-2 -right-2"
                                >
                                    <Sparkles size={20} className="text-[#FF4B1F]" />
                                </motion.div>

                            </div>

                            {/* Text Content */}
                            <h2 className="text-3xl font-lilita text-white uppercase tracking-tight mb-4">
                                Negocio <span className="text-[#00D1FF]">Misterioso</span>
                            </h2>
                            
                            <p className="text-white/70 text-[13px] font-medium leading-relaxed mb-8 px-2 lowercase first-letter:uppercase">
                                visita este local y escanea su <span className="text-white font-bold">código QR</span> para revelarlo en el mapa y descubrir tu sorpresa.
                            </p>

                            {/* Action Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0038A8] to-[#00D1FF] text-white font-lilita text-lg uppercase tracking-wider shadow-[0_10px_20px_rgba(0,56,168,0.4)] border border-white/20"
                            >
                                ¡Entendido!
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
