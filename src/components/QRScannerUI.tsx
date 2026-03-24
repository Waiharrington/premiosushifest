'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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
                const scanner = new Html5Qrcode("qr-reader")
                scannerRef.current = scanner

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
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
                    setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.")
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
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-0 bg-black/40 backdrop-blur-3xl"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-black/90 border border-white/20 rounded-[2.5rem] overflow-hidden p-8 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-lilita text-white">ESCANEAR CÓDIGO QR</h2>
                            <button 
                                onClick={onClose} 
                                className="p-2 text-white/50 hover:text-white transition-colors"
                                aria-label="Cerrar escáner"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                            <div id="qr-reader" className="w-full h-full" />
                            
                            {isInitializing && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Iniciando cámara...</p>
                                </div>
                            )}

                            {error && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-8 text-center">
                                    <p className="text-red-400 text-xs font-bold uppercase mb-4">{error}</p>
                                    <button 
                                        onClick={onClose}
                                        className="px-6 py-2 bg-white/10 rounded-full text-[10px] text-white font-bold uppercase tracking-widest"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                            
                            {/* Overlay Frame */}
                            <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 m-12 rounded-lg opacity-50 border-dashed z-10" />
                        </div>

                        <p className="mt-6 text-center text-sm text-white/50 font-medium">
                            Apunta tu cámara al código QR <br className="hidden md:block"/> del restaurante para registrar tu visita.
                        </p>


                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="w-12 h-1 bg-primary/20 rounded-full animate-pulse mb-2" />
                            
                            {/* Demo Button */}
                            <button
                                onClick={() => {
                                    // Find first unvisited locale
                                    const nextLocale = locales.find(l => !visitedIds.includes(l.id)) || locales[0]
                                    if (nextLocale) {
                                        onScan(nextLocale.id)
                                        onClose()
                                    }
                                }}
                                className="w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white/70 font-lilita uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
                                ✨ Simular Escaneo (Demo)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
