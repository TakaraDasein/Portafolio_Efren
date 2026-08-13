"use client"

import type { HeatmapCell } from "../../lib/wellbeing"

/**
 * Primitivas visuales compartidas por Rutinas, Salud e Inicio.
 * Mismo lenguaje que el resto del dashboard: trazo fino, blanco sobre negro,
 * sin color semántico (nada de rojo de alarma).
 */

export function Sparkline({
  values,
  width = 44,
  height = 14,
  opacity = 0.55,
}: {
  values: number[]
  width?: number
  height?: number
  opacity?: number
}) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.25"
        />
      </svg>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / (max - min || 1)) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </svg>
  )
}

/** Barra de progreso sobria: sin gradientes, sin color, solo densidad. */
export function MeterBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="h-1 flex-1 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/70 transition-all duration-500"
          style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }}
        />
      </div>
      {label && (
        <span className="font-mono text-[9px] text-muted-foreground tabular-nums shrink-0">
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * Rejilla de consistencia estilo calendario.
 * Días no programados quedan casi invisibles: no son faltas.
 */
export function ConsistencyGrid({ cells }: { cells: HeatmapCell[] }) {
  return (
    <div className="flex gap-[3px] flex-wrap">
      {cells.map((cell) => {
        const style = !cell.scheduled
          ? "bg-transparent border border-white/5"
          : cell.completed
            ? "bg-white/80 border border-white/80"
            : cell.isToday
              ? "bg-transparent border border-white/40"
              : "bg-transparent border border-white/15"
        return (
          <div
            key={cell.date}
            title={`${cell.date}${
              !cell.scheduled ? " · no programada" : cell.completed ? " · cumplida" : " · pendiente"
            }`}
            className={`w-2 h-2 rounded-[1px] shrink-0 ${style}`}
          />
        )
      })}
    </div>
  )
}
