"use client"

import { useMemo } from "react"
import { useDashboard } from "../../data/dashboard-store"
import { motion } from "framer-motion"
import { SentientFigure } from "./sentient-figure"
import {
  FolderKanban,
  Repeat,
  Heart,
  BookOpen,
  Calendar,
  Target,
  Zap,
  Activity,
  type LucideIcon,
} from "lucide-react"

function seededSeries(seed: string, points = 7): number[] {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967295
  }
  return Array.from({ length: points }, () => 0.2 + next() * 0.8)
}

function Sparkline({ values }: { values: number[] }) {
  const w = 44
  const h = 14
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * h
      return `${x},${y}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  )
}

function SideStat({
  label,
  value,
  icon: Icon,
  index,
}: {
  label: string
  value: number
  icon: LucideIcon
  index: number
}) {
  const spark = useMemo(() => seededSeries(label), [label])
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
      transition={{
        opacity: { delay: 0.15 + index * 0.08, duration: 0.4 },
        x: { delay: 0.15 + index * 0.08, duration: 0.4 },
        y: { duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
      }}
      className="flex items-center gap-3 px-4 py-2.5 bg-background/70 backdrop-blur-md border border-white/10 rounded-xl hover:border-white/30 transition-colors"
    >
      <div className="flex flex-col items-center gap-1 shrink-0 w-12">
        <Icon className="w-4 h-4 text-white" />
        <span className="font-mono text-[8px] text-muted-foreground/60 tracking-wider uppercase text-center leading-tight">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-sans text-lg font-light tracking-tight">{value}</span>
        <Sparkline values={spark} />
      </div>
    </motion.div>
  )
}

export default function DashboardHome() {
  const { data } = useDashboard()
  const { projects, routines, healthMetrics, researchSeasons, calendarEvents } = data

  const activeProjects = projects.filter((p) => p.status === "development").length
  const activeRoutines = routines.filter((r) => !r.paused)
  const completedToday = activeRoutines.filter(
    (r) => r.lastCompleted === new Date().toISOString().split("T")[0],
  ).length
  const publishedChapters = researchSeasons.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.status === "published").length,
    0,
  )
  const todayEvents = calendarEvents.filter(
    (e) => e.day === new Date().getDay(),
  ).length

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Hero: 3D figure as a full-bleed background reaching the top edge, header + stats overlaid */}
      <div className="relative w-full h-[620px] md:h-[860px] -mt-8">
        <div className="absolute inset-0">
          <SentientFigure accentColor="#7dd3fc" />
        </div>

        <div className="relative z-10 pt-8 pointer-events-none">
          <h1 className="font-sans text-4xl font-light tracking-tight pointer-events-auto">
            Panel de <span className="italic text-white">Control</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider pointer-events-auto">
            Visión general de tu ecosistema personal
          </p>
        </div>

        <div className="absolute inset-y-0 right-0 flex flex-col justify-center gap-3 pr-1 md:pr-4 pointer-events-none [&>*]:pointer-events-auto">
          <SideStat label="Proyectos" value={activeProjects} icon={FolderKanban} index={0} />
          <SideStat label="Rutinas" value={completedToday} icon={Repeat} index={1} />
          <SideStat label="Salud" value={healthMetrics.length} icon={Heart} index={2} />
          <SideStat label="Capítulos" value={publishedChapters} icon={BookOpen} index={3} />
          <SideStat label="Eventos" value={todayEvents} icon={Calendar} index={4} />
        </div>
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
