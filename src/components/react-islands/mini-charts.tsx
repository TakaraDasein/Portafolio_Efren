"use client"

import { motion } from "framer-motion"

export type ChartType =
  | "bars"
  | "scatter"
  | "line"
  | "compare"
  | "area"
  | "gauge"
  | "pulse"
  | "radar"
  | "donut"
  | "network"

export const chartTypes: ChartType[] = [
  "bars",
  "scatter",
  "line",
  "compare",
  "area",
  "gauge",
  "pulse",
  "radar",
  "donut",
  "network",
]

interface MiniChartProps {
  type: ChartType
  color?: string
  size?: number
  active?: boolean
}

const barsData = [16, 30, 22, 40, 27, 36]
const scatterPoints = [
  { x: 10, y: 44, on: true }, { x: 18, y: 20, on: false }, { x: 24, y: 34, on: true },
  { x: 30, y: 14, on: false }, { x: 36, y: 40, on: true }, { x: 42, y: 24, on: true },
  { x: 48, y: 46, on: false }, { x: 54, y: 18, on: true }, { x: 14, y: 30, on: false },
  { x: 44, y: 12, on: true }, { x: 22, y: 50, on: false }, { x: 50, y: 32, on: true },
]
const compareData = [
  { h: 26, on: true }, { h: 20, on: false },
  { h: 38, on: true }, { h: 30, on: false },
  { h: 44, on: true }, { h: 34, on: false },
]

function BarsMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {barsData.map((h, i) => (
        <motion.rect
          key={i}
          x={9 + i * 8}
          width={6}
          rx={1}
          fill={color}
          y={56 - h}
          height={h}
          initial={{ scaleY: 0, opacity: 0.4 }}
          animate={{ scaleY: 1, opacity: active ? 1 : 0.6 }}
          style={{ transformOrigin: "56px" }}
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.6,
          }}
        />
      ))}
    </svg>
  )
}

function ScatterMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {scatterPoints.map((p, i) => {
        const target = p.on ? (active ? 1 : 0.7) : 0.2
        return (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.6}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, target, target, 0], scale: [0.4, 1, 1, 0.4] }}
            transition={{
              duration: 2.4,
              times: [0, 0.25, 0.75, 1],
              delay: i * 0.06,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        )
      })}
    </svg>
  )
}

function LineMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {scatterPoints.slice(0, 8).map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={(p.y + 32) / 2}
          r={1.6}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 0.6, delay: i * 0.03 }}
        />
      ))}
      <motion.path
        d="M8,44 C20,18 44,38 56,12"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: active ? 1 : 0.85 }}
        transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />
    </svg>
  )
}

function CompareMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {compareData.map((b, i) => (
        <motion.rect
          key={i}
          x={7 + i * 9}
          width={5}
          rx={1}
          fill={color}
          y={56 - b.h}
          height={b.h}
          initial={{ scaleY: 0, opacity: b.on ? (active ? 1 : 0.75) : 0.3 }}
          animate={{ scaleY: 1, opacity: b.on ? (active ? 1 : 0.75) : 0.3 }}
          style={{ transformOrigin: "56px" }}
          transition={{
            duration: 0.7,
            delay: i * 0.07,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.6,
          }}
        />
      ))}
    </svg>
  )
}

function AreaMini({ color, active }: { color: string; active: boolean }) {
  const line = "M4,40 L16,32 L28,36 L40,20 L52,24 L60,10"
  const area = `${line} L60,56 L4,56 Z`
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#area-fill)"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 2.2,
          times: [0, 0.35, 0.85, 1],
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, opacity: active ? 1 : 0.85 }}
        transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />
    </svg>
  )
}

function GaugeMini({ color, active }: { color: string; active: boolean }) {
  const r = 24
  const c = 2 * Math.PI * r
  const fillFraction = 0.74
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={5} />
      <motion.circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 32 32)"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - fillFraction) }}
        transition={{
          duration: 1.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.6,
        }}
      />
      <text
        x={32}
        y={36}
        textAnchor="middle"
        fontSize="11"
        fontFamily="monospace"
        fill={color}
        opacity={active ? 1 : 0.8}
      >
        {Math.round(fillFraction * 100)}%
      </text>
    </svg>
  )
}

function PulseMini({ color, active }: { color: string; active: boolean }) {
  const d = "M2,32 H14 L18,14 L25,50 L31,8 L37,42 L43,32 H62"
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d={d} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1.5} />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{ pathLength: 1, opacity: active ? 1 : 0.85 }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: "loop", ease: "linear" }}
      />
    </svg>
  )
}

const networkNodes = [
  { x: 12, y: 16 }, { x: 32, y: 10 }, { x: 52, y: 18 },
  { x: 18, y: 42 }, { x: 40, y: 46 }, { x: 54, y: 36 },
]
const networkEdges: [number, number][] = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5]]
const donutSegments = [0.45, 0.3, 0.25]

function RadarMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <polygon points="32,8 54,24 46,50 18,50 10,24" fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1.5} />
      <polygon points="32,18 46,28 41,45 23,45 18,28" fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={1} />
      <motion.polygon
        points="32,14 48,26 42,46 22,46 16,26"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        initial={{ scale: 0.75, opacity: 0.4, fillOpacity: 0.15 }}
        animate={{ scale: [0.85, 1, 0.85], opacity: active ? 1 : 0.75, fillOpacity: active ? 0.3 : 0.15 }}
        style={{ transformOrigin: "32px 30px" }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  )
}

function DonutMini({ color, active }: { color: string; active: boolean }) {
  const r = 22
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeOpacity={0.12} strokeWidth={7} />
      {donutSegments.map((frac, i) => {
        const dash = c * frac
        const rotation = acc * 360
        acc += frac
        return (
          <motion.circle
            key={i}
            cx={32}
            cy={32}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
            transform={`rotate(${-90 + rotation} 32 32)`}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: active ? [0.55, 1, 0.55] : [0.4, 0.65, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          />
        )
      })}
    </svg>
  )
}

function NetworkMini({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {networkEdges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={networkNodes[a].x}
          y1={networkNodes[a].y}
          x2={networkNodes[b].x}
          y2={networkNodes[b].y}
          stroke={color}
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: active ? 0.7 : 0.35 }}
          transition={{ duration: 1.4, delay: i * 0.08, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.8 }}
        />
      ))}
      {networkNodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={3}
          fill={color}
          initial={{ opacity: 0.4, scale: 0.85 }}
          animate={{ opacity: active ? 1 : 0.75, scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 1.6, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  )
}

const registry: Record<ChartType, typeof BarsMini> = {
  bars: BarsMini,
  scatter: ScatterMini,
  line: LineMini,
  compare: CompareMini,
  area: AreaMini,
  gauge: GaugeMini,
  pulse: PulseMini,
  radar: RadarMini,
  donut: DonutMini,
  network: NetworkMini,
}

export default function MiniChart({ type, color = "currentColor", size = 48, active = false }: MiniChartProps) {
  const Chart = registry[type] ?? registry.bars
  return (
    <div style={{ width: size, height: size }}>
      <Chart color={color} active={active} />
    </div>
  )
}
