'use client'

import { motion, AnimatePresence } from "framer-motion"
import { X, Info, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"

export type StatusType = 'info' | 'success' | 'error'

interface StatusModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type?: StatusType
}

export function StatusModal({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'info' 
}: StatusModalProps) {
    
    // Theme configuration based on status type
    const themes = {
        info: {
            icon: <Info size={40} className="text-white" />,
            glow: "bg-[#00D1FF]/20",
            gradient: "from-[#00D1FF] to-[#0038A8]",
            shadow: "shadow-[0_0_30px_rgba(0,209,255,0.4)]",
            accent: "text-[#00D1FF]"
        },
        success: {
            icon: <CheckCircle2 size={40} className="text-white" />,
            glow: "bg-[#00FF85]/20",
            gradient: "from-[#00FF85] to-[#00A85C]",
            shadow: "shadow-[0_0_30px_rgba(0,255,133,0.4)]",
            accent: "text-[#00FF85]"
        },
        error: {
            icon: <AlertTriangle size={40} className="text-white" />,
            glow: "bg-[#FF4B1F]/20",
            gradient: "from-[#FF4B1F] to-[#A82B00]",
            shadow: "shadow-[0_0_30px_rgba(255,75,31,0.4)]",
            accent: "text-[#FF4B1F]"
        }
    }

    const theme = themes[type]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    {/* Dark Backdrop with Heavy Blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Saga Alert Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-[#0A0A0B]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Status Glow Effects */}
                        <div className={`absolute -top-24 -left-24 w-48 h-48 ${theme.glow} blur-[60px] rounded-full`} />
                        <div className={`absolute -bottom-24 -right-24 w-48 h-48 ${theme.glow} opacity-50 blur-[60px] rounded-full`} />

                        {/* Top Accent Line */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${theme.gradient}`} />

                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                            aria-label="Cerrar aviso"
                        >
                            <X size={18} />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Animated Icon Orb */}
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className={`absolute inset-0 ${theme.glow} blur-2xl rounded-full`}
                                />
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center border-2 border-white/30 ${theme.shadow}`}>
                                    {theme.icon}
                                </div>
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <Sparkles size={18} className={theme.accent} />
                                </motion.div>
                            </div>

                            {/* Alert Content */}
                            <h2 className="text-3xl font-lilita text-white uppercase tracking-tight mb-3">
                                {title}
                            </h2>
                            
                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-8 px-2">
                                {message}
                            </p>

                            {/* Dismiss Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white font-lilita text-lg uppercase tracking-wider shadow-lg border border-white/10`}
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
