"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HomeCertExpAnimatedTitle from "./home-cert-exp-animated-title.tsx"

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
  { id: "certificaciones", label: "Certificaciones", count: 8 },
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeItems = contentByTab[activeTab]
  const isSingleItemTab = activeItems.length === 1

  // El item que se muestra en el panel de info:
  // si hay hover → ese item; si no → ninguno (panel vacío / placeholder)
  const infoIndex = isSingleItemTab ? 0 : hoveredIndex !== null ? hoveredIndex : null
  const infoItem = infoIndex !== null ? activeItems[infoIndex] : null

  const handleTabChange = (tab: CredentialCategory) => {
    setActiveTab(tab)
    setHoveredIndex(null)
  }

  return (
    <section
      id="certifications-showcase"
      className="relative min-h-screen overflow-hidden border-b border-white/10 bg-[#050505] px-4 pt-0 pb-24 md:px-8 md:pb-32"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,203,227,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(57,203,227,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
        <HomeCertExpAnimatedTitle />

        <div className="mt-12 w-full text-left md:mt-16">

          {/* ─── CATEGORY TABS ─── */}
          <div className="mb-8 flex flex-wrap gap-0 border border-white/10">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-cursor-hover
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 min-w-[120px] border-r border-white/10 px-4 py-4 font-mono text-[10px] tracking-[0.16em] transition-all duration-300 last:border-r-0 ${
                  activeTab === tab.id
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-cyan-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="block">{tab.label.toUpperCase()}</span>
                <span
                  className={`mt-1 block text-[9px] tracking-widest ${
                    activeTab === tab.id ? "text-cyan-500/70" : "text-white/20"
                  }`}
                >
                  {String(tab.count).padStart(2, "0")} ITEMS
                </span>
              </button>
            ))}
          </div>

          {/* ─── HORIZONTAL ACCORDION + INFO PANEL ─── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >

              {/* ── ACCORDION STRIP (solo imágenes) ── */}
              <div
                ref={containerRef}
                className="flex w-full overflow-hidden border border-white/10"
                style={{ height: "clamp(340px, 55vh, 620px)" }}
              >
                {activeItems.map((item, index) => {
                  const isExpanded = isSingleItemTab || hoveredIndex === index
                  const isCollapsed = !isSingleItemTab && hoveredIndex !== null && hoveredIndex !== index

                  return (
                    <motion.div
                      key={`${activeTab}-${item.title}`}
                      layout
                      animate={{
                        flexGrow: isExpanded ? 14 : 1,
                        opacity: isCollapsed ? 0.45 : 1,
                      }}
                      transition={{
                        flexGrow: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.25 },
                      }}
                      onMouseEnter={() => {
                        if (!isSingleItemTab) setHoveredIndex(index)
                      }}
                      onMouseLeave={() => {
                        if (!isSingleItemTab) setHoveredIndex(null)
                      }}
                      data-cursor-hover
                      className="relative flex cursor-default select-none overflow-hidden border-r border-white/10 last:border-r-0"
                      style={{ minWidth: "3rem", flexShrink: 1, flexBasis: 0 }}
                    >
                      {/* Dark base */}
                      <div className="absolute inset-0 bg-[#050505]" />

                      {/* Diagonal grid — visible when expanded */}
                      <div
                        className="pointer-events-none absolute inset-0 transition-opacity duration-400"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(57,203,227,0.07) 0px, rgba(57,203,227,0.07) 1px, transparent 1px, transparent 10px)",
                          opacity: isExpanded ? 1 : 0,
                        }}
                      />

                      {/* ── COLLAPSED: vertical label ── */}
                      <AnimatePresence>
                        {!isExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative flex h-full w-full flex-col items-center justify-end pb-6"
                          >
                            <span
                              className="font-mono text-[10px] tracking-[0.2em] text-white/40 transition-colors duration-300 hover:text-white/70"
                              style={{
                                writingMode: "vertical-rl",
                                textOrientation: "mixed",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.shortTitle.toUpperCase()}
                            </span>
                            <span
                              className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-widest text-white/20"
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                              }}
                            >
                              {item.year}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── EXPANDED: solo la imagen del certificado ── */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                            className="relative flex h-full w-full items-center justify-center p-6 md:p-8"
                          >
                            {/* Glow border frame */}
                            <div className="relative border-[4px] border-cyan-500/55 bg-black/40">
                              <div
                                className="pointer-events-none absolute -inset-[8px]"
                                style={{
                                  border: "6px solid rgba(57,203,227,0.28)",
                                  filter: "blur(9px)",
                                  maskImage:
                                    "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                                  WebkitMaskImage:
                                    "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                                }}
                              />
                              <div className="relative overflow-hidden border-[6px] border-black/60">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="block max-h-[46vh] w-auto max-w-full object-contain"
                                  style={{ maxWidth: "clamp(200px, 40vw, 680px)" }}
                                />
                              </div>
                            </div>

                            {/* Top active line */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bottom hover line (collapsed) */}
                      {!isExpanded && (
                        <motion.div
                          className="absolute inset-x-0 bottom-0 h-[2px] bg-cyan-500"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.22 }}
                          style={{ transformOrigin: "left" }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* ── INFO PANEL — debajo del acordeón, siempre visible ── */}
              <div className="border border-t-0 border-white/10 bg-black/40 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {infoItem ? (
                    <motion.div
                      key={`info-${activeTab}-${infoIndex}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-start md:gap-10 md:px-8 md:py-6"
                    >
                      {/* Left column: counter + meta + year */}
                      <div className="flex flex-shrink-0 flex-col gap-2 md:w-48">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] tracking-[0.3em] text-white/30">
                            {String((infoIndex ?? 0) + 1).padStart(2, "0")}
                            <span className="mx-1 text-white/15">/</span>
                            {String(activeItems.length).padStart(2, "0")}
                          </span>
                          <span className="h-px flex-1 bg-white/10" />
                          <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-500/60">
                            {infoItem.year}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-500">
                          {infoItem.meta.toUpperCase()}
                        </p>
                      </div>

                      {/* Vertical divider */}
                      <div className="hidden w-px self-stretch bg-white/8 md:block" />

                      {/* Right column: title + description + dots */}
                      <div className="flex flex-1 flex-col gap-2">
                        <h3 className="font-sans text-xl font-light leading-snug text-white md:text-2xl lg:text-3xl">
                          {infoItem.title}
                        </h3>
                        <p className="font-mono text-[12px] leading-relaxed text-white/45 md:text-[13px]">
                          {infoItem.description}
                        </p>
                      </div>

                      {/* Dots tracker — right side */}
                      <div className="flex flex-shrink-0 flex-row items-center gap-1.5 self-center md:flex-col md:gap-1.5 md:self-start md:pt-1">
                        {activeItems.map((_, i) => (
                          <div
                            key={i}
                            onMouseEnter={() => setHoveredIndex(i)}
                            className={`cursor-default rounded-none transition-all duration-300 ${
                              i === infoIndex
                                ? "h-1 w-6 bg-cyan-500 md:h-6 md:w-1"
                                : "h-1 w-2 bg-white/15 hover:bg-white/35 md:h-2 md:w-1"
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="info-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-4 px-6 py-5 md:px-8"
                    >
                      <span className="font-mono text-[10px] tracking-[0.25em] text-white/20">
                        — PASA EL CURSOR SOBRE UN CERTIFICADO
                      </span>
                      {/* Mini dots row — all inactive */}
                      <div className="ml-auto flex items-center gap-1">
                        {activeItems.map((_, i) => (
                          <div
                            key={i}
                            onMouseEnter={() => setHoveredIndex(i)}
                            className="h-1 w-2 cursor-default bg-white/10 transition-all duration-200 hover:bg-white/30"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── BOTTOM STATUS BAR ── */}
              <div className="flex items-center justify-between border border-t-0 border-white/10 px-5 py-2">
                <p className="font-mono text-[9px] tracking-[0.22em] text-cyan-500/50">
                  {tabItems.find((t) => t.id === activeTab)?.label.toUpperCase()}
                  {infoItem
                    ? ` / ${String((infoIndex ?? 0) + 1).padStart(2, "0")} — ${infoItem.shortTitle.toUpperCase()}`
                    : ""}
                </p>
                <span className="font-mono text-[9px] tracking-widest text-white/15">
                  {infoItem ? infoItem.year : "——"}
                </span>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
