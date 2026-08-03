"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { ChartType } from "../components/react-islands/mini-charts"

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed" | "archived"
  tags: string[]
  url?: string
  icon: ChartType
  createdAt: string
  updatedAt: string
}

export interface Routine {
  id: string
  name: string
  category: "physical" | "mental" | "social" | "work" | "creative" | "other"
  frequency: "daily" | "weekly" | "custom"
  daysOfWeek: number[]
  hour: number
  streak: number
  paused: boolean
  lastCompleted?: string
  createdAt: string
}

export interface HealthMetric {
  id: string
  type: "weight" | "mood" | "sleep" | "exercise" | "meditation" | "reading" | "custom"
  value: number
  unit: string
  note?: string
  date: string
}

export interface ResearchChapter {
  id: string
  title: string
  description: string
  order: number
  content: string
  videoUrl?: string
  status: "draft" | "published"
  resources?: string[]
}

export interface ResearchSeason {
  id: string
  title: string
  subtitle: string
  description: string
  order: number
  icon: ChartType
  chapters: ResearchChapter[]
}

export interface CalendarEvent {
  id: string
  day: number
  hour: number
  title: string
  color: string
}

interface DashboardData {
  projects: Project[]
  routines: Routine[]
  healthMetrics: HealthMetric[]
  researchSeasons: ResearchSeason[]
  calendarEvents: CalendarEvent[]
}

interface DashboardContextType {
  data: DashboardData
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addRoutine: (routine: Omit<Routine, "id" | "streak" | "paused" | "createdAt">) => void
  updateRoutine: (id: string, updates: Partial<Routine>) => void
  toggleRoutine: (id: string) => void
  togglePauseRoutine: (id: string) => void
  deleteRoutine: (id: string) => void
  addHealthMetric: (metric: Omit<HealthMetric, "id">) => void
  deleteHealthMetric: (id: string) => void
  addSeason: (season: Omit<ResearchSeason, "id" | "chapters">) => void
  updateSeason: (id: string, updates: Partial<ResearchSeason>) => void
  deleteSeason: (id: string) => void
  addChapter: (seasonId: string, chapter: Omit<ResearchChapter, "id">) => void
  updateChapter: (seasonId: string, chapterId: string, updates: Partial<ResearchChapter>) => void
  deleteChapter: (seasonId: string, chapterId: string) => void
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void
  deleteCalendarEvent: (id: string) => void
  lastBackupAt: string | null
  exportData: () => void
  importData: (raw: unknown) => { ok: boolean; error?: string }
}

const STORAGE_KEY = "efren-dashboard-data"
const LAST_BACKUP_KEY = "efren-dashboard-last-backup"

const defaultData: DashboardData = {
  projects: [
    {
      id: "1",
      name: "Portafolio Efren",
      description: "Sistema de portafolio personal con dashboard integrado",
      status: "active",
      tags: ["astro", "react", "tailwind", "three.js"],
      url: "",
      icon: "pulse",
      createdAt: "2025-01-15",
      updatedAt: "2025-07-27",
    },
  ],
  routines: [
    {
      id: "1",
      name: "Meditación matutina",
      category: "mental",
      frequency: "daily",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      hour: 7,
      streak: 0,
      paused: false,
      createdAt: "2025-06-01",
    },
    {
      id: "2",
      name: "Ejercicio físico",
      category: "physical",
      frequency: "daily",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      hour: 18,
      streak: 0,
      paused: false,
      createdAt: "2025-06-01",
    },
  ],
  healthMetrics: [],
  researchSeasons: [
    {
      id: "1",
      title: "El Diseño de Información",
      subtitle: "1T · Fundamentos de Visualización de Datos",
      description:
        "Investigación y recopilación de contenido explicando las aristas y partes de cada tipo de estructura para la visualización eficaz de información.",
      order: 1,
      icon: "network",
      chapters: [
        {
          id: "ch-1",
          title: "Estructuras Jerárquicas: Árboles",
          description:
            "Exploración de estructuras arbóreas para visualización jerárquica: dendrogramas, treemaps, diagramas de partición y sunburst.",
          order: 1,
          content:
            "Las estructuras jerárquicas organizan datos con relaciones padre-hijo. Los árboles son la representación más fundamental: un nodo raíz del que parten ramificaciones. Usos comunes: organigramas, taxonomías, sistemas de archivos, y estructuras de decisión.",
          status: "draft",
          resources: ["Tufte - The Visual Display of Quantitative Information"],
        },
        {
          id: "ch-2",
          title: "Estructuras Relacionales: Redes",
          description:
            "Visualización de redes y grafos: nodos y aristas para representar relaciones complejas entre entidades.",
          order: 2,
          content:
            "Las redes modelan conexiones entre entidades mediante grafos (nodos y aristas). Tipos: dirigidas, no dirigidas, ponderadas. Aplicaciones: redes sociales, rutas de transporte, sistemas de recomendación, y mapas de conocimiento.",
          status: "draft",
          resources: ["Network Science - Albert-László Barabási"],
        },
        {
          id: "ch-3",
          title: "Estructuras Temporales: Calendarios y Flujos",
          description:
            "Representación de datos temporales: líneas de tiempo, calendarios, diagramas de Gantt y visualización de flujos.",
          order: 3,
          content:
            "Los datos temporales requieren representaciones que muestren cambio, secuencia y duración. Herramientas: líneas de tiempo, calendarios de calor, diagramas de Gantt, streamgraphs, y visualizaciones de flujo (sankey).",
          status: "draft",
          resources: ["The Grammar of Graphics - Leland Wilkinson"],
        },
        {
          id: "ch-4",
          title: "Estructuras Espacio-Temporales",
          description:
            "Visualización de fenómenos que combinan dimensión espacial y temporal: mapas animados, retroceso espacio-temporal y geo-temporal.",
          order: 4,
          content:
            "Las estructuras espacio-temporales integran coordenadas geográficas con variables temporales. Técnicas: mapas animados, small multiples con mapas, space-time cubes, y mapas de calor espacio-temporales.",
          status: "draft",
          resources: ["Spatial Temporal Data Visualization - Meng et al."],
        },
        {
          id: "ch-5",
          title: "Estructuras Textuales",
          description:
            "Visualización de texto y datos no estructurados: nubes de palabras, análisis de sentimiento, topic modeling y redes semánticas.",
          order: 5,
          content:
            "La visualización textual transforma datos no estructurados en representaciones visuales significativas. Técnicas: nubes de palabras, barras de frecuencia, árboles de texto, redes semánticas, y visualización de corpus.",
          status: "draft",
          resources: ["Text Visualization - Kucher & Kerren"],
        },
      ],
    },
  ],
  calendarEvents: [
    { id: "1", day: 0, hour: 9, title: "Daily Standup", color: "#ffffff" },
    { id: "2", day: 2, hour: 14, title: "Client Meeting", color: "#999999" },
  ],
}

function sanitizeData(raw: unknown): DashboardData {
  const parsed = (raw ?? {}) as Partial<DashboardData>
  return {
    projects: (Array.isArray(parsed.projects) ? parsed.projects : []).map((p) => ({
      ...p,
      icon: p.icon ?? "bars",
    })),
    routines: (Array.isArray(parsed.routines) ? parsed.routines : []).map((r) => ({
      ...r,
      hour: r.hour ?? 9,
      paused: r.paused ?? false,
    })),
    healthMetrics: Array.isArray(parsed.healthMetrics) ? parsed.healthMetrics : [],
    researchSeasons: (Array.isArray(parsed.researchSeasons) ? parsed.researchSeasons : []).map((s) => ({
      ...s,
      icon: s.icon ?? "bars",
      chapters: Array.isArray(s.chapters) ? s.chapters : [],
    })),
    calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [],
  }
}

function loadData(): DashboardData {
  if (typeof window === "undefined") return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return sanitizeData(JSON.parse(raw))
  } catch { /* ignore */ }
  return defaultData
}

function loadLastBackupAt(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_BACKUP_KEY)
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(loadData)
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(loadLastBackupAt)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const addProject = useCallback(
    (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      setData((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          {
            ...project,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
          },
        ],
      }))
    },
    [],
  )

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : p,
      ),
    }))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }))
  }, [])

  const addRoutine = useCallback(
    (routine: Omit<Routine, "id" | "streak" | "paused" | "createdAt">) => {
      setData((prev) => ({
        ...prev,
        routines: [
          ...prev.routines,
          {
            ...routine,
            id: Date.now().toString(),
            streak: 0,
            paused: false,
            createdAt: new Date().toISOString().split("T")[0],
          },
        ],
      }))
    },
    [],
  )

  const toggleRoutine = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.map((r) => {
        if (r.id !== id) return r
        const today = new Date().toISOString().split("T")[0]
        if (r.lastCompleted === today) return r
        return { ...r, streak: r.streak + 1, lastCompleted: today }
      }),
    }))
  }, [])

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }))
  }, [])

  const togglePauseRoutine = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.map((r) =>
        r.id === id ? { ...r, paused: !r.paused } : r,
      ),
    }))
  }, [])

  const deleteRoutine = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.id !== id),
    }))
  }, [])

  const addHealthMetric = useCallback((metric: Omit<HealthMetric, "id">) => {
    setData((prev) => ({
      ...prev,
      healthMetrics: [...prev.healthMetrics, { ...metric, id: Date.now().toString() }],
    }))
  }, [])

  const deleteHealthMetric = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      healthMetrics: prev.healthMetrics.filter((m) => m.id !== id),
    }))
  }, [])

  const addSeason = useCallback(
    (season: Omit<ResearchSeason, "id" | "chapters">) => {
      setData((prev) => ({
        ...prev,
        researchSeasons: [
          ...prev.researchSeasons,
          { ...season, id: Date.now().toString(), chapters: [] },
        ],
      }))
    },
    [],
  )

  const updateSeason = useCallback((id: string, updates: Partial<ResearchSeason>) => {
    setData((prev) => ({
      ...prev,
      researchSeasons: prev.researchSeasons.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    }))
  }, [])

  const deleteSeason = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      researchSeasons: prev.researchSeasons.filter((s) => s.id !== id),
    }))
  }, [])

  const addChapter = useCallback(
    (seasonId: string, chapter: Omit<ResearchChapter, "id">) => {
      setData((prev) => ({
        ...prev,
        researchSeasons: prev.researchSeasons.map((s) =>
          s.id === seasonId
            ? { ...s, chapters: [...s.chapters, { ...chapter, id: Date.now().toString() }] }
            : s,
        ),
      }))
    },
    [],
  )

  const updateChapter = useCallback(
    (seasonId: string, chapterId: string, updates: Partial<ResearchChapter>) => {
      setData((prev) => ({
        ...prev,
        researchSeasons: prev.researchSeasons.map((s) =>
          s.id === seasonId
            ? {
                ...s,
                chapters: s.chapters.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)),
              }
            : s,
        ),
      }))
    },
    [],
  )

  const deleteChapter = useCallback((seasonId: string, chapterId: string) => {
    setData((prev) => ({
      ...prev,
      researchSeasons: prev.researchSeasons.map((s) =>
        s.id === seasonId
          ? { ...s, chapters: s.chapters.filter((c) => c.id !== chapterId) }
          : s,
      ),
    }))
  }, [])

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    setData((prev) => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, { ...event, id: Date.now().toString() }],
    }))
  }, [])

  const deleteCalendarEvent = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter((e) => e.id !== id),
    }))
  }, [])

  const exportData = useCallback(() => {
    const payload = { ...data, exportedAt: new Date().toISOString(), schemaVersion: 1 }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    const now = new Date().toISOString()
    localStorage.setItem(LAST_BACKUP_KEY, now)
    setLastBackupAt(now)
  }, [data])

  const importData = useCallback((raw: unknown): { ok: boolean; error?: string } => {
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, error: "El archivo no contiene un objeto JSON válido." }
    }
    try {
      setData(sanitizeData(raw))
      return { ok: true }
    } catch {
      return { ok: false, error: "No se pudo interpretar el archivo de respaldo." }
    }
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        data,
        addProject,
        updateProject,
        deleteProject,
        addRoutine,
        updateRoutine,
        toggleRoutine,
        togglePauseRoutine,
        deleteRoutine,
        addHealthMetric,
        deleteHealthMetric,
        addSeason,
        updateSeason,
        deleteSeason,
        addChapter,
        updateChapter,
        deleteChapter,
        addCalendarEvent,
        deleteCalendarEvent,
        lastBackupAt,
        exportData,
        importData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
