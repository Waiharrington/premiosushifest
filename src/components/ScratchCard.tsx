'use client'

import React, { useRef, useEffect, useState } from 'react'
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
    percentageToComplete = 50 
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const drawLayer = () => {
            const rect = container.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return

            const dpr = window.devicePixelRatio || 1
            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            ctx.scale(dpr, dpr)
            
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`
            
            // Fill with brand primary gradient
            const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
            gradient.addColorStop(0, '#0066FF')
            gradient.addColorStop(1, '#00B2FF')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, rect.width, rect.height)

            // Add some subtle pattern/texture
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'
            ctx.setLineDash([5, 10])
            for(let i=0; i<rect.width+rect.height; i+=20) {
                ctx.beginPath()
                ctx.moveTo(i, 0)
                ctx.lineTo(0, i)
                ctx.stroke()
            }
            ctx.setLineDash([])

            // Add center text
            ctx.font = 'bold 24px Lilita One, system-ui'
            ctx.fillStyle = '#FFFFFF'
            ctx.textAlign = 'center'
            ctx.shadowColor = 'rgba(0,0,0,0.3)'
            ctx.shadowBlur = 10
            ctx.fillText('¡RASPA AQUÍ', rect.width / 2, rect.height / 2 - 10)
            ctx.fillText('PARA GANAR!', rect.width / 2, rect.height / 2 + 25)
        }

        const resizeObserver = new ResizeObserver(() => {
            if (!isComplete) drawLayer()
        })

        resizeObserver.observe(container)
        return () => resizeObserver.disconnect()
    }, [isComplete])

    const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        const dpr = window.devicePixelRatio || 1
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

        const dpr = window.devicePixelRatio || 1
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

    const handleEnd = () => setIsDrawing(false)

    return (
        <div ref={containerRef} className="relative w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/10 group shadow-2xl mx-auto">
            {/* Content underneath */}
            <div className="absolute inset-0 flex items-center justify-center p-0 text-center overflow-hidden">
                {children}
            </div>

            {/* Scratch layer */}
            <AnimatePresence>
                {!isComplete && (
                    <motion.canvas
                        ref={canvasRef}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 touch-none cursor-pointer z-10"
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
