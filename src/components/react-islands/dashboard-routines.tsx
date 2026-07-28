"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Routine } from "../../data/dashboard-store"
import {
  Plus,
  Trash2,
  X,
  Check,
  Flame,
  Dumbbell,
  Brain,
  Users,
  Briefcase,
  Palette,
  HelpCircle,
} from "lucide-react"

const categoryConfig = {
  physical: { icon: Dumbbell, label: "Físico", color: "text-emerald-500" },
  mental: { icon: Brain, label: "Mental", color: "text-violet-500" },
  social: { icon: Users, label: "Social", color: "text-blue-500" },
  work: { icon: Briefcase, label: "Trabajo", color: "text-amber-500" },
  creative: { icon: Palette, label: "Creativo", color: "text-rose-500" },
  other: { icon: HelpCircle, label: "Otro", color: "text-muted-foreground" },
}

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const emptyRoutine = {
  name: "",
  category: "other" as Routine["category"],
  frequency: "daily" as Routine["frequency"],
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6] as number[],
}

export default function DashboardRoutines() {
  const { data, addRoutine, toggleRoutine, deleteRoutine } = useDashboard()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyRoutine)

  const resetForm = () => {
    setForm(emptyRoutine)
    setShowForm(false)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    addRoutine(form)
    resetForm()
  }

  const toggleDay = (d: number) => {
    setForm({
      ...form,
      daysOfWeek: form.daysOfWeek.includes(d)
        ? form.daysOfWeek.filter((x) => x !== d)
        : [...form.daysOfWeek, d].sort(),
    })
  }

  const today = new Date().getDay()
  const todayRoutines = data.routines.filter((r) =>
    r.daysOfWeek.includes(today),
  )

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            Gestión de <span className="italic text-cyan-500">Rutinas</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            {data.routines.length} rutinas • {todayRoutines.length} para hoy
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors"
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
          <Flame className="w-4 h-4 text-amber-500" />
          <h3 className="font-sans text-lg font-light">
            Rutinas de <span className="italic text-cyan-500">Hoy</span>
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
            const doneToday = routine.lastCompleted === new Date().toISOString().split("T")[0]
            return (
              <div
                key={routine.id}
                className={`flex items-center gap-3 p-3 border transition-all ${
                  doneToday
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <button
                  onClick={() => toggleRoutine(routine.id)}
                  className={`p-1.5 rounded-sm border transition-all ${
                    doneToday
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : "border-white/20 text-transparent hover:border-emerald-500/50"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <CatIcon
                  className={`w-4 h-4 ${categoryConfig[routine.category].color}`}
                />
                <span className="font-mono text-xs flex-1">{routine.name}</span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {routine.streak}
                </span>
                <button
                  onClick={() => deleteRoutine(routine.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* All Routines */}
      <div className="space-y-4">
        <h3 className="font-sans text-lg font-light">
          Todas las <span className="italic text-cyan-500">Rutinas</span>
        </h3>
        {data.routines.map((routine, i) => {
          const CatIcon = categoryConfig[routine.category].icon
          return (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="flex items-center gap-3 p-3 border border-white/10 hover:border-white/20 transition-all"
            >
              <CatIcon
                className={`w-4 h-4 ${categoryConfig[routine.category].color}`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs truncate">{routine.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    {categoryConfig[routine.category].label}
                  </span>
                  {routine.daysOfWeek.map((d) => (
                    <span
                      key={d}
                      className={`font-mono text-[9px] px-1 ${
                        d === today
                          ? "text-cyan-500 bg-cyan-500/10"
                          : "text-muted-foreground"
                      }`}
                    >
                      {weekDays[d]}
                    </span>
                  ))}
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-white/10 p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-2xl font-light">
                  Nueva <span className="italic text-cyan-500">Rutina</span>
                </h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
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
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(categoryConfig) as [Routine["category"], typeof categoryConfig["physical"]][]).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setForm({ ...form, category: key })}
                          className={`flex flex-col items-center gap-1 p-3 border transition-colors ${
                            form.category === key
                              ? "border-cyan-500 bg-cyan-500/10"
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
                    Días de la semana
                  </label>
                  <div className="flex gap-1">
                    {weekDays.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(i)}
                        className={`flex-1 py-2 border font-mono text-[9px] transition-colors ${
                          form.daysOfWeek.includes(i)
                            ? "border-cyan-500 text-cyan-500 bg-cyan-500/10"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                  className="flex-1 px-6 py-3 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CREAR RUTINA
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
