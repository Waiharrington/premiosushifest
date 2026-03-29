'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScratchCardProps {
    onComplete: () => void
    children: React.ReactNode
    brushSize?: number
    percentageToComplete?: number
}

export function ScratchCard({ 
    onComplete, 
    children, 
    brushSize = 35, 
    percentageToComplete = 45 
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)

    const resize = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        if (width === 0 || height === 0) return

        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
            ctx.clearRect(0, 0, width, height)
            
            // Premium Metallic Gradient (Deep Blue to Primary)
            const gradient = ctx.createLinearGradient(0, 0, width, height)
            gradient.addColorStop(0, '#000B2A')
            gradient.addColorStop(0.5, '#0047FF')
            gradient.addColorStop(1, '#00B2FF')
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)
            
            // Add some "Noise/Texture" to the scratch area
            for (let i = 0; i < 2000; i++) {
                const x = Math.random() * width
                const y = Math.random() * height
                const size = Math.random() * 2
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`
                ctx.fillRect(x, y, size, size)
            }

            // Decorative border inside scratch
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
            ctx.strokeRect(10, 10, width - 20, height - 20)
            
            // Typography (Lilita One simulation)
            ctx.font = '900 32px sans-serif'
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.shadowColor = 'rgba(0,0,0,0.5)'
            ctx.shadowBlur = 10
            ctx.fillText('RASPA AQUÍ', width / 2, height / 2)
            
            ctx.font = '500 12px sans-serif'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.shadowBlur = 0
            ctx.fillText('PARA DESCUBRIR TU PREMIO', width / 2, height / 2 + 40)
        }
    }, [])

    useEffect(() => {
        // Initial resize
        setTimeout(resize, 100)
        
        const container = containerRef.current
        if (!container) return

        const observer = new ResizeObserver(() => {
            resize()
        })
        observer.observe(container)

        window.addEventListener('resize', resize)
        return () => {
            observer.disconnect()
            window.removeEventListener('resize', resize)
        }
    }, [resize])

    const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()

        let clientX, clientY
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else if ('clientX' in e) {
            clientX = (e as MouseEvent).clientX
            clientY = (e as MouseEvent).clientY
        } else {
            return { x: 0, y: 0 }
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, brushSize, 0, Math.PI * 2)
        ctx.fill()

        checkCompletion()
    }

    const checkCompletion = () => {
        if (isComplete) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let count = 0

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) count++
        }

        const percent = (count / (pixels.length / 4)) * 100
        if (percent > percentageToComplete) {
            setIsComplete(true)
            onComplete()
        }
    }

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        const pos = getPos(e)
        scratch(pos.x, pos.y)
    }

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || isComplete) return
        const pos = getPos(e)
        scratch(pos.x, pos.y)
    }

    const handleEnd = () => {
        setIsDrawing(false)
    }

    return (
        <div ref={containerRef} className="relative w-full aspect-[3/4] bg-[#000B2A] rounded-[3rem] overflow-hidden border border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto max-w-[320px]">
            <div className="absolute inset-0 flex items-center justify-center p-0 text-center">
                {children}
            </div>

            <AnimatePresence>
                {!isComplete && (
                    <motion.canvas
                        ref={canvasRef}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-20"
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
