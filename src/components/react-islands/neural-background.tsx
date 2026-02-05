"use client"

import { useEffect, useRef } from 'react'

export default function NeuralBackground() {
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

    // Nodos neuronales
    class Neuron {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      connections: Neuron[] = []
      canvas: HTMLCanvasElement

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 2 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Rebote en los bordes
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1

        // Mantener dentro del canvas
        this.x = Math.max(0, Math.min(this.canvas.width, this.x))
        this.y = Math.max(0, Math.min(this.canvas.height, this.y))
      }

      draw() {
        if (!ctx) return
        
        // Dibujar nodo
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)' // Color rojo principal
        ctx.fill()

        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3)
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      drawConnections() {
        if (!ctx) return
        
        this.connections.forEach(neuron => {
          const distance = Math.hypot(this.x - neuron.x, this.y - neuron.y)
          const opacity = Math.max(0, 1 - distance / 150)
          
          if (opacity > 0) {
            // Línea de conexión con pulso
            const pulse = Math.sin(Date.now() * 0.001 + distance * 0.01) * 0.3 + 0.7
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(neuron.x, neuron.y)
            ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.4 * pulse})`
            ctx.lineWidth = 0.5
            ctx.stroke()

            // Partículas viajando por la conexión (señales neuronales)
            const progress = (Date.now() * 0.0005 + distance * 0.01) % 1
            const particleX = this.x + (neuron.x - this.x) * progress
            const particleY = this.y + (neuron.y - this.y) * progress
            
            ctx.beginPath()
            ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 0.8})`
            ctx.fill()
          }
        })
      }
    }

    // Crear neuronas
    const neurons: Neuron[] = []
    const neuronCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000))
    
    for (let i = 0; i < neuronCount; i++) {
      neurons.push(new Neuron(canvas))
    }

    // Establecer conexiones
    const connectNeurons = () => {
      neurons.forEach(neuron => {
        neuron.connections = []
        neurons.forEach(other => {
          if (neuron !== other) {
            const distance = Math.hypot(neuron.x - other.x, neuron.y - other.y)
            if (distance < 150) {
              neuron.connections.push(other)
            }
          }
        })
      })
    }

    // Animación
    let animationId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)' // Fade trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      connectNeurons()

      // Dibujar conexiones primero
      neurons.forEach(neuron => {
        neuron.drawConnections()
      })

      // Luego dibujar nodos
      neurons.forEach(neuron => {
        neuron.update()
        neuron.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        mixBlendMode: 'screen',
        opacity: 0.6 
      }}
    />
  )
}
