'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { X, QrCode as QrIcon, Camera, Sparkles } from 'lucide-react'
import { Locale } from '@/types'

interface QRScannerUIProps {
    isOpen: boolean
    onClose: () => void
    onScan: (decodedText: string) => void
    locales?: Locale[]
    visitedIds?: string[]
}

export function QRScannerUI({ isOpen, onClose, onScan, locales = [], visitedIds = [] }: QRScannerUIProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [isInitializing, setIsInitializing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const startScanner = async () => {
            if (!isOpen) return
            
            setIsInitializing(true)
            setError(null)
            
            try {
                // Ensure the container exists before initializing
                const readerElement = document.getElementById("qr-reader");
                if (!readerElement) {
                    setTimeout(startScanner, 100);
                    return;
                }

                const scanner = new Html5Qrcode("qr-reader")
                scannerRef.current = scanner

                const config = {
                    fps: 15,
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                }

                await scanner.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        onScan(decodedText)
                        handleClose()
                    },
                    () => {} // silent failure for frames
                )
                
                if (mounted) setIsInitializing(false)
            } catch (err) {
                const errorInstance = err as Error
                console.error("Scanner Error:", errorInstance)
                if (mounted) {
                    setError("No se pudo acceder a la cámara. Asegúrate de dar permisos en tu navegador.")
                    setIsInitializing(false)
                }
            }
        }

        const handleClose = async () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                try {
                    await scannerRef.current.stop()
                } catch (e) {
                    console.error("Error stopping scanner", e)
                }
            }
            onClose()
        }

        if (isOpen) {
            startScanner()
        }

        return () => {
            mounted = false
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(e => console.error(e))
                }
            }
        }
    }, [isOpen, onScan, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-0 bg-black/90 backdrop-blur-3xl"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-md bg-[#000B2A]/80 border border-white/10 rounded-[3.5rem] overflow-hidden p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,1)] backdrop-blur-2xl"
                    >
                        {/* Golden/Blue accent border top */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-lilita text-white tracking-tight uppercase">ESCANEAR RUTA</h2>
                                <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] font-sans">Sushifest Panamá • 2026</p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-full text-white/50 hover:text-white transition-all active:scale-90"
                                aria-label="Cerrar escáner"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative aspect-square bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner flex items-center justify-center group">
                            <div id="qr-reader" className="w-full h-full" />
                            
                            {isInitializing && (
                                <div className="absolute inset-0 z-[160] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_rgba(0,71,255,0.4)] mb-6" 
                                    />
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.4em] animate-pulse">Accediendo a la Cámara...</p>
                                </div>
                            )}

                            {error && (
                                <div className="absolute inset-0 z-[160] flex flex-col items-center justify-center bg-black/90 p-10 text-center">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                        <Camera className="text-red-500" size={32} />
                                    </div>
                                    <p className="text-white text-sm font-bold uppercase tracking-tight mb-8 leading-relaxed px-4">{error}</p>
                                    <button 
                                        onClick={onClose}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] text-white font-black uppercase tracking-[0.3em] border border-white/10 transition-all active:scale-95"
                                    >
                                        Entendido
                                    </button>
                                </div>
                            )}
                            
                            {/* Scanning UI Overlays (Elite Digital HUD) */}
                            {!isInitializing && !error && (
                                <>
                                    <div className="absolute inset-0 pointer-events-none z-[155]">
                                        {/* CSS Hack to hide library's internal white borders */}
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            #qr-reader__scan_region div { border: none !important; }
                                            #qr-reader { border: none !important; }
                                        `}} />

                                        {/* Elite Neon Blue Corners */}
                                        <div className="absolute top-12 left-12 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-2xl shadow-[-5px_-5px_25px_-2px_rgba(0,71,255,0.6)]" />
                                        <div className="absolute top-12 right-12 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-2xl shadow-[5px_-5px_25px_-2px_rgba(0,71,255,0.6)]" />
                                        <div className="absolute bottom-12 left-12 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-2xl shadow-[-5px_5px_25px_-2px_rgba(0,71,255,0.6)]" />
                                        <div className="absolute bottom-12 right-12 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-2xl shadow-[5px_5px_25px_-2px_rgba(0,71,255,0.6)]" />
                                        
                                        {/* Electric Laser Line */}
                                        <motion.div 
                                            animate={{ top: ['25%', '75%', '25%'] }}
                                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(0,71,255,1)] z-10"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] md:text-xs text-white/40 font-black uppercase tracking-[0.3em] leading-relaxed">
                                Enfoca el código QR del local <br/> para registrar tu visita 🔥
                            </p>
                        </div>

                        {/* Demo / Secondary Actions Area */}
                        <div className="mt-12 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-grow bg-white/5" />
                                <Sparkles size={14} className="text-secondary/40" />
                                <div className="h-[1px] flex-grow bg-white/5" />
                            </div>
                            
                            {/* Demo Action with Premium Styling */}
                            <button
                                onClick={() => {
                                    const nextLocale = locales.find(l => !visitedIds.includes(l.id)) || locales[0]
                                    if (nextLocale) {
                                        onScan(nextLocale.id)
                                        onClose()
                                    }
                                }}
                                className="w-full group relative py-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-inner"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <QrIcon size={18} className="text-primary group-hover:scale-110 transition-transform" />
                                <span className="relative z-10 text-white/70 group-hover:text-white font-lilita uppercase tracking-widest text-xs">Simular Escaneo Profesional</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
