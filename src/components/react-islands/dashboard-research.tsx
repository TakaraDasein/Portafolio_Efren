"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type ResearchSeason, type ResearchChapter } from "../../data/dashboard-store"
import {
  Plus,
  X,
  Trash2,
  Video,
  FileText,
  CheckCircle,
  Circle,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Edit3,
} from "lucide-react"

export default function DashboardResearch() {
  const { data, addSeason, updateSeason, deleteSeason, addChapter, updateChapter, deleteChapter } =
    useDashboard()
  const [expandedSeason, setExpandedSeason] = useState<string | null>(
    data.researchSeasons[0]?.id ?? null,
  )
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [showSeasonForm, setShowSeasonForm] = useState(false)
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [seasonForm, setSeasonForm] = useState({ title: "", subtitle: "", description: "", order: 1 })
  const [chapterForm, setChapterForm] = useState({
    seasonId: "",
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    order: 1,
    resources: [] as string[],
    status: "draft" as "draft" | "published",
  })
  const [resourceInput, setResourceInput] = useState("")

  const resetSeasonForm = () => {
    setSeasonForm({ title: "", subtitle: "", description: "", order: data.researchSeasons.length + 1 })
    setShowSeasonForm(false)
  }

  const resetChapterForm = () => {
    setChapterForm({
      seasonId: expandedSeason ?? "",
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      order: 1,
      resources: [],
      status: "draft",
    })
    setEditingChapterId(null)
    setShowChapterForm(false)
    setResourceInput("")
  }

  const handleAddSeason = () => {
    if (!seasonForm.title.trim()) return
    addSeason(seasonForm)
    resetSeasonForm()
  }

  const handleAddChapter = () => {
    if (!chapterForm.title.trim() || !chapterForm.seasonId) return
    if (editingChapterId) {
      updateChapter(chapterForm.seasonId, editingChapterId, chapterForm)
    } else {
      addChapter(chapterForm.seasonId, chapterForm)
    }
    resetChapterForm()
  }

  const handleEditChapter = (seasonId: string, ch: ResearchChapter) => {
    setChapterForm({
      seasonId,
      title: ch.title,
      description: ch.description,
      content: ch.content,
      videoUrl: ch.videoUrl ?? "",
      order: ch.order,
      resources: [...(ch.resources ?? [])],
      status: ch.status,
    })
    setEditingChapterId(ch.id)
    setShowChapterForm(true)
  }

  const addResource = () => {
    const r = resourceInput.trim()
    if (r && !chapterForm.resources.includes(r)) {
      setChapterForm({ ...chapterForm, resources: [...chapterForm.resources, r] })
    }
    setResourceInput("")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            Centro de <span className="italic text-cyan-500">Investigación</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            {data.researchSeasons.length} temporadas •{" "}
            {data.researchSeasons.reduce((a, s) => a + s.chapters.length, 0)} capítulos
          </p>
        </div>
        <button
          onClick={() => {
            setSeasonForm({ ...seasonForm, order: data.researchSeasons.length + 1 })
            setShowSeasonForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVA TEMPORADA
        </button>
      </div>

      {/* Seasons */}
      {data.researchSeasons.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-dashed border-white/10 p-12 text-center"
        >
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="font-mono text-xs text-muted-foreground">
            No hay temporadas de investigación. ¡Crea la primera!
          </p>
        </motion.div>
      )}

      {data.researchSeasons.map((season) => (
        <motion.div
          key={season.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10"
        >
          {/* Season Header */}
          <div
            onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-500/10 rounded-sm">
                <BookOpen className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan-500 tracking-wider">
                    {season.subtitle}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {season.chapters.length} capítulos
                  </span>
                </div>
                <h3 className="font-sans text-xl font-light mt-1">{season.title}</h3>
                <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-1">
                  {season.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setChapterForm({
                    ...chapterForm,
                    seasonId: season.id,
                    order: season.chapters.length + 1,
                  })
                  setShowChapterForm(true)
                }}
                className="p-2 text-muted-foreground hover:text-cyan-500 transition-colors"
                title="Agregar capítulo"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSeason(season.id)
                }}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                title="Eliminar temporada"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {expandedSeason === season.id ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Chapters */}
          <AnimatePresence>
            {expandedSeason === season.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-white/10 overflow-hidden"
              >
                <div className="divide-y divide-white/5">
                  {season.chapters.length === 0 && (
                    <div className="p-6">
                      <p className="font-mono text-xs text-muted-foreground">
                        No hay capítulos en esta temporada. Agrega el primero.
                      </p>
                    </div>
                  )}
                  {season.chapters.map((chapter) => (
                    <div key={chapter.id}>
                      {/* Chapter Row */}
                      <div
                        onClick={() =>
                          setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
                        }
                        className="flex items-center gap-4 p-4 pl-16 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateChapter(season.id, chapter.id, {
                              status: chapter.status === "published" ? "draft" : "published",
                            })
                          }}
                          className="shrink-0"
                        >
                          {chapter.status === "published" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                          Cap {chapter.order}
                        </span>
                        <span className="font-mono text-sm flex-1">{chapter.title}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditChapter(season.id, chapter)
                            }}
                            className="p-1.5 text-muted-foreground hover:text-cyan-500 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteChapter(season.id, chapter.id)
                            }}
                            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedChapter === chapter.id ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Chapter Content */}
                      <AnimatePresence>
                        {expandedChapter === chapter.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-white/5 overflow-hidden"
                          >
                            <div className="p-6 pl-16 space-y-4">
                              <p className="font-mono text-xs text-muted-foreground italic leading-relaxed">
                                {chapter.description}
                              </p>
                              <div className="border-l-2 border-cyan-500/30 pl-4">
                                <p className="font-mono text-sm leading-relaxed whitespace-pre-line">
                                  {chapter.content}
                                </p>
                              </div>

                              {chapter.resources && chapter.resources.length > 0 && (
                                <div>
                                  <h4 className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-2">
                                    Recursos
                                  </h4>
                                  <ul className="space-y-1">
                                    {chapter.resources.map((r, i) => (
                                      <li
                                        key={i}
                                        className="flex items-center gap-2 font-mono text-xs text-cyan-500"
                                      >
                                        <FileText className="w-3 h-3" />
                                        {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {chapter.videoUrl && (
                                <a
                                  href={chapter.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 border border-cyan-500/30 text-cyan-500 font-mono text-xs hover:bg-cyan-500/10 transition-colors"
                                >
                                  <Video className="w-4 h-4" />
                                  VER VIDEO
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Season Form Modal */}
      <AnimatePresence>
        {showSeasonForm && (
          <SeasonFormModal
            form={seasonForm}
            onChange={setSeasonForm}
            onSave={handleAddSeason}
            onClose={resetSeasonForm}
          />
        )}
      </AnimatePresence>

      {/* Chapter Form Modal */}
      <AnimatePresence>
        {showChapterForm && (
          <ChapterFormModal
            form={chapterForm}
            onChange={setChapterForm}
            resourceInput={resourceInput}
            onResourceInputChange={setResourceInput}
            onAddResource={addResource}
            onSave={handleAddChapter}
            onClose={resetChapterForm}
            isEditing={editingChapterId !== null}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SeasonFormModal({
  form,
  onChange,
  onSave,
  onClose,
}: {
  form: { title: string; subtitle: string; description: string; order: number }
  onChange: (f: typeof form) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background border border-white/10 p-8 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans text-2xl font-light">
            Nueva <span className="italic text-cyan-500">Temporada</span>
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <InputField label="Título" value={form.title} onChange={(v) => onChange({ ...form, title: v })} placeholder="Ej: El Diseño de Información" />
          <InputField label="Subtítulo" value={form.subtitle} onChange={(v) => onChange({ ...form, subtitle: v })} placeholder="Ej: 1T · Fundamentos de Visualización" />
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Descripción de la temporada"
              className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none"
            />
          </div>
          <InputField label="Orden" type="number" value={String(form.order)} onChange={(v) => onChange({ ...form, order: Number(v) })} />
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onSave} disabled={!form.title.trim()} className="flex-1 px-6 py-3 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            CREAR TEMPORADA
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-white/20 font-mono text-xs tracking-wider hover:border-white/50 transition-colors">
            CANCELAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ChapterFormModal({
  form,
  onChange,
  resourceInput,
  onResourceInputChange,
  onAddResource,
  onSave,
  onClose,
  isEditing,
}: {
  form: { seasonId: string; title: string; description: string; content: string; videoUrl: string; order: number; resources: string[]; status: "draft" | "published" }
  onChange: (f: typeof form) => void
  resourceInput: string
  onResourceInputChange: (v: string) => void
  onAddResource: () => void
  onSave: () => void
  onClose: () => void
  isEditing: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background border border-white/10 p-8 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans text-2xl font-light">
            {isEditing ? "Editar" : "Nuevo"}{" "}
            <span className="italic text-cyan-500">Capítulo</span>
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <InputField label="Título" value={form.title} onChange={(v) => onChange({ ...form, title: v })} placeholder="Ej: Estructuras Jerárquicas: Árboles" />
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Breve descripción del capítulo"
              className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
              Contenido
            </label>
            <textarea
              value={form.content}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              rows={6}
              placeholder="Contenido académico del capítulo..."
              className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Orden" type="number" value={String(form.order)} onChange={(v) => onChange({ ...form, order: Number(v) })} />
            <div>
              <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                Estado
              </label>
              <div className="flex gap-2">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onChange({ ...form, status: s })}
                    className={`flex-1 py-2 border font-mono text-[10px] tracking-wider transition-colors ${
                      form.status === s
                        ? "border-cyan-500 text-cyan-500 bg-cyan-500/10"
                        : "border-white/10 text-muted-foreground"
                    }`}
                  >
                    {s === "draft" ? "Borrador" : "Publicado"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <InputField label="URL del Video (opcional)" value={form.videoUrl} onChange={(v) => onChange({ ...form, videoUrl: v })} placeholder="https://youtube.com/..." />
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
              Recursos
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.resources.map((r, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 font-mono text-[10px] text-cyan-500">
                  {r}
                  <button onClick={() => onChange({ ...form, resources: form.resources.filter((_, j) => j !== i) })} className="hover:text-red-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={resourceInput}
                onChange={(e) => onResourceInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddResource() } }}
                placeholder="Agregar recurso..."
                className="flex-1 bg-transparent border border-white/10 px-3 py-2 font-mono text-xs focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <button onClick={onAddResource} className="px-3 py-2 border border-white/10 font-mono text-[10px] hover:border-white/30">
                +
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onSave} disabled={!form.title.trim()} className="flex-1 px-6 py-3 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isEditing ? "GUARDAR CAMBIOS" : "CREAR CAPÍTULO"}
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-white/20 font-mono text-xs tracking-wider hover:border-white/50 transition-colors">
            CANCELAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
      />
    </div>
  )
}
