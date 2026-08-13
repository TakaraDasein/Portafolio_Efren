"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkline } from "./wellbeing-visuals"
import type { LucideIcon } from "lucide-react"

/**
 * Piezas del hero del panel de control: pods de datos con detalle desplegable
 * y la tira semanal. Todo se superpone al lienzo 3D, así que cada elemento
 * gestiona sus propios `pointer-events` para no bloquear el arrastre de la figura.
 */

/** Cierra al hacer clic fuera o con Escape. */
function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  return ref
}

export interface HeroPodProps {
  label: string
  value: string | number
  /** Contexto breve junto al número: "de 4", "publicados"… */
  caption?: string
  icon: LucideIcon
  index: number
  series?: number[]
  /** Lado por el que se despliega el detalle. */
  side?: "left" | "right"
  /** Contenido del panel de detalle; sin él el pod no es interactivo. */
  detail?: ReactNode
  onNavigate?: () => void
  /** Fila estrecha de una sola línea, para ocupar lo mínimo. */
  compact?: boolean
}

export function HeroPod({
  label,
  value,
  caption,
  icon: Icon,
  index,
  series = [],
  side = "right",
  detail,
  onNavigate,
  compact = false,
}: HeroPodProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const interactive = Boolean(detail)
  // Un botón que flota es un blanco móvil: se posa al apuntarlo o al abrirlo.
  const settled = open || (hovered && interactive)

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        disabled={!interactive}
        onClick={() => setOpen((prev) => !prev)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        initial={{ opacity: 0, x: side === "right" ? 16 : -16 }}
        animate={{ opacity: 1, x: 0, y: settled ? 0 : [0, -4, 0] }}
        transition={{
          opacity: { delay: 0.15 + index * 0.08, duration: 0.4 },
          x: { delay: 0.15 + index * 0.08, duration: 0.4 },
          y: settled
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
        }}
        title={interactive ? `Ver detalle de ${label}` : undefined}
        className={`w-full flex items-center bg-background/70 backdrop-blur-md border rounded-xl transition-colors ${
          compact ? "gap-2 px-3 py-1.5" : "gap-3 px-4 py-2.5"
        } ${open ? "border-white/40" : "border-white/10"} ${
          interactive ? "hover:border-white/30 cursor-pointer" : "cursor-default"
        }`}
      >
        {compact ? (
          <>
            <Icon className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="font-mono text-[8px] text-muted-foreground/60 tracking-wider uppercase shrink-0">
              {label}
            </span>
            <span className="font-sans text-base font-light tracking-tight tabular-nums ml-auto">
              {value}
            </span>
            {caption && (
              <span className="font-mono text-[9px] text-muted-foreground/70 shrink-0">
                {caption}
              </span>
            )}
            <Sparkline values={series} width={36} height={12} />
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1 shrink-0 w-12">
              <Icon className="w-4 h-4 text-white" />
              <span className="font-mono text-[8px] text-muted-foreground/60 tracking-wider uppercase text-center leading-tight">
                {label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg font-light tracking-tight tabular-nums">
                {value}
              </span>
              {caption && (
                <span className="font-mono text-[9px] text-muted-foreground/70 shrink-0">
                  {caption}
                </span>
              )}
              <Sparkline values={series} />
            </div>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && detail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: side === "right" ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={`absolute top-0 z-30 w-72 max-h-[19rem] overflow-y-auto bg-background/95 backdrop-blur-md border border-white/20 p-4 rounded-xl ${
              side === "right" ? "right-full mr-3" : "left-full ml-3"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                {label}
              </span>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onNavigate()
                  }}
                  className="font-mono text-[9px] text-muted-foreground hover:text-white tracking-wider uppercase transition-colors"
                >
                  Abrir →
                </button>
              )}
            </div>
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Fila compacta reutilizable dentro de los paneles de detalle. */
export function DetailRow({
  icon: Icon,
  title,
  meta,
  dim = false,
}: {
  icon?: LucideIcon
  title: string
  /** Acepta nodos para poder componer iconos (racha, hora) sin recurrir a emoji. */
  meta?: ReactNode
  dim?: boolean
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      {Icon && <Icon className="w-3 h-3 text-white/70 shrink-0" />}
      <span
        className={`font-mono text-[10px] flex-1 truncate ${
          dim ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {title}
      </span>
      {meta && (
        <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground shrink-0 tabular-nums">
          {meta}
        </span>
      )}
    </div>
  )
}

export function DetailEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{children}</p>
  )
}

export interface WeekDay {
  date: string
  column: number
  label: string
  dayNumber: string
  isToday: boolean
  isPast: boolean
  routines: number
  completed: number
  events: number
}

/**
 * Tira semanal: densidad de cada día de un vistazo.
 * El anillo se llena según la proporción cumplida de ese día.
 */
export function MiniWeek({
  days,
  selected,
  onSelect,
}: {
  days: WeekDay[]
  selected: string | null
  onSelect: (date: string | null) => void
}) {
  return (
    <div className="flex gap-1">
      {days.map((day) => {
        const ratio = day.routines > 0 ? day.completed / day.routines : 0
        const isSelected = selected === day.date
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(isSelected ? null : day.date)}
            title={`${day.label} ${day.dayNumber} · ${day.completed}/${day.routines} rutinas · ${day.events} eventos`}
            className={`flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg border transition-colors ${
              isSelected
                ? "border-white/40 bg-white/10"
                : day.isToday
                  ? "border-white/25"
                  : "border-transparent hover:border-white/15"
            }`}
          >
            <span
              className={`font-mono text-[8px] tracking-wider uppercase ${
                day.isToday ? "text-white" : "text-muted-foreground/60"
              }`}
            >
              {day.label}
            </span>
            <span
              className={`font-mono text-[10px] tabular-nums ${
                day.isToday ? "text-white" : "text-muted-foreground"
              }`}
            >
              {day.dayNumber}
            </span>

            {/* Barra de cumplimiento del día */}
            <span className="block w-5 h-0.5 bg-white/10 overflow-hidden">
              <span
                className="block h-full bg-white/70"
                style={{
                  // Los días futuros no se "rellenan": aún no han ocurrido.
                  width: day.isPast || day.isToday ? `${Math.round(ratio * 100)}%` : "0%",
                }}
              />
            </span>

            {/* Puntos de eventos, máximo tres */}
            <span className="flex gap-0.5 h-1">
              {Array.from({ length: Math.min(day.events, 3) }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-white/50" />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
