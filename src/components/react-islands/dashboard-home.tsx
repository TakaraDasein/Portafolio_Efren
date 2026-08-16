"use client"

import { useMemo, useState } from "react"
import { useDashboard } from "../../data/dashboard-store"
import { motion, AnimatePresence } from "framer-motion"
import { SentientFigure, type MoodId } from "./sentient-figure"
import FigureControls from "./figure-controls"
import DashboardInsights from "./dashboard-insights"
import DashboardClock from "./dashboard-clock"
import DashboardPad from "./dashboard-pad"
import { DetailRow, DetailEmpty, MiniWeek, type WeekDay } from "./dashboard-hero"
import { categoryConfig } from "./routine-config"
import type { DashboardViewProps } from "./dashboard-layout"
import {
  adherence,
  computeStreak,
  isCompletedOn,
  isScheduledOn,
  parseISODate,
  todayISO,
  weekDates,
} from "../../lib/wellbeing"
import {
  BookOpen,
  Target,
  Zap,
  Activity,
  Check,
  Flame,
  CircleDot,
  NotebookPen,
} from "lucide-react"

const WEEK_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export default function DashboardHome({ onNavigate }: Partial<DashboardViewProps> = {}) {
  const { data } = useDashboard()
  const { routines, researchSeasons, calendarEvents } = data
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [moodId, setMoodId] = useState<MoodId | null>(null)

  const today = todayISO()

  const activeRoutines = useMemo(() => routines.filter((r) => !r.paused), [routines])


  /* ── Semana ────────────────────────────────────────────────────────────── */
  const week: WeekDay[] = useMemo(
    () =>
      weekDates(today).map((date, column) => {
        const scheduled = activeRoutines.filter((r) => isScheduledOn(r, date))
        return {
          date,
          column,
          label: WEEK_LABELS[column],
          dayNumber: String(parseISODate(date).getDate()),
          isToday: date === today,
          isPast: date < today,
          routines: scheduled.length,
          completed: scheduled.filter((r) => isCompletedOn(r, date)).length,
          events: calendarEvents.filter((e) => e.day === column).length,
        }
      }),
    [activeRoutines, calendarEvents, today],
  )

  const selected = week.find((d) => d.date === selectedDay) ?? null
  const selectedRoutines = selected
    ? activeRoutines.filter((r) => isScheduledOn(r, selected.date))
    : []
  const selectedEvents = selected
    ? calendarEvents.filter((e) => e.day === selected.column)
    : []

  const weekTotals = week.reduce(
    (acc, d) => ({ routines: acc.routines + d.routines, completed: acc.completed + d.completed }),
    { routines: 0, completed: 0 },
  )

  const quickActions = [
    { icon: Target, label: "Nuevo Proyecto", view: "projects" as const },
    { icon: Zap, label: "Registrar Rutina", view: "routines" as const },
    { icon: Activity, label: "Medir Salud", view: "health" as const },
    { icon: BookOpen, label: "Escribir Capítulo", view: "research" as const },
    { icon: NotebookPen, label: "Nota o Lista", view: "notebook" as const },
  ]

  return (
    <div className="space-y-10">
      {/*
        Hero a sangre: los márgenes negativos cancelan el padding de <main> para
        que el lienzo 3D llegue hasta los bordes en vez de quedarse dentro del
        contenedor centrado, que lo estrechaba en pantallas anchas.

        Altura mínima, no fija: en pantallas estrechas la columna de tarjetas
        es más alta que el hero y se derramaba sobre la sección siguiente.
      */}
      <div className="relative min-h-[620px] lg:min-h-[860px] -mt-16 md:-mt-4 lg:-mt-8 -mx-4 lg:-mx-8 pb-4">
        <div className="absolute inset-0">
          <SentientFigure accentColor="#7dd3fc" moodId={moodId} />
        </div>

        {/* Encabezado + tira semanal */}
        <div className="relative z-20 pt-16 md:pt-4 lg:pt-8 px-4 lg:px-8 pointer-events-none space-y-5">
          <div className="pointer-events-auto">
            <h1 className="font-sans text-4xl font-light tracking-tight">
              Panel de <span className="italic text-white">Control</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
              Visión general de tu ecosistema personal
            </p>
          </div>

          <div className="pointer-events-auto block w-full max-w-md lg:inline-block lg:w-auto lg:max-w-full bg-background/70 backdrop-blur-md border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between gap-6 mb-2">
              <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">
                Esta semana
              </span>
              <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                {weekTotals.completed}/{weekTotals.routines} rutinas
              </span>
            </div>

            <MiniWeek days={week} selected={selectedDay} onSelect={setSelectedDay} />

            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-white/10 w-64">
                    <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase mb-1.5">
                      {selected.label} {selected.dayNumber}
                      {selected.isToday && " · hoy"}
                    </p>
                    {selectedRoutines.length === 0 && selectedEvents.length === 0 && (
                      <DetailEmpty>Día libre. Nada programado.</DetailEmpty>
                    )}
                    {selectedRoutines.map((routine) => {
                      const done = isCompletedOn(routine, selected.date)
                      return (
                        <DetailRow
                          key={routine.id}
                          icon={done ? Check : categoryConfig[routine.category].icon}
                          title={routine.name}
                          meta={`${routine.hour}:00`}
                          dim={done}
                        />
                      )
                    })}
                    {selectedEvents.map((event) => (
                      <DetailRow
                        key={event.id}
                        icon={CircleDot}
                        title={event.title}
                        meta={`${event.hour}:00`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reloj con su agenda y el pad, bajo el calendario */}
          <div className="pointer-events-auto flex flex-col gap-3 w-full max-w-md lg:w-[17.5rem] lg:max-w-none">
            <DashboardClock onNavigate={onNavigate && (() => onNavigate("routines"))} />
            <DashboardPad onNavigate={onNavigate && (() => onNavigate("notebook"))} />
            <FigureControls moodId={moodId} onMoodChange={setMoodId} />
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="border border-white/10 p-6"
        >
          <h3 className="font-sans text-lg font-light mb-4">
            Acciones <span className="italic text-white">Rápidas</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate?.(action.view)}
                  className="flex items-center gap-3 p-3 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
                >
                  <Icon className="w-4 h-4 text-white shrink-0" />
                  <span className="font-mono text-[11px] tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Week Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="border border-white/10 p-6"
        >
          <h3 className="font-sans text-lg font-light mb-4">
            Progreso <span className="italic text-white">Semanal</span>
          </h3>
          <div className="space-y-4">
            {activeRoutines.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground">
                Aún no hay rutinas activas.
              </p>
            )}
            {activeRoutines.slice(0, 4).map((routine) => {
              const doneToday = isCompletedOn(routine, today)
              const { streak } = computeStreak(routine, today)
              const rate = adherence(routine, 30, today)
              return (
                <div key={routine.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      doneToday ? "bg-white" : "bg-white/10"
                    }`}
                  />
                  <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                    {routine.name}
                  </span>
                  <span className="font-mono text-[10px] text-white/80 shrink-0">
                    {routine.hour}:00
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground shrink-0 tabular-nums">
                    <Flame className="w-3 h-3 text-white/70" />
                    {streak}
                  </span>
                  {rate && (
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 tabular-nums">
                      {Math.round(rate.rate * 100)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        <DashboardInsights />
      </div>

      {/* Research Progress */}
      {researchSeasons.map((season) => (
        <motion.div
          key={season.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="max-w-7xl mx-auto border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-lg font-light">
              <span className="italic text-white">{season.title}</span>
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              {season.chapters.filter((c) => c.status === "published").length} /{" "}
              {season.chapters.length} publicado
            </span>
          </div>
          <div className="space-y-2">
            {season.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex items-center gap-3 p-3 bg-white/5 border-l-2"
                style={{
                  borderColor:
                    chapter.status === "published" ? "#ffffff" : "rgba(255,255,255,0.1)",
                }}
              >
                <span className="font-mono text-[10px] text-muted-foreground w-6">
                  Cap {chapter.order}
                </span>
                <span className="font-mono text-xs text-foreground flex-1">{chapter.title}</span>
                <span
                  className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 border ${
                    chapter.status === "published"
                      ? "border-white/30 text-white"
                      : "border-white/10 text-muted-foreground"
                  }`}
                >
                  {chapter.status === "published" ? "Publicado" : "Borrador"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
