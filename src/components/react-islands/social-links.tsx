"use client"

import { useEffect, useRef, useState } from "react"
import { Github, Linkedin, Mail } from "lucide-react"

type SocialLinksProps = {
  accentColor: string
  className?: string
  iconSizeClass?: string
  paddingClass?: string
}

export default function SocialLinks({
  accentColor,
  className = "",
  iconSizeClass = "w-4 h-4",
  paddingClass = "p-1.5",
}: SocialLinksProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("efren.dataviz@gmail.com")
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const baseIconClass = `${paddingClass} text-muted-foreground/75 transition-colors duration-300`

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      <a
        href="https://github.com/TakaraDasein"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className={baseIconClass}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = accentColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = ""
        }}
      >
        <Github className={iconSizeClass} />
      </a>

      <a
        href="https://www.linkedin.com/in/alvaro-efren-bola%C3%B1os-scalante-a42520219/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className={baseIconClass}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = accentColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = ""
        }}
      >
        <Linkedin className={iconSizeClass} />
      </a>

      <button
        type="button"
        aria-label="Copiar correo"
        onClick={handleCopyEmail}
        className={baseIconClass}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = accentColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = ""
        }}
      >
        <Mail className={iconSizeClass} />
      </button>

      <span
        className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[10px] tracking-wider text-white/90 transition-all duration-200 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        ¡Copiado!
      </span>
    </div>
  )
}
