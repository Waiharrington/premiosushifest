import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { LocaleCard } from "./LocaleCard"
import { RatingModal } from "./RatingModal"
import { VoteSuccessModal } from "./VoteSuccessModal"
import { submitRatingAndVote } from "@/actions/rating"
import { useAuth } from "@/context/AuthContext"

interface Locale {
    id: string
    name: string
    image_url: string
    description?: string
}

interface LocaleGridProps {
    locales: Locale[]
}

export function LocaleGrid({ locales }: LocaleGridProps) {
    const { user } = useAuth()
    const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null)
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [votedLocalInfo, setVotedLocalInfo] = useState<{ name: string, image: string } | null>(null)

    const handleRatingClick = (locale: Locale) => {
        setSelectedLocale(locale)
        setIsRatingModalOpen(true)
    }

    const handleRatingSubmit = async (
        ratings: { flavor: number, service: number, presentation: number }, 
        wantToVote: boolean,
        confirmMove: boolean = false
    ) => {
        if (!selectedLocale || !user) return
        setIsSubmitting(true)

        try {
            const result = await submitRatingAndVote(user.id, selectedLocale.id, ratings, wantToVote, confirmMove)

            if (!result.success) {
                if (result.code === 'VOTE_EXISTS') {
                    const confirm = window.confirm(
                        `Ya tienes un voto registrado para "${result.currentLocaleName}".\n\n` +
                        `¿Quieres mover tu voto a "${selectedLocale.name}"?\n` +
                        `(Tu calificación de estrellas se guardará de todos modos).`
                    )
                    if (confirm) {
                        // Retry with confirmation
                        await handleRatingSubmit(ratings, wantToVote, true)
                        return
                    }
                } else {
                    alert(result.error)
                }
            } else {
                setVotedLocalInfo({
                    name: selectedLocale.name,
                    image: selectedLocale.image_url
                })
                setIsRatingModalOpen(false)
                setSelectedLocale(null)
                setShowSuccessModal(true)
            }
        } catch (e) {
            console.error(e)
            alert("Hubo un error inesperado al guardar tu calificación.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (locales.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white">No hay participantes registrados aún.</h2>
            </div>
        )
    }

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item: Variants = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    }

    return (
        <>
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-3 gap-2 md:gap-6 lg:gap-8"
            >
                {locales.map((locale, index) => (
                    <motion.div key={locale.id} variants={item}>
                        <LocaleCard
                            locale={locale}
                            onVoteClick={handleRatingClick}
                            rank={index + 1}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onRating={handleRatingSubmit}
                localeId={selectedLocale?.id || ""}
                localeName={selectedLocale?.name || ""}
                isSubmitting={isSubmitting}
            />

            <VoteSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                localeName={votedLocalInfo?.name || ""}
                localeImage={votedLocalInfo?.image || ""}
            />
        </>
    )
}
