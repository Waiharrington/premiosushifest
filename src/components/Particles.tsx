"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export const Particles = ({ color = "#f97316" }: { color?: string }) => {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([])

    useEffect(() => {
        const count = 20
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 20 + 10,
        }))
        // Wrap in a non-sync block if needed, but in React 18/19 
        // this is usually fine unless it's a loop. 
        // However, one way to avoid the 'synchronous' warning is to use functional update or a slight delay.
        requestAnimationFrame(() => {
            setParticles(newParticles)
        })
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full blur-[1px]"
                    initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
                    animate={{
                        y: [`${p.y}%`, `${p.y - 20}%`, `${p.y}%`],
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: color,
                    }}
                />
            ))}
        </div>
    )
}
