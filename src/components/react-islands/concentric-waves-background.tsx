import { useEffect, useRef } from 'react'

interface WaveRing {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  speed: number
  lineWidth: number
}

interface Epicenter {
  x: number
  y: number
  nextWaveTime: number
  waveInterval: number
}

export default function ConcentricWavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Epicentros de ondas
    const epicenters: Epicenter[] = []
    const epicenterCount = 5 // Múltiples epicentros activos
    
    // Crear epicentros en posiciones aleatorias
    for (let i = 0; i < epicenterCount; i++) {
      epicenters.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        nextWaveTime: Math.random() * 2000, // Tiempo hasta la próxima onda
        waveInterval: 1500 + Math.random() * 1500 // 1.5-3s entre ondas
      })
    }

    const waves: WaveRing[] = []
    let lastTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Limpiar canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)' // Trail más pronunciado para transiciones suaves
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar epicentros y generar nuevas ondas
      epicenters.forEach(epicenter => {
        epicenter.nextWaveTime -= deltaTime
        
        if (epicenter.nextWaveTime <= 0) {
          // Generar nueva onda desde este epicentro
          waves.push({
            x: epicenter.x,
            y: epicenter.y,
            radius: 0,
            maxRadius: 200 + Math.random() * 150, // Radio máximo aleatorio
            opacity: 0.2,
            speed: 0.3 + Math.random() * 0.3, // Más lento y suave
            lineWidth: 0.8 + Math.random() * 0.5 // Líneas más delgadas
          })
          
          // Mover epicentro a nueva posición aleatoria
          epicenter.x = Math.random() * canvas.width
          epicenter.y = Math.random() * canvas.height
          
          // Reiniciar temporizador
          epicenter.nextWaveTime = epicenter.waveInterval
        }
      })

      // Actualizar y dibujar ondas
      for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i]
        
        // Expandir onda
        wave.radius += wave.speed
        
        // Desvanecer conforme se expande
        wave.opacity = (1 - wave.radius / wave.maxRadius) * 0.2
        
        // Eliminar ondas completadas
        if (wave.radius >= wave.maxRadius || wave.opacity <= 0) {
          waves.splice(i, 1)
          continue
        }
        
        // Dibujar onda
        ctx.strokeStyle = `rgba(16, 185, 129, ${wave.opacity})` // Verde elegante
        ctx.lineWidth = wave.lineWidth
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        ctx.stroke()
        
        // Círculo central más brillante cuando la onda apenas comienza
        if (wave.radius < 20) {
          const centerOpacity = (1 - wave.radius / 20) * 0.1
          ctx.fillStyle = `rgba(16, 185, 129, ${centerOpacity})`
          ctx.beginPath()
          ctx.arc(wave.x, wave.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'linear-gradient(to bottom, #000000, #001a0d)' }}
    />
  )
}
