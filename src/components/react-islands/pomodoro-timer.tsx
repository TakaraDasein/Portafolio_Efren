"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, Music2 } from "lucide-react"

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G3: 196.0,
  A3: 220.0,
  C3: 130.81,
}

type Step = [note: string | null, beats: number]

const MELODIES: { id: string; label: string; tempo: number; sequence: Step[] }[] = [
  {
    id: "brisa",
    label: "Brisa",
    tempo: 84,
    sequence: [
      ["C4", 1],
      ["E4", 1],
      ["G4", 1],
      ["E4", 1],
      ["A3", 1],
      ["C4", 1],
      ["E4", 1],
      [null, 1],
      ["D4", 1],
      ["F4", 1],
      ["A4", 1],
      ["F4", 1],
      ["G3", 1],
      ["C4", 1],
      ["D4", 1],
      [null, 1],
    ],
  },
  {
    id: "pixel",
    label: "Pixel",
    tempo: 96,
    sequence: [
      ["C4", 0.5],
      ["C4", 0.5],
      ["G3", 0.5],
      [null, 0.5],
      ["E4", 0.5],
      ["D4", 0.5],
      ["C4", 1],
      ["A3", 0.5],
      ["A3", 0.5],
      ["F4", 0.5],
      [null, 0.5],
      ["E4", 0.5],
      ["D4", 0.5],
      ["G3", 1],
    ],
  },
]

function useChiptunePlayer() {
  const ctxRef = useRef<AudioContext | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx: AudioContext = new AudioCtx()
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 1600
      const masterGain = ctx.createGain()
      masterGain.gain.value = 0.06
      filter.connect(masterGain)
      masterGain.connect(ctx.destination)
      ctxRef.current = ctx
      filterRef.current = filter
    }
    return ctxRef.current
  }

  const stop = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPlayingId(null)
  }

  const playNote = (freq: number | null, duration: number) => {
    const ctx = ensureCtx()
    const filter = filterRef.current
    if (freq && filter && ctx) {
      const osc = ctx.createOscillator()
      osc.type = "square"
      osc.frequency.value = freq
      const noteGain = ctx.createGain()
      const now = ctx.currentTime
      noteGain.gain.setValueAtTime(0.0001, now)
      noteGain.gain.linearRampToValueAtTime(1, now + 0.02)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85)
      osc.connect(noteGain)
      noteGain.connect(filter)
      osc.start(now)
      osc.stop(now + duration)
    }
  }

  const play = (melody: (typeof MELODIES)[number]) => {
    stop()
    setPlayingId(melody.id)
    const beatSeconds = 60 / melody.tempo
    let i = 0
    const step = () => {
      const [note, beats] = melody.sequence[i % melody.sequence.length]
      playNote(note ? NOTE_FREQ[note] : null, beats * beatSeconds)
      i++
      timeoutRef.current = window.setTimeout(step, beats * beatSeconds * 1000)
    }
    step()
  }

  useEffect(() => stop, [])

  return { playingId, play, stop }
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"work" | "break">("work")
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60)
  const [running, setRunning] = useState(false)
  const modeRef = useRef(mode)
  const player = useChiptunePlayer()

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const nextMode = modeRef.current === "work" ? "break" : "work"
          setMode(nextMode)
          return (nextMode === "work" ? WORK_MINUTES : BREAK_MINUTES) * 60
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const reset = () => {
    setRunning(false)
    setMode("work")
    setSecondsLeft(WORK_MINUTES * 60)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-background/60 backdrop-blur-md">
      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60 w-14 text-center">
        {mode === "work" ? "Enfoque" : "Descanso"}
      </span>

      <span className="font-sans text-sm tabular-nums text-white w-11 text-center">
        {mm}:{ss}
      </span>

      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="p-1 text-muted-foreground/80 hover:text-white transition-colors"
        title={running ? "Pausar" : "Iniciar"}
      >
        {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </button>

      <button
        type="button"
        onClick={reset}
        className="p-1 text-muted-foreground/80 hover:text-white transition-colors"
        title="Reiniciar"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      <div className="w-px h-4 bg-white/10" />

      {MELODIES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => (player.playingId === m.id ? player.stop() : player.play(m))}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[8px] tracking-wider uppercase transition-colors ${
            player.playingId === m.id
              ? "border-white/40 text-white bg-white/10"
              : "border-white/10 text-muted-foreground/70 hover:border-white/25 hover:text-muted-foreground"
          }`}
          title={`Melodía 8-bit lofi: ${m.label}`}
        >
          <Music2 className="w-2.5 h-2.5" />
          {m.label}
        </button>
      ))}
    </div>
  )
}
