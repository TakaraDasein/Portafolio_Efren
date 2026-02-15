"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Frases rotativas con palabras clave resaltadas
  const phrases = [
    { text: "La pregunta correcta ", highlight: "transforma", text2: " los datos" },
    { text: "Destilar la complejidad para hallar la ", highlight: "ruta de acción" },
    { text: "La ética como ", highlight: "código de depuración" },
    { text: "De la incertidumbre social al ", highlight: "bienestar común" },
    { text: "Una correlación es una pista, no ", highlight: "una causa" },
    { text: "Cada punto de datos es una ", highlight: "historia humana" },
  ]

  // Efecto de typing
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    const fullText = (currentPhrase.text || "") + (currentPhrase.highlight || "") + (currentPhrase.text2 || "")
    
    setIsTyping(true)
    setDisplayedText("")
    
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        
        // Esperar 1.5 segundos después de terminar de escribir
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        }, 1500)
      }
    }, 50) // Velocidad de escritura: 50ms por letra
    
    return () => clearInterval(typingInterval)
  }, [currentPhraseIndex])

  const navigationButtons = [
    {
      id: "data-analysis",
      label: "Análisis de Datos",
      href: "/analisis-datos",
      icon: (
        <img 
          src="/ilustraciones/data-analisis.png" 
          alt="Análisis de Datos"
          className="object-contain w-full h-full"
        />
      ),
    },
    {
      id: "machine-learning",
      label: "Machine Learning",
      href: "/machine-learning",
      icon: (
        <img 
          src="/ilustraciones/machine-learning.png" 
          alt="Machine Learning"
          className="object-contain w-full h-full"
        />
      ),
    },
    {
      id: "environment",
      label: "Medio Ambiente y Sociedad",
      href: "/medio-ambiente-sociedad",
      icon: (
        <img 
          src="/ilustraciones/cultura-sociedad.png" 
          alt="Medio Ambiente y Sociedad"
          className="object-contain w-full h-full"
        />
      ),
    },
  ]

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {/* 3D Sphere - Background en móvil, Foreground en desktop */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px] 2xl:w-[700px] 2xl:h-[700px] z-0 md:z-50 opacity-70 md:opacity-90 lg:opacity-95 xl:opacity-100 pointer-events-auto overflow-visible">
        <SentientSphere />
      </div>

      {/* Typography Overlay */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 h-full flex flex-col justify-center md:justify-between p-6 sm:p-8 md:px-12 lg:px-16 xl:px-24 pt-24 sm:pt-28 md:py-16 lg:py-20 pointer-events-none"
      >
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 md:flex-1 pointer-events-auto max-w-7xl mx-auto w-full">
          {/* Left Side - Profile & Text */}
          <div className="flex flex-col items-center md:items-start gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative group"
            >
              <a href="https://www.kaggle.com" target="_blank" rel="noopener noreferrer" data-cursor-hover>
                <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] xl:w-[300px] xl:h-[300px] cursor-pointer">
                  {/* Profile photo */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src="/profile-photo.png"
                      alt="Foto de perfil"
                      className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(57,203,227,0.8)] w-full h-full"
                      loading="eager"
                    />
                  </div>
                </div>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center md:text-left"
            >
              <h1 className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light tracking-tight">
                Alvaro Efren <span className="italic">B.S.</span>
              </h1>
              <div className="w-[220px] sm:w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px] mx-auto md:mx-0 h-[60px] sm:h-[64px] md:h-[68px] lg:h-[72px] xl:h-[76px] flex items-start mt-2 sm:mt-2 md:mt-2 lg:mt-3">
                <p className="font-mono text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-base text-muted-foreground tracking-wide leading-relaxed">
                  {displayedText.split('').map((char, index) => {
                    const currentPhrase = phrases[currentPhraseIndex]
                    const textLength = (currentPhrase.text || "").length
                    const highlightLength = (currentPhrase.highlight || "").length
                    
                    if (index < textLength) {
                      return <span key={index}>{char}</span>
                    } else if (index < textLength + highlightLength) {
                      return <span key={index} className="text-cyan-500 font-semibold">{char}</span>
                    } else {
                      return <span key={index}>{char}</span>
                    }
                  })}
                  {isTyping && <span className="animate-pulse text-cyan-500">|</span>}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-row justify-center md:flex-col gap-4 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-10"
          >
            {navigationButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.7 + index * 0.1,
                }}
                className="relative"
                onMouseEnter={() => setHoveredButton(button.id)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <a
                  href={button.href}
                  data-cursor-hover
                  className="group relative block"
                >
                  {/* Main button */}
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 border border-white/20 bg-black/80 backdrop-blur-sm flex items-center justify-center hover:border-cyan-500 transition-all duration-300">
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12">
                      {button.icon}
                    </div>
                    {/* Corner accent */}
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-3 h-3 sm:w-4 sm:h-4 border-r border-b border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                </a>
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

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
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

