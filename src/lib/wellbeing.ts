import type { CalendarEvent, HealthMetric, Routine } from "../data/dashboard-store"

/**
 * Núcleo analítico del dashboard (rutinas + salud).
 *
 * Todo aquí es puro y derivado: la fuente de verdad son `Routine.completions`
 * y `HealthMetric`. Nada se almacena precalculado salvo `Routine.streak`, que
 * es solo una caché recomputada desde el historial.
 */

/* ── Fechas ──────────────────────────────────────────────────────────────── */

/** Fecha local en formato YYYY-MM-DD (no UTC: evita saltar de día por la tarde). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Medianoche local a partir de YYYY-MM-DD (evita el parseo UTC de `new Date(iso)`). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, delta: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + delta)
  return toISODate(date)
}

export function dayOfWeek(iso: string): number {
  return parseISODate(iso).getDay()
}

/** Lista de fechas ISO desde hace `days - 1` días hasta `endISO`, en orden ascendente. */
export function dateRange(days: number, endISO: string = todayISO()): string[] {
  return Array.from({ length: days }, (_, i) => addDays(endISO, i - (days - 1)))
}

/**
 * El calendario semanal indexa sus columnas 0=Lunes … 6=Domingo, mientras que
 * `Date.getDay()` usa 0=Domingo. Mezclar ambos desalinea los eventos por un día.
 */
export function toCalendarColumn(jsDay: number): number {
  return (jsDay + 6) % 7
}

export function fromCalendarColumn(column: number): number {
  return (column + 1) % 7
}

/** Las 7 fechas de la semana que contiene `iso`, de lunes a domingo. */
export function weekDates(iso: string = todayISO()): string[] {
  const monday = addDays(iso, -toCalendarColumn(dayOfWeek(iso)))
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/* ── Rutinas: historial y adherencia ─────────────────────────────────────── */

export const GRACE_ALLOWANCE = 1

function completionSet(routine: Routine): Set<string> {
  return new Set((routine.completions ?? []).map((c) => c.date))
}

export function isCompletedOn(routine: Routine, iso: string): boolean {
  return completionSet(routine).has(iso)
}

export function isScheduledOn(routine: Routine, iso: string): boolean {
  return routine.daysOfWeek.includes(dayOfWeek(iso))
}

/** Días en que la rutina estaba programada dentro de la ventana, ya existiendo. */
export function scheduledDates(
  routine: Routine,
  days: number,
  endISO: string = todayISO(),
): string[] {
  return dateRange(days, endISO).filter(
    (iso) => iso >= routine.createdAt && isScheduledOn(routine, iso),
  )
}

export interface Adherence {
  rate: number
  completed: number
  scheduled: number
}

/**
 * Adherencia real: completados / días efectivamente programados.
 * Faltar un día no programado nunca penaliza. `null` si aún no hay
 * suficientes días programados para decir algo honesto.
 */
export function adherence(
  routine: Routine,
  days = 30,
  endISO: string = todayISO(),
): Adherence | null {
  // El día de hoy aún está en curso: no cuenta como fallo todavía.
  const scheduled = scheduledDates(routine, days, endISO).filter((iso) => iso !== endISO)
  if (scheduled.length < 3) return null
  const done = completionSet(routine)
  const completed = scheduled.filter((iso) => done.has(iso)).length
  return { rate: completed / scheduled.length, completed, scheduled: scheduled.length }
}

export interface StreakResult {
  /** Días programados consecutivos cumplidos (incluye los perdonados). */
  streak: number
  /** Fallos aislados perdonados dentro de la racha actual. */
  forgiven: number
  /** Queda indulto disponible en esta racha. */
  graceLeft: number
}

/**
 * Racha consciente del horario, con indulto por fallo aislado.
 *
 * Reglas:
 *  - Los días no programados se saltan (no rompen nada).
 *  - Hoy nunca rompe la racha: sigue pendiente hasta que termine.
 *  - Un fallo aislado se perdona (regla "nunca faltes dos veces"); dos fallos
 *    programados consecutivos sí cortan la racha.
 */
export function computeStreak(routine: Routine, endISO: string = todayISO()): StreakResult {
  const done = completionSet(routine)
  let streak = 0
  let forgiven = 0
  let previousWasMiss = false
  let cursor = endISO

  // Tope defensivo: un año de historia es más que suficiente.
  for (let i = 0; i < 366; i++) {
    if (cursor < routine.createdAt) break
    if (!isScheduledOn(routine, cursor)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (done.has(cursor)) {
      streak++
      previousWasMiss = false
      cursor = addDays(cursor, -1)
      continue
    }
    // Día programado sin completar.
    if (cursor === endISO) {
      // Hoy sigue en curso: ni suma ni rompe.
      cursor = addDays(cursor, -1)
      continue
    }
    if (previousWasMiss || forgiven >= GRACE_ALLOWANCE) break
    forgiven++
    previousWasMiss = true
    cursor = addDays(cursor, -1)
  }

  return { streak, forgiven, graceLeft: GRACE_ALLOWANCE - forgiven }
}

export interface HeatmapCell {
  date: string
  scheduled: boolean
  completed: boolean
  isToday: boolean
}

/** Rejilla de consistencia de los últimos `days` días para una rutina. */
export function consistencyGrid(
  routine: Routine,
  days = 28,
  endISO: string = todayISO(),
): HeatmapCell[] {
  const done = completionSet(routine)
  return dateRange(days, endISO).map((date) => ({
    date,
    scheduled: date >= routine.createdAt && isScheduledOn(routine, date),
    completed: done.has(date),
    isToday: date === endISO,
  }))
}

/** ¿La racha está en riesgo? Ya pasó la hora, sigue pendiente y hay algo que perder. */
export function isStreakAtRisk(routine: Routine, now: Date = new Date()): boolean {
  if (routine.paused) return false
  const today = toISODate(now)
  if (!isScheduledOn(routine, today) || isCompletedOn(routine, today)) return false
  const { streak } = computeStreak(routine, today)
  return streak >= 3 && now.getHours() >= routine.hour
}

/* ── Próxima tarea ───────────────────────────────────────────────────────── */

export interface UpcomingTask {
  kind: "routine" | "event"
  id: string
  title: string
  /** Fecha en que ocurre (los eventos del calendario se repiten cada semana). */
  date: string
  hour: number
  /** Negativo mientras transcurre su franja horaria. */
  minutesUntil: number
  /** 0 = hoy, 1 = mañana… Se toma del calendario, no de dividir minutos. */
  daysAhead: number
  happening: boolean
  /** Solo aplica a rutinas; los eventos no se cumplen. */
  completed: boolean
  category?: Routine["category"]
}

/** Una tarea sigue vigente durante toda su hora, no solo en el minuto exacto. */
const SLOT_MINUTES = 60

/**
 * Agenda cronológica desde hoy hasta el horizonte: rutinas programadas (incluidas
 * las ya cumplidas, para poder listarlas y navegar hacia atrás) y eventos del
 * calendario, que se repiten cada semana. Las rutinas pausadas no aparecen.
 */
export function buildAgenda(
  routines: Routine[],
  events: CalendarEvent[],
  now: Date = new Date(),
  horizonDays = 7,
): UpcomingTask[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const todayIso = toISODate(now)
  const agenda: UpcomingTask[] = []

  for (let offset = 0; offset <= horizonDays; offset++) {
    const date = addDays(todayIso, offset)
    const column = toCalendarColumn(dayOfWeek(date))

    for (const routine of routines) {
      if (routine.paused) continue
      if (!isScheduledOn(routine, date)) continue
      const minutesUntil = routine.hour * 60 - nowMinutes + offset * 1440
      agenda.push({
        kind: "routine",
        id: routine.id,
        title: routine.name,
        date,
        hour: routine.hour,
        minutesUntil,
        daysAhead: offset,
        happening: minutesUntil <= 0 && minutesUntil + SLOT_MINUTES > 0,
        completed: isCompletedOn(routine, date),
        category: routine.category,
      })
    }

    for (const event of events) {
      if (event.day !== column) continue
      const minutesUntil = event.hour * 60 - nowMinutes + offset * 1440
      agenda.push({
        kind: "event",
        id: event.id,
        title: event.title,
        date,
        hour: event.hour,
        minutesUntil,
        daysAhead: offset,
        happening: minutesUntil <= 0 && minutesUntil + SLOT_MINUTES > 0,
        completed: false,
      })
    }
  }

  // `minutesUntil` ya es un desplazamiento absoluto desde ahora: ordenar por él
  // equivale a ordenar cronológicamente.
  return agenda.sort((a, b) => a.minutesUntil - b.minutesUntil)
}

/** Índice de lo que toca ahora dentro de la agenda; -1 si no queda nada. */
export function nextTaskIndex(agenda: UpcomingTask[]): number {
  return agenda.findIndex((t) => !t.completed && t.minutesUntil + SLOT_MINUTES > 0)
}

/**
 * La siguiente cosa que toca: rutina pendiente o evento del calendario, lo que
 * llegue antes. Ignora rutinas pausadas y las ya cumplidas ese día.
 */
export function nextTask(
  routines: Routine[],
  events: CalendarEvent[],
  now: Date = new Date(),
  horizonDays = 7,
): UpcomingTask | null {
  const agenda = buildAgenda(routines, events, now, horizonDays)
  const index = nextTaskIndex(agenda)
  return index === -1 ? null : agenda[index]
}

/**
 * Distancia temporal en palabras, siempre relativa: quien lo muestre antepone
 * la hora (`7:00 · mañana`), así que aquí nunca se repite.
 *
 * El salto de día se decide por calendario (`daysAhead`), no por minutos: una
 * tarea de mañana a las 7:00 vista a las 22:00 está a 9 horas, y anunciarla
 * como "en 9 h" ocultaba que ya es otro día.
 */
export function formatCountdown(task: UpcomingTask): string {
  if (task.daysAhead >= 2) return `en ${task.daysAhead} días`
  if (task.daysAhead === 1) return "mañana"

  const { minutesUntil } = task

  // Ya cerró su franja: se puede mirar hacia atrás en la agenda, y decir
  // "en curso" a algo de hace horas sería falso.
  if (minutesUntil + SLOT_MINUTES <= 0) {
    const ago = -minutesUntil
    if (ago < 120) return `hace ${ago} min`
    return `hace ${Math.floor(ago / 60)} h`
  }

  if (minutesUntil <= 0) return "en curso"
  if (minutesUntil < 60) return `en ${minutesUntil} min`

  const hours = Math.floor(minutesUntil / 60)
  const minutes = minutesUntil % 60
  return minutes === 0 ? `en ${hours} h` : `en ${hours} h ${minutes} min`
}

/* ── Balance entre dominios de vida ──────────────────────────────────────── */

export interface CategoryScore {
  category: Routine["category"]
  score: number
  routines: number
}

export interface BalanceResult {
  categories: CategoryScore[]
  /** 0–1: qué tan parejo está el esfuerzo entre dominios (1 = totalmente parejo). */
  balance: number
  /** Categoría más descuidada, si hay una claramente por debajo. */
  weakest: CategoryScore | null
}

export function lifeBalance(
  routines: Routine[],
  endISO: string = todayISO(),
): BalanceResult | null {
  const active = routines.filter((r) => !r.paused)
  const byCategory = new Map<Routine["category"], number[]>()

  for (const routine of active) {
    const result = adherence(routine, 30, endISO)
    if (!result) continue
    // Sin ponderar por dificultad: así un porcentaje significa lo mismo en todo
    // el dashboard (días cumplidos sobre días programados) y no aparecen dos
    // cifras distintas para la misma rutina en pantallas contiguas.
    const list = byCategory.get(routine.category) ?? []
    list.push(result.rate)
    byCategory.set(routine.category, list)
  }

  if (byCategory.size === 0) return null

  const categories: CategoryScore[] = [...byCategory.entries()].map(([category, scores]) => ({
    category,
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
    routines: scores.length,
  }))

  const values = categories.map((c) => c.score)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length
  const balance = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) * 2))

  const sorted = [...categories].sort((a, b) => a.score - b.score)
  const weakest =
    categories.length > 1 && sorted[0].score < mean - 0.15 ? sorted[0] : null

  return { categories: categories.sort((a, b) => b.score - a.score), balance, weakest }
}

/* ── Salud: tendencias suaves ────────────────────────────────────────────── */

export interface MetricPoint {
  date: string
  value: number
}

/** Serie diaria real (promedia si hay varios registros del mismo día). */
export function metricSeries(
  metrics: HealthMetric[],
  type: HealthMetric["type"],
  days = 14,
  endISO: string = todayISO(),
): MetricPoint[] {
  const start = addDays(endISO, -(days - 1))
  const buckets = new Map<string, number[]>()
  for (const m of metrics) {
    if (m.type !== type || m.date < start || m.date > endISO) continue
    const list = buckets.get(m.date) ?? []
    list.push(m.value)
    buckets.set(m.date, list)
  }
  return [...buckets.entries()]
    .map(([date, values]) => ({
      date,
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface RollingAverage {
  avg: number
  count: number
  /** Dirección frente al periodo anterior; `null` si no hay con qué comparar. */
  direction: "up" | "flat" | "down" | null
}

/**
 * Promedio móvil. Devuelve `null` con menos de 2 registros: es preferible el
 * silencio a una tendencia inventada sobre un solo dato.
 */
export function rollingAverage(
  metrics: HealthMetric[],
  type: HealthMetric["type"],
  days = 7,
  endISO: string = todayISO(),
): RollingAverage | null {
  const current = metricSeries(metrics, type, days, endISO)
  if (current.length < 2) return null

  const avg = current.reduce((a, p) => a + p.value, 0) / current.length
  const previous = metricSeries(metrics, type, days, addDays(endISO, -days))

  let direction: RollingAverage["direction"] = null
  if (previous.length >= 2) {
    const previousAvg = previous.reduce((a, p) => a + p.value, 0) / previous.length
    const delta = avg - previousAvg
    // Umbral deliberadamente ancho: el ruido diario no es una tendencia.
    direction = Math.abs(delta) < 0.4 ? "flat" : delta > 0 ? "up" : "down"
  }

  return { avg, count: current.length, direction }
}

export const DIRECTION_LABEL: Record<"up" | "flat" | "down", string> = {
  up: "subiendo ligeramente",
  flat: "estable",
  down: "bajando ligeramente",
}

/**
 * Señal de acompañamiento: varios registros seguidos de ánimo bajo.
 * No es un diagnóstico ni una alerta — solo una invitación a hacer una pausa.
 */
export function checkInSignal(
  metrics: HealthMetric[],
  threshold = 4,
  minRun = 3,
): { run: number } | null {
  const mood = metrics
    .filter((m) => m.type === "mood")
    .sort((a, b) => b.date.localeCompare(a.date))
  let run = 0
  for (const entry of mood) {
    if (entry.value > threshold) break
    run++
  }
  return run >= minRun ? { run } : null
}

export interface RoutineMoodSignal {
  direction: "higher" | "lower"
  magnitude: number
  sample: number
}

/**
 * Observación suave, no correlación estadística: compara el ánimo de los días
 * en que la rutina se completó contra los días en que no. Devuelve `null` sin
 * muestra suficiente o si la diferencia es demasiado pequeña para significar algo.
 */
export function routineMoodSignal(
  routine: Routine,
  metrics: HealthMetric[],
  windowDays = 30,
  endISO: string = todayISO(),
): RoutineMoodSignal | null {
  const moodByDate = new Map<string, number>()
  for (const point of metricSeries(metrics, "mood", windowDays, endISO)) {
    moodByDate.set(point.date, point.value)
  }
  if (moodByDate.size < 6) return null

  const done = completionSet(routine)
  const on: number[] = []
  const off: number[] = []

  for (const iso of scheduledDates(routine, windowDays, endISO)) {
    // Mismo día, o el siguiente si ese día no hubo registro.
    const mood = moodByDate.get(iso) ?? moodByDate.get(addDays(iso, 1))
    if (mood === undefined) continue
    ;(done.has(iso) ? on : off).push(mood)
  }

  if (on.length < 3 || off.length < 3) return null

  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const delta = mean(on) - mean(off)
  if (Math.abs(delta) < 0.5) return null

  return {
    direction: delta > 0 ? "higher" : "lower",
    magnitude: Math.abs(delta),
    sample: on.length + off.length,
  }
}
