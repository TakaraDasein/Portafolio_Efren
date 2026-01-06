"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function MedioAmbienteSociedad() {
  const initiatives = [
    {
      title: "Análisis de Huella de Carbono",
      description: "Modelos predictivos para medir y reducir emisiones empresariales",
      impact: "30% reducción promedio",
      icon: "🌱",
    },
    {
      title: "Optimización de Recursos Hídricos",
      description: "Machine Learning para gestión eficiente del agua en agricultura",
      impact: "40% ahorro de agua",
      icon: "💧",
    },
    {
      title: "Energías Renovables",
      description: "Predicción de generación solar y eólica mediante IA",
      impact: "25% mejor rendimiento",
      icon: "⚡",
    },
    {
      title: "Biodiversidad Urbana",
      description: "Análisis de datos para preservación de ecosistemas urbanos",
      impact: "15 especies protegidas",
      icon: "🌿",
    },
  ]

  const sdgs = [
    { number: 7, name: "Energía Asequible y No Contaminante" },
    { number: 11, name: "Ciudades y Comunidades Sostenibles" },
    { number: 12, name: "Producción y Consumo Responsable" },
    { number: 13, name: "Acción por el Clima" },
    { number: 15, name: "Vida de Ecosistemas Terrestres" },
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>

          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 — IMPACTO SOSTENIBLE</p>
          <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            Medio Ambiente y <span className="italic">Sociedad</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Aplicando ciencia de datos para crear un futuro más sostenible y equitativo
          </p>
        </motion.div>

        <Link
          href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          VOLVER
        </Link>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-sans text-3xl md:text-5xl font-light mb-8 leading-relaxed">
            Los datos tienen el poder de <span className="italic text-cyan-500">cambiar el mundo</span>. 
            Usémoslos para proteger nuestro planeta y mejorar vidas.
          </h2>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl mx-auto">
            Cada proyecto es una oportunidad para generar impacto positivo en el medio ambiente y la sociedad.
          </p>
        </motion.div>
      </section>

      {/* Initiatives */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 — INICIATIVAS</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16">Proyectos con Propósito</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group border border-white/10 p-8 hover:border-cyan-500/50 transition-all duration-300 relative"
              >
                <div className="absolute -top-4 -left-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {initiative.icon}
                </div>
                
                <div className="relative">
                  <h3 className="font-sans text-2xl font-light mb-4 group-hover:text-cyan-500 transition-colors">
                    {initiative.title}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground mb-6">
                    {initiative.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className="font-mono text-xs text-cyan-500 tracking-wider">
                      {initiative.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SDG Alignment */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">05 — ALINEACIÓN</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16">
            Objetivos de Desarrollo Sostenible
          </h2>

          <div className="max-w-4xl space-y-6">
            {sdgs.map((sdg, index) => (
              <motion.div
                key={sdg.number}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group flex items-center gap-6 border-l-2 border-white/10 pl-6 py-4 hover:border-cyan-500 transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 border border-white/20 group-hover:border-cyan-500 transition-colors">
                  <span className="font-sans text-2xl font-light group-hover:text-cyan-500 transition-colors">
                    {sdg.number}
                  </span>
                </div>
                <p className="font-mono text-sm md:text-base group-hover:text-cyan-500 transition-colors">
                  {sdg.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Impact Metrics */}
      <section className="py-24 px-8 md:px-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4 text-center">06 — IMPACTO MEDIBLE</p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-16 text-center">Números que Importan</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "12+", label: "Proyectos Sostenibles" },
              { value: "500T", label: "CO₂ Reducido" },
              { value: "25K", label: "Personas Impactadas" },
              { value: "8", label: "Organizaciones" },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center border border-white/10 p-6 hover:border-cyan-500 transition-colors group"
              >
                <div className="font-sans text-4xl md:text-5xl font-light mb-2 group-hover:text-cyan-500 transition-colors">
                  {metric.value}
                </div>
                <p className="font-mono text-xs text-muted-foreground tracking-wider">
                  {metric.label}
                </p>
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
            Colaboremos por un <span className="italic text-cyan-500">futuro sostenible</span>
          </h2>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest border border-white/20 px-8 py-4 hover:border-cyan-500 hover:text-cyan-500 transition-all duration-300 group"
          >
            UNIRME A LA CAUSA
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
