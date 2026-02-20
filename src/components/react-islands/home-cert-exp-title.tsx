"use client"

import { useState } from "react"
import HomeCertExpAnimatedTitle from "./home-cert-exp-animated-title.tsx"

type CredentialTab = "diplomas" | "certificaciones" | "experiencia" | "ponencias"
type CredentialItem = {
  title: string
  meta: string
  description: string
  image: string
}

const tabItems: { id: CredentialTab; label: string }[] = [
  { id: "diplomas", label: "Diplomas" },
  { id: "certificaciones", label: "Certificaciones" },
  { id: "experiencia", label: "Experiencias Laborales" },
  { id: "ponencias", label: "Ponencias y Congresos" },
]

const contentByTab: Record<CredentialTab, CredentialItem[]> = {
  diplomas: [
    {
      title: "Diploma en Ciencia Política",
      meta: "Formación universitaria",
      description: "Base teórica y metodológica para análisis institucional, territorial y social aplicado a datos.",
      image: "/certificaciones/diploma-politologo.jpg",
    },
  ],
  certificaciones: [
    {
      title: "IBM Data Science, Python e IA",
      meta: "Certificación técnica",
      description: "Herramientas de analítica, programación y fundamentos de inteligencia artificial para productos de datos.",
      image: "/certificaciones/ibm-data-science-python-ia.png",
    },
    {
      title: "IBM Developing Skills",
      meta: "Certificación técnica",
      description: "Fortalecimiento de habilidades prácticas para resolver problemas reales con enfoques data-driven.",
      image: "/certificaciones/ibm-developing-skills.png",
    },
    {
      title: "DANE: Construcción de Indicadores",
      meta: "Capacitación institucional",
      description: "Diseño, lectura e interpretación de indicadores para seguimiento de políticas y evaluación territorial.",
      image: "/certificaciones/dane-construcion-indicadores.png",
    },
    {
      title: "DANE: Registros Administrativos",
      meta: "Capacitación institucional",
      description: "Uso estratégico de fuentes administrativas para analítica pública y planeación basada en evidencia.",
      image: "/certificaciones/dane-registros-administrativos.png",
    },
  ],
  experiencia: [
    {
      title: "Consultoría Territorial y Social",
      meta: "Sector público y social",
      description: "Diseño de tableros y sistemas de seguimiento para gestión pública, conflicto y desarrollo territorial.",
      image: "/certificaciones/ocha-certificado.png",
    },
  ],
  ponencias: [
    {
      title: "Coloquio Doctoral en Ciencias Humanas",
      meta: "Ponencia académica",
      description: "Discusión interdisciplinaria sobre enfoques de investigación social y territorial.",
      image: "/certificaciones/coloquio-doctoral-ciencias-humanas.png",
    },
    {
      title: "Congreso de Arqueología",
      meta: "Congreso",
      description: "Participación en espacio académico de análisis histórico y territorial.",
      image: "/certificaciones/congreso-arqueologia.png",
    },
    {
      title: "Ponente Andes - Congreso CIPOL",
      meta: "Ponente invitado",
      description: "Presentación de análisis aplicado para lectura de fenómenos políticos y sociales.",
      image: "/certificaciones/ponente-andes-congreso-cipol.png",
    },
    {
      title: "Simposio Memoria, Conflicto y Paz",
      meta: "Simposio",
      description: "Socialización de resultados y marcos de análisis para memoria y construcción de paz.",
      image: "/certificaciones/simposio-memoria-conflicto-paz.png",
    },
  ],
}

export default function HomeCertExpTitle() {
  const [activeTab, setActiveTab] = useState<CredentialTab>("diplomas")
  const [activeIndexByTab, setActiveIndexByTab] = useState<Record<CredentialTab, number>>({
    diplomas: 0,
    certificaciones: 0,
    experiencia: 0,
    ponencias: 0,
  })

  const activeItems = contentByTab[activeTab]
  const activeIndex = activeIndexByTab[activeTab] ?? 0
  const currentItem = activeItems[activeIndex] ?? activeItems[0]

  const setActiveIndex = (index: number) => {
    setActiveIndexByTab((prev) => ({
      ...prev,
      [activeTab]: index,
    }))
  }

  const handlePrev = () => {
    const previousIndex = activeIndex === 0 ? activeItems.length - 1 : activeIndex - 1
    setActiveIndex(previousIndex)
  }

  const handleNext = () => {
    const nextIndex = activeIndex === activeItems.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(nextIndex)
  }

  return (
    <section
      id="home-cert-exp-title"
      className="relative min-h-screen overflow-hidden border-b border-white/10 bg-[#050505] px-8 pt-0 pb-32 md:px-12 md:pt-0 md:pb-44"
    >
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
        <HomeCertExpAnimatedTitle />

        <div className="mt-72 w-full text-left md:mt-96">
          <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-cursor-hover
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-16 border px-2 py-3 font-mono text-[10px] tracking-[0.14em] transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                    : "border-white/20 text-muted-foreground hover:border-white/50 hover:text-white"
                }`}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="border border-white/15 bg-black/55 p-6 backdrop-blur-md">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] tracking-[0.2em] text-cyan-500">CENTRO DE MANDOS</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-cursor-hover
                    aria-label="Elemento anterior"
                    onClick={handlePrev}
                    className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-cyan-500 hover:text-cyan-500"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    data-cursor-hover
                    aria-label="Elemento siguiente"
                    onClick={handleNext}
                    className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-cyan-500 hover:text-cyan-500"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="relative mb-5">
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(57,203,227,0.14) 0px, rgba(57,203,227,0.14) 1px, transparent 1px, transparent 8px)",
                  }}
                />
                <div className="relative mx-auto w-fit border-[5px] border-cyan-500/60 bg-black/30 leading-none">
                  <div
                    className="pointer-events-none absolute -inset-[10px]"
                    style={{
                      border: "8px solid rgba(57, 203, 227, 0.35)",
                      filter: "blur(10px)",
                      maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                    }}
                  />
                  <div className="relative inline-flex max-w-full overflow-hidden border-[8px] border-black/55 shadow-[0_0_0_2px_rgba(0,0,0,0.35)] leading-none">
                    <img src={currentItem.image} alt={currentItem.title} className="block max-h-[68vh] w-auto max-w-full object-contain align-top" />
                  </div>
                </div>
              </div>

              <h3 className="mb-2 font-sans text-2xl font-light text-white">{currentItem.title}</h3>
              <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-cyan-500">{currentItem.meta.toUpperCase()}</p>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">{currentItem.description}</p>

              <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {activeItems.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    data-cursor-hover
                    onClick={() => setActiveIndex(index)}
                    className={`group relative h-16 w-16 overflow-hidden border-2 bg-black/35 transition-all ${
                      activeIndex === index ? "border-cyan-500/80" : "border-white/30 hover:border-white/55"
                    }`}
                  >
                    <img src={item.image} alt={`Miniatura ${item.title}`} className="relative h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
    </section>
  )
}
