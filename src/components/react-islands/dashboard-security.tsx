"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Plus, X, Eye, EyeOff, Copy, Trash2, Check, KeyRound, Lock, Fingerprint } from "lucide-react"

interface VaultSecretMasked {
  id: string
  label: string
  masked: string
  category: "token" | "api-key" | "password" | "other"
  notes?: string
  createdAt: string
}

const categoryLabels: Record<VaultSecretMasked["category"], string> = {
  token: "Token",
  "api-key": "API Key",
  password: "Contraseña",
  other: "Otro",
}

const emptyForm = {
  label: "",
  value: "",
  category: "token" as VaultSecretMasked["category"],
  notes: "",
}

export default function DashboardSecurity() {
  const [secrets, setSecrets] = useState<VaultSecretMasked[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [revealing, setRevealing] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch("/api/vault")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSecrets(data.secrets)
    } catch {
      setError(
        "No se pudo conectar con la bóveda. Verifica que VAULT_ENCRYPTION_KEY y BLOB_READ_WRITE_TOKEN estén configurados.",
      )
      setSecrets([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.value.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch {
      setError("No se pudo guardar el secreto.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSecrets((prev) => prev?.filter((s) => s.id !== id) ?? prev)
    setRevealed((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetch("/api/vault", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => load())
  }

  const handleReveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }
    setRevealing(id)
    try {
      const res = await fetch("/api/vault/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRevealed((prev) => ({ ...prev, [id]: data.value }))
    } catch {
      setError("No se pudo revelar el secreto.")
    } finally {
      setRevealing(null)
    }
  }

  const handleCopy = async (id: string) => {
    let value = revealed[id]
    if (!value) {
      try {
        const res = await fetch("/api/vault/reveal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
        if (!res.ok) throw new Error()
        value = (await res.json()).value
      } catch {
        setError("No se pudo copiar el secreto.")
        return
      }
    }
    await navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-4xl font-light tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white" />
            Hiper <span className="italic text-white">Seguridad</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            Bóveda cifrada (AES-256-GCM) para tokens, API keys y credenciales
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVO SECRETO
        </button>
      </div>

      {error && (
        <div className="border border-red-400/30 bg-red-400/5 text-red-400 font-mono text-xs px-4 py-3">
          {error}
        </div>
      )}

      {secrets === null ? (
        <p className="font-mono text-xs text-muted-foreground">Cargando bóveda...</p>
      ) : secrets.length === 0 ? (
        <div className="border border-white/10 p-10 flex flex-col items-center gap-3 text-center">
          <Lock className="w-6 h-6 text-muted-foreground" />
          <p className="font-mono text-xs text-muted-foreground">
            No hay secretos guardados todavía.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {secrets.map((secret) => (
            <motion.div
              key={secret.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 hover:border-white/20 transition-colors p-4 flex items-center gap-4"
            >
              <div className="p-2 bg-white/5 shrink-0">
                <KeyRound className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-sm font-light truncate">{secret.label}</h3>
                  <span className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 border border-white/10 text-muted-foreground shrink-0">
                    {categoryLabels[secret.category]}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
                  {revealed[secret.id] ?? secret.masked}
                </p>
                {secret.notes && (
                  <p className="font-mono text-[10px] text-muted-foreground/70 mt-1 truncate">{secret.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleReveal(secret.id)}
                  disabled={revealing === secret.id}
                  className="p-2 text-muted-foreground hover:text-white transition-colors"
                  title={revealed[secret.id] ? "Ocultar" : "Revelar"}
                >
                  {revealed[secret.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleCopy(secret.id)}
                  className="p-2 text-muted-foreground hover:text-white transition-colors"
                  title="Copiar"
                >
                  {copiedId === secret.id ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(secret.id)}
                  className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="border border-white/10 p-5 flex items-start gap-3">
        <Fingerprint className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          Los valores se cifran con AES-256-GCM en el servidor antes de guardarse y solo se
          descifran al pulsar "Revelar" o "Copiar". Esta sección requiere sesión activa de
          administrador; nunca se expone en el sitio público.
        </p>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
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
                  Nuevo <span className="italic text-white">Secreto</span>
                </h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Nombre / Etiqueta
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Ej: GitHub Personal Access Token"
                    autoFocus
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Categoría
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["token", "api-key", "password", "other"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, category: c })}
                        className={`px-3 py-2 border font-mono text-[10px] tracking-wider uppercase transition-colors ${
                          form.category === c
                            ? "border-white text-white bg-white/10"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {categoryLabels[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Valor (token / clave / contraseña)
                  </label>
                  <input
                    type="password"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Se cifrará antes de guardarse"
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    placeholder="Contexto, alcance, fecha de expiración..."
                    className="w-full bg-transparent border border-white/10 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!form.label.trim() || !form.value.trim() || submitting}
                  className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "GUARDANDO..." : "GUARDAR SECRETO"}
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
