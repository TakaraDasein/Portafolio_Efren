"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  Repeat,
  Heart,
  BookOpen,
  Calendar,
  ShieldCheck,
  NotebookPen,
  ChevronLeft,
  LogOut,
} from "lucide-react"
import DashboardBackupControls from "./dashboard-backup-controls"

export type ViewType =
  | "home"
  | "projects"
  | "routines"
  | "health"
  | "research"
  | "calendar"
  | "notebook"
  | "security"

interface NavItem {
  id: ViewType
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "routines", label: "Rutinas", icon: Repeat },
  { id: "health", label: "Salud & Mente", icon: Heart },
  { id: "research", label: "Investigación", icon: BookOpen },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "notebook", label: "Libreta", icon: NotebookPen },
  { id: "security", label: "Hiper Seguridad", icon: ShieldCheck },
]

interface DashboardSidebarProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
  collapsed: boolean
  onToggle: () => void
  /** En móvil deja de empujar el contenido y pasa a ser un cajón superpuesto. */
  mobile?: boolean
  /** Solo aplica en móvil: si el cajón está desplegado. */
  open?: boolean
  onClose?: () => void
  /** El rail de iconos es obligatorio en tablet, así que el usuario no lo alterna. */
  lockCollapsed?: boolean
}

export default function DashboardSidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
  mobile = false,
  open = false,
  onClose,
  lockCollapsed = false,
}: DashboardSidebarProps) {
  return (
    <motion.aside
      animate={{
        // En móvil conserva su ancho y se desliza fuera de pantalla.
        width: mobile ? 260 : collapsed ? 72 : 260,
        x: mobile && !open ? -276 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      {/* Logo / Title */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.a
              key="collapsed-logo"
              href="/"
              title="Volver al inicio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto block w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-white/50 transition-colors"
            >
              <img
                src="/profile-photo.png"
                alt="Volver al inicio"
                className="w-full h-full object-cover object-top grayscale"
              />
            </motion.a>
          ) : (
            <motion.a
              key="expanded-logo"
              href="/"
              title="Volver al inicio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 group-hover:border-white/50 transition-colors shrink-0">
                <img
                  src="/profile-photo.png"
                  alt="Volver al inicio"
                  className="w-full h-full object-cover object-top grayscale"
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase group-hover:text-foreground transition-colors">
                Dashboard
              </span>
            </motion.a>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                if (mobile) onClose?.()
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200
                font-mono text-xs tracking-wider
                ${isActive
                  ? "bg-white/10 text-white border-l-2 border-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </nav>

      {/* Respaldo */}
      <div className="px-2 py-2 border-t border-sidebar-border shrink-0">
        <DashboardBackupControls sidebar collapsed={collapsed} />
      </div>

      {/* Logout */}
      <div className="px-2 pt-2 border-t border-sidebar-border shrink-0">
        <form method="POST" action="/api/logout">
          <button
            type="submit"
            title={collapsed ? "Cerrar sesión" : undefined}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>

      {/* Colapsar (escritorio) o cerrar el cajón (móvil) */}
      <div className={`p-2 shrink-0 ${lockCollapsed ? "hidden" : ""}`}>
        <button
          onClick={mobile ? onClose : onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              !mobile && collapsed ? "rotate-180" : ""
            }`}
          />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {mobile ? "Cerrar" : "Colapsar"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
