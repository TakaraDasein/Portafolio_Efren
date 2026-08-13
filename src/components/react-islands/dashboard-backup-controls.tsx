"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboard } from "../../data/dashboard-store"
import { Download, Upload, AlertTriangle } from "lucide-react"

const BACKUP_REMINDER_DAYS = 7

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

export default function DashboardBackupControls({
  /** En el sidebar el espacio es estrecho: la etiqueta va sobre los botones. */
  sidebar = false,
  collapsed = false,
}: {
  sidebar?: boolean
  collapsed?: boolean
} = {}) {
  const { lastBackupAt, exportData, importData } = useDashboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<unknown | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const isStale = !lastBackupAt || daysSince(lastBackupAt) >= BACKUP_REMINDER_DAYS

  const backupLabel = !lastBackupAt
    ? "Sin respaldo"
    : daysSince(lastBackupAt) === 0
      ? "Último respaldo: hoy"
      : `Último respaldo: hace ${daysSince(lastBackupAt)} día${daysSince(lastBackupAt) === 1 ? "" : "s"}`

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        setImportError(null)
        setPendingImport(json)
      } catch {
        setImportError("El archivo seleccionado no es un JSON válido.")
      }
    }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (pendingImport === null) return
    const result = importData(pendingImport)
    if (!result.ok) {
      setImportError(result.error ?? "No se pudo importar el archivo.")
    }
    setPendingImport(null)
  }

  return (
    <div className={sidebar ? "w-full" : "flex items-center gap-4"}>
      {/* Colapsado no cabe texto: los iconos y su tooltip bastan. */}
      {(!sidebar || !collapsed) && (
        <span
          className={`font-mono text-[10px] tracking-wider ${
            sidebar ? "block px-3 mb-1 text-[9px] leading-tight" : ""
          } ${isStale ? "text-white" : "text-muted-foreground"}`}
        >
          {backupLabel}
        </span>
      )}

      <div className={sidebar ? "flex items-center justify-center gap-1" : "contents"}>
        <button
          onClick={exportData}
          title="Exportar respaldo JSON"
          className="p-2 text-muted-foreground hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Importar respaldo JSON"
          className="p-2 text-muted-foreground hover:text-white transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleFileSelect}
      />

      <AnimatePresence>
        {(pendingImport !== null || importError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setPendingImport(null)
              setImportError(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-white/10 p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-white shrink-0" />
                <h3 className="font-sans text-xl font-light">
                  {importError ? "Error al " : "Confirmar "}
                  <span className="italic text-white">
                    {importError ? "importar" : "Importación"}
                  </span>
                </h3>
              </div>

              {importError ? (
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {importError}
                </p>
              ) : (
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Esto reemplazará todos los proyectos, rutinas, registros de salud,
                  investigación y eventos actuales con el contenido del archivo
                  seleccionado. Esta acción no se puede deshacer.
                </p>
              )}

              <div className="flex gap-3 mt-8">
                {!importError && (
                  <button
                    onClick={confirmImport}
                    className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
                  >
                    CONFIRMAR
                  </button>
                )}
                <button
                  onClick={() => {
                    setPendingImport(null)
                    setImportError(null)
                  }}
                  className={`px-6 py-3 border border-white/20 font-mono text-xs tracking-wider hover:border-white/50 transition-colors ${
                    importError ? "flex-1" : ""
                  }`}
                >
                  {importError ? "CERRAR" : "CANCELAR"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
