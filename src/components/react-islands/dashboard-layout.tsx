"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import { DashboardProvider } from "../../data/dashboard-store"
import DashboardSidebar, { type ViewType } from "./dashboard-sidebar"
import DashboardHome from "./dashboard-home"
import DashboardProjects from "./dashboard-projects"
import DashboardRoutines from "./dashboard-routines"
import DashboardHealth from "./dashboard-health"
import DashboardResearch from "./dashboard-research"
import DashboardCalendar from "./dashboard-calendar"
import DashboardNotebook from "./dashboard-notebook"
import DashboardSecurity from "./dashboard-security"
import { DashboardErrorBoundary } from "./error-boundary"

/** Las vistas pueden pedir navegación (el panel de inicio enlaza a las demás). */
export interface DashboardViewProps {
  onNavigate: (view: ViewType) => void
}

const views: Record<ViewType, React.FC<DashboardViewProps>> = {
  home: DashboardHome,
  projects: DashboardProjects,
  routines: DashboardRoutines,
  health: DashboardHealth,
  research: DashboardResearch,
  calendar: DashboardCalendar,
  notebook: DashboardNotebook,
  security: DashboardSecurity,
}

type Breakpoint = "mobile" | "tablet" | "desktop"

/**
 * El sidebar ocupa 260px fijos. En un móvil de 420px eso dejaba 96px útiles y
 * todo el contenido desbordaba, así que por debajo de ciertos anchos deja de
 * empujar el contenido.
 */
function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")

  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth
      setBreakpoint(width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop")
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  return breakpoint
}

function DashboardShell() {
  const [activeView, setActiveView] = useState<ViewType>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === "mobile"
  const isTablet = breakpoint === "tablet"
  // En tablet el rail de iconos es forzoso; en escritorio decide el usuario.
  const collapsed = isTablet ? true : sidebarCollapsed
  const contentMargin = isMobile ? 0 : collapsed ? 72 : 260

  // Al ensanchar la ventana el cajón deja de tener sentido: se cierra.
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false)
  }, [isMobile])

  // Con el cajón abierto se bloquea el desplazamiento del fondo.
  useEffect(() => {
    if (!isMobile || !drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isMobile, drawerOpen])

  // El cursor con efecto de "splash" (fluid trail) se monta globalmente en Layout.astro
  // y lee esta variable CSS para su color. La forzamos a escala de grises solo mientras
  // el dashboard está activo, y la restauramos al salir.
  useEffect(() => {
    document.documentElement.style.setProperty("--cursor-color", "#e5e5e5")
    return () => {
      document.documentElement.style.removeProperty("--cursor-color")
    }
  }, [])

  const ViewComponent = views[activeView]

  return (
    <div className="min-h-screen bg-background">
      {/* Botón del cajón: solo en móvil, donde el sidebar está fuera de pantalla */}
      {isMobile && !drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          title="Abrir menú"
          className="fixed top-4 left-4 z-30 p-2.5 bg-background/80 backdrop-blur-md border border-white/15 rounded-lg text-muted-foreground hover:text-white hover:border-white/40 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Fondo que atenúa el contenido y cierra al tocarlo */}
      <AnimatePresence>
        {isMobile && drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <DashboardSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={collapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobile={isMobile}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lockCollapsed={isTablet}
      />

      <div className="transition-all duration-300" style={{ marginLeft: contentMargin }}>
        {/*
          Sin barra superior: duplicaba el sidebar y la fecha que ya muestra el
          reloj del panel. Los controles de respaldo viven ahora en el sidebar.
        */}
        <main className="p-4 pt-16 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ViewComponent onNavigate={setActiveView} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <DashboardErrorBoundary>
        <DashboardShell />
      </DashboardErrorBoundary>
    </DashboardProvider>
  )
}
