"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const projects = [
  {
    title: "Neural Interface",
    tags: ["Next.js", "OpenAI", "WebGL"],
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
    year: "2024",
    description: "An AI-powered neural network visualization system",
  },
  {
    title: "Quantum Dashboard",
    tags: ["React", "D3.js", "Python"],
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
    year: "2024",
    description: "Real-time data visualization and analytics platform",
  },
  {
    title: "Synthetic Memory",
    tags: ["TypeScript", "LangChain", "Vector DB"],
    image: "/abstract-memory-storage-visualization.jpg",
    year: "2023",
    description: "Advanced memory storage and retrieval system",
  },
  {
    title: "Echo Protocol",
    tags: ["Rust", "WebAssembly", "Audio"],
    image: "/sound-wave-visualization-dark-theme.jpg",
    year: "2023",
    description: "High-performance audio processing engine",
  },
]

export function Works() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % projects.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const goToPrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const currentProject = projects[currentIndex]

  return (
    <section className="relative py-32 px-8 md:px-12 md:py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 md:mb-24"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">04 — SELECTED WORKS</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">The Distortion Gallery</h2>
      </motion.div>

      {/* Dynamic Project Banner */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Banner */}
        <div className="relative h-[60vh] md:h-[70vh] border border-white/10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -100 }}
              transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
              >
                <img
                  src={currentProject.image}
                  alt={currentProject.title}
                  className="w-full h-full object-cover"
                  style={{
                    filter: "grayscale(50%) contrast(1.1) brightness(0.7)",
                  }}
                />
                {/* Glitch overlay */}
                <div className="absolute inset-0 bg-[#2563eb]/10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </motion.div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* Project Number & Year */}
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                      {String(currentIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                    </span>
                    <span className="text-white/30">—</span>
                    <span className="font-mono text-xs tracking-widest text-muted-foreground">
                      {currentProject.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-sans text-5xl md:text-7xl lg:text-8xl font-light tracking-tight">
                    {currentProject.title}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl">
                    {currentProject.description}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    {currentProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Project Button */}
                  <a
                    href="#"
                    data-cursor-hover
                    className="inline-flex items-center gap-2 font-mono text-xs tracking-widest hover:text-white transition-colors duration-300 group"
                  >
                    VIEW PROJECT
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
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 md:left-8 md:right-8 flex justify-between items-center pointer-events-none">
          <button
            onClick={goToPrev}
            data-cursor-hover
            className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 border border-white/20 bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 transition-colors group"
            aria-label="Previous project"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            data-cursor-hover
            className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 border border-white/20 bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 transition-colors group"
            aria-label="Next project"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2 justify-center mt-8">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              data-cursor-hover
              className="group relative h-1 w-16 bg-white/10 overflow-hidden"
              aria-label={`Go to project ${index + 1}`}
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={false}
                animate={{
                  scaleX: currentIndex === index ? (isPaused ? 0.3 : 1) : 0,
                }}
                transition={{
                  duration: currentIndex === index && !isPaused ? 5 : 0.3,
                  ease: "linear",
                }}
                style={{ transformOrigin: "left" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Border */}
      <div className="border-t border-white/10 mt-16 md:mt-24" />
    </section>
  )
}
