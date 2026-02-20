"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import MatrixBackground from "./matrix-background"

type CredentialItem = {
  title: string
  meta: string
  description: string
  image: string
}
const diplomaItems: CredentialItem[] = [
  {
    title: "Diploma en Ciencia Política",
    meta: "Formación universitaria",
    description: "Base teórica y metodológica para análisis institucional, territorial y social aplicado a datos.",
    image: "/certificaciones/diploma-politologo.jpg",
  },
]

function CredentialCarousel({ items, activeIndex, onPrev, onNext, onSelect }: {
  items: CredentialItem[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
}) {
  const currentItem = items[activeIndex] ?? items[0]

  return (
    <div className="border border-white/15 bg-black/55 p-6 backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] tracking-[0.2em] text-cyan-500">CENTRO DE MANDOS</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-cursor-hover
            aria-label="Elemento anterior"
            onClick={onPrev}
            className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-cyan-500 hover:text-cyan-500"
          >
            ←
          </button>
          <button
            type="button"
            data-cursor-hover
            aria-label="Elemento siguiente"
            onClick={onNext}
            className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-cyan-500 hover:text-cyan-500"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative mb-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(57,203,227,0.14) 0px, rgba(57,203,227,0.14) 1px, transparent 1px, transparent 8px)",
          }}
        />
        <div className="relative mx-auto w-fit border-[5px] border-cyan-500/60 bg-black/30 leading-none">
          <div
            className="pointer-events-none absolute -inset-[10px]"
            style={{
              border: "8px solid rgba(57, 203, 227, 0.35)",
              filter: "blur(10px)",
              maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
            }}
          />
          <div className="relative inline-flex max-w-full overflow-hidden border-[8px] border-black/55 shadow-[0_0_0_2px_rgba(0,0,0,0.35)] leading-none">
            <img src={currentItem.image} alt={currentItem.title} className="block max-h-[68vh] w-auto max-w-full object-contain align-top" />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.16))",
            }}
          />
        </div>
      </div>

      <h3 className="mb-2 font-sans text-2xl font-light">{currentItem.title}</h3>
      <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-cyan-500">{currentItem.meta.toUpperCase()}</p>
      <p className="font-mono text-xs leading-relaxed text-muted-foreground">{currentItem.description}</p>

      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            data-cursor-hover
            onClick={() => onSelect(index)}
            className={`group relative h-16 w-16 overflow-hidden border-2 bg-black/35 transition-all ${
              activeIndex === index ? "border-cyan-500/80" : "border-white/30 hover:border-white/55"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(57,203,227,0.18) 0px, rgba(57,203,227,0.18) 1px, transparent 1px, transparent 6px)",
              }}
            />
            <img src={item.image} alt={`Miniatura ${item.title}`} className="relative h-full w-full object-cover" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-cyan-500/70 opacity-70 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HomeCredentialsSnap() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    const previousIndex = activeIndex === 0 ? diplomaItems.length - 1 : activeIndex - 1
    setActiveIndex(previousIndex)
  }

  const handleNext = () => {
    const nextIndex = activeIndex === diplomaItems.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(nextIndex)
  }

  return (
    <section id="home-next-snap" className="relative hidden min-h-screen w-full overflow-hidden border-t border-white/10 bg-[#050505] lg:flex lg:items-center">
      <MatrixBackground />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(57,203,227,0.12), transparent 35%), radial-gradient(circle at 78% 34%, rgba(255,255,255,0.08), transparent 30%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 9px)",
          filter: "blur(0.5px)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto w-full max-w-7xl px-12"
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)]">
          <CredentialCarousel
            items={diplomaItems}
            activeIndex={activeIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelect={setActiveIndex}
          />
        </div>
      </motion.div>
    </section>
  )
}
