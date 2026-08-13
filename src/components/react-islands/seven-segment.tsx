"use client"

/**
 * Display de siete segmentos dibujado en SVG.
 *
 * Se construye a mano en vez de usar una tipografía digital para no añadir
 * dependencias, mantenerlo nítido a cualquier tamaño y poder atenuar los
 * segmentos apagados como en una pantalla LCD real.
 */

// Geometría de un dígito: 22 × 40, con segmentos de 5 de grosor y puntas biseladas.
const horizontal = (x: number, y: number, length: number) =>
  `${x},${y + 2.5} ${x + 2.5},${y} ${x + length - 2.5},${y} ${x + length},${y + 2.5} ` +
  `${x + length - 2.5},${y + 5} ${x + 2.5},${y + 5}`

const vertical = (x: number, y: number, length: number) =>
  `${x + 2.5},${y} ${x + 5},${y + 2.5} ${x + 5},${y + length - 2.5} ` +
  `${x + 2.5},${y + length} ${x},${y + length - 2.5} ${x},${y + 2.5}`

const SEGMENT_SHAPE: Record<string, string> = {
  a: horizontal(0, 0, 22),
  g: horizontal(0, 17.5, 22),
  d: horizontal(0, 35, 22),
  f: vertical(0, 0, 20),
  b: vertical(17, 0, 20),
  e: vertical(0, 20, 20),
  c: vertical(17, 20, 20),
}

const DIGIT_SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
}

/** Opacidad de los segmentos apagados: presentes, pero casi imperceptibles. */
const OFF_OPACITY = 0.07

export function SevenSegmentDigit({ char, className = "" }: { char: string; className?: string }) {
  const lit = DIGIT_SEGMENTS[char] ?? ""
  return (
    <svg viewBox="0 0 22 40" className={className} fill="currentColor" aria-hidden="true">
      {Object.entries(SEGMENT_SHAPE).map(([id, points]) => (
        <polygon key={id} points={points} opacity={lit.includes(id) ? 1 : OFF_OPACITY} />
      ))}
    </svg>
  )
}

export function SevenSegmentColon({
  dim = false,
  className = "",
}: {
  dim?: boolean
  className?: string
}) {
  return (
    <svg viewBox="0 0 8 40" className={className} fill="currentColor" aria-hidden="true">
      <rect x="1.5" y="11" width="5" height="5" rx="1" opacity={dim ? OFF_OPACITY : 1} />
      <rect x="1.5" y="24" width="5" height="5" rx="1" opacity={dim ? OFF_OPACITY : 1} />
    </svg>
  )
}

/** Renderiza "HH:MM" completo; el separador puede latir con los segundos. */
export function SevenSegmentTime({
  hours,
  minutes,
  dimColon = false,
  height = "h-12",
}: {
  hours: number
  minutes: number
  dimColon?: boolean
  height?: string
}) {
  const digits = `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`
  return (
    <div className={`flex items-stretch gap-[3px] ${height}`} role="timer">
      <SevenSegmentDigit char={digits[0]} className="h-full w-auto" />
      <SevenSegmentDigit char={digits[1]} className="h-full w-auto" />
      <SevenSegmentColon dim={dimColon} className="h-full w-auto" />
      <SevenSegmentDigit char={digits[2]} className="h-full w-auto" />
      <SevenSegmentDigit char={digits[3]} className="h-full w-auto" />
    </div>
  )
}
