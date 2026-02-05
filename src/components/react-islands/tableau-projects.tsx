"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface TableauProject {
  id: string
  title: string
  description: string
  embedUrl: string
  tags: string[]
  featured?: boolean
  thumbnail: string
}

export default function TableauProjects() {
  const [selectedProject, setSelectedProject] = useState<TableauProject | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [visualizationType, setVisualizationType] = useState<'tableau' | 'powerbi'>('tableau')

  // Proyectos de Tableau
  const tableauProjects: TableauProject[] = [
    {
      id: "1",
      title: "Análisis de Sostenibilidad Fresota - Cauca",
      description: "Dashboard socio-ambiental que evalúa indicadores de sostenibilidad en la región del Cauca, integrando variables ambientales y sociales para la toma de decisiones estratégicas",
      embedUrl: "https://public.tableau.com/views/AnlisisdeSostenibilidadFresota-CaucaSocio-ambiental/0_InfoGe?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Sostenibilidad", "Medio Ambiente", "Social"],
      featured: true,
      thumbnail: "/proyectos/8.fresota.png"
    },
    {
      id: "2",
      title: "Histórico de Desapariciones en Colombia",
      description: "Análisis temporal y geográfico de casos de desaparición forzada en Colombia, visualizando patrones, tendencias y zonas críticas para apoyar políticas de prevención",
      embedUrl: "https://public.tableau.com/views/HistoricodedesaparicionesenColombia/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Derechos Humanos", "Geoespacial", "Histórico"],
      thumbnail: "/proyectos/7.historico-desapariciones.png"
    },
    {
      id: "3",
      title: "Incautación de Cannabis en Colombia 2010-2024",
      description: "Dashboard interactivo que mapea incautaciones de cannabis a nivel nacional, identificando tendencias temporales, departamentos críticos y evolución del fenómeno",
      embedUrl: "https://public.tableau.com/views/IncautaciondecannabisenColombia2010-2024/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Seguridad", "Geográfico", "Series Temporales"],
      thumbnail: "/proyectos/6.incautacion-weed.png"
    },
    {
      id: "4",
      title: "Análisis Electoral Popayán 2015-2019",
      description: "Estudio comparativo de resultados electorales en Popayán, visualizando comportamiento electoral, participación ciudadana y distribución de votos por zonas",
      embedUrl: "https://public.tableau.com/views/AnlisisElectoralPopayn2015-2019/Dash?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Electoral", "Político", "Comparativo"],
      thumbnail: "/proyectos/5.analisis-electoral.png"
    },
    {
      id: "5",
      title: "Presencia de Grupos Armados en Colombia 2023",
      description: "Geovisor que mapea la presencia y control territorial de grupos armados ilegales, identificando zonas de influencia y riesgos para la población civil",
      embedUrl: "https://public.tableau.com/views/PresenciadegruposarmadosenColombia2023DataLabConsulting/DataLabConsulting?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Conflicto", "Territorial", "Seguridad"],
      featured: true,
      thumbnail: "/proyectos/4.grupos-armados.png"
    },
    {
      id: "6",
      title: "Geovisor ELC Cauca - OCHA",
      description: "Herramienta geoespacial desarrollada para la Oficina de Coordinación de Asuntos Humanitarios (OCHA), visualizando variables humanitarias críticas en el Cauca",
      embedUrl: "https://public.tableau.com/views/GeovisorparaOCHA/Historia1?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Humanitario", "OCHA", "Geoespacial"],
      thumbnail: "/proyectos/3.ocha.png"
    },
    {
      id: "7",
      title: "Dashboard de Organizaciones",
      description: "Análisis integral de organizaciones sociales y comunitarias, incluyendo distribución geográfica, áreas de acción y capacidades operativas",
      embedUrl: "https://public.tableau.com/views/DashboarddeOrganizaciones/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Organizaciones", "Social", "Mapeo"],
      thumbnail: "/proyectos/2.cosurca.png"
    },
    {
      id: "8",
      title: "Geovisor Multivariado - Riesgo de Reclutamiento Cauca",
      description: "Análisis multivariado que identifica zonas de riesgo de reclutamiento forzado de niñas, niños y adolescentes en el Cauca 2023, integrando variables sociales, económicas y de conflicto",
      embedUrl: "https://public.tableau.com/views/DATALABGeovisormultivariadoEND/Historia?:embed=y&:display_count=yes&:showVizHome=no",
      tags: ["Protección Infantil", "Multivariado", "Riesgo"],
      featured: true,
      thumbnail: "/proyectos/1.geovisor-multivariado.png"
    },
  ]

  // Proyectos de Power BI
  const powerbiProjects: TableauProject[] = [
    {
      id: "pb-1",
      title: "Visualización PAX END",
      description: "Dashboard integral de PAX END que visualiza métricas clave, análisis de tendencias y reportes operacionales en tiempo real para la toma de decisiones estratégica",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=4b474239-4187-49d7-8b5c-73c2c1360393&autoAuth=true&ctid=e8214937-233b-4b36-86bf-0b5f3337bee1&actionBarEnabled=true&reportCopilotInEmbed=true",
      tags: ["PAX", "Reportes", "Análisis"],
      featured: true,
      thumbnail: "/pax.png"
    }
  ]

  // Seleccionar proyectos basado en tipo
  const projects = visualizationType === 'tableau' ? tableauProjects : powerbiProjects

  return (
    <section className="py-24 px-8 md:px-12 border-b border-white/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
          04  {visualizationType === 'tableau' ? 'TABLEAU DASHBOARDS' : 'POWER BI DASHBOARDS'}
        </p>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-8 mb-4">
          <h2 className="font-sans text-3xl md:text-5xl font-light italic">
            Visualizaciones <span className="text-cyan-500">Interactivas</span>
          </h2>
          
          {/* Toggle Button */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={() => setVisualizationType('tableau')}
              className={`font-mono text-xs tracking-wider px-4 py-2 border transition-all ${
                visualizationType === 'tableau'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                  : 'border-white/20 text-muted-foreground hover:border-cyan-500/50'
              }`}
            >
              TABLEAU
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button
              onClick={() => setVisualizationType('powerbi')}
              className={`font-mono text-xs tracking-wider px-4 py-2 border transition-all ${
                visualizationType === 'powerbi'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                  : 'border-white/20 text-muted-foreground hover:border-cyan-500/50'
              }`}
            >
              POWER BI
            </button>
          </div>
        </div>
        
        <p className="font-mono text-sm text-muted-foreground max-w-3xl mb-16">
          {visualizationType === 'tableau' 
            ? 'Explora dashboards interactivos creados con Tableau, diseñados para transformar datos complejos en historias visuales comprensibles y accionables.'
            : 'Descubre análisis avanzados desarrollados con Power BI, combinando visualizaciones dinámicas con inteligencia empresarial para mejores decisiones.'
          }
        </p>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              onClick={() => setSelectedProject(project)}
              className={`group relative border cursor-pointer transition-all duration-300 ${
                project.featured 
                  ? 'border-cyan-500/50 bg-cyan-500/5' 
                  : 'border-white/10 hover:border-cyan-500/50'
              }`}
            >
              {project.featured && (
                <div className="absolute -top-3 left-6 bg-cyan-500 px-3 py-1">
                  <span className="font-mono text-[10px] tracking-wider text-black">
                    DESTACADO
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Project Thumbnail */}
                <div className="mb-6 aspect-video bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors overflow-hidden relative">
                  <img 
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="font-sans text-xl font-light group-hover:text-cyan-500 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-wider px-2 py-1 border border-white/20 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Button */}
                  <button className="flex items-center gap-2 font-mono text-xs tracking-wider text-cyan-500 group-hover:gap-3 transition-all">
                    VER DASHBOARD
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-500 translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Full Dashboard Modal */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[95vw] max-w-[1600px] h-[95vh] max-h-[90vh] bg-background border border-cyan-500/50 flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tableau Embed Container - Left Side */}
              <div className="flex-1 h-full p-2 md:p-4">
                <iframe
                  src={selectedProject.embedUrl}
                  className="w-full h-full border border-white/10"
                  style={{ border: 'none' }}
                  title={selectedProject.title}
                  allowFullScreen
                />
              </div>

              {/* Toggle Panel Button */}
              <button
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-0 z-20 p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border-l border-t border-b border-cyan-500/50 hover:border-cyan-500 transition-all"
                style={{ 
                  right: isPanelCollapsed ? '0' : '320px',
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem'
                }}
                aria-label={isPanelCollapsed ? "Mostrar panel" : "Ocultar panel"}
              >
                <svg 
                  className={`w-4 h-4 text-cyan-500 transition-transform ${isPanelCollapsed ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Right Sidebar - Info Panel */}
              <div 
                className={`h-full border-l border-white/10 bg-black/30 backdrop-blur-sm flex flex-col transition-all duration-300 ${
                  isPanelCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 bg-black/50 hover:bg-black/80 border border-white/20 hover:border-cyan-500 transition-all"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Title Section */}
                  <div className="pt-8">
                    <h3 className="font-sans text-2xl font-light text-white mb-3 leading-tight">
                      {selectedProject.title}
                    </h3>
                    <div className="h-px bg-gradient-to-r from-cyan-500 to-transparent mb-4" />
                  </div>

                  {/* Description Section */}
                  <div>
                    <p className="font-mono text-xs tracking-wider text-cyan-500 mb-2">
                      DESCRIPCIÓN
                    </p>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Tags Section */}
                  <div>
                    <p className="font-mono text-xs tracking-wider text-cyan-500 mb-3">
                      CATEGORÍAS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-wider px-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 text-white hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {selectedProject.featured && (
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30">
                        <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-mono text-[10px] tracking-wider text-cyan-500">
                          PROYECTO DESTACADO
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
