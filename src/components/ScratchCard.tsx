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
    brushSize = 30, 
    percentageToComplete = 50 
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
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, width, height)
            gradient.addColorStop(0, '#0052cc')
            gradient.addColorStop(1, '#0070f3')
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)
            
            ctx.font = '24px Lilita One, sans-serif'
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.textAlign = 'center'
            ctx.fillText('¡RASPA AQUÍ!', width / 2, height / 2)
            ctx.font = '12px sans-serif'
            ctx.fillText('PARA DESCUBRIR TU PREMIO', width / 2, height / 2 + 30)
        }
    }, [])

    useEffect(() => {
        resize()
        
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
        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as MouseEvent).clientX
            clientY = (e as MouseEvent).clientY
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
        <div ref={containerRef} className="relative w-full aspect-[3/4] bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group shadow-2xl mx-auto max-w-[320px]">
            <div className="absolute inset-0 flex items-center justify-center p-0 text-center">
                {children}
            </div>

            <AnimatePresence>
                {!isComplete && (
                    <motion.canvas
                        ref={canvasRef}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 touch-none cursor-pointer z-20"
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
