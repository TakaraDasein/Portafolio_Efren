"use client"

import { motion } from "framer-motion"
import PomodoroTimer from "./pomodoro-timer"
import { MOODS, type MoodId } from "./sentient-figure"

/**
 * Temporizador de enfoque y ambiente de la figura.
 *
 * Vivían anclados al pie del lienzo 3D, centrados y flotando sobre el resto:
 * en pantallas estrechas quedaban cortados y por detrás de otras tarjetas.
 * Ahora forman parte de la columna, en el flujo normal del documento.
 */
export default function FigureControls({
  moodId,
  onMoodChange,
}: {
  moodId: MoodId | null
  onMoodChange: (mood: MoodId | null) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="w-full bg-background/70 backdrop-blur-md border border-white/10 rounded-xl px-3 py-3 hover:border-white/25 transition-colors space-y-2.5"
    >
      <PomodoroTimer />

      <div>
        <span className="font-mono text-[9px] text-muted-foreground/60 tracking-wider uppercase block mb-1.5 px-0.5">
          Ambiente
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {MOODS.map((mood) => {
            const active = moodId === mood.id
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => onMoodChange(active ? null : mood.id)}
                className={`py-1.5 rounded-full border font-mono text-[9px] tracking-wider uppercase transition-colors ${
                  active
                    ? "text-white"
                    : "border-white/10 text-muted-foreground/70 hover:border-white/25 hover:text-muted-foreground"
                }`}
                style={
                  active ? { borderColor: mood.color, backgroundColor: `${mood.color}1a` } : undefined
                }
              >
                {mood.label}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
