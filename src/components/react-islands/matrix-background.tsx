"use client"

import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
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

    // Caracteres japoneses katakana y hiragana
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const nums = '0123456789'
    const alphabet = katakana + latin + nums

    const fontSize = 16
    const columns = canvas.width / fontSize

    // Array de gotas - una por columna
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Función de dibujo
    function draw() {
      if (!ctx || !canvas) return

      // Fondo semi-transparente para efecto de desvanecimiento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Color del texto - cyan como el tema de análisis de datos
      ctx.fillStyle = 'rgba(57, 203, 227, 0.9)'
      ctx.font = `${fontSize}px monospace`

      // Dibujar caracteres
      for (let i = 0; i < drops.length; i++) {
        // Carácter aleatorio
        const text = alphabet[Math.floor(Math.random() * alphabet.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(text, x, y)

        // Resetear gota al tope cuando llega al fondo
        // También agregar aleatoriedad para que no todas caigan al mismo ritmo
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Incrementar posición Y
        drops[i]++
      }
    }

    // Animación
    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
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
