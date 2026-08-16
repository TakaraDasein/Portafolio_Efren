"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard, type Note } from "../../data/dashboard-store"
import { NotebookPen, StickyNote, ListChecks, Plus, X, Check, ArrowRight } from "lucide-react"

/**
 * Pad de captura rápida: escribe una nota o una lista sin salir del panel.
 * Todo lo que se guarda aterriza en la Libreta.
 */
export default function DashboardPad({ onNavigate }: { onNavigate?: () => void }) {
  const { addNote } = useDashboard()
  const [kind, setKind] = useState<Note["kind"]>("note")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [items, setItems] = useState<string[]>([])
  const [draftItem, setDraftItem] = useState("")
  const [saved, setSaved] = useState(false)

  const pendingItems = draftItem.trim() ? [...items, draftItem.trim()] : items
  const canSave =
    title.trim().length > 0 ||
    (kind === "note" ? body.trim().length > 0 : pendingItems.length > 0)

  const reset = () => {
    setTitle("")
    setBody("")
    setItems([])
    setDraftItem("")
  }

  const commitItem = () => {
    const clean = draftItem.trim()
    if (!clean) return
    setItems((prev) => [...prev, clean])
    setDraftItem("")
  }

  const save = () => {
    if (!canSave) return
    addNote({
      kind,
      // Sin título explícito se usa la primera línea, para no guardar cosas sin nombre.
      title:
        title.trim() ||
        (kind === "note" ? body.trim().split("\n")[0].slice(0, 60) : pendingItems[0]) ||
        "Sin título",
      body,
      items: pendingItems,
    })
    reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const tabs: { id: Note["kind"]; label: string; icon: typeof StickyNote }[] = [
    { id: "note", label: "Nota", icon: StickyNote },
    { id: "list", label: "Lista", icon: ListChecks },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="w-full lg:w-[17.5rem] bg-background/70 backdrop-blur-md border border-white/10 rounded-xl hover:border-white/25 transition-colors"
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <NotebookPen className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase flex-1">
          Pad
        </span>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            title="Abrir la Libreta"
            className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/70 hover:text-white tracking-wider uppercase transition-colors"
          >
            Libreta
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Tipo */}
      <div className="flex gap-1.5 px-3 pb-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = kind === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setKind(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border font-mono text-[10px] tracking-wider transition-colors ${
                active
                  ? "border-white bg-white/10 text-white"
                  : "border-white/10 text-muted-foreground hover:border-white/30"
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="px-3 pb-3 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full bg-transparent border border-white/10 px-3 py-2 font-mono text-[11px] focus:border-white/50 focus:outline-none transition-colors"
        />

        <AnimatePresence mode="wait">
          {kind === "note" ? (
            <motion.textarea
              key="note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe…"
              rows={4}
              className="w-full bg-transparent border border-white/10 px-3 py-2 font-mono text-[11px] leading-relaxed resize-none focus:border-white/50 focus:outline-none transition-colors"
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5"
            >
              {items.length > 0 && (
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {items.map((item, i) => (
                    <div
                      key={`${i}-${item}`}
                      className="flex items-center gap-2 px-2 py-1 border border-white/5 group"
                    >
                      <span className="w-2.5 h-2.5 border border-white/25 rounded-[2px] shrink-0" />
                      <span className="font-mono text-[10px] flex-1 truncate">{item}</span>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white transition-all"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={draftItem}
                  onChange={(e) => setDraftItem(e.target.value)}
                  // Enter encadena ítems: escribir una lista no debería requerir el ratón.
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      commitItem()
                    }
                  }}
                  placeholder="Añadir ítem y pulsar Enter"
                  className="flex-1 min-w-0 bg-transparent border border-white/10 px-3 py-2 font-mono text-[11px] focus:border-white/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={commitItem}
                  disabled={!draftItem.trim()}
                  title="Añadir ítem"
                  className="px-2 border border-white/10 text-muted-foreground hover:border-white/40 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-black font-mono text-[10px] tracking-wider hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3 h-3" />
                GUARDADO
              </motion.span>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                GUARDAR EN LIBRETA
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  )
}
