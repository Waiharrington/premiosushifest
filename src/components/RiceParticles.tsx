"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface RiceGrain {
  id: number;
  initialX: number;
  initialRotate: number;
  targetRotate: number;
  duration: number;
  delay: number;
  scale: number;
  blur: number;
  layer: 'foreground' | 'midground' | 'background';
  type: 'rice' | 'roll';
  swingRange: number; 
  spawnTop: string; 
  randomDelay: number; // ADDED
}

export function RiceParticles() {
  const [grains, setGrains] = useState<RiceGrain[]>([]);

  useEffect(() => {
    // REDUCED: 10 particles for much better mobile performance
    const newGrains = Array.from({ length: 12 }).map((_, i) => {
      const layerRand = Math.random();
      let layer: 'foreground' | 'midground' | 'background' = 'midground';
      let scale = 0.8;
      let duration = 12;

      if (layerRand > 0.85) {
        layer = 'foreground';
        scale = 1.3 + Math.random() * 0.3;
        duration = 8 + Math.random() * 4;
      } else if (layerRand < 0.25) {
        layer = 'background';
        scale = 0.5 + Math.random() * 0.2;
        duration = 16 + Math.random() * 6;
      } else {
        layer = 'midground';
        scale = 0.8 + Math.random() * 0.4;
        duration = 11 + Math.random() * 5;
      }

      return {
        id: i,
        initialX: Math.random() * 100,
        spawnTop: `${Math.random() * 120 - 20}%`, 
        initialRotate: Math.random() * 360,
        targetRotate: Math.random() * 1080 + 720,
        duration,
        delay: 0,
        scale,
        blur: 0, // DISABLED BLUR FILTERS FOR PERFORMANCE
        layer,
        type: Math.random() > 0.9 ? 'roll' as const : 'rice' as const,
        swingRange: 15 + Math.random() * 25,
        randomDelay: -duration * Math.random(),
      };
    });
    
    setTimeout(() => {
        setGrains(newGrains);
    }, 0);
  }, []);

  if (grains.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {grains.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 0, 
            top: p.spawnTop, 
            left: `${p.initialX}%`,
            rotate: p.initialRotate,
            scale: p.scale
          }}
          animate={{ 
            opacity: [0, 0.5, 0.5, 0], 
            top: ["-10%", "110%"],
            x: [0, p.swingRange, -p.swingRange, 0], 
            rotate: [p.initialRotate, p.targetRotate],
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: p.randomDelay,
          }}
          className="absolute will-change-transform"
          style={{ 
            width: p.type === 'roll' ? '28px' : '3px', 
            height: p.type === 'roll' ? '28px' : '8px',
            zIndex: p.layer === 'foreground' ? 50 : p.layer === 'midground' ? 30 : 10
          }}
        >
          {p.type === 'roll' ? (
            <div className="relative w-full h-full rounded-full overflow-hidden opacity-80">
               <Image 
                 src="/sushi-roll.png" 
                 alt="Sushi" 
                 fill 
                 className="object-cover"
                 sizes="28px"
               />
            </div>
          ) : (
            <div className="w-full h-full bg-white/30 rounded-full" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
