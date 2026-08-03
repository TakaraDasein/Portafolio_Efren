"use client"

import { useDashboard } from "../../data/dashboard-store"
import { motion } from "framer-motion"
import {
  FolderKanban,
  Repeat,
  Heart,
  BookOpen,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Activity,
} from "lucide-react"

export default function DashboardHome() {
  const { data } = useDashboard()
  const { projects, routines, healthMetrics, researchSeasons, calendarEvents } = data

  const activeProjects = projects.filter((p) => p.status === "active").length
  const activeRoutines = routines.filter((r) => !r.paused)
  const completedToday = activeRoutines.filter(
    (r) => r.lastCompleted === new Date().toISOString().split("T")[0],
  ).length
  const totalChapters = researchSeasons.reduce(
    (acc, s) => acc + s.chapters.length,
    0,
  )
  const publishedChapters = researchSeasons.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.status === "published").length,
    0,
  )
  const todayEvents = calendarEvents.filter(
    (e) => e.day === new Date().getDay(),
  ).length

  const stats = [
    {
      label: "Proyectos Activos",
      value: activeProjects,
      total: projects.length,
      icon: FolderKanban,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      label: "Rutinas Hoy",
      value: completedToday,
      total: activeRoutines.length,
      icon: Repeat,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      label: "Registros Salud",
      value: healthMetrics.length,
      icon: Heart,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      label: "Capítulos",
      value: publishedChapters,
      total: totalChapters,
      icon: BookOpen,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      label: "Eventos Hoy",
      value: todayEvents,
      icon: Calendar,
      color: "text-white",
      bg: "bg-white/10",
    },
  ]

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-sans text-4xl font-light tracking-tight">
          Panel de <span className="italic text-white">Control</span>
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
          Visión general de tu ecosistema personal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="border border-white/10 p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-sm ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                {stat.total !== undefined && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    de {stat.total}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-sans text-3xl font-light tracking-tight">
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
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
            {[
              { icon: Target, label: "Nuevo Proyecto", color: "text-white" },
              { icon: Zap, label: "Registrar Rutina", color: "text-white" },
              { icon: Activity, label: "Medir Salud", color: "text-white" },
              { icon: BookOpen, label: "Escribir Capítulo", color: "text-white" },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-3 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
                >
                  <Icon className={`w-4 h-4 ${action.color} shrink-0`} />
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
            {activeRoutines.slice(0, 4).map((routine) => {
              const dayOfWeek = new Date().getDay()
              const doneToday = routine.lastCompleted === new Date().toISOString().split("T")[0]
              return (
                <div key={routine.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      doneToday ? "bg-white" : "bg-white/10"
                    }`}
                  />
                  <span className="font-mono text-xs text-muted-foreground flex-1">
                    {routine.name}
                  </span>
                  <span className="font-mono text-[10px] text-white/80">
                    {routine.hour}:00
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {routine.streak} días seguidos
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Research Progress */}
      {researchSeasons.map((season) => (
        <motion.div
          key={season.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="border border-white/10 p-6"
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
                <span className="font-mono text-xs text-foreground flex-1">
                  {chapter.title}
                </span>
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
