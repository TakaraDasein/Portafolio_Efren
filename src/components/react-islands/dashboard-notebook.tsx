"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Note } from "../../data/dashboard-store"
import { MeterBar } from "./wellbeing-visuals"
import {
  Plus,
  Trash2,
  X,
  Check,
  StickyNote,
  ListChecks,
  Search,
} from "lucide-react"

type Filter = "all" | Note["kind"]

const KIND_META: Record<Note["kind"], { icon: typeof StickyNote; label: string }> = {
  note: { icon: StickyNote, label: "Nota" },
  list: { icon: ListChecks, label: "Lista" },
}

/** Fecha corta y legible a partir del timestamp ISO. */
function formatStamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
}

export default function DashboardNotebook() {
  const {
    data,
    addNote,
    updateNote,
    deleteNote,
    addNoteItem,
    updateNoteItem,
    toggleNoteItem,
    deleteNoteItem,
  } = useDashboard()

  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [newKind, setNewKind] = useState<Note["kind"]>("note")
  const [newTitle, setNewTitle] = useState("")
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const notes = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.notes
      .filter((n) => (filter === "all" ? true : n.kind === filter))
      .filter((n) => {
        if (!needle) return true
        return (
          n.title.toLowerCase().includes(needle) ||
          n.body.toLowerCase().includes(needle) ||
          n.items.some((i) => i.text.toLowerCase().includes(needle))
        )
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [data.notes, filter, query])

  const counts = useMemo(
    () => ({
      all: data.notes.length,
      note: data.notes.filter((n) => n.kind === "note").length,
      list: data.notes.filter((n) => n.kind === "list").length,
    }),
    [data.notes],
  )

  const create = () => {
    if (!newTitle.trim()) return
    addNote({ kind: newKind, title: newTitle.trim() })
    setNewTitle("")
    setShowForm(false)
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todo" },
    { id: "note", label: "Notas" },
    { id: "list", label: "Listas" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight">
            <span className="italic text-white">Libreta</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            {counts.note} {counts.note === 1 ? "nota" : "notas"} • {counts.list}{" "}
            {counts.list === 1 ? "lista" : "listas"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVA ENTRADA
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 border font-mono text-[10px] tracking-wider uppercase transition-colors ${
                filter === f.id
                  ? "border-white bg-white/10 text-white"
                  : "border-white/10 text-muted-foreground hover:border-white/30"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-muted-foreground/60 tabular-nums">
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[12rem] border border-white/10 px-3 py-1.5 focus-within:border-white/40 transition-colors">
          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la libreta…"
            className="flex-1 bg-transparent font-mono text-[11px] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {notes.length === 0 && (
        <p className="font-mono text-xs text-muted-foreground">
          {data.notes.length === 0
            ? "La libreta está vacía. Crea una nota o una lista — también puedes hacerlo desde el pad del panel de control."
            : "Nada coincide con esa búsqueda."}
        </p>
      )}

      {/* Rejilla tipo tablero */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        <AnimatePresence mode="popLayout">
          {notes.map((note, i) => {
            const Icon = KIND_META[note.kind].icon
            const done = note.items.filter((it) => it.done).length
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                className="border border-white/10 hover:border-white/25 transition-colors flex flex-col"
              >
                {/* Cabecera */}
                <div className="flex items-start gap-2.5 p-4 pb-3">
                  <Icon className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent font-mono text-xs focus:outline-none focus:text-white transition-colors"
                  />
                  <button
                    onClick={() => deleteNote(note.id)}
                    title="Eliminar"
                    className="text-muted-foreground hover:text-white transition-colors shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Progreso, solo en listas con contenido */}
                {note.kind === "list" && note.items.length > 0 && (
                  <div className="px-4 pb-3">
                    <MeterBar
                      value={done / note.items.length}
                      label={`${done}/${note.items.length}`}
                    />
                  </div>
                )}

                <div className="px-4 pb-4 flex-1">
                  {note.kind === "note" ? (
                    <textarea
                      value={note.body}
                      onChange={(e) => updateNote(note.id, { body: e.target.value })}
                      placeholder="Escribe aquí…"
                      rows={6}
                      className="w-full bg-transparent font-mono text-[11px] leading-relaxed resize-y focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  ) : (
                    <div className="space-y-1">
                      {note.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => toggleNoteItem(note.id, item.id)}
                            title={item.done ? "Desmarcar" : "Marcar"}
                            className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${
                              item.done
                                ? "bg-white border-white text-black"
                                : "border-white/25 text-transparent hover:border-white/60"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateNoteItem(note.id, item.id, e.target.value)}
                            className={`flex-1 min-w-0 bg-transparent font-mono text-[11px] focus:outline-none transition-colors ${
                              item.done ? "text-muted-foreground line-through" : ""
                            }`}
                          />
                          <button
                            onClick={() => deleteNoteItem(note.id, item.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white transition-all shrink-0"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}

                      {/* Alta de ítems: Enter encadena sin tocar el ratón. */}
                      <div className="flex items-center gap-2 pt-1">
                        <Plus className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                        <input
                          type="text"
                          value={drafts[note.id] ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [note.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return
                            e.preventDefault()
                            addNoteItem(note.id, drafts[note.id] ?? "")
                            setDrafts((prev) => ({ ...prev, [note.id]: "" }))
                          }}
                          placeholder="Añadir ítem…"
                          className="flex-1 min-w-0 bg-transparent font-mono text-[11px] focus:outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground/60 tracking-wider uppercase">
                    {KIND_META[note.kind].label}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/60">
                    {formatStamp(note.updatedAt)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Alta */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-white/10 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-2xl font-light">
                  Nueva <span className="italic text-white">Entrada</span>
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(KIND_META) as [Note["kind"], (typeof KIND_META)["note"]][]).map(
                      ([key, meta]) => {
                        const Icon = meta.icon
                        return (
                          <button
                            key={key}
                            onClick={() => setNewKind(key)}
                            className={`flex items-center justify-center gap-2 py-3 border transition-colors ${
                              newKind === key
                                ? "border-white bg-white/10 text-white"
                                : "border-white/10 text-muted-foreground hover:border-white/30"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-mono text-[11px]">{meta.label}</span>
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && create()}
                    placeholder={newKind === "list" ? "Compras del mes" : "Idea suelta"}
                    autoFocus
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={create}
                  disabled={!newTitle.trim()}
                  className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CREAR
                </button>
                <button
                  onClick={() => setShowForm(false)}
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
