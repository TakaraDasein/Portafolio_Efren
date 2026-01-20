"use client"

import { motion } from "framer-motion"
import ProjectsShowcase from "./projects-showcase"

const tableauProjects = [
  {
    id: "1",
    title: "Análisis de Sostenibilidad Fresota - Cauca",
    description: "Dashboard socio-ambiental que evalúa indicadores de sostenibilidad en la región del Cauca, integrando variables ambientales y sociales para la toma de decisiones estratégicas",
    embedUrl: "https://public.tableau.com/views/AnlisisdeSostenibilidadFresota-CaucaSocio-ambiental/0_InfoGe?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Sostenibilidad", "Medio Ambiente", "Social"],
    featured: true,
    thumbnail: "/proyectos/8.fresota.png",
    type: "tableau" as const
  },
  {
    id: "2",
    title: "Histórico de Desapariciones en Colombia",
    description: "Análisis temporal y geográfico de casos de desaparición forzada en Colombia, visualizando patrones, tendencias y zonas críticas para apoyar políticas de prevención",
    embedUrl: "https://public.tableau.com/views/HistoricodedesaparicionesenColombia/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Derechos Humanos", "Geoespacial", "Histórico"],
    thumbnail: "/proyectos/7.historico-desapariciones.png",
    type: "tableau" as const
  },
  {
    id: "3",
    title: "Incautación de Cannabis en Colombia 2010-2024",
    description: "Dashboard interactivo que mapea incautaciones de cannabis a nivel nacional, identificando tendencias temporales, departamentos críticos y evolución del fenómeno",
    embedUrl: "https://public.tableau.com/views/IncautaciondecannabisenColombia2010-2024/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Seguridad", "Geográfico", "Series Temporales"],
    thumbnail: "/proyectos/6.incautacion-weed.png",
    type: "tableau" as const
  },
  {
    id: "4",
    title: "Análisis Electoral Popayán 2015-2019",
    description: "Estudio comparativo de resultados electorales en Popayán, visualizando comportamiento electoral, participación ciudadana y distribución de votos por zonas",
    embedUrl: "https://public.tableau.com/views/AnlisisElectoralPopayn2015-2019/Dash?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Electoral", "Político", "Comparativo"],
    thumbnail: "/proyectos/5.analisis-electoral.png",
    type: "tableau" as const
  },
  {
    id: "5",
    title: "Presencia de Grupos Armados en Colombia 2023",
    description: "Geovisor que mapea la presencia y control territorial de grupos armados ilegales, identificando zonas de influencia y riesgos para la población civil",
    embedUrl: "https://public.tableau.com/views/PresenciadegruposarmadosenColombia2023DataLabConsulting/DataLabConsulting?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Conflicto", "Territorial", "Seguridad"],
    featured: true,
    thumbnail: "/proyectos/4.grupos-armados.png",
    type: "tableau" as const
  },
  {
    id: "6",
    title: "Geovisor ELC Cauca - OCHA",
    description: "Herramienta geoespacial desarrollada para la Oficina de Coordinación de Asuntos Humanitarios (OCHA), visualizando variables humanitarias críticas en el Cauca",
    embedUrl: "https://public.tableau.com/views/GeovisorparaOCHA/Historia1?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Humanitario", "OCHA", "Geoespacial"],
    thumbnail: "/proyectos/3.ocha.png",
    type: "tableau" as const
  },
  {
    id: "7",
    title: "Dashboard de Organizaciones",
    description: "Análisis integral de organizaciones sociales y comunitarias, incluyendo distribución geográfica, áreas de acción y capacidades operativas",
    embedUrl: "https://public.tableau.com/views/DashboarddeOrganizaciones/Dashboard1?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Organizaciones", "Social", "Mapeo"],
    thumbnail: "/proyectos/2.cosurca.png",
    type: "tableau" as const
  },
  {
    id: "8",
    title: "Geovisor Multivariado - Riesgo de Reclutamiento Cauca",
    description: "Análisis multivariado que identifica zonas de riesgo de reclutamiento forzado de niñas, niños y adolescentes en el Cauca 2023, integrando variables sociales, económicas y de conflicto",
    embedUrl: "https://public.tableau.com/views/DATALABGeovisormultivariadoEND/Historia?:embed=y&:display_count=yes&:showVizHome=no",
    tags: ["Protección Infantil", "Multivariado", "Riesgo"],
    featured: true,
    thumbnail: "/proyectos/1.geovisor-multivariado.png",
    type: "tableau" as const
  },
]

export default function AnalisisDatosContent() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <svg className="w-16 h-16 md:w-20 md:h-20 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.div>

          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">01  ESPECIALIZACIÓN</p>
          <h1 className="font-sans text-5xl md:text-7xl font-light tracking-tight mb-6">
            Análisis de <span className="italic">Datos</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Transformando datos complejos en insights accionables para la toma de decisiones estratégicas
          </p>
        </motion.div>

        <a
          href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          VOLVER
        </a>
      </section>

      {/* Tableau Dashboards Section */}
      <ProjectsShowcase 
        projects={tableauProjects}
        title="Visualizaciones"
        subtitle="Interactivas"
        sectionNumber="04 • TABLEAU DASHBOARDS"
        accentColor="#39cbe3"
      />

      {/* CTA Section */}
      <section className="py-24 px-8 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-8">
            ¿Listo para transformar tus <span className="italic">datos</span>?
          </h2>
          <a
            href="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest border border-white/20 px-8 py-4 hover:border-[#39cbe3] hover:text-[#39cbe3] transition-all duration-300 group"
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

