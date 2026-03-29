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
            
            // Premium Metallic Gradient (Deep Navy to Saga Blue)
            const gradient = ctx.createLinearGradient(0, 0, width, height)
            gradient.addColorStop(0, '#000B2A')
            gradient.addColorStop(0.5, '#011543')
            gradient.addColorStop(1, '#0038A8')
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)
            
            // Add Elegant "Saga Dust" (Noise/Metallic Texture)
            for (let i = 0; i < 3000; i++) {
                const x = Math.random() * width
                const y = Math.random() * height
                const size = Math.random() * 1.5
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`
                ctx.fillRect(x, y, size, size)
            }

            // Decorative Golden Dust Border
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(255, 183, 0, 0.25)' // Golden/Orange tint
            ctx.strokeRect(15, 15, width - 30, height - 30)
            
            // Typography (Premium Render)
            // Using bold sans-serif as Lilita One fallback
            ctx.font = '900 36px "Montserrat", sans-serif'
            ctx.fillStyle = 'rgba(255,255,255,0.95)'
            ctx.textAlign = 'center'
            ctx.shadowColor = 'rgba(0,0,0,0.8)'
            ctx.shadowBlur = 15
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 4
            ctx.fillText('RASPA AQUÍ', width / 2, height / 2)
            
            // Subtext (Saga Explorer vibe)
            ctx.font = '900 10px "Montserrat", sans-serif'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0
            const subtext = 'PARA REVELAR TU TESORO'
            ctx.fillText(subtext, width / 2, height / 2 + 50)
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
