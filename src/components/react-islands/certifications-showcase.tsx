"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

type CredentialCategory = "diplomas" | "certificaciones" | "experiencia" | "ponencias"

type CredentialItem = {
  title: string
  shortTitle: string
  meta: string
  year: string
  description: string
  image: string
}

const tabItems: { id: CredentialCategory; label: string; count: number }[] = [
  { id: "diplomas", label: "Diplomas", count: 1 },
  { id: "certificaciones", label: "Certificaciones", count: 9 },
  { id: "experiencia", label: "Experiencias", count: 1 },
  { id: "ponencias", label: "Ponencias", count: 4 },
]

const contentByTab: Record<CredentialCategory, CredentialItem[]> = {
  diplomas: [
    {
      title: "Diploma en Ciencia Política",
      shortTitle: "Ciencia Política",
      meta: "Formación universitaria",
      year: "2019",
      description:
        "Base teórica y metodológica para análisis institucional, territorial y social aplicado a datos.",
      image: "/certificaciones/diploma-politologo.jpg",
    },
  ],
  certificaciones: [
    {
      title: "Programa Especializado en Ciencia de Datos",
      shortTitle: "Ciencia de Datos",
      meta: "Formación especializada",
      year: "2025",
      description:
        "Programa integral en ciencia de datos: análisis exploratorio, machine learning, visualización y despliegue de modelos con herramientas modernas.",
      image: "/certificaciones/ciencia-datos-programa-especializado.jpeg",
    },
    {
      title: "Google: Fundamentos de IA",
      shortTitle: "Google IA",
      meta: "Certificación técnica",
      year: "2024",
      description:
        "Fundamentos de inteligencia artificial y machine learning aplicados a productos y servicios reales con herramientas de Google.",
      image: "/certificaciones/google-ia.png",
    },
    {
      title: "IBM Data Science, Python e IA",
      shortTitle: "IBM Data Science",
      meta: "Certificación técnica",
      year: "2024",
      description:
        "Herramientas de analítica, programación y fundamentos de inteligencia artificial para productos de datos.",
      image: "/certificaciones/ibm-data-science-python-ia.png",
    },
    {
      title: "IBM Developing Skills",
      shortTitle: "IBM Dev Skills",
      meta: "Certificación técnica",
      year: "2024",
      description:
        "Fortalecimiento de habilidades prácticas para resolver problemas reales con enfoques data-driven.",
      image: "/certificaciones/ibm-developing-skills.png",
    },
    {
      title: "DANE: Construcción de Indicadores",
      shortTitle: "DANE Indicadores",
      meta: "Capacitación institucional",
      year: "2023",
      description:
        "Diseño, lectura e interpretación de indicadores para seguimiento de políticas y evaluación territorial.",
      image: "/certificaciones/dane-construcion-indicadores.png",
    },
    {
      title: "DANE: Registros Administrativos",
      shortTitle: "DANE Registros",
      meta: "Capacitación institucional",
      year: "2023",
      description:
        "Uso estratégico de fuentes administrativas para analítica pública y planeación basada en evidencia.",
      image: "/certificaciones/dane-registros-administrativos.png",
    },
    {
      title: "SENA: Calidad Física del Café",
      shortTitle: "SENA Café",
      meta: "Formación técnica",
      year: "2021",
      description:
        "Evaluación sensorial y parámetros de calidad física para análisis de productos agroindustriales.",
      image: "/certificaciones/sena-calidad-fisica-cafe.png",
    },
    {
      title: "SENA: SIG y Catastro",
      shortTitle: "SENA SIG Catastro",
      meta: "Formación técnica",
      year: "2022",
      description:
        "Sistemas de información geográfica aplicados a catastro multipropósito y gestión territorial.",
      image: "/certificaciones/sena-sig-catastro.png",
    },
    {
      title: "SENA: Sistemas de Información Geográfica",
      shortTitle: "SENA SIG",
      meta: "Formación técnica",
      year: "2022",
      description:
        "Fundamentos de SIG para captura, procesamiento y visualización de datos espaciales.",
      image: "/certificaciones/sena-sig.png",
    },
  ],
  experiencia: [
    {
      title: "Consultoría Territorial y Social",
      shortTitle: "Consultoría OCHA",
      meta: "Sector público y social",
      year: "2022",
      description:
        "Diseño de tableros y sistemas de seguimiento para gestión pública, conflicto y desarrollo territorial.",
      image: "/certificaciones/ocha-certificado.png",
    },
  ],
  ponencias: [
    {
      title: "Coloquio Doctoral en Ciencias Humanas",
      shortTitle: "Coloquio Doctoral",
      meta: "Ponencia académica",
      year: "2021",
      description:
        "Discusión interdisciplinaria sobre enfoques de investigación social y territorial.",
      image: "/certificaciones/coloquio-doctoral-ciencias-humanas.png",
    },
    {
      title: "Congreso de Arqueología",
      shortTitle: "Congreso Arqueología",
      meta: "Congreso",
      year: "2020",
      description:
        "Participación en espacio académico de análisis histórico y territorial.",
      image: "/certificaciones/congreso-arqueologia.png",
    },
    {
      title: "Ponente Andes – Congreso CIPOL",
      shortTitle: "CIPOL Andes",
      meta: "Ponente invitado",
      year: "2019",
      description:
        "Presentación de análisis aplicado para lectura de fenómenos políticos y sociales.",
      image: "/certificaciones/ponente-andes-congreso-cipol.png",
    },
    {
      title: "Simposio Memoria, Conflicto y Paz",
      shortTitle: "Memoria & Paz",
      meta: "Simposio",
      year: "2018",
      description:
        "Socialización de resultados y marcos de análisis para memoria y construcción de paz.",
      image: "/certificaciones/simposio-memoria-conflicto-paz.png",
    },
  ],
}

export default function CertificationsShowcase() {
  const [activeTab, setActiveTab] = useState<CredentialCategory>("diplomas")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const activeItems = contentByTab[activeTab]
  const isSingleItemTab = activeItems.length === 1

  const openCarousel = useCallback((index: number) => {
    setCarouselIndex(index)
    setCarouselOpen(true)
  }, [])

  const closeCarousel = useCallback(() => {
    setCarouselOpen(false)
  }, [])

  const goToCarouselPrev = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)
  }, [activeItems.length])

  const goToCarouselNext = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % activeItems.length)
  }, [activeItems.length])

  useEffect(() => {
    if (!carouselOpen) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCarousel()
      if (e.key === "ArrowLeft") goToCarouselPrev()
      if (e.key === "ArrowRight") goToCarouselNext()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [carouselOpen, goToCarouselPrev, goToCarouselNext, closeCarousel])

  const infoIndex = isSingleItemTab ? 0 : selectedIndex !== null ? selectedIndex : null
  const infoItem = infoIndex !== null ? activeItems[infoIndex] : null

  const handleTabChange = (tab: CredentialCategory) => {
    setActiveTab(tab)
    setSelectedIndex(null)
  }

  const goToPrev = () => {
    if (isSingleItemTab || activeItems.length === 0) return
    const current = selectedIndex ?? 0
    setSelectedIndex((current - 1 + activeItems.length) % activeItems.length)
  }

  const goToNext = () => {
    if (isSingleItemTab || activeItems.length === 0) return
    const current = selectedIndex ?? 0
    setSelectedIndex((current + 1) % activeItems.length)
  }

  return (
    <section
      id="certifications-showcase"
      className="relative min-h-screen overflow-hidden px-4 pb-24 md:px-12 md:pb-32"
    >

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col"
      >
        <div className="mb-10 md:mb-14 md:mt-12">
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/30 mb-3">02 — CREDENCIALES</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic text-white">
            Formación{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              y Trayectoria
            </span>
          </h2>
        </div>

        <div className="w-full">

          {/* ─── CATEGORY TABS ─── */}
          <div className="mb-8 flex flex-wrap gap-1 md:gap-0 md:border md:border-white/10">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-cursor-hover
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 min-w-[calc(50%-2px)] md:min-w-0 border border-white/10 md:border-r md:border-0 md:last:border-r-0 px-4 py-3 md:py-4 font-mono text-[10px] tracking-[0.16em] transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 md:border-transparent"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70 border-white/10"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-cyan-400 to-cyan-600"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="block">{tab.label.toUpperCase()}</span>
                <span
                  className={`mt-0.5 block text-[9px] tracking-widest ${
                    activeTab === tab.id ? "text-cyan-500/70" : "text-white/20"
                  }`}
                >
                  {String(tab.count).padStart(2, "0")} ITEMS
                </span>
              </button>
            ))}
          </div>

          {/* ─── MOBILE GRID + DESKTOP ACCORDION ─── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >

              {/* ── CUADRÍCULA DE PREVIEWS ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {activeItems.map((item, index) => {
                  const isActive = selectedIndex === index
                  return (
                    <button
                      key={`${activeTab}-${item.title}`}
                      type="button"
                      onClick={() => openCarousel(index)}
                      onMouseEnter={() => { if (!isSingleItemTab) setSelectedIndex(index) }}
                      className={`group relative flex flex-col overflow-hidden border text-left transition-all duration-200 ${
                        isActive
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-black/40 p-3 transition-all duration-300 group-hover:bg-black/25">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex w-full items-center justify-between gap-1 px-2.5 py-2">
                        <p className="font-mono text-[9px] font-semibold tracking-wider text-white/70 transition-colors duration-200 group-hover:text-white/90 truncate">
                          {item.shortTitle.toUpperCase()}
                        </p>
                        <span className="shrink-0 font-mono text-[8px] tracking-widest text-white/20 group-hover:text-cyan-500/60 transition-colors duration-200">
                          {item.year}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="card-active-line"
                          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 to-cyan-600"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* ── INFO PANEL ── */}
              <div className="border border-t-0 border-white/10 bg-black/30 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {infoItem ? (
                    <motion.div
                      key={`info-${activeTab}-${infoIndex}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:gap-8 md:px-8 md:py-6"
                    >
                      <div className="flex flex-shrink-0 flex-col gap-2 md:w-44">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] tracking-[0.3em] text-white/25">
                            {String((infoIndex ?? 0) + 1).padStart(2, "0")}
                            <span className="mx-1.5 text-white/10">/</span>
                            {String(activeItems.length).padStart(2, "0")}
                          </span>
                          <span className="h-px flex-1 bg-white/8" />
                        </div>
                        <span className="inline-flex w-fit border border-cyan-500/20 bg-cyan-500/8 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-cyan-400/80">
                          {infoItem.meta.toUpperCase()}
                        </span>
                        <span className="font-mono text-[11px] tracking-widest text-white/20">{infoItem.year}</span>
                      </div>

                      <div className="hidden w-px self-stretch bg-white/8 md:block" />

                      <div className="flex flex-1 flex-col gap-2">
                        <h3 className="font-sans text-xl font-light leading-snug text-white md:text-2xl lg:text-3xl">
                          {infoItem.title}
                        </h3>
                        <p className="font-mono text-[12px] leading-relaxed text-white/40 md:text-[13px] max-w-2xl">
                          {infoItem.description}
                        </p>
                      </div>

                      <div className="hidden md:flex items-center gap-2 self-start pt-1">
                        <button
                          type="button"
                          onClick={goToPrev}
                          disabled={isSingleItemTab}
                          className="flex h-8 w-8 items-center justify-center border border-white/10 text-white/30 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Anterior"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2L4 6l3 4"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={goToNext}
                          disabled={isSingleItemTab}
                          className="flex h-8 w-8 items-center justify-center border border-white/10 text-white/30 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Siguiente"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2l3 4-3 4"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="info-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between px-6 py-5 md:px-8"
                    >
                      <span className="font-mono text-[10px] tracking-[0.25em] text-white/20">
                        — EXPLORA LOS CERTIFICADOS
                      </span>
                      <div className="flex items-center gap-1.5">
                        {activeItems.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            onMouseEnter={() => setSelectedIndex(i)}
                            className="h-1 w-2 cursor-pointer bg-white/10 transition-all duration-200 hover:bg-white/30"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border border-t-0 border-white/10 px-5 py-2.5">
                <p className="font-mono text-[9px] tracking-[0.22em] text-cyan-500/40">
                  {tabItems.find((t) => t.id === activeTab)?.label.toUpperCase()}
                  {infoItem
                    ? ` / ${String((infoIndex ?? 0) + 1).padStart(2, "0")} — ${infoItem.shortTitle.toUpperCase()}`
                    : ""}
                </p>
                <span className="font-mono text-[9px] tracking-widest text-white/12">
                  {infoItem ? infoItem.year : "——"}
                </span>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      {/* ─── FULL-SCREEN CAROUSEL (portal) ─── */}
      {mounted && createPortal(
        <AnimatePresence>
          {carouselOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-lg"
            >
            <div className="relative flex h-full w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 md:px-12 py-16">
              {/* Close button */}
              <button
                type="button"
                onClick={closeCarousel}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/10 text-white/40 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>

              {/* Counter */}
              <span className="font-mono text-[10px] tracking-[0.3em] text-white/20 absolute top-4 left-4">
                {String(carouselIndex + 1).padStart(2, "0")} / {String(activeItems.length).padStart(2, "0")}
              </span>

              {/* Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`carousel-img-${carouselIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex w-full max-h-[50vh] items-center justify-center"
                >
                  <img
                    src={activeItems[carouselIndex].image}
                    alt={activeItems[carouselIndex].title}
                    className="max-h-[50vh] w-auto max-w-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`carousel-text-${carouselIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-2 text-center max-w-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex border border-cyan-500/20 bg-cyan-500/8 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-cyan-400/80">
                      {activeItems[carouselIndex].meta.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-white/20">{activeItems[carouselIndex].year}</span>
                  </div>
                  <h3 className="font-sans text-xl font-light leading-snug text-white md:text-3xl">
                    {activeItems[carouselIndex].title}
                  </h3>
                  <p className="font-mono text-[12px] leading-relaxed text-white/40 md:text-[13px] max-w-xl">
                    {activeItems[carouselIndex].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToCarouselPrev}
                  disabled={activeItems.length <= 1}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/40 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
                </button>
                <span className="font-mono text-[9px] tracking-[0.25em] text-white/20">{activeItems[carouselIndex].shortTitle.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={goToCarouselNext}
                  disabled={activeItems.length <= 1}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/40 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Siguiente"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
