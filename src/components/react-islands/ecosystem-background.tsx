"use client"

import { useEffect, useRef } from 'react'

export default function EcosystemBackground() {
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

    // Clase para partículas orgánicas (hojas, flores, etc.)
    class OrganicParticle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      rotation: number
      rotationSpeed: number
      type: 'leaf' | 'flower' | 'circle' | 'petal'
      opacity: number
      color: string
      canvas: HTMLCanvasElement

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        
        // Movimiento tipo viento/agua - más horizontal que vertical
        this.vx = (Math.random() - 0.5) * 1.5
        this.vy = (Math.random() - 0.3) * 0.8 // Ligeramente hacia abajo
        
        this.size = Math.random() * 4 + 2
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        
        // Tipos de partículas
        const types: ('leaf' | 'flower' | 'circle' | 'petal')[] = ['leaf', 'flower', 'circle', 'petal']
        this.type = types[Math.floor(Math.random() * types.length)]
        
        this.opacity = Math.random() * 0.6 + 0.3
        
        // Tonos verdes naturales
        const greens = [
          'rgba(16, 185, 129, ', // #10b981 - verde principal
          'rgba(34, 197, 94, ',  // verde brillante
          'rgba(74, 222, 128, ', // verde claro
          'rgba(134, 239, 172, ', // verde muy claro
        ]
        this.color = greens[Math.floor(Math.random() * greens.length)]
      }

      update() {
        // Movimiento fluido con pequeñas variaciones (simula viento)
        this.x += this.vx + Math.sin(Date.now() * 0.001) * 0.1
        this.y += this.vy + Math.cos(Date.now() * 0.001) * 0.05
        
        this.rotation += this.rotationSpeed

        // Wrap around (aparecer del otro lado)
        if (this.x < -20) this.x = this.canvas.width + 20
        if (this.x > this.canvas.width + 20) this.x = -20
        if (this.y < -20) this.y = this.canvas.height + 20
        if (this.y > this.canvas.height + 20) this.y = -20
      }

      draw() {
        if (!ctx) return
        
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity

        switch (this.type) {
          case 'leaf':
            this.drawLeaf()
            break
          case 'flower':
            this.drawFlower()
            break
          case 'petal':
            this.drawPetal()
            break
          default:
            this.drawCircle()
        }

        ctx.restore()
      }

      drawLeaf() {
        if (!ctx) return
        
        ctx.fillStyle = this.color + this.opacity + ')'
        ctx.beginPath()
        // Forma de hoja usando curvas bezier
        ctx.moveTo(0, -this.size)
        ctx.quadraticCurveTo(this.size, -this.size * 0.5, this.size * 0.5, this.size)
        ctx.quadraticCurveTo(0, this.size * 0.7, 0, this.size)
        ctx.quadraticCurveTo(0, this.size * 0.7, -this.size * 0.5, this.size)
        ctx.quadraticCurveTo(-this.size, -this.size * 0.5, 0, -this.size)
        ctx.fill()
      }

      drawFlower() {
        if (!ctx) return
        
        const petals = 5
        const petalSize = this.size
        
        for (let i = 0; i < petals; i++) {
          const angle = (Math.PI * 2 * i) / petals
          ctx.save()
          ctx.rotate(angle)
          ctx.fillStyle = this.color + this.opacity + ')'
          ctx.beginPath()
          ctx.ellipse(0, petalSize * 0.7, petalSize * 0.4, petalSize * 0.8, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        
        // Centro de la flor
        ctx.fillStyle = `rgba(255, 237, 160, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      drawPetal() {
        if (!ctx) return
        
        ctx.fillStyle = this.color + this.opacity + ')'
        ctx.beginPath()
        ctx.ellipse(0, 0, this.size * 0.4, this.size, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      drawCircle() {
        if (!ctx) return
        
        // Partícula simple circular
        ctx.fillStyle = this.color + this.opacity + ')'
        ctx.beginPath()
        ctx.arc(0, 0, this.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Glow suave
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2)
        gradient.addColorStop(0, this.color + (this.opacity * 0.3) + ')')
        gradient.addColorStop(1, this.color + '0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Crear partículas
    const particles: OrganicParticle[] = []
    const particleCount = 80

    for (let i = 0; i < particleCount; i++) {
      particles.push(new OrganicParticle(canvas))
    }

    // Conexiones entre partículas cercanas (red ecológica)
    function drawConnections() {
      if (!ctx) return
      
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.15
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })
    }

    // Animación
    function animate() {
      if (!ctx || !canvas) return

      // Fondo con desvanecimiento suave
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar conexiones primero (debajo de las partículas)
      drawConnections()

      // Actualizar y dibujar partículas
      particles.forEach(particle => {
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
