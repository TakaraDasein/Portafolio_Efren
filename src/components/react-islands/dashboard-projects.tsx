"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Project } from "../../data/dashboard-store"
import { Plus, ExternalLink, Trash2, X, Archive, Play, Pause } from "lucide-react"

const statusIcons = {
  active: Play,
  paused: Pause,
  completed: Archive,
  archived: Archive,
}
const statusColors = {
  active: "text-emerald-500 border-emerald-500/30",
  paused: "text-amber-500 border-amber-500/30",
  completed: "text-cyan-500 border-cyan-500/30",
  archived: "text-muted-foreground border-white/10",
}

const emptyProject = {
  name: "",
  description: "",
  status: "active" as const,
  tags: [] as string[],
  url: "",
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
            Gestión de <span className="italic text-cyan-500">Proyectos</span>
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
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVO PROYECTO
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.projects.map((project, i) => {
          const StatusIcon = statusIcons[project.status]
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="group border border-white/10 p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans text-lg font-light truncate">
                    {project.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[9px] tracking-wider uppercase mt-2 ${
                      statusColors[project.status]
                    }`}
                  >
                    <StatusIcon className="w-2.5 h-2.5" />
                    {project.status === "active"
                      ? "Activo"
                      : project.status === "paused"
                        ? "Pausado"
                        : project.status === "completed"
                          ? "Completado"
                          : "Archivado"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 text-muted-foreground hover:text-cyan-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-3 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
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
                    className="text-muted-foreground hover:text-cyan-500 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          )
        })}
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
                      Editar <span className="italic text-cyan-500">Proyecto</span>
                    </>
                  ) : (
                    <>
                      Nuevo <span className="italic text-cyan-500">Proyecto</span>
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
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
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
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Estado
                  </label>
                  <div className="flex gap-2">
                    {(["active", "paused", "completed", "archived"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-3 py-2 border font-mono text-[10px] tracking-wider uppercase transition-colors ${
                          form.status === s
                            ? "border-cyan-500 text-cyan-500 bg-cyan-500/10"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {s === "active" ? "Activo" : s === "paused" ? "Pausado" : s === "completed" ? "Completado" : "Archivado"}
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
                        <button onClick={() => removeTag(tag)} className="hover:text-red-400">
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
                      className="flex-1 bg-transparent border border-white/10 px-3 py-2 font-mono text-xs focus:border-cyan-500 focus:outline-none transition-colors"
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
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                  className="flex-1 px-6 py-3 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
