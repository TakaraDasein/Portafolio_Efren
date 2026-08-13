"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  ArrowRight,
  Code2,
  Sigma,
  Database,
  Workflow,
  Table,
  Brain,
  BookOpen,
  GitCommit,
  Box,
  Boxes,
  Zap,
  Cloud,
  Briefcase,
  Users,
  BarChart3,
  Target,
  Activity,
  FileText,
  type LucideIcon,
} from "lucide-react"
import MiniChart, { type ChartType } from "./mini-charts"

type ApproachType = "technical" | "strategic"

interface MethodDetail {
  label: string
  chart: ChartType
  description: string
}

interface Stage {
  id: number
  phase: string
  title: string
  chart: ChartType
  description: string
  methods: MethodDetail[]
  tools: string[]
  color: string
}

type SelectedDetail =
  | { kind: "method"; label: string; chart: ChartType; description: string }
  | { kind: "tool"; label: string; icon: LucideIcon; description: string }

// Ficha compartida de cada herramienta: mismo ícono y descripción sin importar en qué etapa aparezca
const toolInfo: Record<string, { icon: LucideIcon; description: string }> = {
  "R": { icon: Sigma, description: "Lenguaje y entorno estadístico especializado en análisis de datos y visualización científica." },
  "Python": { icon: Code2, description: "Lenguaje de propósito general con el ecosistema más amplio para ciencia de datos e IA." },
  "SQL": { icon: Database, description: "Lenguaje estándar para consultar, transformar y gobernar datos relacionales." },
  "Airflow": { icon: Workflow, description: "Orquestador de flujos de trabajo para programar y monitorear pipelines de datos." },
  "Pandas": { icon: Table, description: "Librería de Python para manipulación y análisis de datos estructurados en memoria." },
  "NumPy": { icon: Sigma, description: "Librería base de computación numérica en Python, fundamento del stack científico." },
  "Scikit-learn": { icon: Brain, description: "Librería de machine learning clásico con algoritmos listos para producción." },
  "TensorFlow": { icon: Brain, description: "Framework de deep learning de Google para entrenar y desplegar redes neuronales a escala." },
  "PyTorch": { icon: Brain, description: "Framework de deep learning flexible, preferido en investigación y prototipado rápido." },
  "Keras": { icon: Brain, description: "API de alto nivel para construir redes neuronales de forma rápida y legible." },
  "Jupyter": { icon: BookOpen, description: "Entorno interactivo de notebooks para exploración, prototipado y documentación de análisis." },
  "MLflow": { icon: GitCommit, description: "Plataforma para rastrear experimentos, versionar modelos y gestionar su ciclo de vida." },
  "Docker": { icon: Box, description: "Empaqueta aplicaciones y sus dependencias en contenedores portables y reproducibles." },
  "Kubernetes": { icon: Boxes, description: "Orquesta y escala contenedores en producción de forma automatizada." },
  "FastAPI": { icon: Zap, description: "Framework de Python para exponer modelos y servicios como APIs de alto rendimiento." },
  "AWS SageMaker": { icon: Cloud, description: "Plataforma gestionada de AWS para entrenar, desplegar y monitorear modelos de ML." },
  "Excel": { icon: Table, description: "Hoja de cálculo universal para análisis rápido, reportes y prototipado de negocio." },
  "Business Tools": { icon: Briefcase, description: "Conjunto de herramientas internas para mapear necesidades y flujos del negocio." },
  "CRM Systems": { icon: Users, description: "Sistemas que centralizan datos de clientes para alinear ventas, marketing y soporte." },
  "Power Query": { icon: Workflow, description: "Motor de Microsoft para conectar, transformar y limpiar datos antes de analizarlos." },
  "Alteryx": { icon: Workflow, description: "Plataforma de preparación de datos con flujos visuales sin necesidad de código." },
  "Talend": { icon: Workflow, description: "Suite de integración y calidad de datos para entornos empresariales complejos." },
  "Informatica": { icon: Database, description: "Plataforma empresarial de gestión, integración y gobierno de datos a gran escala." },
  "Tableau": { icon: BarChart3, description: "Herramienta de visualización interactiva enfocada en exploración visual de datos." },
  "Power BI": { icon: BarChart3, description: "Suite de Microsoft para construir dashboards y reportes conectados en tiempo real." },
  "Looker": { icon: BarChart3, description: "Plataforma de BI moderna basada en un modelo de datos centralizado y gobernado." },
  "Google Analytics": { icon: TrendingUp, description: "Plataforma de analítica web para medir comportamiento y conversión de usuarios." },
  "Google Data Studio": { icon: BarChart3, description: "Herramienta gratuita de Google para construir reportes visuales compartibles." },
  "Business Cases": { icon: Briefcase, description: "Documentos que justifican inversiones en datos con impacto y retorno esperado." },
  "OKRs": { icon: Target, description: "Marco de objetivos y resultados clave para alinear iniciativas de datos con la estrategia." },
  "Analytics": { icon: Activity, description: "Disciplina de medir, interpretar y accionar sobre datos operativos y de negocio." },
  "Reporting Tools": { icon: FileText, description: "Herramientas para automatizar la generación y distribución de reportes recurrentes." },
}

const fallbackToolInfo = { icon: Boxes, description: "Herramienta utilizada en esta etapa del proceso." }

// Enfoque TÉCNICO - Ingenieros ML, Estadísticos, Analistas
const technicalStages: Stage[] = [
  {
    id: 1,
    phase: "Ingesta",
    title: "Arquitectura de Datos",
    chart: "bars",
    description: "Diseño de pipelines robustos para captura de datos a escala utilizando Python, SQL y sistemas distribuidos",
    methods: [
      { label: "Apache Kafka", chart: "pulse", description: "Sistema de mensajería distribuida que captura eventos en tiempo real con alta tolerancia a fallos, ideal para ingesta continua a gran escala." },
      { label: "Python ETL", chart: "line", description: "Scripts y frameworks en Python que extraen, transforman y cargan datos de forma programática y versionable." },
      { label: "PostgreSQL", chart: "bars", description: "Motor de base de datos relacional robusto, usado como destino confiable para datos estructurados de ingesta." },
      { label: "Apache Spark", chart: "network", description: "Motor de procesamiento distribuido que escala la ingesta y transformación de volúmenes masivos de datos." },
    ],
    tools: ["R", "Python", "SQL", "Airflow"],
    color: "#ffffff",
  },
  {
    id: 2,
    phase: "Transformación",
    title: "Feature Engineering",
    chart: "scatter",
    description: "Aplicación de matemáticas y estadística para crear características óptimas que maximicen el rendimiento del modelo",
    methods: [
      { label: "Normalización", chart: "gauge", description: "Escala las variables a rangos comparables para que ningún atributo domine el aprendizaje del modelo por su magnitud." },
      { label: "Encoding", chart: "compare", description: "Convierte variables categóricas en representaciones numéricas que los algoritmos puedan procesar." },
      { label: "Dimensionality Reduction", chart: "radar", description: "Reduce el número de variables conservando la información relevante, mejorando velocidad y generalización." },
      { label: "Data Wrangling", chart: "scatter", description: "Limpia, reestructura y enriquece datos crudos hasta dejarlos listos para el modelado." },
    ],
    tools: ["Pandas", "NumPy", "Scikit-learn", "R"],
    color: "#ffffff",
  },
  {
    id: 3,
    phase: "Modelado",
    title: "Machine Learning & IA",
    chart: "line",
    description: "Construcción de modelos predictivos mediante algoritmos avanzados, redes neuronales y métodos estadísticos",
    methods: [
      { label: "Deep Learning", chart: "network", description: "Redes neuronales profundas que aprenden representaciones jerárquicas directamente de los datos crudos." },
      { label: "Random Forest", chart: "bars", description: "Conjunto de árboles de decisión que combina sus votos para mejorar precisión y controlar el sobreajuste." },
      { label: "XGBoost", chart: "line", description: "Algoritmo de boosting optimizado para velocidad y rendimiento en competencias y producción." },
      { label: "Neural Networks", chart: "pulse", description: "Modelos inspirados en el cerebro que capturan relaciones no lineales complejas entre variables." },
    ],
    tools: ["TensorFlow", "PyTorch", "Keras", "Scikit-learn"],
    color: "#ffffff",
  },
  {
    id: 4,
    phase: "Validación",
    title: "Evaluación Técnica",
    chart: "compare",
    description: "Optimización de hiperparámetros y validación estadística para garantizar precisión y generalización del modelo",
    methods: [
      { label: "Cross-Validation", chart: "donut", description: "Divide los datos en múltiples particiones para estimar el desempeño del modelo de forma más confiable." },
      { label: "Grid Search", chart: "compare", description: "Explora sistemáticamente combinaciones de hiperparámetros para encontrar la configuración óptima." },
      { label: "Metrics Analysis", chart: "gauge", description: "Cuantifica el desempeño del modelo con métricas específicas al problema: precisión, recall, error, etc." },
      { label: "Backtesting", chart: "area", description: "Evalúa cómo se habría comportado el modelo con datos históricos antes de llevarlo a producción." },
    ],
    tools: ["Python", "R", "Jupyter", "MLflow"],
    color: "#ffffff",
  },
  {
    id: 5,
    phase: "Deployment",
    title: "Producción & MLOps",
    chart: "pulse",
    description: "Implementación de modelos en producción con monitoreo continuo y pipelines automatizados",
    methods: [
      { label: "CI/CD", chart: "network", description: "Automatiza pruebas y despliegues del modelo cada vez que el código o los datos cambian." },
      { label: "Model Serving", chart: "pulse", description: "Expone el modelo entrenado para que otras aplicaciones consuman predicciones en tiempo real." },
      { label: "API Development", chart: "line", description: "Construye interfaces estandarizadas para integrar el modelo con sistemas externos de forma segura." },
      { label: "Monitoring", chart: "gauge", description: "Vigila continuamente el rendimiento y la deriva del modelo para detectar degradación a tiempo." },
    ],
    tools: ["Docker", "Kubernetes", "FastAPI", "AWS SageMaker"],
    color: "#ffffff",
  },
]

// Enfoque ESTRATÉGICO - BI Professionals, Gerentes de Proyectos
const strategicStages: Stage[] = [
  {
    id: 1,
    phase: "Recolección",
    title: "Estrategia de Datos",
    chart: "bars",
    description: "Identificación de fuentes clave alineadas con objetivos empresariales y KPIs organizacionales",
    methods: [
      { label: "Stakeholder Mapping", chart: "network", description: "Identifica quién depende de los datos y qué decisiones dependen de ellos, para priorizar correctamente." },
      { label: "Business Analysis", chart: "bars", description: "Traduce objetivos de negocio en preguntas de datos concretas y medibles." },
      { label: "Data Discovery", chart: "scatter", description: "Explora qué fuentes de datos existen realmente en la organización y en qué estado se encuentran." },
      { label: "Requirements Gathering", chart: "compare", description: "Define con claridad qué necesita cada área antes de construir cualquier solución de datos." },
    ],
    tools: ["SQL", "Excel", "Business Tools", "CRM Systems"],
    color: "#ffffff",
  },
  {
    id: 2,
    phase: "Procesamiento",
    title: "Limpieza & Gobernanza",
    chart: "scatter",
    description: "Garantizar calidad y cumplimiento de datos para soportar decisiones críticas de negocio",
    methods: [
      { label: "Data Quality", chart: "gauge", description: "Mide y corrige inconsistencias, duplicados y valores faltantes para que los datos sean confiables." },
      { label: "Governance", chart: "network", description: "Define quién puede acceder, modificar y ser responsable de cada dato dentro de la organización." },
      { label: "Compliance", chart: "donut", description: "Asegura que el manejo de los datos cumple normativas legales y estándares del sector." },
      { label: "Master Data Management", chart: "compare", description: "Unifica las versiones de una misma entidad (cliente, producto) en una sola fuente de verdad." },
    ],
    tools: ["Power Query", "Alteryx", "Talend", "Informatica"],
    color: "#ffffff",
  },
  {
    id: 3,
    phase: "Análisis",
    title: "Business Intelligence",
    chart: "compare",
    description: "Interpretación de patrones y tendencias para identificar oportunidades de mejora en operaciones y finanzas",
    methods: [
      { label: "Trend Analysis", chart: "line", description: "Identifica patrones de comportamiento a lo largo del tiempo para anticipar cambios en el negocio." },
      { label: "Cohort Analysis", chart: "compare", description: "Compara grupos de usuarios según su momento de entrada para entender retención y comportamiento." },
      { label: "Financial Modeling", chart: "area", description: "Proyecta escenarios financieros a partir de supuestos y datos históricos de la operación." },
      { label: "Market Research", chart: "scatter", description: "Recoge y analiza información del mercado y la competencia para orientar decisiones estratégicas." },
    ],
    tools: ["Tableau", "Power BI", "Looker", "Google Analytics"],
    color: "#ffffff",
  },
  {
    id: 4,
    phase: "Visualización",
    title: "Storytelling de Datos",
    chart: "area",
    description: "Comunicación efectiva de insights mediante dashboards ejecutivos que impulsan la estrategia empresarial",
    methods: [
      { label: "Executive Dashboards", chart: "bars", description: "Resume los indicadores más críticos del negocio en una sola vista para la toma de decisiones rápida." },
      { label: "KPI Monitoring", chart: "gauge", description: "Da seguimiento continuo a los indicadores clave para detectar desviaciones a tiempo." },
      { label: "Report Automation", chart: "pulse", description: "Elimina el trabajo manual repetitivo generando reportes de forma programada y consistente." },
      { label: "Data Presentation", chart: "network", description: "Comunica hallazgos complejos de forma clara para audiencias no técnicas." },
    ],
    tools: ["Power BI", "Tableau", "Google Data Studio", "Excel"],
    color: "#ffffff",
  },
  {
    id: 5,
    phase: "Acción",
    title: "Impacto Empresarial",
    chart: "gauge",
    description: "Maximizar información para guiar operaciones, I+D y decisiones estratégicas con ROI medible",
    methods: [
      { label: "Strategic Planning", chart: "radar", description: "Traduce los hallazgos de datos en iniciativas concretas alineadas con los objetivos de la empresa." },
      { label: "ROI Analysis", chart: "area", description: "Cuantifica el retorno económico generado por las iniciativas basadas en datos." },
      { label: "Change Management", chart: "network", description: "Acompaña a los equipos en la adopción de decisiones y procesos basados en datos." },
      { label: "Performance Optimization", chart: "gauge", description: "Ajusta procesos operativos de forma continua a partir de la evidencia que arrojan los datos." },
    ],
    tools: ["Business Cases", "OKRs", "Analytics", "Reporting Tools"],
    color: "#ffffff",
  },
]

export default function DataLifecycle({ accentColor = "#ffffff" }: { accentColor?: string }) {
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const [approach, setApproach] = useState<ApproachType>("strategic")
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null)

  const lifecycleStages = approach === "technical" ? technicalStages : strategicStages

  const selectStage = (id: number | null) => {
    setActiveStage(id)
    setSelectedDetail(null)
  }

  const selectMethod = (method: MethodDetail) => {
    setSelectedDetail((prev) =>
      prev?.kind === "method" && prev.label === method.label
        ? null
        : { kind: "method", label: method.label, chart: method.chart, description: method.description },
    )
  }

  const selectTool = (toolLabel: string) => {
    const info = toolInfo[toolLabel] ?? fallbackToolInfo
    setSelectedDetail((prev) =>
      prev?.kind === "tool" && prev.label === toolLabel
        ? null
        : { kind: "tool", label: toolLabel, icon: info.icon, description: info.description },
    )
  }

  return (
    <section id="ciclo-datos" className="relative py-24 md:py-32 px-8 md:px-12 bg-[#0a0a0a] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent origin-left"
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mb-16 md:mb-24 z-10"
      >
        <h2 className="font-sans text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
          Ciclo de Vida del <span className="italic text-accent">Dato</span>
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
              className="absolute inset-y-0 w-1/2 bg-accent/20 border-2 border-accent"
              animate={{
                x: approach === "technical" ? 0 : "100%",
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <button
              onClick={() => {
                setApproach("technical")
                selectStage(null)
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
                selectStage(null)
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
          className="mt-6 p-4 border-l-2 border-accent bg-white/5"
        >
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {approach === "technical" ? (
              <>
                <span className="text-accent font-medium">Perfil Técnico:</span> Ingenieros de Machine Learning, Estadísticos y Analistas de Datos expertos.
                Especialización en matemáticas, estadística e informática para crear modelos predictivos y extraer valor de conjuntos de datos empresariales
                mediante herramientas como R, Python, TensorFlow y Scikit-learn.
              </>
            ) : (
              <>
                <span className="text-accent font-medium">Perfil Estratégico:</span> Profesionales de Business Intelligence y Gerentes de Proyectos Técnicos.
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
        <div className="hidden xl:block">
          {/* Timeline */}
          <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
            <div className="grid grid-cols-5 gap-4 relative">
              {lifecycleStages.map((stage) => {
                const isActive = activeStage === stage.id
                const isHovered = hoveredStage === stage.id
                return (
                  <div key={`tl-${stage.id}`} className="flex items-center justify-center">
                    <motion.span
                      animate={{
                        borderColor: isActive || isHovered ? "var(--accent)" : "rgba(255,255,255,0.15)",
                        color: isActive || isHovered ? "var(--accent)" : "rgba(255,255,255,0.4)",
                        scale: isActive || isHovered ? 1.1 : 1,
                      }}
                      className="relative z-10 flex h-8 w-8 items-center justify-center border-2 bg-[#0a0a0a] font-mono text-xs font-bold"
                    >
                      {stage.id}
                    </motion.span>
                  </div>
                )
              })}
            </div>
          </div>

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
                  className="relative h-0.5 bg-white/10 origin-left overflow-visible"
                  style={{
                    width: `calc(${100 / (lifecycleStages.length - 1)}% - 8rem)`,
                    marginRight: '8rem'
                  }}
                >
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                    initial={{ left: "0%", opacity: 0 }}
                    animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.6 + index * 0.35 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-5 gap-4">
              {lifecycleStages.map((stage, index) => {
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
                    onClick={() => selectStage(isActive ? null : stage.id)}
                    className="cursor-pointer group"
                  >
                    {/* Stage Card */}
                    <div className="relative">
                      {/* Icon Container */}
                      <motion.div
                        animate={{
                          scale: isHovered || isActive ? 1.05 : 1,
                          borderColor: isHovered || isActive ? "var(--accent)" : "rgba(255,255,255,0.1)",
                        }}
                        className="relative w-40 h-40 mx-auto mb-6 border-2 bg-[#0a0a0a] flex items-center justify-center p-5"
                      >
                        <MiniChart
                          type={stage.chart}
                          size={92}
                          active={isHovered || isActive}
                          color={isHovered || isActive ? "var(--accent)" : "rgba(255,255,255,0.5)"}
                        />
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
                  const DetailIcon = selectedDetail?.kind === "tool" ? selectedDetail.icon : null

                  return (
                    <div
                      className="border-2 bg-[#0a0a0a] p-8 md:p-12"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      <div className="grid xl:grid-cols-2 gap-8 md:gap-12 items-center">
                        {/* Left: Large Animation */}
                        <div
                          className="flex items-center justify-center border border-white/10 bg-white/[0.02] p-8 md:h-80"
                          style={{ borderColor: "rgba(255,255,255,0.1)" }}
                        >
                          <AnimatePresence mode="wait">
                            {selectedDetail?.kind === "method" ? (
                              <motion.div
                                key={`method-${selectedDetail.label}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25 }}
                              >
                                <MiniChart type={selectedDetail.chart} size={180} active color="var(--accent)" />
                              </motion.div>
                            ) : DetailIcon ? (
                              <motion.div
                                key={`tool-${selectedDetail!.label}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25 }}
                              >
                                <DetailIcon size={110} strokeWidth={1} style={{ color: "var(--accent)" }} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="stage-default"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25 }}
                              >
                                <MiniChart type={stage.chart} size={180} active color="var(--accent)" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Right: Title + Text + Methods */}
                        <div>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedDetail ? `${selectedDetail.kind}-${selectedDetail.label}` : "stage-default"}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-1">
                                {selectedDetail
                                  ? `${stage.phase} · ${selectedDetail.kind === "method" ? "Método" : "Herramienta"}`
                                  : stage.phase}
                              </p>
                              <h3 className="font-sans text-2xl md:text-3xl font-light mb-4">
                                {selectedDetail ? selectedDetail.label : stage.title}
                              </h3>
                              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                                {selectedDetail ? selectedDetail.description : stage.description}
                              </p>
                            </motion.div>
                          </AnimatePresence>

                          <p className="font-mono text-xs tracking-widest text-muted-foreground mb-4 uppercase">
                            {approach === "technical" ? "Herramientas & Frameworks" : "Métodos & Estrategias"}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {stage.methods.map((method, idx) => {
                              const isSelected =
                                selectedDetail?.kind === "method" && selectedDetail.label === method.label
                              return (
                                <motion.button
                                  key={method.label}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  onClick={() => selectMethod(method)}
                                  className={`flex items-center gap-2 border px-3 py-2 transition-colors text-left ${
                                    isSelected
                                      ? "bg-white/10"
                                      : "border-white/10 bg-white/5 hover:border-white/30"
                                  }`}
                                  style={isSelected ? { borderColor: "var(--accent)" } : undefined}
                                >
                                  <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "var(--accent)" }} />
                                  <span className="font-mono text-xs">{method.label}</span>
                                </motion.button>
                              )
                            })}
                          </div>
                          {stage.tools && (
                            <div className="mt-4">
                              <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2 uppercase">
                                Stack Principal
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {stage.tools.map((tool) => {
                                  const info = toolInfo[tool] ?? fallbackToolInfo
                                  const ToolIcon = info.icon
                                  const isSelected =
                                    selectedDetail?.kind === "tool" && selectedDetail.label === tool
                                  return (
                                    <button
                                      key={tool}
                                      onClick={() => selectTool(tool)}
                                      className={`flex items-center gap-2 font-mono text-[10px] px-2 py-2 border transition-colors text-left ${
                                        isSelected
                                          ? "bg-white/10 text-white"
                                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                                      }`}
                                      style={isSelected ? { borderColor: "var(--accent)" } : undefined}
                                    >
                                      <ToolIcon className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{tool}</span>
                                    </button>
                                  )
                                })}
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
        <div className="xl:hidden space-y-6">
          {lifecycleStages.map((stage, index) => {
            const isActive = activeStage === stage.id
            const detail = isActive ? selectedDetail : null
            const DetailIcon = detail?.kind === "tool" ? detail.icon : null

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => selectStage(isActive ? null : stage.id)}
                className="cursor-pointer"
              >
                <div
                  className="border-2 bg-[#0a0a0a] p-6 transition-all duration-300"
                  style={{
                    borderColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.1)"
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 border-2 flex items-center justify-center flex-shrink-0 p-2"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      {detail?.kind === "method" ? (
                        <MiniChart type={detail.chart} size={48} active color="var(--accent)" />
                      ) : DetailIcon ? (
                        <DetailIcon size={32} strokeWidth={1} style={{ color: "var(--accent)" }} />
                      ) : (
                        <MiniChart type={stage.chart} size={48} active color="var(--accent)" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          0{stage.id}
                        </span>
                        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                          {stage.phase}
                        </span>
                      </div>
                      <h3 className="font-sans text-xl font-light">
                        {detail ? detail.label : stage.title}
                      </h3>
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
                          {detail ? detail.description : stage.description}
                        </p>

                        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2 uppercase">
                          {approach === "technical" ? "Herramientas & Frameworks" : "Métodos & Estrategias"}
                        </p>
                        <div className="space-y-2 mb-4">
                          {stage.methods.map((method) => {
                            const isSelected = detail?.kind === "method" && detail.label === method.label
                            return (
                              <button
                                key={method.label}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectMethod(method)
                                }}
                                className={`w-full flex items-center gap-2 border px-3 py-2 transition-colors text-left ${
                                  isSelected ? "bg-white/10" : "border-white/10 bg-white/5"
                                }`}
                                style={isSelected ? { borderColor: "var(--accent)" } : undefined}
                              >
                                <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "var(--accent)" }} />
                                <span className="font-mono text-xs">{method.label}</span>
                              </button>
                            )
                          })}
                        </div>

                        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2 uppercase">
                          Stack Principal
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {stage.tools.map((tool) => {
                            const info = toolInfo[tool] ?? fallbackToolInfo
                            const ToolIcon = info.icon
                            const isSelected = detail?.kind === "tool" && detail.label === tool
                            return (
                              <button
                                key={tool}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectTool(tool)
                                }}
                                className={`flex items-center gap-2 font-mono text-[10px] px-2 py-2 border transition-colors text-left ${
                                  isSelected ? "bg-white/10 text-white" : "bg-white/5 border-white/10 text-white/70"
                                }`}
                                style={isSelected ? { borderColor: "var(--accent)" } : undefined}
                              >
                                <ToolIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate">{tool}</span>
                              </button>
                            )
                          })}
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
