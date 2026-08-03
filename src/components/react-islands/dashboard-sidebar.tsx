"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  Repeat,
  Heart,
  BookOpen,
  Calendar,
  ChevronLeft,
} from "lucide-react"

export type ViewType =
  | "home"
  | "projects"
  | "routines"
  | "health"
  | "research"
  | "calendar"

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
]

interface DashboardSidebarProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
  collapsed: boolean
  onToggle: () => void
}

export default function DashboardSidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      {/* Logo / Title */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <span className="font-tech text-lg text-white">E</span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="font-tech text-lg text-white">EF</span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                Dashboard
              </span>
            </motion.div>
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
              onClick={() => onNavigate(item.id)}
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

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
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
                Colapsar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
