"use client"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import ProjectsShowcase from "./projects-showcase"
import EcosystemBackground from "./ecosystem-background"
import { Leaf, Users, Globe, ShieldAlert, Heart, Landmark } from "lucide-react"

const environmentProjects = [
  {
    id: "forestal-1",
    title: "Densidad Forestal Global 2000-2020",
    description: "Visualización interactiva que muestra la evolución de la densidad forestal a nivel global entre los años 2000 y 2020. Permite explorar tendencias, comparar regiones y analizar el impacto ambiental a lo largo del tiempo.",
    embedUrl: "https://densidad-forestal-global-2000-2020.vercel.app/",
    tags: ["Bosques", "Cambio Climático", "Visualización", "Global"],
    featured: true,
    thumbnail: "/proyectos/9.densidad-fores.png",
    type: "web" as const
  },
  {
    id: "sec-1",
    title: "Sistema de Seguimiento Contractual - SEC",
    description: "Plataforma de gestión y seguimiento contractual para la Secretaría de Educación de Guadalajara de Buga. Sistema integral para el monitoreo, administración y control de contratos educativos del territorio.",
    embedUrl: "https://sistema-seguimiento-contractual-sec.vercel.app/",
    tags: ["Educación", "Territorial", "Gestión Pública", "Contratos"],
    featured: false,
    thumbnail: "/alcaldia-buga.png",
    type: "web" as const
  }
]

const impactAreas = [
  { 
    category: "Sostenibilidad Ambiental", 
    icon: Leaf,
    items: ["Indicadores socio-ambientales", "Gestión de recursos naturales", "Cambio climático", "Biodiversidad"],
    color: "#10b981"
  },
  { 
    category: "Derechos Humanos", 
    icon: ShieldAlert,
    items: ["Desapariciones forzadas", "Protección infantil", "Víctimas del conflicto", "Justicia transicional"],
    color: "#10b981"
  },
  { 
    category: "Paz y Conflicto", 
    icon: Heart,
    items: ["Post-acuerdo de paz", "Control territorial", "Violencias", "Construcción de paz"],
    color: "#10b981"
  },
  { 
    category: "Desarrollo Social", 
    icon: Users,
    items: ["Organizaciones comunitarias", "Acción humanitaria", "Desarrollo territorial", "Participación ciudadana"],
    color: "#10b981"
  },
]

const methodology = [
  {
    step: "01",
    title: "Contexto Territorial",
    description: "Análisis de dinámicas sociales, conflicto armado y variables ambientales del territorio",
    icon: Globe
  },
  {
    step: "02",
    title: "Recolección Participativa",
    description: "Metodologías mixtas con comunidades, organizaciones y fuentes institucionales",
    icon: Users
  },
  {
    step: "03",
    title: "Análisis Multivariado",
    description: "Integración de dimensiones sociales, ambientales, económicas y de conflicto",
    icon: ShieldAlert
  },
  {
    step: "04",
    title: "Incidencia & Políticas",
    description: "Productos para toma de decisiones, advocacy y construcción de paz territorial",
    icon: Landmark
  },
]

export default function MedioAmbienteSociedadContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const iconRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) / 20
    const deltaY = (e.clientY - centerY) / 20
    setMousePosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center border-b border-white/10 overflow-hidden">
        <EcosystemBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8"
        >
          <motion.div
            ref={iconRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: mousePosition.x,
              y: mousePosition.y
            }}
            transition={{ 
              scale: { delay: 0.2, duration: 0.6 },
              opacity: { delay: 0.2, duration: 0.6 },
              x: { type: "spring", stiffness: 150, damping: 15 },
              y: { type: "spring", stiffness: 150, damping: 15 }
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="inline-block mb-8 cursor-pointer"
          >
            <img 
              src="/ilustraciones/cultura-sociedad.png" 
              alt="Medio Ambiente y Sociedad"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
            />
          </motion.div>

          <h1 className="font-sans text-5xl md:text-7xl font-light tracking-tight mb-6">
            Medio Ambiente y <span className="italic text-[#10b981]">Sociedad</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Análisis de datos para la sostenibilidad, derechos humanos y construcción de paz territorial
          </p>
        </motion.div>

        <a href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-[#10b981] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          VOLVER
        </a>
      </section>

      {/* Impact Areas */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 • ÁREAS DE IMPACTO</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-16">
            Dimensiones de <span className="italic text-[#10b981]">Análisis</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {impactAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <motion.div
                  key={area.category}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group border border-white/10 p-6 hover:border-white/50 transition-all duration-300 relative"
                  style={{
                    borderColor: `${area.color}40`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = area.color}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = `${area.color}40`}
                >
                  <div className="mb-6">
                    <Icon className="w-10 h-10 transition-colors" style={{ color: area.color }} />
                  </div>
                  
                  <h3 className="font-sans text-xl font-light mb-4 transition-colors" style={{ color: area.color }}>
                    {area.category}
                  </h3>
                  <ul className="space-y-2">
                    {area.items.map((item) => (
                      <li key={item} className="font-mono text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 mt-1.5 flex-shrink-0" style={{ backgroundColor: area.color }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Methodology */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 • METODOLOGÍA</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-16">
            Enfoque <span className="italic text-[#10b981]">Territorial</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {methodology.map((phase, index) => {
              const Icon = phase.icon
              return (
                <motion.div
                  key={phase.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="relative"
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 border-2 border-[#10b981] bg-[#0a0a0a] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-[#10b981]">{phase.step}</span>
                  </div>

                  {/* Card */}
                  <div className="border border-white/10 p-6 pt-10 h-full hover:border-[#10b981]/50 transition-all duration-300">
                    <Icon className="w-8 h-8 text-[#10b981] mb-4" />
                    <h3 className="font-sans text-lg font-light mb-3">{phase.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  {/* Connecting Line (except last) */}
                  {index < methodology.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#10b981] to-transparent" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Projects Showcase */}
      <ProjectsShowcase 
        projects={environmentProjects}
        title="Proyectos"
        subtitle="Territoriales"
        sectionNumber="05 • PORTAFOLIO SOCIO-AMBIENTAL"
        accentColor="#10b981"
      />

      {/* Impact Statement */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6 text-center">ENFOQUE DE IMPACTO</p>
          <blockquote className="text-2xl md:text-3xl font-light text-center leading-relaxed mb-8">
            "Los datos no son solo números: son <span className="italic text-[#10b981]">territorios</span>, son <span className="italic text-[#10b981]">comunidades</span>, son <span className="italic text-[#10b981]">vidas</span>. 
            Mi trabajo busca que cada visualización contribuya a la construcción de paz, la defensa de derechos y la sostenibilidad territorial."
          </blockquote>
          <div className="h-px bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-8">
            ¿Trabajemos por el <span className="italic text-[#10b981]">territorio</span>?
          </h2>
          <a
            href="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest border border-white/20 px-8 py-4 hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300 group"
          >
            CONTACTAR
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </section>
    </main>
  )
}
