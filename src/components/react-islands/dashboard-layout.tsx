"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardProvider } from "../../data/dashboard-store"
import DashboardSidebar, { type ViewType } from "./dashboard-sidebar"
import DashboardHome from "./dashboard-home"
import DashboardProjects from "./dashboard-projects"
import DashboardRoutines from "./dashboard-routines"
import DashboardHealth from "./dashboard-health"
import DashboardResearch from "./dashboard-research"
import DashboardCalendar from "./dashboard-calendar"

const views: Record<ViewType, React.FC> = {
  home: DashboardHome,
  projects: DashboardProjects,
  routines: DashboardRoutines,
  health: DashboardHealth,
  research: DashboardResearch,
  calendar: DashboardCalendar,
}

function DashboardShell() {
  const [activeView, setActiveView] = useState<ViewType>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const ViewComponent = views[activeView]

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="font-sans text-lg font-light">
              <span className="italic text-cyan-500">Sistema</span> Personal
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ViewComponent />
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
      <DashboardShell />
    </DashboardProvider>
  )
}
