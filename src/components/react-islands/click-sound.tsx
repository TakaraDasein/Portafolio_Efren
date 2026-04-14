"use client"

import { useEffect, useRef } from "react"

export default function ClickSound() {
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const ensureAudioContext = () => {
      if (!contextRef.current) {
        contextRef.current = new window.AudioContext()
      }

      if (contextRef.current.state === "suspended") {
        void contextRef.current.resume()
      }
    }

    const playClick = () => {
      const context = contextRef.current
      if (!context) return

      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = "triangle"
      oscillator.frequency.setValueAtTime(920, now)
      oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.045)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.02, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.065)
    }

    const handlePointerDown = () => {
      ensureAudioContext()
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      if (target.closest("a, button, [data-sound-click]")) {
        playClick()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true })
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return null
}
