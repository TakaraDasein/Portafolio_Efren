"use client"

import { useEffect, useRef } from 'react'

export default function OrbitalGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configuración
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Clase para partículas del globo
    class OrbitalParticle {
      theta: number // Ángulo horizontal (latitud)
      phi: number   // Ángulo vertical (longitud)
      radius: number
      orbitSpeed: number
      size: number
      opacity: number
      targetOpacity: number
      fadeSpeed: number
      pulsePhase: number
      pulseSpeed: number
      isPulsePoint: boolean
      canvas: HTMLCanvasElement
      lifetime: number
      maxLifetime: number

      constructor(canvas: HTMLCanvasElement, isPulsePoint = false) {
        this.canvas = canvas
        this.theta = Math.random() * Math.PI * 2
        // Distribución uniforme en esfera usando Math.acos para phi
        this.phi = Math.acos(2 * Math.random() - 1)
        this.radius = 470 + Math.random() * 20 // Radio más uniforme 470-490 para mejor redondez
        this.orbitSpeed = (Math.random() - 0.5) * 0.002 // Más lento para mantener forma
        this.size = isPulsePoint ? 5 : Math.random() * 2.5 + 1.5
        this.opacity = 0
        this.targetOpacity = Math.random() * 0.7 + 0.4 // Más opacas
        this.fadeSpeed = 0.01 + Math.random() * 0.02
        this.pulsePhase = Math.random() * Math.PI * 2
        this.pulseSpeed = 0.02 + Math.random() * 0.03
        this.isPulsePoint = isPulsePoint
        this.lifetime = 0
        this.maxLifetime = 200 + Math.random() * 300 // Vida aleatoria
      }

      update() {
        // Incrementar tiempo de vida
        this.lifetime++

        // Fade in al inicio
        if (this.lifetime < 30) {
          this.opacity = Math.min(this.opacity + this.fadeSpeed * 2, this.targetOpacity)
        }
        // Fade out al final de la vida
        else if (this.lifetime > this.maxLifetime - 50) {
          this.opacity = Math.max(this.opacity - this.fadeSpeed, 0)
        }
        // Parpadeo sutil durante vida
        else {
          const flicker = Math.sin(this.lifetime * 0.05) * 0.08
          this.opacity = this.targetOpacity + flicker
        }

        // Resetear si la partícula "murió"
        if (this.lifetime > this.maxLifetime) {
          this.respawn()
        }

        // Orbitar con variación dinámica reducida para mantener forma
        this.theta += this.orbitSpeed + Math.sin(this.lifetime * 0.01) * 0.0005
        this.phi += this.orbitSpeed * 0.15 + Math.cos(this.lifetime * 0.015) * 0.0003

        // Pulso
        this.pulsePhase += this.pulseSpeed
      }

      respawn() {
        // Reaparecer en nueva posición aleatoria
        this.theta = Math.random() * Math.PI * 2
        this.phi = Math.acos(2 * Math.random() - 1)
        this.radius = 470 + Math.random() * 20 // Mantener radio uniforme
        this.opacity = 0
        this.lifetime = 0
        this.maxLifetime = 200 + Math.random() * 300
        this.targetOpacity = Math.random() * 0.7 + 0.4
      }

      getPosition() {
        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2

        // Conversión de coordenadas esféricas a cartesianas (correcta para esfera perfecta)
        const sinPhi = Math.sin(this.phi)
        const x = centerX + this.radius * sinPhi * Math.cos(this.theta)
        const y = centerY + this.radius * Math.cos(this.phi)
        const z = this.radius * sinPhi * Math.sin(this.theta)

        return { x, y, z }
      }

      draw() {
        if (!ctx) return
        
        const pos = this.getPosition()
        
        // Partículas en la parte trasera más tenues
        const depthOpacity = (pos.z + this.radius) / (this.radius * 2)
        const finalOpacity = this.opacity * depthOpacity

        ctx.globalAlpha = finalOpacity

        if (this.isPulsePoint) {
          // Efecto de pulso
          const pulseSize = this.size + Math.sin(this.pulsePhase) * 3
          
          // Núcleo brillante
          ctx.fillStyle = '#10b981'
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, pulseSize, 0, Math.PI * 2)
          ctx.fill()

          // Onda de pulso
          const waveRadius = pulseSize + Math.abs(Math.sin(this.pulsePhase)) * 28
          const waveOpacity = (1 - Math.abs(Math.sin(this.pulsePhase))) * 0.3
          
          ctx.strokeStyle = `rgba(16, 185, 129, ${waveOpacity * depthOpacity})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, waveRadius, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          // Partícula normal
          ctx.fillStyle = '#10b981'
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2)
          ctx.fill()

          // Glow suave
          const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, this.size * 2)
          gradient.addColorStop(0, `rgba(16, 185, 129, ${0.3 * depthOpacity})`)
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, this.size * 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1
      }
    }

    // Crear partículas
    const particles: OrbitalParticle[] = []
    const particleCount = 100 // Aumentado para mejor estructura
    const pulsePointCount = 6

    // Crear puntos de pulso
    for (let i = 0; i < pulsePointCount; i++) {
      particles.push(new OrbitalParticle(canvas, true))
    }

    // Crear partículas normales
    for (let i = 0; i < particleCount; i++) {
      particles.push(new OrbitalParticle(canvas, false))
    }

    // Dibujar conexiones entre partículas cercanas
    function drawConnections() {
      if (!ctx) return
      
      particles.forEach((particle, i) => {
        const pos1 = particle.getPosition()
        
        particles.slice(i + 1).forEach(otherParticle => {
          const pos2 = otherParticle.getPosition()
          const dx = pos1.x - pos2.x
          const dy = pos1.y - pos2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 200) { // Reducido para más conexiones y mejor estructura
            // Calcular opacidad basada en profundidad de ambas partículas
            const depth1 = (pos1.z + particle.radius) / (particle.radius * 2)
            const depth2 = (pos2.z + otherParticle.radius) / (otherParticle.radius * 2)
            const avgDepth = (depth1 + depth2) / 2
            const avgOpacity = (particle.opacity + otherParticle.opacity) / 2
            
            const opacity = (1 - distance / 200) * 0.25 * avgDepth * avgOpacity // Más visible
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`
            ctx.lineWidth = 1.5 // Líneas más gruesas
            ctx.beginPath()
            ctx.moveTo(pos1.x, pos1.y)
            ctx.lineTo(pos2.x, pos2.y)
            ctx.stroke()
          }
        })
      })
    }

    // Animación
    function animate() {
      if (!ctx || !canvas) return

      // Limpiar canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar conexiones primero
      drawConnections()

      // Actualizar y dibujar partículas
      // Ordenar por profundidad (z) para dibujar las de atrás primero
      const sortedParticles = [...particles].sort((a, b) => {
        return a.getPosition().z - b.getPosition().z
      })

      sortedParticles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'black' }}
    />
  )
}
