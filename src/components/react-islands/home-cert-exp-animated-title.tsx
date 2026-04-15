"use client"

import { motion } from "framer-motion"

export default function HomeCertExpAnimatedTitle() {
  return (
    <div className="relative mt-8 w-full max-w-7xl md:mt-10">
      <div className="group relative cursor-default overflow-hidden rounded-lg border border-white/10" data-cursor-hover>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-cyan-500/15" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.22) 0px, transparent 38%), radial-gradient(circle at 82% 72%, rgba(57,203,227,0.22) 0px, transparent 44%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(57,203,227,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(57,203,227,0.55) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.24, 0.38, 0.24] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 14px)",
          }}
        />

        <div className="relative z-10 flex items-center justify-center px-6 py-16 md:px-12 md:py-24 lg:py-32">
          <h2
            className="text-center text-4xl font-sans font-light leading-tight tracking-tight md:text-6xl lg:text-8xl transition-all duration-500 group-hover:scale-[1.02]"
            style={{
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(57, 203, 227, 0.3)",
            }}
          >
            <span className="block whitespace-nowrap">Certificaciones</span>
            <span className="mt-2 block whitespace-nowrap md:mt-3">y Experiencia</span>
          </h2>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-500" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-500" />
      </div>
    </div>
  )
}
