"use client"

import { motion } from "framer-motion"


export default function Content() {
  const expertise = [
    { category: "Supervised Learning", items: ["RegresiÃ³n Lineal", "Random Forest", "SVM", "Neural Networks"] },
    { category: "Unsupervised Learning", items: ["K-Means", "PCA", "Clustering", "Anomaly Detection"] },
    { category: "Deep Learning", items: ["CNNs", "RNNs", "Transformers", "GANs"] },
    { category: "NLP", items: ["Text Classification", "Sentiment Analysis", "Named Entity Recognition", "LLMs"] },
  ]

  const frameworks = [
    { name: "TensorFlow", icon: "ðŸ§ " },
    { name: "PyTorch", icon: "ðŸ”¥" },
    { name: "Scikit-learn", icon: "ðŸ”¬" },
    { name: "Keras", icon: "âš¡" },
    { name: "Hugging Face", icon: "ðŸ¤—" },
    { name: "LangChain", icon: "ðŸ¦œ" },
  ]

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </motion.div>

          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">02 â€” INTELIGENCIA ARTIFICIAL</p>
          <h1 className="font-sans text-5xl md:text-7xl font-light tracking-tight mb-6">
            Machine <span className="italic">Learning</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Desarrollando modelos inteligentes que aprenden y evolucionan para resolver problemas complejos
          </p>
        </motion.div>

        <a href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-2"
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
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 â€” ÃREAS DE EXPERTISE</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16">Modelos y Algoritmos</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {expertise.map((area, index) => (
              <motion.div
                key={area.category}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group border border-white/10 p-8 hover:border-cyan-500/50 transition-all duration-300 relative"
              >
                <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <h3 className="font-sans text-2xl font-light mb-6 group-hover:text-cyan-500 transition-colors">
                  {area.category}
                </h3>
                <ul className="space-y-3">
                  {area.items.map((item) => (
                    <li key={item} className="font-mono text-sm text-muted-foreground flex items-center gap-3">
                      <span className="w-1 h-1 bg-cyan-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
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
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 â€” STACK TECNOLÃ“GICO</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16">Frameworks y LibrerÃ­as</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group border border-white/10 p-6 hover:border-cyan-500 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {framework.icon}
                </div>
                <p className="font-mono text-xs tracking-wider group-hover:text-cyan-500 transition-colors">
                  {framework.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4 text-center">05 â€” METODOLOGÃA</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16 text-center">Pipeline de Desarrollo</h2>

          <div className="space-y-8">
            {[
              { step: "01", title: "DefiniciÃ³n del Problema", desc: "AnÃ¡lisis de requisitos y objetivos del negocio" },
              { step: "02", title: "PreparaciÃ³n de Datos", desc: "Limpieza, transformaciÃ³n y feature engineering" },
              { step: "03", title: "Modelado", desc: "SelecciÃ³n y entrenamiento de algoritmos" },
              { step: "04", title: "EvaluaciÃ³n", desc: "ValidaciÃ³n de mÃ©tricas y optimizaciÃ³n de hiperparÃ¡metros" },
              { step: "05", title: "Deployment", desc: "ImplementaciÃ³n y monitoreo en producciÃ³n" },
            ].map((phase, index) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex gap-6 items-start border-l-2 border-white/10 pl-6 hover:border-cyan-500 transition-colors duration-300 group"
              >
                <span className="font-mono text-xs text-cyan-500 min-w-[3rem]">{phase.step}</span>
                <div>
                  <h3 className="font-sans text-xl md:text-2xl font-light mb-2 group-hover:text-cyan-500 transition-colors">
                    {phase.title}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">{phase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
            Construyamos el <span className="italic">futuro</span> juntos
          </h2>
          <a href="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest border border-white/20 px-8 py-4 hover:border-cyan-500 hover:text-cyan-500 transition-all duration-300 group"
          >
            INICIAR PROYECTO
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


