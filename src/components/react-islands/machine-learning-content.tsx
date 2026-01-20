"use client"

import { motion } from "framer-motion"
import ProjectsShowcase from "./projects-showcase"
import { Code2, BrainCircuit, Zap, Database, GitBranch, TrendingUp } from "lucide-react"

const mlProjects = [
  {
    id: "1",
    title: "Predicción de Deserción Estudiantil",
    description: "Modelo de clasificación usando Random Forest y XGBoost para predecir riesgo de deserción universitaria, integrando variables académicas, socioeconómicas y comportamentales con 89% de precisión",
    tags: ["Classification", "Random Forest", "Python", "Scikit-learn"],
    featured: true,
    thumbnail: "/proyectos/ml-desercion.png",
    type: "jupyter" as const,
    externalLink: "#"
  },
  {
    id: "2",
    title: "Sistema de Recomendación NLP",
    description: "Motor de recomendaciones basado en procesamiento de lenguaje natural y análisis de sentimientos para personalización de contenido educativo usando embeddings y transformers",
    tags: ["NLP", "Transformers", "Sentiment Analysis", "TensorFlow"],
    thumbnail: "/proyectos/ml-nlp.png",
    type: "github" as const,
    externalLink: "#"
  },
  {
    id: "3",
    title: "Clustering de Perfiles de Usuario",
    description: "Segmentación automática de usuarios mediante K-Means y DBSCAN para identificar patrones de comportamiento y optimizar estrategias de marketing dirigido",
    tags: ["Clustering", "K-Means", "Unsupervised Learning", "Python"],
    featured: true,
    thumbnail: "/proyectos/ml-clustering.png",
    type: "jupyter" as const,
    externalLink: "#"
  },
  {
    id: "4",
    title: "Detección de Anomalías en Series Temporales",
    description: "Implementación de autoencoders y LSTM para identificación de patrones anómalos en datos de sensores IoT con aplicación en mantenimiento predictivo",
    tags: ["Deep Learning", "LSTM", "Anomaly Detection", "Keras"],
    thumbnail: "/proyectos/ml-anomalias.png",
    type: "jupyter" as const,
    externalLink: "#"
  },
  {
    id: "5",
    title: "Clasificación de Imágenes CNN",
    description: "Red neuronal convolucional para clasificación multiclase de imágenes médicas usando transfer learning con ResNet50, alcanzando 92% de accuracy en validación",
    tags: ["CNN", "Transfer Learning", "Computer Vision", "PyTorch"],
    thumbnail: "/proyectos/ml-cnn.png",
    type: "github" as const,
    externalLink: "#"
  },
  {
    id: "6",
    title: "Chatbot Conversacional con LLMs",
    description: "Asistente virtual desarrollado con LangChain y modelos de lenguaje para atención al cliente automatizada, integrando RAG para consultas específicas del dominio",
    tags: ["LLMs", "LangChain", "NLP", "RAG"],
    featured: true,
    thumbnail: "/proyectos/ml-chatbot.png",
    type: "demo" as const,
    externalLink: "#"
  },
]

const expertise = [
  { 
    category: "Supervised Learning", 
    icon: TrendingUp,
    items: ["Regresión Lineal/Logística", "Random Forest", "SVM", "Gradient Boosting"],
    color: "#ef4444"
  },
  { 
    category: "Unsupervised Learning", 
    icon: GitBranch,
    items: ["K-Means", "DBSCAN", "PCA", "Anomaly Detection"],
    color: "#ef4444"
  },
  { 
    category: "Deep Learning", 
    icon: BrainCircuit,
    items: ["CNNs", "RNNs/LSTM", "Transformers", "Autoencoders"],
    color: "#ef4444"
  },
  { 
    category: "NLP & LLMs", 
    icon: Code2,
    items: ["Text Classification", "Sentiment Analysis", "NER", "LangChain"],
    color: "#ef4444"
  },
]

const frameworks = [
  { name: "TensorFlow", stack: "Deep Learning", color: "#ef4444" },
  { name: "PyTorch", stack: "Deep Learning", color: "#ef4444" },
  { name: "Scikit-learn", stack: "ML Clásico", color: "#ef4444" },
  { name: "Keras", stack: "Neural Networks", color: "#ef4444" },
  { name: "Hugging Face", stack: "NLP/Transformers", color: "#ef4444" },
  { name: "LangChain", stack: "LLM Applications", color: "#ef4444" },
]

const pipeline = [
  {
    step: "01",
    title: "Problem Definition",
    description: "Análisis del problema empresarial y definición de métricas de éxito",
    icon: Database
  },
  {
    step: "02",
    title: "Data Preparation",
    description: "Recolección, limpieza y feature engineering de datasets",
    icon: Code2
  },
  {
    step: "03",
    title: "Model Development",
    description: "Experimentación con múltiples algoritmos y optimización de hiperparámetros",
    icon: BrainCircuit
  },
  {
    step: "04",
    title: "Evaluation & Deployment",
    description: "Validación rigurosa y despliegue en producción con monitoreo continuo",
    icon: Zap
  },
]

export default function MachineLearningContent() {
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
            <BrainCircuit className="w-16 h-16 md:w-20 md:h-20 text-[#ef4444]" strokeWidth={1.5} />
          </motion.div>

          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">02 • INTELIGENCIA ARTIFICIAL</p>
          <h1 className="font-sans text-5xl md:text-7xl font-light tracking-tight mb-6">
            Machine <span className="italic text-[#ef4444]">Learning</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Desarrollando modelos inteligentes que aprenden, predicen y optimizan decisiones empresariales complejas
          </p>
        </motion.div>

        <a href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-[#ef4444] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          VOLVER
        </a>
      </section>

      {/* Expertise Grid */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 • ÁREAS DE EXPERTISE</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-16">
            Modelos y <span className="italic text-[#ef4444]">Algoritmos</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {expertise.map((area, index) => {
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

      {/* Frameworks */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 • STACK TECNOLÓGICO</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-16">
            Frameworks y <span className="italic text-[#ef4444]">Librerías</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group border border-white/10 p-6 hover:border-white/50 transition-all duration-300 text-center"
                style={{
                  borderColor: `${framework.color}40`
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = framework.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = `${framework.color}40`}
              >
                <p className="font-mono text-xs tracking-wider mb-2 transition-colors" style={{ color: framework.color }}>
                  {framework.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {framework.stack}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ML Pipeline */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">05 • METODOLOGÍA</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-16">
            Pipeline de <span className="italic text-[#ef4444]">Desarrollo</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((phase, index) => {
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
                  <div className="absolute -top-3 -left-3 w-12 h-12 border-2 border-[#ef4444] bg-[#0a0a0a] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-[#ef4444]">{phase.step}</span>
                  </div>

                  {/* Card */}
                  <div className="border border-white/10 p-6 pt-10 h-full hover:border-[#ef4444]/50 transition-all duration-300">
                    <Icon className="w-8 h-8 text-[#ef4444] mb-4" />
                    <h3 className="font-sans text-lg font-light mb-3">{phase.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  {/* Connecting Line (except last) */}
                  {index < pipeline.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#ef4444] to-transparent" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Projects Showcase */}
      <ProjectsShowcase 
        projects={mlProjects}
        title="Proyectos de"
        subtitle="ML & IA"
        sectionNumber="06 • PORTAFOLIO ML"
        accentColor="#ef4444"
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
            ¿Construimos algo <span className="italic text-[#ef4444]">inteligente</span>?
          </h2>
          <a
            href="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest border border-white/20 px-8 py-4 hover:border-[#ef4444] hover:text-[#ef4444] transition-all duration-300 group"
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


