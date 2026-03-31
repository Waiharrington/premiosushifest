"use client"

export function SponsorBackground() {
    // 9 columns for desktop to fill width
    // Added priority/eager optimizations to prevent scroll lag
    const columns = [
        { duration: 25, delay: 0 },
        { duration: 35, delay: -5 },
        { duration: 28, delay: -10 },
        { duration: 40, delay: -15 },
        { duration: 30, delay: -2 },
        { duration: 32, delay: -8 },
        { duration: 22, delay: -12 },
        { duration: 38, delay: -4 },
        { duration: 26, delay: -6 },
    ]

    const logos = Array(10).fill("/watermark-epic.png")

    return (
        <div className="fixed inset-0 z-0 overflow-hidden opacity-[0.50] pointer-events-none mix-blend-screen mix-blend-plus-lighter">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes sponsorMoveUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-1000px); }
                }
                .sponsor-col {
                    animation-name: sponsorMoveUp;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform;
                }
            `}} />
            <div className="flex justify-between w-full h-full max-w-[95%] mx-auto px-2 md:px-4">
                {columns.map((col, index) => (
                    <div
                        key={index}
                        className={`relative h-[200vh] w-20 md:w-32 flex-col gap-12 md:gap-20 items-center ${
                            // Hide some on mobile
                            index % 2 === 0 ? 'flex' : 'hidden md:flex'
                        }`}
                    >
                        <div
                            className="sponsor-col flex flex-col gap-16 md:gap-24 w-full items-center pb-16 md:pb-24"
                            style={{ 
                                animationDuration: `${col.duration}s`,
                                animationDelay: `${col.delay}s`
                            }}
                        >
                            {/* Standard img tag is much more performant than Next/image for 270 cascading particles */}
                            {[...logos, ...logos, ...logos].map((src, i) => (
                                <div key={i} className="relative w-16 h-16 md:w-24 md:h-24 opacity-60">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={src}
                                        alt="sponsor bg"
                                        decoding="async"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
