"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useDashboard } from "../../data/dashboard-store"
import { categoryConfig } from "./routine-config"
import { MeterBar } from "./wellbeing-visuals"
import {
  adherence,
  lifeBalance,
  routineMoodSignal,
  todayISO,
  scheduledDates,
} from "../../lib/wellbeing"
import { Compass, Sparkles } from "lucide-react"

const percent = (v: number) => `${Math.round(v * 100)}%`

/**
 * Panel de lectura del sistema: adherencia global, equilibrio entre dominios
 * de vida y observaciones suaves rutina↔ánimo.
 *
 * Regla de tono: sin números sobre el ánimo, sin comparaciones con normas,
 * sin lenguaje clínico. Si no hay muestra suficiente, se calla.
 */
export default function DashboardInsights({ compact = false }: { compact?: boolean }) {
  const { data } = useDashboard()
  const { routines, healthMetrics } = data

  const insights = useMemo(() => {
    const today = todayISO()
    const active = routines.filter((r) => !r.paused)

    // Adherencia global ponderada por días realmente programados.
    let scheduledTotal = 0
    let completedTotal = 0
    for (const routine of active) {
      const result = adherence(routine, 30, today)
      if (!result) continue
      scheduledTotal += result.scheduled
      completedTotal += result.completed
    }
    const overall = scheduledTotal >= 5 ? completedTotal / scheduledTotal : null

    const balance = lifeBalance(routines, today)

    // Solo la observación más marcada, para no saturar de "hallazgos".
    const moodSignals = active
      .map((routine) => {
        const signal = routineMoodSignal(routine, healthMetrics, 30, today)
        return signal ? { routine, signal } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.signal.magnitude - a.signal.magnitude)

    // Rutina más sostenida. Misma ventana de 30 días que el resto del panel:
    // usar una distinta mostraba dos porcentajes para la misma rutina.
    const strongest = active
      .map((routine) => ({ routine, result: adherence(routine, 30, today) }))
      .filter((x): x is { routine: (typeof active)[number]; result: NonNullable<typeof x.result> } =>
        x.result !== null && scheduledDates(x.routine, 30, today).length >= 4,
      )
      .sort((a, b) => b.result.rate - a.result.rate)[0]

    return { overall, balance, moodSignal: moodSignals[0] ?? null, strongest }
  }, [routines, healthMetrics])

  const { overall, balance, moodSignal, strongest } = insights

  // Sin datos suficientes no se inventa nada: se dice con neutralidad.
  const hasAnything = overall !== null || balance !== null || moodSignal !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-white/10 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-4 h-4 text-white" />
        <h3 className="font-sans text-lg font-light">
          Lectura del <span className="italic text-white">Sistema</span>
        </h3>
      </div>

      {!hasAnything && (
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Aún no hay suficientes registros para leer patrones. Se irán revelando solos
          con el tiempo.
        </p>
      )}

      {hasAnything && (
        <div className="space-y-6">
          {overall !== null && (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                  Adherencia · 30 días
                </span>
                <span className="font-sans text-2xl font-light tracking-tight tabular-nums">
                  {percent(overall)}
                </span>
              </div>
              <MeterBar value={overall} />
              <p className="font-mono text-[9px] text-muted-foreground mt-2">
                Sobre días efectivamente programados — los días libres no penalizan.
              </p>
            </div>
          )}

          {balance && !compact && (
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                  Equilibrio entre dominios
                </span>
                <span className="font-mono text-[10px] text-white tabular-nums">
                  {percent(balance.balance)}
                </span>
              </div>
              <div className="space-y-2">
                {balance.categories.map((entry) => {
                  const config = categoryConfig[entry.category]
                  const Icon = config.icon
                  return (
                    <div key={entry.category} className="flex items-center gap-3">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${config.color}`} />
                      <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">
                        {config.label}
                      </span>
                      <MeterBar value={entry.score} label={percent(entry.score)} />
                    </div>
                  )
                })}
              </div>
              {balance.weakest && (
                <p className="font-mono text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  Tu dominio{" "}
                  <span className="text-white">
                    {categoryConfig[balance.weakest.category].label.toLowerCase()}
                  </span>{" "}
                  viene quedando por detrás del resto.
                </p>
              )}
            </div>
          )}

          {(strongest || moodSignal) && (
            <div className="space-y-2.5 pt-1">
              {strongest && (
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                    <span className="text-white">{strongest.routine.name}</span> es la que
                    más sostienes: {percent(strongest.result.rate)} de sus días programados
                    en el último mes.
                  </p>
                </div>
              )}
              {moodSignal && (
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                    Los días que completas{" "}
                    <span className="text-white">{moodSignal.routine.name}</span> tu ánimo
                    suele ser un poco{" "}
                    {moodSignal.signal.direction === "higher" ? "más alto" : "más bajo"}.
                    Es solo una observación sobre {moodSignal.signal.sample} días, no una causa.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
