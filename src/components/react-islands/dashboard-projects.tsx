"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Project } from "../../data/dashboard-store"
import { Plus, ExternalLink, Trash2, X, Archive, Search, Code2, Wrench, CheckCircle2 } from "lucide-react"
import MiniChart, { chartTypes, type ChartType } from "./mini-charts"

export const statusIcons = {
  planning: Search,
  development: Code2,
  maintenance: Wrench,
  completed: CheckCircle2,
  archived: Archive,
}
const statusColors = {
  planning: "text-red-400 border-red-400/40",
  development: "text-green-400 border-green-400/40",
  maintenance: "text-yellow-400 border-yellow-400/40",
  completed: "text-white border-white/30",
  archived: "text-muted-foreground border-white/10",
}
const statusGlow = {
  planning: "239,68,68",
  development: "34,197,94",
  maintenance: "234,179,8",
  completed: "255,255,255",
  archived: "110,110,110",
}
export const statusLabels = {
  planning: "Planeación",
  development: "Desarrollo",
  maintenance: "Mantenimiento",
  completed: "Completado",
  archived: "Archivado",
}
const statusSelectedClasses = {
  planning: "border-red-400 text-red-400 bg-red-400/10",
  development: "border-green-400 text-green-400 bg-green-400/10",
  maintenance: "border-yellow-400 text-yellow-400 bg-yellow-400/10",
  completed: "border-white text-white bg-white/10",
  archived: "border-white/40 text-muted-foreground bg-white/5",
}

const emptyProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  status: "planning",
  tags: [],
  url: "",
  icon: "bars" as ChartType,
}

export default function DashboardProjects() {
  const { data, addProject, updateProject, deleteProject } = useDashboard()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProject)
  const [tagInput, setTagInput] = useState("")

  const resetForm = () => {
    setForm(emptyProject)
    setEditingId(null)
    setTagInput("")
    setShowForm(false)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateProject(editingId, form)
    } else {
      addProject(form)
    }
    resetForm()
  }

  const handleEdit = (p: Project) => {
    setForm({
      name: p.name,
      description: p.description,
      status: p.status,
      tags: [...p.tags],
      url: p.url ?? "",
      icon: p.icon,
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] })
    }
    setTagInput("")
  }

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            Gestión de <span className="italic text-white">Proyectos</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            {data.projects.length} proyectos registrados
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVO PROYECTO
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onEdit={() => handleEdit(project)}
            onDelete={() => deleteProject(project.id)}
          />
        ))}
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
              className="bg-background border border-white/10 p-8 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-2xl font-light">
                  {editingId ? (
                    <>
                      Editar <span className="italic text-white">Proyecto</span>
                    </>
                  ) : (
                    <>
                      Nuevo <span className="italic text-white">Proyecto</span>
                    </>
                  )}
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
                    placeholder="Nombre del proyecto"
                    autoFocus
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Descripción del proyecto"
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Estado
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["planning", "development", "maintenance", "completed", "archived"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-3 py-2 border font-mono text-[10px] tracking-wider uppercase transition-colors ${
                          form.status === s
                            ? statusSelectedClasses[s]
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 bg-white/5 font-mono text-[10px] text-muted-foreground"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-gray-300">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag() }
                      }}
                      placeholder="Agregar tag..."
                      className="flex-1 bg-transparent border border-white/10 px-3 py-2 font-mono text-xs focus:border-white focus:outline-none transition-colors"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 border border-white/10 font-mono text-[10px] hover:border-white/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    URL (opcional)
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Ícono animado
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {chartTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, icon: type })}
                        title={type}
                        className={`aspect-square flex items-center justify-center border p-1.5 transition-colors ${
                          form.icon === type
                            ? "border-white bg-white/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <MiniChart
                          type={type}
                          size={32}
                          active={form.icon === type}
                          color={form.icon === type ? "#ffffff" : "rgba(255,255,255,0.45)"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                  className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "GUARDAR CAMBIOS" : "CREAR PROYECTO"}
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

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
}: {
  project: Project
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const StatusIcon = statusIcons[project.status]
  const glow = statusGlow[project.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-64 overflow-hidden border transition-colors"
      style={{ borderColor: `rgba(${glow},${hovered ? 0.55 : 0.3})` }}
    >
      {/* Default background: elegant grid pattern + status glow */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${glow},${hovered ? 0.18 : 0.1}) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Animated icon, always visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniChart
          type={project.icon}
          size={110}
          active={hovered}
          color={hovered ? "#ffffff" : "rgba(255,255,255,0.35)"}
        />
      </div>

      {/* Status badge, always visible */}
      <span
        className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[9px] tracking-wider uppercase bg-background/60 backdrop-blur-sm ${statusColors[project.status]}`}
      >
        <StatusIcon className="w-2.5 h-2.5" />
        {statusLabels[project.status]}
      </span>

      {/* Name, always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <h3 className="font-sans text-lg font-light truncate">{project.name}</h3>
      </div>

      {/* Hover overlay: blur + full details */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-background/85 backdrop-blur-md p-5 flex flex-col"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-sans text-lg font-light truncate">{project.name}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onEdit}
                  className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="font-mono text-xs text-muted-foreground line-clamp-4 flex-1">
              {project.description || "Sin descripción."}
            </p>

            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/5 font-mono text-[9px] text-muted-foreground tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-white transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
