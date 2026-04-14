"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Database, TrendingUp, BarChart3, Lightbulb, CheckCircle2, ArrowRight, Code2, BrainCircuit } from "lucide-react"

type ApproachType = "technical" | "strategic"

// Enfoque TÉCNICO - Ingenieros ML, Estadísticos, Analistas
const technicalStages = [
  {
    id: 1,
    phase: "Ingesta",
    title: "Arquitectura de Datos",
    icon: Database,
    description: "Diseño de pipelines robustos para captura de datos a escala utilizando Python, SQL y sistemas distribuidos",
    methods: ["Apache Kafka", "Python ETL", "PostgreSQL", "Apache Spark"],
    tools: ["R", "Python", "SQL", "Airflow"],
    color: "#39cbe3",
  },
  {
    id: 2,
    phase: "Transformación",
    title: "Feature Engineering",
    icon: CheckCircle2,
    description: "Aplicación de matemáticas y estadística para crear características óptimas que maximicen el rendimiento del modelo",
    methods: ["Normalización", "Encoding", "Dimensionality Reduction", "Data Wrangling"],
    tools: ["Pandas", "NumPy", "Scikit-learn", "R"],
    color: "#39cbe3",
  },
  {
    id: 3,
    phase: "Modelado",
    title: "Machine Learning & IA",
    icon: BrainCircuit,
    description: "Construcción de modelos predictivos mediante algoritmos avanzados, redes neuronales y métodos estadísticos",
    methods: ["Deep Learning", "Random Forest", "XGBoost", "Neural Networks"],
    tools: ["TensorFlow", "PyTorch", "Keras", "Scikit-learn"],
    color: "#39cbe3",
  },
  {
    id: 4,
    phase: "Validación",
    title: "Evaluación Técnica",
    icon: BarChart3,
    description: "Optimización de hiperparámetros y validación estadística para garantizar precisión y generalización del modelo",
    methods: ["Cross-Validation", "Grid Search", "Metrics Analysis", "Backtesting"],
    tools: ["Python", "R", "Jupyter", "MLflow"],
    color: "#39cbe3",
  },
  {
    id: 5,
    phase: "Deployment",
    title: "Producción & MLOps",
    icon: Code2,
    description: "Implementación de modelos en producción con monitoreo continuo y pipelines automatizados",
    methods: ["CI/CD", "Model Serving", "API Development", "Monitoring"],
    tools: ["Docker", "Kubernetes", "FastAPI", "AWS SageMaker"],
    color: "#39cbe3",
  },
]

// Enfoque ESTRATÉGICO - BI Professionals, Gerentes de Proyectos
const strategicStages = [
  {
    id: 1,
    phase: "Recolección",
    title: "Estrategia de Datos",
    icon: Database,
    description: "Identificación de fuentes clave alineadas con objetivos empresariales y KPIs organizacionales",
    methods: ["Stakeholder Mapping", "Business Analysis", "Data Discovery", "Requirements Gathering"],
    tools: ["SQL", "Excel", "Business Tools", "CRM Systems"],
    color: "#39cbe3",
  },
  {
    id: 2,
    phase: "Procesamiento",
    title: "Limpieza & Gobernanza",
    icon: CheckCircle2,
    description: "Garantizar calidad y cumplimiento de datos para soportar decisiones críticas de negocio",
    methods: ["Data Quality", "Governance", "Compliance", "Master Data Management"],
    tools: ["Power Query", "Alteryx", "Talend", "Informatica"],
    color: "#39cbe3",
  },
  {
    id: 3,
    phase: "Análisis",
    title: "Business Intelligence",
    icon: BarChart3,
    description: "Interpretación de patrones y tendencias para identificar oportunidades de mejora en operaciones y finanzas",
    methods: ["Trend Analysis", "Cohort Analysis", "Financial Modeling", "Market Research"],
    tools: ["Tableau", "Power BI", "Looker", "Google Analytics"],
    color: "#39cbe3",
  },
  {
    id: 4,
    phase: "Visualización",
    title: "Storytelling de Datos",
    icon: TrendingUp,
    description: "Comunicación efectiva de insights mediante dashboards ejecutivos que impulsan la estrategia empresarial",
    methods: ["Executive Dashboards", "KPI Monitoring", "Report Automation", "Data Presentation"],
    tools: ["Power BI", "Tableau", "Google Data Studio", "Excel"],
    color: "#39cbe3",
  },
  {
    id: 5,
    phase: "Acción",
    title: "Impacto Empresarial",
    icon: Lightbulb,
    description: "Maximizar información para guiar operaciones, I+D y decisiones estratégicas con ROI medible",
    methods: ["Strategic Planning", "ROI Analysis", "Change Management", "Performance Optimization"],
    tools: ["Business Cases", "OKRs", "Analytics", "Reporting Tools"],
    color: "#39cbe3",
  },
]

export default function DataLifecycle() {
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const [approach, setApproach] = useState<ApproachType>("strategic")

  const lifecycleStages = approach === "technical" ? technicalStages : strategicStages

  return (
    <section className="relative py-24 md:py-32 px-8 md:px-12 bg-[#0a0a0a] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#39cbe3] to-transparent origin-left"
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mb-16 md:mb-24 z-10"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 • METODOLOGÍA</p>
        <h2 className="font-sans text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
          Ciclo de Vida del <span className="italic text-[#39cbe3]">Dato</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mb-8">
          {approach === "technical" 
            ? "Ingeniería de Machine Learning y estadística avanzada: creando modelos predictivos con R, Python y frameworks de IA"
            : "Business Intelligence y gestión estratégica: transformando información en decisiones que impulsan el negocio"
          }
        </p>

        {/* Approach Toggle */}
        <div className="flex items-center gap-4 mt-8">
          <span className="font-mono text-xs tracking-wider text-muted-foreground">ENFOQUE:</span>
          <div className="relative inline-flex border-2 border-white/10 bg-[#0a0a0a]">
            <motion.div
              className="absolute inset-y-0 w-1/2 bg-[#39cbe3]/20 border-2 border-[#39cbe3]"
              animate={{
                x: approach === "technical" ? 0 : "100%",
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <button
              onClick={() => {
                setApproach("technical")
                setActiveStage(null)
              }}
              className={`relative z-10 px-6 py-3 font-mono text-xs tracking-wider transition-colors ${
                approach === "technical" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <Code2 className="inline-block w-4 h-4 mr-2" />
              TÉCNICO
            </button>
            <button
              onClick={() => {
                setApproach("strategic")
                setActiveStage(null)
              }}
              className={`relative z-10 px-6 py-3 font-mono text-xs tracking-wider transition-colors ${
                approach === "strategic" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <TrendingUp className="inline-block w-4 h-4 mr-2" />
              ESTRATÉGICO
            </button>
          </div>
        </div>

        {/* Approach Description */}
        <motion.div
          key={approach}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 p-4 border-l-2 border-[#39cbe3] bg-white/5"
        >
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {approach === "technical" ? (
              <>
                <span className="text-[#39cbe3] font-medium">Perfil Técnico:</span> Ingenieros de Machine Learning, Estadísticos y Analistas de Datos expertos. 
                Especialización en matemáticas, estadística e informática para crear modelos predictivos y extraer valor de conjuntos de datos empresariales 
                mediante herramientas como R, Python, TensorFlow y Scikit-learn.
              </>
            ) : (
              <>
                <span className="text-[#39cbe3] font-medium">Perfil Estratégico:</span> Profesionales de Business Intelligence y Gerentes de Proyectos Técnicos. 
                Interpretación de información para operaciones, finanzas e I+D. Maximizan insights para guiar la estrategia empresarial 
                mediante dashboards ejecutivos, análisis de tendencias y gestión del cambio.
              </>
            )}
          </p>
        </motion.div>
      </motion.div>

      {/* Interactive Lifecycle Flow */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={approach}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
        {/* Desktop: Horizontal Flow */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-20 left-0 right-0 flex items-center justify-between px-12">
              {lifecycleStages.slice(0, -1).map((stage, index) => (
                <motion.div
                  key={`line-${stage.id}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-0.5 bg-white/10 origin-left"
                  style={{ 
                    width: `calc(${100 / (lifecycleStages.length - 1)}% - 8rem)`,
                    marginRight: '8rem'
                  }}
                />
              ))}
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-5 gap-4">
              {lifecycleStages.map((stage, index) => {
                const Icon = stage.icon
                const isActive = activeStage === stage.id
                const isHovered = hoveredStage === stage.id

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredStage(stage.id)}
                    onHoverEnd={() => setHoveredStage(null)}
                    onClick={() => setActiveStage(isActive ? null : stage.id)}
                    className="cursor-pointer group"
                  >
                    {/* Stage Card */}
                    <div className="relative">
                      {/* Icon Container */}
                      <motion.div
                        animate={{
                          scale: isHovered || isActive ? 1.05 : 1,
                          borderColor: isHovered || isActive ? stage.color : "rgba(255,255,255,0.1)",
                        }}
                        className="relative w-32 h-32 mx-auto mb-6 border-2 bg-[#0a0a0a] flex items-center justify-center"
                      >
                        <motion.div
                          animate={{
                            rotate: isHovered ? 360 : 0,
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon 
                            className="w-12 h-12" 
                            style={{ 
                              color: isHovered || isActive ? stage.color : "rgba(255,255,255,0.5)" 
                            }}
                          />
                        </motion.div>

                        {/* Phase Number */}
                        <span 
                          className="absolute -top-3 -right-3 w-8 h-8 border-2 bg-[#0a0a0a] flex items-center justify-center font-mono text-xs font-bold"
                          style={{ 
                            borderColor: stage.color,
                            color: stage.color 
                          }}
                        >
                          {stage.id}
                        </span>
                      </motion.div>

                      {/* Text Content */}
                      <div className="text-center space-y-2">
                        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          {stage.phase}
                        </p>
                        <h3 className="font-sans text-sm font-light tracking-tight">
                          {stage.title}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Expanded Details Panel */}
          <AnimatePresence mode="wait">
            {activeStage && (
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 48 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                {(() => {
                  const stage = lifecycleStages.find(s => s.id === activeStage)!
                  const Icon = stage.icon
                  
                  return (
                    <div 
                      className="border-2 bg-[#0a0a0a] p-8 md:p-12"
                      style={{ borderColor: stage.color }}
                    >
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Left: Details */}
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <Icon className="w-8 h-8" style={{ color: stage.color }} />
                            <div>
                              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                                {stage.phase}
                              </p>
                              <h3 className="font-sans text-2xl md:text-3xl font-light">
                                {stage.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-lg text-muted-foreground font-light leading-relaxed">
                            {stage.description}
                          </p>
                        </div>

                        {/* Right: Methods */}
                        <div>
                          <p className="font-mono text-xs tracking-widest text-muted-foreground mb-4 uppercase">
                            {approach === "technical" ? "Herramientas & Frameworks" : "Métodos & Estrategias"}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {stage.methods.map((method, idx) => (
                              <motion.div
                                key={method}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 group hover:border-white/30 transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" style={{ color: stage.color }} />
                                <span className="font-mono text-xs">{method}</span>
                              </motion.div>
                            ))}
                          </div>
                          {stage.tools && (
                            <div className="mt-4">
                              <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2 uppercase">
                                Stack Principal
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {stage.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="font-mono text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-white/70"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="md:hidden space-y-6">
          {lifecycleStages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = activeStage === stage.id

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActiveStage(isActive ? null : stage.id)}
                className="cursor-pointer"
              >
                <div 
                  className="border-2 bg-[#0a0a0a] p-6 transition-all duration-300"
                  style={{ 
                    borderColor: isActive ? stage.color : "rgba(255,255,255,0.1)" 
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-16 h-16 border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: stage.color }}
                    >
                      <Icon className="w-8 h-8" style={{ color: stage.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="font-mono text-xs font-bold"
                          style={{ color: stage.color }}
                        >
                          0{stage.id}
                        </span>
                        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                          {stage.phase}
                        </span>
                      </div>
                      <h3 className="font-sans text-xl font-light">{stage.title}</h3>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {stage.description}
                        </p>
                        <div className="space-y-2">
                          {stage.methods.map((method) => (
                            <div
                              key={method}
                              className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2"
                            >
                              <ArrowRight className="w-3 h-3" style={{ color: stage.color }} />
                              <span className="font-mono text-xs">{method}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
        </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-16 md:mt-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
      />
    </section>
  )
}
