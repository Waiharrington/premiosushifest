"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Particles } from "@/components/Particles";
import { SponsorBackground } from "@/components/SponsorBackground";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleStartVoting = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      router.push("/votar");
    }
  };

  return (
    <div className="h-[100svh] bg-background text-white relative overflow-hidden selection:bg-primary/30">

      {/* Background Layer */}
      <div className="fixed top-0 left-0 w-full h-[100svh] md:h-screen md:inset-0 z-0 text-white">

        {/* Note: In a real production setup, we would replace these files with Sushifest specific ones */}
        {/* Mobile Background (Vertical) */}
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

        {/* Desktop Background (Horizontal) */}
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

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-full bg-gradient-to-b from-background/40 to-background/80">

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center gap-2 md:gap-0 px-4 py-2 md:pt-10 md:pb-12 text-center max-w-lg md:max-w-4xl mx-auto w-full h-full">


          {/* Integrated Header: Logo */}
          <div className="relative w-full max-w-[150px] md:max-w-[180px] aspect-square flex justify-center items-center mb-6">

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="relative w-[100%] h-[100%] z-10"
            >
              <motion.div
                className="w-full h-full relative"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Sushifest 2026"
                  fill
                  className="object-cover rounded-full drop-shadow-[0_0_35px_rgba(5,55,187,0.5)] filter brightness-110"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Golden Crown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, type: "spring" }}
            className="-mt-16 relative z-20"
          >
            <Image src="/crown.png" alt="Crown" width={150} height={110} className="w-[110px] md:w-[140px] h-auto drop-shadow-lg mx-auto" />
          </motion.div>

          {/* Main Text (H1) */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1, duration: 1, ease: "easeOut" }}
            className="text-3xl md:text-5xl text-white uppercase leading-tight tracking-tight mb-2 -mt-6 md:-mt-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-lilita"
          >
            ¡Vota por el mejor<br />sushi de Panamá!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            className="text-sm md:text-lg text-white/90 font-medium mb-4 md:mb-6 max-w-xs md:max-w-2xl mx-auto leading-relaxed"
          >
            Califica sabor, servicio y presentación. <br className="hidden md:block"/> Solo uno será coronado en el <span className="font-bold text-secondary">Sushifest 🏆</span>
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={handleStartVoting}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: 1,
              y: 0,
              boxShadow: ["0 0 10px rgba(5,55,187,0.25)", "0 0 30px rgba(5,55,187,0.45)", "0 0 10px rgba(5,55,187,0.25)"]
            }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 50px rgba(5,55,187,0.8)" }}
            whileTap={{ scale: 0.95 }}
            transition={{
              default: { type: "spring", stiffness: 200, damping: 20 },
              boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="group relative bg-gradient-to-r from-primary to-blue-700 text-lg md:text-xl py-4 px-10 rounded-full flex items-center gap-3 border border-white/20 font-lilita tracking-wide mt-4 overflow-hidden"
          >
            <span className="relative z-10">{user ? "CONTINUAR VOTANDO 🍣" : "EMPIEZA A VOTAR 🔥"}</span>

            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 rounded-t-full" />
          </motion.button>

          {/* View Ranking Button */}
          <motion.button
            onClick={() => router.push("/ranking")}
            className="text-white/60 hover:text-white font-lilita tracking-widest text-xs mt-10 uppercase underline underline-offset-8 decoration-white/20 transition-colors"
          >
            Ver Ranking de Estrellas ⭐️
          </motion.button>

          <footer className="pb-4 pt-2 md:py-10 text-center text-white/40 text-[10px] mt-auto relative z-20 uppercase tracking-[0.2em]">
            <p>© 2026 SUSHIFEST • BY EPIC MARKETING • PANAMÁ</p>
          </footer>
        </main>

      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => router.push("/votar")}
      />
    </div>
  );
}
