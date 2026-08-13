"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type HealthMetric } from "../../data/dashboard-store"
import { Sparkline } from "./wellbeing-visuals"
import DashboardInsights from "./dashboard-insights"
import {
  checkInSignal,
  metricSeries,
  rollingAverage,
  todayISO,
  DIRECTION_LABEL,
} from "../../lib/wellbeing"
import {
  Plus,
  Trash2,
  X,
  Weight,
  Smile,
  Moon,
  Zap,
  Brain,
  BookOpen,
  Activity,
} from "lucide-react"

const metricConfig = {
  weight: { icon: Weight, label: "Peso", unit: "kg", color: "text-white" },
  mood: { icon: Smile, label: "Estado de Ánimo", unit: "1-10", color: "text-white" },
  sleep: { icon: Moon, label: "Sueño", unit: "hrs", color: "text-white" },
  exercise: { icon: Zap, label: "Ejercicio", unit: "min", color: "text-white" },
  meditation: { icon: Brain, label: "Meditación", unit: "min", color: "text-white" },
  reading: { icon: BookOpen, label: "Lectura", unit: "min", color: "text-white" },
  custom: { icon: Activity, label: "Personalizado", unit: "", color: "text-muted-foreground" },
}

/** Vocabulario cerrado y breve: da textura sin convertirse en un diario. */
const moodVocabulary = [
  "tranquilo",
  "contento",
  "motivado",
  "cansado",
  "ansioso",
  "irritable",
  "disperso",
  "abrumado",
]

const MAX_TAGS = 3

type MetricType = HealthMetric["type"]

const emptyMetric = {
  type: "mood" as MetricType,
  value: 5,
  unit: "1-10",
  note: "",
  date: todayISO(),
  moodTags: [] as string[],
}

export default function DashboardHealth() {
  const { data, addHealthMetric, deleteHealthMetric } = useDashboard()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyMetric)

  const resetForm = () => {
    setForm({ ...emptyMetric, date: todayISO() })
    setShowForm(false)
  }

  const handleSubmit = () => {
    addHealthMetric({
      ...form,
      note: form.note.trim() || undefined,
      moodTags: form.type === "mood" && form.moodTags.length ? form.moodTags : undefined,
    })
    resetForm()
  }

  const changeType = (type: MetricType) => {
    setForm({ ...form, type, unit: metricConfig[type].unit })
  }

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      moodTags: prev.moodTags.includes(tag)
        ? prev.moodTags.filter((t) => t !== tag)
        : prev.moodTags.length < MAX_TAGS
          ? [...prev.moodTags, tag]
          : prev.moodTags,
    }))
  }

  const today = todayISO()
  const todayMetrics = data.healthMetrics.filter((m) => m.date === today)

  const summary = useMemo(() => {
    const types = Object.keys(metricConfig) as MetricType[]
    return {
      checkIn: checkInSignal(data.healthMetrics),
      byType: types.map((type) => ({
        type,
        average: rollingAverage(data.healthMetrics, type, 7, today),
        series: metricSeries(data.healthMetrics, type, 14, today).map((p) => p.value),
      })),
    }
  }, [data.healthMetrics, today])

  const hasTrends = summary.byType.some((t) => t.average !== null)

  const recentMetrics = [...data.healthMetrics]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            Salud & <span className="italic text-white">Mente</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            Monitoreo corporal y mental
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVO REGISTRO
        </button>
      </div>

      {/*
        Señal de acompañamiento. Deliberadamente igual que cualquier otra tarjeta:
        sin rojo, sin iconos de alerta, sin bloquear nada. Es una invitación.
      */}
      <AnimatePresence>
        {summary.checkIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-white/20 p-6"
          >
            <p className="font-sans text-lg font-light leading-relaxed">
              Los últimos días vienen <span className="italic text-white">cuesta arriba</span>.
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Tus registros lo reflejan y está bien que así sea. Tómate un momento para ti
              hoy — descansar también es parte del sistema.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's quick add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 p-6"
      >
        <h3 className="font-sans text-lg font-light mb-4">
          Registro de <span className="italic text-white">Hoy</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.entries(metricConfig) as [MetricType, (typeof metricConfig)["mood"]][]).map(
            ([type, config]) => {
              const Icon = config.icon
              const existing = todayMetrics.find((m) => m.type === type)
              return (
                <button
                  key={type}
                  onClick={() => {
                    setForm({
                      ...emptyMetric,
                      date: today,
                      type,
                      unit: config.unit,
                      value: existing?.value ?? 5,
                    })
                    setShowForm(true)
                  }}
                  className="flex flex-col items-center gap-2 p-4 border border-white/10 hover:border-white/30 transition-all text-center group"
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">
                    {config.label}
                  </span>
                  {existing ? (
                    <span className="font-mono text-xs text-white">
                      {existing.value} {existing.unit}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground">--</span>
                  )}
                </button>
              )
            },
          )}
        </div>
      </motion.div>

      {/* Rolling trends — solo aparece cuando hay con qué comparar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/10 p-6"
      >
        <h3 className="font-sans text-lg font-light mb-4">
          Esta <span className="italic text-white">Semana</span>
        </h3>
        {!hasTrends && (
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no hay suficientes registros para mostrar una tendencia. Con dos o más en
            la misma semana empieza a dibujarse sola.
          </p>
        )}
        {hasTrends && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.byType
              .filter((entry) => entry.average !== null)
              .map((entry) => {
                const config = metricConfig[entry.type]
                const Icon = config.icon
                const average = entry.average!
                return (
                  <div
                    key={entry.type}
                    className="flex items-center gap-3 p-3 border border-white/10"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase truncate">
                        {config.label}
                      </p>
                      <p className="font-sans text-xl font-light tracking-tight tabular-nums">
                        {average.avg.toFixed(1)}
                        <span className="font-mono text-[10px] text-muted-foreground ml-1">
                          {config.unit}
                        </span>
                      </p>
                      {average.direction && (
                        <p className="font-mono text-[9px] text-muted-foreground">
                          {DIRECTION_LABEL[average.direction]}
                        </p>
                      )}
                    </div>
                    <div className="text-white">
                      <Sparkline values={entry.series} width={52} height={18} />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </motion.div>

      <DashboardInsights compact />

      {/* Recent entries */}
      <div>
        <h3 className="font-sans text-lg font-light mb-4">
          Historial <span className="italic text-white">Reciente</span>
        </h3>
        <div className="space-y-2">
          {recentMetrics.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              Aún no hay registros.
            </p>
          )}
          {recentMetrics.map((metric, i) => {
            const config = metricConfig[metric.type]
            const Icon = config.icon
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="flex items-center gap-3 p-3 border border-white/10 hover:border-white/20 transition-all group"
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs">{config.label}</span>
                    <span className="font-mono text-sm text-white">
                      {metric.value} {metric.unit}
                    </span>
                    {metric.moodTags?.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] px-1.5 py-0.5 border border-white/15 text-muted-foreground tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {metric.note && (
                    <p className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                      {metric.note}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">{metric.date}</span>
                <button
                  onClick={() => deleteHealthMetric(metric.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-white/10 p-8 max-w-md w-full my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-2xl font-light">
                  Nuevo <span className="italic text-white">Registro</span>
                </h3>
                <button
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      Object.entries(metricConfig) as [
                        MetricType,
                        (typeof metricConfig)["mood"],
                      ][]
                    ).map(([type, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={type}
                          onClick={() => changeType(type)}
                          className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
                            form.type === type
                              ? "border-white bg-white/10"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-mono text-[10px]">{config.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Valor ({form.unit})
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    min={0}
                    max={form.type === "mood" ? 10 : undefined}
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                {form.type === "mood" && (
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                      ¿Cómo se sintió? (hasta {MAX_TAGS})
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {moodVocabulary.map((tag) => {
                        const selected = form.moodTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1.5 border font-mono text-[10px] transition-colors ${
                              selected
                                ? "border-white bg-white/10 text-white"
                                : "border-white/10 text-muted-foreground hover:border-white/30"
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {form.type === "custom" && (
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                      Unidad
                    </label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      placeholder="kg, min, hrs, etc."
                      className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    {form.type === "mood" ? "Reflexión (opcional)" : "Nota (opcional)"}
                  </label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder={
                      form.type === "mood" ? "¿Qué influyó en tu día?" : "Nota breve"
                    }
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
                >
                  GUARDAR
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-white/20 font-mono text-xs tracking-wider hover:border-white/50 transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
