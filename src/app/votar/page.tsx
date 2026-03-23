"use client";

import { useEffect, useState } from "react";
import { LocaleGrid } from "@/components/LocaleGrid";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Image from "next/image";
import { Particles } from "@/components/Particles";
import { SponsorBackground } from "@/components/SponsorBackground";

export default function VotingPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [locales, setLocales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data, error } = await supabase.from('locales').select('*').order('name');
                if (error) throw error;
                setLocales(data || []);
            } catch (err: unknown) {
                console.error("Error fetching locales:", err);
                setError((err as Error).message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background text-white relative overflow-x-hidden selection:bg-primary/30">

            {/* Background Layer */}
            <div className="fixed top-0 left-0 w-full h-[100svh] md:h-screen md:inset-0 z-0">


                {/* Mobile Background */}
                <div className="absolute inset-0 z-0 block md:hidden">
                    <Image
                        src="/bg-home-mobile.jpg"
                        alt="Mobile Background"
                        fill
                        className="object-cover opacity-50"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>

                {/* Desktop Background */}
                <div className="absolute inset-0 z-0 hidden md:block">
                    <Image
                        src="/bg-home.jpg"
                        alt="Desktop Background"
                        fill
                        className="object-cover opacity-30"
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>

                <Particles color="#0537BB" />
                <SponsorBackground />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen pt-2 md:pt-12 bg-gradient-to-b from-background/40 to-background/80">

                {/* Header Section */}
                <div className="text-center px-4 mb-2">

                    {/* Integrated Header: Sponsors + Main Logo (Optional, if we want exact mirror, but user just said text/proportions. Let's fix text first) */}

                    {/* Crown */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative z-20 -mt-6 md:-mt-12 -mb-10 md:-mb-20"
                    >
                        <Image src="/crown-header.png" alt="Crown" width={500} height={250} className="w-[240px] md:w-[400px] h-auto drop-shadow-lg mx-auto" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-2xl md:text-4xl lg:text-6xl text-white uppercase leading-none tracking-tight mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-lilita max-w-5xl mx-auto"
                    >
                        ¡VOTA POR TU LOCAL FAVORITO<br />DE SUSHI EN PANAMÁ!
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/90 text-sm md:text-xl lg:text-2xl max-w-3xl mx-auto font-medium leading-relaxed px-4"
                    >
                        Elige cuál es el mejor negocio especialista en sushi del <span className="font-bold underline decoration-primary/50">Sushifest 🏆</span>
                    </motion.p>
                </div>

                {/* Voting Grid */}
                <div className="flex-grow px-4 pb-20 mt-6 md:mt-16">
                    <div className="max-w-5xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white">
                                <div className="animate-spin text-4xl mb-4">🍣</div>
                                <p>Cargando participantes...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-900/50 border border-red-500 rounded text-red-200 text-center max-w-md mx-auto">
                                <p>Error de conexión</p>
                            </div>
                        ) : (
                            <LocaleGrid locales={locales} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 text-center text-white/40 text-[10px] z-20 relative uppercase tracking-[0.2em]">
                    <p>© 2026 SUSHIFEST • BY EPIC MARKETING • PANAMÁ</p>
                </footer>

            </div>
        </div>
    );
}
