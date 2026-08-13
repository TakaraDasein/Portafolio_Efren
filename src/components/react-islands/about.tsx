"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

interface Statement {
  text: string
  author?: string
}

const statements: Statement[] = [
  { text: "Construyo sistemas en los que otros puedan confiar sin tener que entenderlos por completo." },
  { text: "Afirmaciones extraordinarias requieren evidencia extraordinaria.", author: "Carl Sagan" },
  { text: "La seguridad no se añade al final: se decide en cada línea de código." },
  { text: "El código abierto es memoria colectiva: lo que hoy comparto, mañana alguien más lo mejora." },
  { text: "Somos una forma en que el cosmos se conoce a sí mismo.", author: "Carl Sagan" },
  { text: "Un modelo entrenado es una hipótesis, no una verdad absoluta." },
  { text: "La ciencia recoge conocimiento más rápido de lo que la sociedad recoge sabiduría.", author: "Isaac Asimov" },
  { text: "Solo podemos ver un poco hacia adelante, pero hay mucho por hacer en ese trecho.", author: "Alan Turing" },
  { text: "La inteligencia artificial no reemplaza el juicio humano: lo amplifica y lo pone a prueba." },
  { text: "En algún lugar, algo increíble espera ser descubierto.", author: "Carl Sagan" },
  { text: "No temo a las computadoras, temo la falta de ellas.", author: "Isaac Asimov" },
  { text: "La calidad técnica es una forma de respeto hacia quien usará lo que construyo." },
  { text: "Vivimos en una sociedad profundamente dependiente de la ciencia y la tecnología, en la que casi nadie sabe nada sobre ciencia y tecnología.", author: "Carl Sagan" },
  { text: "La violencia es el último recurso del incompetente.", author: "Isaac Asimov" },
  { text: "Diseñar el futuro empieza por cuestionar el presente con datos, no con suposiciones." },
]

const INTERVAL_MS = 5000

export default function About() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % statements.length)
    }, INTERVAL_MS)
    return () => clearTimeout(id)
  }, [isPlaying, index])

  const goPrev = () => setIndex((i) => (i - 1 + statements.length) % statements.length)
  const goNext = () => setIndex((i) => (i + 1) % statements.length)

  const current = statements[index]

  return (
    <section id="sobre-mi" className="relative py-32 overflow-hidden md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-12 md:mb-16 flex items-center justify-between flex-wrap gap-4"
      >
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">Flujo de Pensamiento</h2>

        {/* Playback controls */}
        <div className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-opacity duration-500">
          <button
            onClick={goPrev}
            aria-label="Frase anterior"
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={goNext}
            aria-label="Frase siguiente"
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Quote Display */}
      <div className="px-8 md:px-12">
        <div className="min-h-[220px] md:min-h-[260px] flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-4xl"
            >
              <p className="text-2xl md:text-4xl lg:text-5xl font-sans font-light leading-snug tracking-tight text-white/90">
                {current.text}
              </p>
              {current.author && (
                <p className="mt-6 font-mono text-xs md:text-sm tracking-widest text-muted-foreground uppercase">
                  — {current.author}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8 opacity-30 hover:opacity-100 transition-opacity duration-500">
          {statements.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la frase ${i + 1}`}
              className="p-1"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-white/60" : "w-1 bg-white/15"
                }`}
              />
            </button>
          ))}
        </div>
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
