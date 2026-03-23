"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { claimCoupon, getMyCoupon, redeemCoupon } from "@/actions/coupon";
import { useRouter } from "next/navigation";
import { Particles } from "@/components/Particles";

export default function CouponPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [coupon, setCoupon] = useState<{ id: string; status: string; code: string; locales?: { name: string; image_url: string } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const fetchCoupon = useCallback(async () => {
        if (!user) return;
        const myCoupon = await getMyCoupon(user.id);
        setCoupon(myCoupon);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            const timer = setTimeout(() => setIsAuthModalOpen(true), 0);
            return () => clearTimeout(timer);
        } else if (user) {
            const timer = setTimeout(() => {
                fetchCoupon();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user, authLoading, fetchCoupon]);

    const handleClaim = async () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setLoading(true);
        const res = await claimCoupon(user.id);
        if (res.success) {
            fetchCoupon();
        } else {
            alert(res.error);
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!coupon) return;
        if (confirm("¿Estás seguro que quieres redimir tu cupón ahora? Esto solo lo debe hacer el personal del restaurante.")) {
            setIsRedeeming(true);
            const res = await redeemCoupon(coupon.id);
            if (res.success) {
                fetchCoupon();
            } else {
                alert(res.error);
            }
            setIsRedeeming(false);
        }
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-primary">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-lilita uppercase tracking-widest text-white/60">Cargando tu sorpresa...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white relative overflow-hidden flex flex-col items-center py-10 px-6">
            <div className="fixed inset-0 z-0">
                <Image src="/bg-home.jpg" alt="BG" fill className="object-cover opacity-20" unoptimized />
                <Particles color="#0537BB" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <Image src="/logo.png" alt="Sushifest" width={100} height={100} className="rounded-full object-cover drop-shadow-lg" />
                </motion.div>

                <AnimatePresence mode="wait">
                    {!coupon ? (
                        <motion.div
                            key="no-coupon"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background/80 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-primary/10"
                        >
                            <h1 className="text-3xl font-lilita text-white">¡RECLAMA TU REGALO! 🍣</h1>
                            <p className="text-white/60 text-sm leading-relaxed uppercase tracking-wider">
                                Registra tus datos y obtén un Sushi sorpresa totalmente GRATIS en uno de nuestros restaurantes participantes.
                            </p>
                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-blue-700 text-white font-lilita text-2xl py-5 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 shadow-xl shadow-primary/20"
                            >
                                {loading ? "DESCUBRIENDO..." : "¡RECLAMAR MI SORPRESA! 🔥"}
                            </button>
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
                                Límite: 1 cupón por persona (válido con cédula)
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="coupon-claimed"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`w-full bg-background border ${coupon.status === 'redeemed' ? 'border-white/10 opacity-80' : 'border-primary/50'} rounded-[2.5rem] overflow-hidden shadow-2xl relative`}
                        >
                            {/* Paper cutout effect */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full" />
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full" />
                            <div className="absolute top-1/2 left-4 right-4 h-[1px] border-t border-dashed border-white/10" />

                            {/* Top Part: Restaurant */}
                            <div className="p-8 text-center space-y-4">
                                <div className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-2">Sushi Fest 2026 Presents</div>
                                <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-primary/30 p-1 bg-black overflow-hidden shadow-lg">
                                    <Image 
                                        src={coupon.locales?.image_url || "/logo.png"} 
                                        alt="Local" 
                                        fill 
                                        className="object-cover"
                                    />
                                    {coupon.status === 'redeemed' && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-secondary font-lilita text-2xl rotate-12 border-4 border-secondary px-2 rounded-lg">USADO</span>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-lilita text-white uppercase tracking-wider">
                                    {coupon.locales?.name || "RESTAURANTE SORPRESA"}
                                </h2>
                                <p className="text-xs text-white/50 uppercase tracking-widest">Vale por: 1 Sushi Roll Especial</p>
                            </div>

                            {/* Bottom Part: Code & Redeem */}
                            <div className="p-8 bg-white/5 pt-10 text-center space-y-4">
                                <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Cédula del Titular: {user?.cedula}</div>
                                <div className="font-mono text-3xl font-black text-white tracking-[0.2em] bg-black/40 py-3 rounded-xl border border-white/5">
                                    {coupon.code}
                                </div>
                                
                                {coupon.status !== 'redeemed' ? (
                                    <button
                                        onClick={handleRedeem}
                                        disabled={isRedeeming}
                                        className="w-full bg-white text-background font-lilita text-lg py-4 rounded-2xl hover:bg-primary hover:text-white transition-colors shadow-lg"
                                    >
                                        {isRedeeming ? "REDIMIENDO..." : "REDIMIR AHORA 🍱"}
                                    </button>
                                ) : (
                                    <div className="py-4 text-green-500 font-bold uppercase tracking-widest text-sm bg-green-500/10 rounded-2xl border border-green-500/20">
                                        ✓ Cupón Redimido con éxito
                                    </div>
                                )}
                                
                                <p className="text-[8px] text-white/30 leading-tight uppercase px-4">
                                    Este cupón es personal e intransferible. Debe presentarse con la cédula física en el restaurante.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => router.push("/")}
                    className="mt-10 text-white/60 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                >
                    ← Volver al Inicio
                </button>
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onSuccess={fetchCoupon}
            />
        </div>
    );
}
