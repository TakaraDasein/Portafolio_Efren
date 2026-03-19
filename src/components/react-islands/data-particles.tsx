"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  char: string
  duration: number
  delay: number
  angle: number // Para ondulación sinusoidal
  amplitude: number // Amplitud de la onda
  frequency: number // Frecuencia de la onda
  distance: number // Distancia a recorrer
}

export function DataParticles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

  // Letras griegas usadas en ciencia de datos y estadística
  // α (alpha) - nivel de significancia, tasa de aprendizaje
  // β (beta) - coeficientes de regresión, error tipo II
  // γ (gamma) - factor de descuento en RL
  // δ (delta) - diferencias, cambios
  // ε (epsilon) - error, término de ruido
  // θ (theta) - parámetros del modelo
  // λ (lambda) - regularización, tasa
  // μ (mu) - media poblacional
  // σ (sigma) - desviación estándar
  // ρ (rho) - correlación
  // φ (phi) - función de activación
  // ψ (psi) - función de estado
  // ω (omega) - pesos
  // η (eta) - learning rate
  const dataChars = ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'σ', 'ρ', 'φ', 'ψ', 'ω', 'η']

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Crear partículas iniciales (15-25 para ser muy sutil)
    const particleCount = Math.floor(Math.random() * 11) + 15 // 15-25 partículas
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      // Ángulo aleatorio para aparición explosiva desde el centro
      const angle = Math.random() * Math.PI * 2
      
      // Distancias más variadas: algunas cercas (150), otras muy lejos (800)
      // Distribución: 30% cercanas, 40% medias, 30% lejanas
      const rand = Math.random()
      let distance
      if (rand < 0.3) {
        distance = 150 + Math.random() * 200 // Cercanas: 150-350px
      } else if (rand < 0.7) {
        distance = 350 + Math.random() * 250 // Medias: 350-600px
      } else {
        distance = 600 + Math.random() * 300 // Lejanas: 600-900px
      }
      
      // Duraciones más largas y proporcionales a la distancia
      // Partículas lejanas duran más para mantener velocidad constante
      const baseDuration = 5 + Math.random() * 5 // 5-10 segundos base
      const durationMultiplier = distance / 400 // Factor basado en distancia
      const duration = baseDuration * durationMultiplier
      
      return {
        id: i,
        x: centerX, // Todas empiezan desde el centro
        y: centerY,
        char: dataChars[Math.floor(Math.random() * dataChars.length)],
        duration: duration, // Duración variable según distancia
        delay: Math.random() * 3, // Mayor variación en delays: 0-3s
        angle: angle, // Dirección de movimiento
        amplitude: 20 + Math.random() * 50, // Amplitud de ondulación: 20-70px (más variación)
        frequency: 2 + Math.random() * 3, // Frecuencia de ondas: 2-5
        distance: distance, // Distancia desde el centro (muy variable)
      }
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 5 }}
    >
      {particlesRef.current.map((particle) => {
        // Calcular posición final con ondulación sinusoidal
        const endX = particle.x + Math.cos(particle.angle) * particle.distance
        const endY = particle.y + Math.sin(particle.angle) * particle.distance
        
        // Crear trayectoria ondulante usando keyframes
        // La partícula se moverá en línea recta pero con oscilación perpendicular
        const perpendicularAngle = particle.angle + Math.PI / 2
        
        return (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              opacity: 0,
              scale: 0.3, // Empieza más pequeña para efecto explosivo
            }}
            animate={{
              x: [
                particle.x,
                particle.x + Math.cos(particle.angle) * particle.distance * 0.25 + Math.cos(perpendicularAngle) * particle.amplitude * 0.5,
                particle.x + Math.cos(particle.angle) * particle.distance * 0.5 + Math.cos(perpendicularAngle) * particle.amplitude,
                particle.x + Math.cos(particle.angle) * particle.distance * 0.75 + Math.cos(perpendicularAngle) * particle.amplitude * 0.5,
                endX
              ],
              y: [
                particle.y,
                particle.y + Math.sin(particle.angle) * particle.distance * 0.25 + Math.sin(perpendicularAngle) * particle.amplitude * 0.5,
                particle.y + Math.sin(particle.angle) * particle.distance * 0.5 + Math.sin(perpendicularAngle) * particle.amplitude,
                particle.y + Math.sin(particle.angle) * particle.distance * 0.75 + Math.sin(perpendicularAngle) * particle.amplitude * 0.5,
                endY
              ],
              opacity: [0, 0.15, 0.25, 0.15, 0], // Fade sutil
              scale: [0.3, 1, 1, 1, 0.8], // Explosión inicial, luego estable
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute font-mono text-sm tracking-wider"
            style={{
              color: '#39cbe3',
              textShadow: '0 0 6px rgba(57, 203, 227, 0.4), 0 0 12px rgba(57, 203, 227, 0.2)',
              filter: 'blur(0px)',
            }}
          >
            {particle.char}
            {/* Efecto de estela/trail */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                color: '#39cbe3',
                opacity: 0.15,
              }}
              animate={{
                x: [-2, 0],
                y: [-2, 0],
                opacity: [0.15, 0],
              }}
              transition={{
                duration: particle.duration * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              {particle.char}
            </motion.span>
          </motion.div>
        )
      })}
    </div>
  )
}
