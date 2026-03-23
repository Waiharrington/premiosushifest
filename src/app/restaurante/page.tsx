"use client";

import { useState } from "react";
import { getLocaleByName, getRedeemedCoupons } from "@/actions/restaurant";
import { redeemCoupon } from "@/actions/coupon";
import { supabase } from "@/lib/supabase";
import { Particles } from "@/components/Particles";

interface Locale {
    id: string
    name: string
    image_url: string
}

interface Coupon {
    id: string
    status: string
    code: string
    redeemed_at?: string
    profiles?: {
        full_name: string
        cedula: string
    }
}

export default function RestaurantPage() {
    const [locale, setLocale] = useState<Locale | null>(null);
    const [searchName, setSearchName] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [redeemedList, setRedeemedList] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = await getLocaleByName(searchName);
        if (data) {
            setLocale(data);
            const list = await getRedeemedCoupons(data.id);
            setRedeemedList(list);
        } else {
            alert("Restaurante no encontrado.");
        }
        setLoading(false);
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!locale) return;
        setLoading(true);
        setMsg("");

        // Find the coupon by code
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode)
            .single();

        if (error || !coupon) {
            setMsg("❌ Código no válido");
        } else if (coupon.status === 'redeemed') {
            setMsg("⚠️ Este código ya fue usado");
        } else if (coupon.redeemed_at_locale !== locale.id) {
            setMsg("🚫 Este cupón pertenece a OTRO restaurante");
        } else {
            const res = await redeemCoupon(coupon.id);
            if (res.success) {
                setMsg("✅ ¡CUPÓN REDIMIDO!");
                setCouponCode("");
                const list = await getRedeemedCoupons(locale.id);
                setRedeemedList(list);
            } else {
                setMsg("❌ Error al redimir");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 relative flex flex-col items-center">
            <Particles />

            {!locale ? (
                <div className="w-full max-w-sm mt-20 z-10">
                    <h1 className="text-3xl font-lilita text-white text-center mb-8 uppercase">Login Restaurante</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre del Restaurante"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-primary"
                        />
                        <button className="w-full bg-primary text-white font-lilita py-4 rounded-2xl">INGRESAR</button>
                    </form>
                </div>
            ) : (
                <div className="w-full max-w-lg z-10 space-y-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-lilita text-white uppercase">{locale.name}</h2>
                            <p className="text-xs text-white/40">Panel de Canje de Cupones</p>
                        </div>
                        <button onClick={() => setLocale(null)} className="text-[10px] text-slate-500 underline">Cerrar Sesión</button>
                    </header>

                    <div className="bg-slate-900 border border-primary/30 p-8 rounded-[2.5rem] space-y-6">
                        <h3 className="text-xl font-lilita text-center">CANJEAR CÓDIGO 🍣</h3>
                        <form onSubmit={handleRedeem} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Escribe el código aquí"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="w-full bg-black text-center text-3xl font-mono p-4 rounded-xl border border-slate-700 outline-none focus:border-primary"
                            />
                            <button disabled={loading} className="w-full bg-primary text-white font-lilita py-4 rounded-xl">
                                {loading ? "PROCESANDO..." : "CONFIRMAR CANJE"}
                            </button>
                            {msg && <p className="text-center font-bold text-sm tracking-widest">{msg}</p>}
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Recientes</h3>
                        <div className="space-y-2">
                            {redeemedList.map((c) => (
                                <div key={c.id} className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-white/5">
                                    <div>
                                        <p className="font-bold text-sm">{c.profiles?.full_name}</p>
                                        <p className="text-[10px] text-slate-500">{c.profiles?.cedula}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono text-primary font-bold">{c.code}</p>
                                        <p className="text-[10px] text-slate-600">{new Date(c.redeemed_at || '').toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
