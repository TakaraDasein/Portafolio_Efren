"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useRef } from "react"

// Secciones reales del home (ids definidos en hero/data-lifecycle/about/tech-marquee/footer)
const sectionLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Ciclo de Datos", href: "#ciclo-datos" },
  { label: "Sobre Mí", href: "#sobre-mi" },
  { label: "Tecnologías", href: "#tecnologias" },
  { label: "Contacto", href: "#contacto" },
]

// Áreas de trabajo: páginas propias del portafolio
const areaLinks = [
  { label: "Análisis de Datos", href: "/analisis-datos", color: "#39cbe3" },
  { label: "Machine Learning", href: "/machine-learning", color: "#ef4444" },
  { label: "Medio Ambiente y Sociedad", href: "/medio-ambiente-sociedad", color: "#10b981" },
]
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dashboardOpacity, setDashboardOpacity] = useState(0)
  const dashboardButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dashboardButtonRef.current) {
        const rect = dashboardButtonRef.current.getBoundingClientRect()
        const distance = Math.sqrt(
          Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
          Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
        )
        
        const maxDistance = 200
        const opacity = Math.max(0, 1 - (distance / maxDistance))
        setDashboardOpacity(opacity)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <nav className="flex items-center justify-end px-6 py-4 my-0 md:px-12 md:py-5 text-primary">
          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-6 pointer-events-auto">
            <div
              ref={dashboardButtonRef}
              style={{ opacity: dashboardOpacity }}
              className="transition-opacity duration-300"
            >
              <a
                href="/dashboard"
                className="group p-2 transition-all duration-300 flex items-center gap-2"
                data-cursor-hover
                title="Dashboard"
              >
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground group-hover:text-white transition-colors">
                  SISTEMA
                </span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 pointer-events-auto"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-foreground origin-center"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="w-6 h-px bg-foreground"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-foreground origin-center"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg xl:hidden overflow-y-auto"
          >
            <nav className="flex min-h-full flex-col justify-center gap-10 px-8 py-24 sm:px-12">
              {/* Secciones del home */}
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Navegación
                </span>
                {sectionLinks.map((link, index) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(link.href)}
                    className="group flex items-baseline gap-3 text-left text-3xl font-sans font-light tracking-tight text-foreground transition-colors hover:text-white sm:text-4xl"
                  >
                    <span className="font-mono text-xs text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Áreas de trabajo */}
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Áreas
                </span>
                {areaLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-3 font-sans text-xl font-light tracking-tight text-white/70 transition-colors hover:text-white"
                  >
                    <span
                      className="h-2 w-2 flex-shrink-0"
                      style={{ backgroundColor: link.color }}
                    />
                    {link.label}
                  </motion.a>
                ))}
              </div>

              {/* Acceso al sistema personal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col gap-3 border-t border-white/10 pt-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
                  Sistema
                </span>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-2 border border-white/15 px-4 py-3 font-mono text-xs uppercase tracking-widest text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Panel
                  </a>
                  <a
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-2 border border-white/15 px-4 py-3 font-mono text-xs uppercase tracking-widest text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    Iniciar sesión
                  </a>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

