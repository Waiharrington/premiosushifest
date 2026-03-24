'use client'

import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface QRScannerUIProps {
    isOpen: boolean
    onClose: () => void
    onScan: (decodedText: string) => void
    locales?: Locale[]
    visitedIds?: string[]
}

export function QRScannerUI({ isOpen, onClose, onScan, locales = [], visitedIds = [] }: QRScannerUIProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
                },
                /* verbose= */ false
            )

            scannerRef.current.render(
                (decodedText) => {
                    onScan(decodedText)
                    onClose()
                },
                () => {
                    // Handle scan error if needed
                }
            )

            return () => {
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Error clearing scanner", err))
                    scannerRef.current = null
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

                        <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                            <div id="qr-reader" className="w-full h-full" />
                            
                            {/* Overlay Frame */}
                            <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 m-12 rounded-lg opacity-50 border-dashed" />
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
