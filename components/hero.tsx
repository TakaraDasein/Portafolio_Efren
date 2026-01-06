"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const navigationButtons = [
    {
      id: "data-analysis",
      label: "Análisis de Datos",
      href: "/analisis-datos",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "machine-learning",
      label: "Machine Learning",
      href: "/machine-learning",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: "environment",
      label: "Medio Ambiente y Sociedad",
      href: "/medio-ambiente-sociedad",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {/* 3D Sphere Background - Positioned Right */}
      <div className="absolute right-[15%] md:right-[20%] lg:right-[25%] top-1/2 -translate-y-1/2 w-[450px] h-[450px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] z-20">
        <SentientSphere />
      </div>

      {/* Typography Overlay */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 h-full flex flex-col justify-between p-8 md:px-16 lg:px-24 md:py-20 pointer-events-none"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-16 flex-1 pointer-events-auto">
          {/* Left Side - Profile & Text */}
          <div className="flex flex-col gap-8 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative group"
            >
              <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]">
                {/* Brutalist border frame */}
                <div className="absolute inset-0 border-2 border-cyan-500 translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                <div className="absolute inset-0 border border-white/20" />

                {/* Profile photo */}
                <div className="relative w-full h-full overflow-hidden bg-black">
                  <Image
                    src="/profile-photo.png"
                    alt="Foto de perfil"
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                    priority
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <p className="font-mono text-sm md:text-base text-cyan-500 tracking-wider font-bold text-center">
                      Álvaro Efrén Bolaños Scalante
                    </p>
                  </div>
                </div>

                {/* Corner accent - enlarged */}
                <div className="absolute -bottom-3 -right-3 w-10 h-10 border-r-2 border-b-2 border-cyan-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-left"
            >
              <h1 className="font-sans text-5xl md:text-7xl lg:text-7xl font-light tracking-tight">
                Analista de <span className="italic">Datos</span>
              </h1>
              <p className="font-mono text-sm md:text-base text-muted-foreground mt-4 tracking-wide">
                Transformando datos en decisiones estratégicas
              </p>
            </motion.div>
          </div>

          {/* Right Side - Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-row lg:flex-col gap-6 lg:gap-10"
          >
            {navigationButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="relative"
                onMouseEnter={() => setHoveredButton(button.id)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Link
                  href={button.href}
                  data-cursor-hover
                  className="group relative block"
                >
                  {/* Main button */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-cyan-500 transition-all duration-300">
                    <div className="text-white group-hover:text-cyan-500 transition-colors duration-300 w-7 h-7 md:w-8 md:h-8">
                      {button.icon}
                    </div>
                    {/* Corner accent */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-r border-b border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Label tooltip */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{
                      opacity: hoveredButton === button.id ? 1 : 0,
                      x: hoveredButton === button.id ? 0 : 10,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-full mr-6 top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap hidden lg:block"
                  >
                    <div className="relative">
                      <div className="bg-black border border-cyan-500 px-5 py-3">
                        <p className="font-mono text-sm tracking-wider text-cyan-500">
                          {button.label}
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-black border-r border-t border-cyan-500 rotate-45" />
                    </div>
                  </motion.div>

                  {/* Mobile tooltip (below) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredButton === button.id ? 1 : 0,
                      y: hoveredButton === button.id ? 0 : 10,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap lg:hidden"
                  >
                    <div className="relative">
                      <div className="bg-black border border-cyan-500 px-5 py-3">
                        <p className="font-mono text-sm tracking-wider text-cyan-500">
                          {button.label}
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-l border-t border-cyan-500 rotate-45" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Center Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="self-end text-right"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">02 — ANÁLISIS</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Desplazar</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
