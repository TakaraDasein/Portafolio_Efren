"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard } from "../../data/dashboard-store"
import { categoryConfig, weekDays } from "./routine-config"
import { SevenSegmentTime } from "./seven-segment"
import {
  buildAgenda,
  dayOfWeek,
  formatCountdown,
  nextTaskIndex,
  parseISODate,
  toISODate,
} from "../../lib/wellbeing"
import {
  Check,
  CalendarClock,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListChecks,
} from "lucide-react"

const DAY_MINUTES = 24 * 60

/** Verde fósforo apagado: evoca un display físico sin romper el monocromo. */
const DISPLAY_COLOR = "#8fa290"

/**
 * Reloj vivo con la agenda del sistema.
 *
 * El tick vive aquí dentro a propósito: si el estado del segundo estuviera en
 * DashboardHome, cada segundo re-renderizaría el lienzo 3D que es su hermano.
 */
export default function DashboardClock({ onNavigate }: { onNavigate?: () => void }) {
  const { data, toggleRoutine } = useDashboard()
  const [now, setNow] = useState<Date | null>(null)
  /** `null` = seguir en vivo lo que toca; un número fija la tarea que se mira. */
  const [cursor, setCursor] = useState<number | null>(null)
  const [showAgenda, setShowAgenda] = useState(false)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const agenda = useMemo(
    () => (now ? buildAgenda(data.routines, data.calendarEvents, now) : []),
    // `now` cambia cada segundo, pero recalcular esto es trivial y así la
    // cuenta atrás nunca se queda desfasada.
    [data.routines, data.calendarEvents, now],
  )

  const liveIndex = nextTaskIndex(agenda)

  // Evita desajustes de render: el reloj solo existe una vez montado en cliente.
  if (!now) {
    return <div className="w-[17.5rem] h-[12rem] border border-white/10 rounded-xl bg-background/70" />
  }

  const todayIso = toISODate(now)
  const todayTasks = agenda.filter((t) => t.date === todayIso)

  // El cursor puede quedar obsoleto al cumplir algo; se acota siempre.
  const index =
    cursor === null
      ? liveIndex
      : Math.max(0, Math.min(cursor, agenda.length - 1))
  const task = index >= 0 ? agenda[index] : null

  /*
   * La agenda sigue al día que estás mirando, no a hoy: al navegar al viernes
   * carece de sentido seguir listando las actividades de hoy debajo.
   */
  const agendaDate = task?.date ?? todayIso
  const agendaTasks = agenda.filter((t) => t.date === agendaDate)
  const agendaIsToday = agendaDate === todayIso

  const canGoBack = task !== null && index > 0
  const canGoForward = task !== null && index < agenda.length - 1
  const step = (delta: number) => setCursor(Math.max(0, Math.min(index + delta, agenda.length - 1)))

  const isToday = task?.date === todayIso
  const isLive = index === liveIndex
  const minutesElapsed = now.getHours() * 60 + now.getMinutes()
  const dayProgress = minutesElapsed / DAY_MINUTES
  const taskPosition = task && isToday ? Math.min(1, (task.hour * 60) / DAY_MINUTES) : null
  const TaskIcon = task
    ? task.category
      ? categoryConfig[task.category].icon
      : CalendarClock
    : Moon

  const todayRoutines = todayTasks.filter((t) => t.kind === "routine")
  /*
   * "Día completo" solo si de verdad se cumplió todo lo de hoy. Que el día se
   * acabe habiendo fallado no es un logro, y anunciarlo como tal sería mentir.
   */
  const dayFullyDone =
    todayRoutines.length > 0 && todayRoutines.every((t) => t.completed)

  const dayLabel = (daysAhead: number, date: string) =>
    daysAhead === 0 ? "Hoy" : daysAhead === 1 ? "Mañana" : weekDays[dayOfWeek(date)]

  // Etiqueta central: qué estás mirando exactamente.
  const label = !task
    ? "Sin agenda"
    : isLive
      ? isToday
        ? "Siguiente"
        : dayFullyDone
          ? "Día completo"
          : dayLabel(task.daysAhead, task.date)
      : dayLabel(task.daysAhead, task.date)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative w-[17.5rem] bg-background/70 backdrop-blur-md border border-white/10 rounded-xl hover:border-white/25 transition-colors"
    >
      {/* Display */}
      <div className="px-5 pt-4 pb-3 flex flex-col items-center bg-white/[0.02] rounded-t-xl">
        <div style={{ color: DISPLAY_COLOR }}>
          <SevenSegmentTime
            hours={now.getHours()}
            minutes={now.getMinutes()}
            // El separador late una vez por segundo: el único movimiento del panel.
            dimColon={now.getSeconds() % 2 === 1}
            height="h-14"
          />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/70 tracking-[0.2em] mt-2.5">
          {todayIso}
        </span>
      </div>

      <div className="px-3 pb-3 pt-2.5 border-t border-white/[0.07]">
        {/* Navegación entre actividades */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canGoBack}
            title="Actividad anterior"
            className="p-1 text-muted-foreground/70 hover:text-white disabled:opacity-20 disabled:hover:text-muted-foreground/70 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCursor(null)}
            title={isLive ? undefined : "Volver a lo que toca ahora"}
            disabled={isLive}
            className={`flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase transition-colors ${
              isLive
                ? "text-muted-foreground/60 cursor-default"
                : "text-white/80 hover:text-white"
            }`}
          >
            {label}
            {task && (
              <span className="text-muted-foreground/50 tabular-nums">
                {index + 1}/{agenda.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canGoForward}
            title="Actividad siguiente"
            className="p-1 text-muted-foreground/70 hover:text-white disabled:opacity-20 disabled:hover:text-muted-foreground/70 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Línea del día: dónde estás y dónde cae lo señalado */}
        <div className="relative h-px bg-white/10 mb-3 mx-1">
          <div
            className="absolute inset-y-0 left-0 bg-white/40"
            style={{ width: `${dayProgress * 100}%` }}
          />
          {taskPosition !== null && (
            <span
              className="absolute -top-[3px] w-px h-[7px] bg-white"
              style={{ left: `${taskPosition * 100}%` }}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={task ? `${task.kind}-${task.id}-${task.date}` : "empty"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 min-h-[2rem] px-1"
          >
            <TaskIcon
              className={`w-3.5 h-3.5 shrink-0 ${task ? "text-white" : "text-muted-foreground"}`}
            />

            {!task ? (
              <span className="font-mono text-[10px] text-muted-foreground flex-1">
                Nada pendiente. Descansa.
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onNavigate}
                  title={onNavigate ? "Ir a la sección" : undefined}
                  className="flex-1 min-w-0 text-left group"
                >
                  <p
                    className={`font-mono text-[11px] truncate transition-colors ${
                      task.completed
                        ? "text-muted-foreground line-through"
                        : "group-hover:text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-wider">
                    {/* La hora siempre delante; la cuenta atrás solo la distancia. */}
                    {task.hour}:00 ·{" "}
                    <span className={task.happening ? "text-white" : ""}>
                      {task.completed ? "cumplida" : formatCountdown(task)}
                    </span>
                  </p>
                </button>

                {/* Solo las rutinas de hoy se pueden marcar desde aquí. */}
                {task.kind === "routine" && isToday && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleRoutine(task.id)
                      setCursor(null)
                    }}
                    title={task.completed ? "Desmarcar" : "Marcar como cumplida"}
                    className={`p-1.5 rounded-sm border transition-colors shrink-0 ${
                      task.completed
                        ? "bg-white border-white text-black"
                        : "border-white/20 text-transparent hover:border-white/60 hover:text-white"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Agenda completa del día */}
      <div className="border-t border-white/[0.07]">
        <button
          type="button"
          onClick={() => setShowAgenda((prev) => !prev)}
          className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground/70 hover:text-white transition-colors"
        >
          <ListChecks className="w-3 h-3 shrink-0" />
          <span className="font-mono text-[9px] tracking-wider uppercase flex-1 text-left">
            {agendaIsToday
              ? "Agenda del día"
              : `Agenda · ${weekDays[dayOfWeek(agendaDate)]} ${parseISODate(agendaDate).getDate()}`}
          </span>
          <span className="font-mono text-[9px] tabular-nums">
            {/* En días futuros el marcador de cumplidas no dice nada: solo el total. */}
            {agendaIsToday
              ? `${agendaTasks.filter((t) => t.completed).length}/${agendaTasks.length}`
              : agendaTasks.length}
          </span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform ${showAgenda ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {showAgenda && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 max-h-44 overflow-y-auto">
                {agendaTasks.length === 0 && (
                  <p className="font-mono text-[10px] text-muted-foreground px-1 py-2">
                    {agendaIsToday
                      ? "Hoy no hay nada programado."
                      : "Ese día no hay nada programado."}
                  </p>
                )}
                {agendaTasks.map((item) => {
                  const ItemIcon = item.category
                    ? categoryConfig[item.category].icon
                    : CalendarClock
                  const isCurrent = agenda.indexOf(item) === index
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      type="button"
                      onClick={() => setCursor(agenda.indexOf(item))}
                      className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-sm text-left transition-colors ${
                        isCurrent ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="font-mono text-[9px] text-muted-foreground/60 tabular-nums w-8 shrink-0">
                        {String(item.hour).padStart(2, "0")}:00
                      </span>
                      {item.completed && agendaIsToday ? (
                        <Check className="w-3 h-3 text-white shrink-0" />
                      ) : (
                        <ItemIcon
                          className={`w-3 h-3 shrink-0 ${
                            item.happening ? "text-white" : "text-muted-foreground/70"
                          }`}
                        />
                      )}
                      <span
                        className={`font-mono text-[10px] flex-1 truncate ${
                          item.completed
                            ? "text-muted-foreground line-through"
                            : item.minutesUntil + 60 <= 0
                              ? "text-muted-foreground/60"
                              : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.happening && (
                        <span className="font-mono text-[8px] text-white tracking-wider uppercase shrink-0">
                          ahora
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
