"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Routine } from "../../data/dashboard-store"
import { categoryConfig, difficultyConfig, weekDays } from "./routine-config"
import { ConsistencyGrid } from "./wellbeing-visuals"
import DashboardInsights from "./dashboard-insights"
import {
  adherence,
  computeStreak,
  consistencyGrid,
  isCompletedOn,
  isStreakAtRisk,
  todayISO,
} from "../../lib/wellbeing"
import {
  Plus,
  Trash2,
  X,
  Check,
  Flame,
  Pause,
  Play,
  Edit3,
  Shield,
  Clock,
  Link2,
  ChevronDown,
} from "lucide-react"

export { categoryConfig }

const calendarHours = Array.from({ length: 14 }, (_, i) => i + 7)

const emptyRoutine = {
  name: "",
  category: "other" as Routine["category"],
  frequency: "daily" as Routine["frequency"],
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6] as number[],
  hour: 7,
  difficulty: "medium" as Routine["difficulty"],
  cue: "",
  identity: "",
  stackAfterId: "",
}

export default function DashboardRoutines() {
  const { data, addRoutine, updateRoutine, toggleRoutine, togglePauseRoutine, deleteRoutine } =
    useDashboard()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [form, setForm] = useState(emptyRoutine)

  const resetForm = () => {
    setForm(emptyRoutine)
    setEditingId(null)
    setShowDetails(false)
    setShowForm(false)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const payload = {
      ...form,
      name: form.name.trim(),
      cue: form.cue.trim() || undefined,
      identity: form.identity.trim() || undefined,
      stackAfterId: form.stackAfterId || undefined,
    }
    if (editingId) {
      updateRoutine(editingId, payload)
    } else {
      addRoutine(payload)
    }
    resetForm()
  }

  const handleEdit = (routine: Routine) => {
    setForm({
      name: routine.name,
      category: routine.category,
      frequency: routine.frequency,
      daysOfWeek: [...routine.daysOfWeek],
      hour: routine.hour,
      difficulty: routine.difficulty,
      cue: routine.cue ?? "",
      identity: routine.identity ?? "",
      stackAfterId: routine.stackAfterId ?? "",
    })
    setShowDetails(Boolean(routine.cue || routine.identity || routine.stackAfterId))
    setEditingId(routine.id)
    setShowForm(true)
  }

  const toggleDay = (d: number) => {
    setForm({
      ...form,
      daysOfWeek: form.daysOfWeek.includes(d)
        ? form.daysOfWeek.filter((x) => x !== d)
        : [...form.daysOfWeek, d].sort(),
    })
  }

  const today = todayISO()
  const todayDow = new Date().getDay()

  // Métricas derivadas por rutina: una sola pasada, memorizada.
  const stats = useMemo(() => {
    const map = new Map<
      string,
      {
        streak: number
        forgiven: number
        adherence30: ReturnType<typeof adherence>
        doneToday: boolean
        atRisk: boolean
      }
    >()
    for (const routine of data.routines) {
      const { streak, forgiven } = computeStreak(routine, today)
      map.set(routine.id, {
        streak,
        forgiven,
        adherence30: adherence(routine, 30, today),
        doneToday: isCompletedOn(routine, today),
        atRisk: isStreakAtRisk(routine),
      })
    }
    return map
  }, [data.routines, today])

  const todayRoutines = data.routines.filter(
    (r) => r.daysOfWeek.includes(todayDow) && !r.paused,
  )
  const doneCount = todayRoutines.filter((r) => stats.get(r.id)?.doneToday).length
  const routineName = (id?: string) => data.routines.find((r) => r.id === id)?.name

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            Gestión de <span className="italic text-white">Rutinas</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            {data.routines.length} rutinas • {doneCount}/{todayRoutines.length} hoy
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
          NUEVA RUTINA
        </button>
      </div>

      {/* Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-white" />
          <h3 className="font-sans text-lg font-light">
            Rutinas de <span className="italic text-white">Hoy</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todayRoutines.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground col-span-full">
              No hay rutinas para hoy. ¡Agrega una!
            </p>
          )}
          {todayRoutines.map((routine) => {
            const CatIcon = categoryConfig[routine.category].icon
            const stat = stats.get(routine.id)!
            return (
              <div
                key={routine.id}
                className={`p-3 border transition-all ${
                  stat.doneToday
                    ? "border-white/30 bg-white/5"
                    : stat.atRisk
                      ? "border-white/25"
                      : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRoutine(routine.id)}
                    title={stat.doneToday ? "Desmarcar" : "Marcar como cumplida"}
                    className={`p-1.5 rounded-sm border transition-all ${
                      stat.doneToday
                        ? "bg-white border-white text-black"
                        : "border-white/20 text-transparent hover:border-white/50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <CatIcon className={`w-4 h-4 ${categoryConfig[routine.category].color}`} />
                  <span className="font-mono text-xs flex-1 truncate">{routine.name}</span>
                  <span className="font-mono text-[10px] text-white/80">{routine.hour}:00</span>
                  <span
                    title={`Racha: ${stat.streak} días programados seguidos`}
                    className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"
                  >
                    <Flame className="w-3 h-3 text-white" />
                    {stat.streak}
                  </span>
                  {stat.forgiven > 0 && (
                    <span
                      title="Una falta aislada quedó perdonada: la racha sigue viva"
                      className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"
                    >
                      <Shield className="w-3 h-3 text-white/60" />
                    </span>
                  )}
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {routine.cue && !stat.doneToday && (
                  <p className="font-mono text-[10px] text-muted-foreground/70 italic mt-2 ml-9">
                    {routine.cue}
                  </p>
                )}

                {stat.atRisk && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-2 ml-9"
                  >
                    <Clock className="w-3 h-3 text-white/70 shrink-0" />
                    <span className="font-mono text-[9px] text-white/70 tracking-wider uppercase">
                      Racha de {stat.streak} en juego · aún estás a tiempo
                    </span>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      <DashboardInsights />

      {/* All Routines */}
      <div className="space-y-4">
        <h3 className="font-sans text-lg font-light">
          Todas las <span className="italic text-white">Rutinas</span>
        </h3>
        {data.routines.map((routine, i) => {
          const CatIcon = categoryConfig[routine.category].icon
          const stat = stats.get(routine.id)!
          const grid = consistencyGrid(routine, 28, today)
          const stackedAfter = routineName(routine.stackAfterId)
          return (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`p-3 border transition-all ${
                routine.paused
                  ? "border-white/5 opacity-50"
                  : "border-white/10 hover:border-white/20"
              } ${routine.stackAfterId ? "ml-6 border-l-white/25" : ""}`}
            >
              <div className="flex items-center gap-3">
                <CatIcon className={`w-4 h-4 ${categoryConfig[routine.category].color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs truncate">{routine.name}</p>
                    {routine.paused && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 border border-white/30 text-white uppercase tracking-wider shrink-0">
                        Pausada
                      </span>
                    )}
                    {stackedAfter && (
                      <span
                        title={`Encadenada después de: ${stackedAfter}`}
                        className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground shrink-0"
                      >
                        <Link2 className="w-2.5 h-2.5" />
                        {stackedAfter}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      {categoryConfig[routine.category].label}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      {difficultyConfig[routine.difficulty].label}
                    </span>
                    <span className="font-mono text-[9px] text-white/80">{routine.hour}:00</span>
                    {routine.daysOfWeek.map((d) => (
                      <span
                        key={d}
                        className={`font-mono text-[9px] px-1 ${
                          d === todayDow ? "text-white bg-white/10" : "text-muted-foreground"
                        }`}
                      >
                        {weekDays[d]}
                      </span>
                    ))}
                  </div>
                  {routine.identity && (
                    <p className="font-mono text-[10px] text-white/60 italic mt-1.5 truncate">
                      “{routine.identity}”
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(routine)}
                    title="Editar"
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => togglePauseRoutine(routine.id)}
                    title={routine.paused ? "Reanudar" : "Pausar"}
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    {routine.paused ? (
                      <Play className="w-3.5 h-3.5" />
                    ) : (
                      <Pause className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    title="Eliminar"
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Consistencia real de las últimas 4 semanas */}
              <div className="flex items-center gap-3 mt-3 pl-7">
                <ConsistencyGrid cells={grid} />
                <span className="font-mono text-[9px] text-muted-foreground tracking-wider shrink-0">
                  {stat.adherence30
                    ? `${Math.round(stat.adherence30.rate * 100)}% · 30d`
                    : "sin datos aún"}
                </span>
              </div>
            </motion.div>
          )
        })}
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
                  {editingId ? "Editar" : "Nueva"}{" "}
                  <span className="italic text-white">Rutina</span>
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
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Nombre de la rutina"
                    autoFocus
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      Object.entries(categoryConfig) as [
                        Routine["category"],
                        (typeof categoryConfig)["physical"],
                      ][]
                    ).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setForm({ ...form, category: key })}
                          className={`flex flex-col items-center gap-1 p-3 border transition-colors ${
                            form.category === key
                              ? "border-white bg-white/10"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-mono text-[9px] text-muted-foreground">
                            {config.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Exigencia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      Object.entries(difficultyConfig) as [
                        Routine["difficulty"],
                        (typeof difficultyConfig)["easy"],
                      ][]
                    ).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setForm({ ...form, difficulty: key })}
                        title={config.hint}
                        className={`py-2 border font-mono text-[10px] transition-colors ${
                          form.difficulty === key
                            ? "border-white bg-white/10 text-white"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Días de la semana
                  </label>
                  <div className="flex gap-1">
                    {weekDays.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(i)}
                        className={`flex-1 py-2 border font-mono text-[9px] transition-colors ${
                          form.daysOfWeek.includes(i)
                            ? "border-white text-white bg-white/10"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Hora en el calendario (obligatoria)
                  </label>
                  <select
                    value={form.hour}
                    onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  >
                    {calendarHours.map((h) => (
                      <option key={h} value={h} className="bg-background">
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detalles de diseño de hábito, plegados para no saturar */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground tracking-wider uppercase transition-colors"
                >
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
                  />
                  Diseño del hábito
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                          Disparador
                        </label>
                        <input
                          type="text"
                          value={form.cue}
                          onChange={(e) => setForm({ ...form, cue: e.target.value })}
                          placeholder="Después de servir el café…"
                          className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                          Identidad
                        </label>
                        <input
                          type="text"
                          value={form.identity}
                          onChange={(e) => setForm({ ...form, identity: e.target.value })}
                          placeholder="Soy alguien que se mueve a diario"
                          className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                          Encadenar después de
                        </label>
                        <select
                          value={form.stackAfterId}
                          onChange={(e) => setForm({ ...form, stackAfterId: e.target.value })}
                          className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                        >
                          <option value="" className="bg-background">
                            Ninguna
                          </option>
                          {data.routines
                            .filter((r) => r.id !== editingId)
                            .map((r) => (
                              <option key={r.id} value={r.id} className="bg-background">
                                {r.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                  className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "GUARDAR CAMBIOS" : "CREAR RUTINA"}
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
