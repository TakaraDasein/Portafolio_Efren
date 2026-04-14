"use client"

import { motion } from "framer-motion"

const statements = [
  "Transformo datos complejos en insights accionables.",
  "La visualización efectiva comunica historias ocultas.",
  "Cada métrica cuenta una parte de la verdad.",
  "Los datos no mienten, solo necesitan interpretación.",
  "El análisis predictivo anticipa el futuro.",
]

export default function About() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-12 md:mb-16"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 — FILOSOFÍA</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">Flujo de Pensamiento</h2>
      </motion.div>

      {/* Horizontal Scroll Container */}
      <div className="relative flex items-center overflow-hidden py-8 md:py-12">
        <motion.div 
          className="flex gap-32 md:gap-48 lg:gap-64 whitespace-nowrap"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            },
          }}
        >
          {/* Triple set for seamless loop */}
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-32 md:gap-48 lg:gap-64">
              {statements.map((statement, index) => (
                <motion.p
                  key={`${setIndex}-${index}`}
                  className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-sans font-light tracking-tight text-white/90 min-w-max"
                  style={{
                    WebkitTextStroke: index % 2 === 0 ? "none" : "1px rgba(255,255,255,0.3)",
                    color: index % 2 === 0 ? "inherit" : "transparent",
                  }}
                >
                  {statement}
                </motion.p>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-16 mx-8 md:mx-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
      />
    </section>
  )
}

