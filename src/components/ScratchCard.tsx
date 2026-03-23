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
    brushSize = 30, 
    percentageToComplete = 50 
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size for matching the container
        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect()
            if (rect) {
                canvas.width = rect.width
                canvas.height = rect.height
                
                // Fill with gray
                ctx.fillStyle = '#4b5563' // gray-600
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                // Add some texture/text
                ctx.font = '24px font-lilita'
                ctx.fillStyle = '#9ca3af'
                ctx.textAlign = 'center'
                ctx.fillText('¡RASPA AQUÍ!', canvas.width / 2, canvas.height / 2)
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

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
        <div className="relative w-full aspect-[4/3] bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            {/* Content underneath */}
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                {children}
            </div>

            {/* Scratch layer */}
            <AnimatePresence>
                {!isComplete && (
                    <motion.canvas
                        ref={canvasRef}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 touch-none cursor-pointer"
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
