"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Database, TrendingUp, BarChart3, PieChart } from "lucide-react"

const portfolioProjects = [
  {
    id: "01",
    title: "Dashboard Predictivo de Ventas",
    category: "Business Intelligence",
    description: "Análisis predictivo con Machine Learning para forecasting de ventas con precisión del 94%",
    metrics: ["Python", "Power BI", "SQL", "Scikit-learn"],
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
    icon: TrendingUp,
  },
  {
    id: "02",
    title: "Pipeline ETL Automatizado",
    category: "Data Engineering",
    description: "Sistema de extracción, transformación y carga de datos procesando 2M+ registros diarios",
    metrics: ["Airflow", "PostgreSQL", "Docker", "AWS"],
    image: "/abstract-memory-storage-visualization.jpg",
    icon: Database,
  },
  {
    id: "03",
    title: "Segmentación de Clientes",
    category: "Machine Learning",
    description: "Clustering avanzado identificando 7 segmentos clave para estrategia de marketing personalizado",
    metrics: ["Python", "K-Means", "Tableau", "BigQuery"],
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
    icon: PieChart,
  },
  {
    id: "04",
    title: "Análisis de Churn Rate",
    category: "Analytics",
    description: "Modelo predictivo reduciendo la tasa de abandono en un 23% mediante intervenciones proactivas",
    metrics: ["R", "Random Forest", "Excel", "Looker"],
    image: "/sound-wave-visualization-dark-theme.jpg",
    icon: BarChart3,
  },
]

export default function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  return (
    <section className="relative py-24 md:py-32 px-8 md:px-12 bg-[#0a0a0a]">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 md:mb-24"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 — PORTAFOLIO</p>
        <h2 className="font-sans text-3xl md:text-5xl lg:text-7xl font-light tracking-tight">
          Proyectos <span className="italic text-[#39cbe3]">Destacados</span>
        </h2>
      </motion.div>

      {/* Projects Grid - Techno-Brutalist Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {portfolioProjects.map((project, index) => {
          const Icon = project.icon
          const isSelected = selectedProject === index

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setSelectedProject(index)}
              onHoverEnd={() => setSelectedProject(null)}
              className="group relative"
            >
              {/* Project Card */}
              <div className="relative h-full border-2 border-white/10 bg-[#0a0a0a] overflow-hidden">
                {/* Image Container */}
                <div className="relative h-64 md:h-72 overflow-hidden bg-black">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    style={{
                      filter: "grayscale(80%) contrast(1.2)",
                    }}
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />

                  {/* Project Number */}
                  <div className="absolute top-4 left-4 font-mono text-6xl md:text-7xl font-bold text-white/5 leading-none">
                    {project.id}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className="absolute top-4 right-4 p-3 bg-[#39cbe3]/10 border border-[#39cbe3]/30"
                    animate={{
                      backgroundColor: isSelected ? "rgba(57, 203, 227, 0.2)" : "rgba(57, 203, 227, 0.1)",
                    }}
                  >
                    <Icon className="w-6 h-6 text-[#39cbe3]" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-[#39cbe3]" />
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[#39cbe3] uppercase">
                      {project.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-sans text-2xl md:text-3xl font-light tracking-tight text-white leading-tight">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    {project.metrics.map((tech) => (
                      <div
                        key={tech}
                        className="font-mono text-[10px] tracking-wider px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-center uppercase"
                      >
                        {tech}
                      </div>
                    ))}
                  </div>

                  {/* CTA Line */}
                  <motion.div
                    className="pt-4 flex items-center gap-2 font-mono text-xs tracking-wider text-white/50 group-hover:text-[#39cbe3] transition-colors duration-300"
                    animate={{
                      x: isSelected ? 8 : 0,
                    }}
                  >
                    <span>VER PROYECTO</span>
                    <motion.div
                      className="h-px bg-white/50 group-hover:bg-[#39cbe3]"
                      animate={{
                        width: isSelected ? "40px" : "20px",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </div>

                {/* Border Accent */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-[#39cbe3]"
                  initial={{ width: "0%" }}
                  animate={{
                    width: isSelected ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom Stats - Brutalist Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Proyectos Completados", value: "25+" },
          { label: "Datos Procesados", value: "500M+" },
          { label: "Precisión Promedio", value: "96%" },
          { label: "Años Experiencia", value: "5+" },
        ].map((stat, index) => (
          <div
            key={index}
            className="border-2 border-white/10 bg-[#0a0a0a] p-6 text-center group hover:border-[#39cbe3]/50 transition-colors duration-300"
          >
            <div className="font-mono text-3xl md:text-4xl font-bold text-[#39cbe3] mb-2 tabular-nums">
              {stat.value}
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

