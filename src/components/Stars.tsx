"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface StarsProps {
    value: number;
    onChange: (value: number) => void;
    label: string;
    readOnly?: boolean;
}

export function Stars({ value, onChange, label, readOnly }: StarsProps) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-primary/70 uppercase tracking-widest leading-none mb-1">
                {label} {readOnly && <span className="text-[10px] text-white/20">(Ya Calificado)</span>}
            </span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        whileHover={readOnly ? {} : { scale: 1.2 }}
                        whileTap={readOnly ? {} : { scale: 0.9 }}
                        onClick={() => !readOnly && onChange(star)}
                        onMouseEnter={() => !readOnly && setHover(star)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                        style={{ cursor: readOnly ? "default" : "pointer" }}
                        className={`text-3xl transition-colors ${
                            star <= (hover || value) ? "text-primary" : "text-white/10"
                        }`}
                    >
                        ★
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
