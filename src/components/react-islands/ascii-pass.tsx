"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three"

/**
 * Rampa de caracteres ordenada de menor a mayor densidad de tinta. La elección
 * es estética además de técnica: se evitan los bloques (░▒▓█), que llenan la
 * celda entera y producen una imagen sucia, en favor de signos de trazo fino
 * que dejan respirar el negro y conservan la silueta.
 */
const RAMP = " .·:;+=*ox%#@"

/** Lado de la celda en píxeles de pantalla. Más pequeño, más resolución. */
const CELL_SIZE = 11

const MONO_STACK = "'Geist Mono', ui-monospace, monospace"

/**
 * Pila con `DejaVu Sans Mono` por delante para las familias que Geist Mono no
 * cubre. No basta con confiar en que la fuente traiga el glifo: cuando falta,
 * el canvas dibuja la caja de *tofu* —un rectángulo relleno— sin lanzar ningún
 * error, y una rampa entera de tofus se convertiría en bloques sólidos con toda
 * la apariencia de ser el efecto buscado. De ahí que la calibración descarte
 * expresamente los glifos ausentes.
 */
const WIDE_STACK = `'DejaVu Sans Mono', 'Noto Sans Mono', ${MONO_STACK}`

/** Rango completo de Braille: 256 combinaciones de una rejilla de 2×4 puntos. */
const BRAILLE = Array.from({ length: 256 }, (_, i) => String.fromCharCode(0x2800 + i)).join("")

type AsciiPreset = {
  /**
   * Caracteres candidatos. No hace falta que estén ordenados ni que sean
   * exactamente los que se usarán: la calibración mide, descarta y elige.
   */
  candidates: string
  font: string
  cellSize: number
  contrast: number
  /** Glifos finales de la rampa. Más niveles, más gradación. */
  levels: number
  /**
   * Los candidatos ya vienen ordenados a mano y se usan tal cual. Solo para la
   * rampa histórica, que se deja intacta para no alterar el estilo vigente.
   */
  verbatim?: boolean
}

export type AsciiPresetId = keyof typeof ASCII_PRESETS

export const ASCII_PRESETS = {
  /** El acabado actual de /perfil. Sin calibrar, para no moverlo. */
  ink: {
    candidates: RAMP,
    font: MONO_STACK,
    cellSize: CELL_SIZE,
    contrast: 1.35,
    levels: RAMP.length,
    verbatim: true,
  },

  /**
   * Braille: el salto de calidad real. Cada glifo es una rejilla de 2×4 puntos,
   * así que la imagen gana resolución efectiva sin achicar la celda ni pagar
   * más coste de render. Se ofrecen las 256 combinaciones y la calibración se
   * queda con las que reparten la tinta de forma pareja.
   */
  braille: {
    candidates: BRAILLE,
    font: WIDE_STACK,
    cellSize: 10,
    contrast: 1.25,
    levels: 14,
  },

  /**
   * Cifras. El retrato queda compuesto literalmente de dígitos, que en esta
   * página dice lo mismo que el titular del capítulo. Densidad muy pareja entre
   * glifos, así que la gradación sale suave.
   */
  digits: {
    candidates: " .:0123456789ABCDEF",
    font: MONO_STACK,
    cellSize: 11,
    contrast: 1.3,
    levels: 12,
  },

  /**
   * Bloques parciales: la rampa más lineal que existe, cada glifo llena un
   * octavo más que el anterior. Cartelístico y sólido, lo contrario de `ink`.
   */
  blocks: {
    candidates: " ▁▂▃▄▅▆▇█░▒▓",
    font: WIDE_STACK,
    cellSize: 9,
    contrast: 1.15,
    levels: 10,
  },

  /** Puntillismo: suave, de grabado, sin la agresividad del @#%. */
  stipple: {
    candidates: " .·∙•*✳❋●",
    font: WIDE_STACK,
    cellSize: 9,
    contrast: 1.4,
    levels: 8,
  },
} satisfies Record<string, AsciiPreset>

/**
 * Firma visual de un carácter: la celda rasterizada y reducida a una rejilla de
 * 4×4 medias. Sirve para dos cosas —comparar glifos entre sí y medir su tinta—
 * con una sola lectura del canvas.
 */
function glyphSignature(
  ctx: CanvasRenderingContext2D,
  char: string,
  size: number,
): { ink: number; cells: number[] } {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "#fff"
  ctx.fillText(char, size / 2, size / 2 + size * 0.04)

  const data = ctx.getImageData(0, 0, size, size).data
  const cells = new Array(16).fill(0)
  const counts = new Array(16).fill(0)
  let total = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = data[(y * size + x) * 4] / 255
      total += value
      const cell = Math.floor((y * 4) / size) * 4 + Math.floor((x * 4) / size)
      cells[cell] += value
      counts[cell]++
    }
  }

  return {
    ink: total / (size * size),
    cells: cells.map((sum, i) => sum / Math.max(counts[i], 1)),
  }
}

/**
 * Elige la rampa midiendo, en lugar de confiar en el ojo. Ordenar caracteres
 * por densidad aparente es justamente donde falla la intuición: en la rampa
 * original `·`, `:` y `;` tenían casi la misma tinta y se comían tres pasos de
 * los medios tonos, que quedaban aplastados en tres glifos indistinguibles.
 *
 * El procedimiento es: rasterizar cada candidato con la fuente que el navegador
 * haya cargado de verdad, descartar los que salgan como *tofu* —comparándolos
 * con un carácter de uso privado que ninguna fuente define—, ordenar por tinta
 * medida y quedarse con los que caen más cerca de una escala uniforme. Así la
 * rampa resultante recorre el rango de grises a pasos parejos, sea cual sea la
 * familia de símbolos y la fuente que acabe aplicándose.
 */
function calibrateRamp(candidates: string, font: string, levels: number): string {
  const size = 32
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  ctx.font = `${Math.floor(size * 0.82)}px ${font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // U+E000 pertenece al área de uso privado: ninguna fuente lo define, así que
  // lo que dibuje el canvas para él es exactamente el glifo de reemplazo.
  const tofu = glyphSignature(ctx, "", size)

  const measured: { char: string; ink: number }[] = []
  const seen: number[][] = []

  for (const char of candidates) {
    const signature = glyphSignature(ctx, char, size)

    const matches = (other: number[]) =>
      signature.cells.every((value, i) => Math.abs(value - other[i]) < 0.02)

    // El espacio se conserva siempre: es el nivel cero de la rampa y su firma
    // vacía coincidiría con la de cualquier otro glifo en blanco.
    if (char !== " ") {
      if (matches(tofu.cells)) continue
      if (seen.some(matches)) continue
    }

    seen.push(signature.cells)
    measured.push({ char, ink: signature.ink })
  }

  measured.sort((a, b) => a.ink - b.ink)
  if (measured.length <= levels) return measured.map((m) => m.char).join("")

  const maxInk = measured[measured.length - 1].ink
  const minInk = measured[0].ink

  const ramp: string[] = []
  for (let i = 0; i < levels; i++) {
    const target = minInk + ((maxInk - minInk) * i) / (levels - 1)
    let best = measured[0]
    for (const entry of measured) {
      if (Math.abs(entry.ink - target) < Math.abs(best.ink - target)) best = entry
    }
    if (!ramp.includes(best.char)) ramp.push(best.char)
  }

  return ramp.join("")
}

/**
 * Atlas de glifos: los caracteres de la rampa dibujados en fila sobre un lienzo
 * 2D y subidos como textura. Se genera una sola vez y se reutiliza en cada
 * frame, en vez de rasterizar texto por fotograma.
 */
function buildGlyphAtlas(ramp: string, font: string): CanvasTexture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size * ramp.length
  canvas.height = size

  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#fff"
  ctx.font = `${Math.floor(size * 0.82)}px ${font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  for (let i = 0; i < ramp.length; i++) {
    ctx.fillText(ramp[i], i * size + size / 2, size / 2 + size * 0.04)
  }

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  return texture
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uGlyphs;
  uniform vec2 uCells;
  uniform float uRampLength;
  uniform float uContrast;
  varying vec2 vUv;

  void main() {
    // Centro de la celda: toda la celda comparte un único muestreo de la
    // escena, que es lo que produce la cuadrícula de caracteres.
    vec2 cell = floor(vUv * uCells);
    vec2 cellUv = (cell + 0.5) / uCells;
    vec4 scene = texture2D(uScene, cellUv);

    float luma = dot(scene.rgb, vec3(0.2126, 0.7152, 0.0722));
    luma = clamp(pow(luma * uContrast, 0.85), 0.0, 1.0);

    // La opacidad del original also cuenta: sobre el fondo transparente no debe
    // dibujarse ningún carácter, o la silueta quedaría dentro de un rectángulo.
    float presence = scene.a;
    float index = floor(luma * (uRampLength - 1.0) + 0.5);

    // Coordenada dentro del glifo, con la fila del atlas correspondiente.
    vec2 inCell = fract(vUv * uCells);
    vec2 glyphUv = vec2((index + inCell.x) / uRampLength, inCell.y);
    float glyph = texture2D(uGlyphs, glyphUv).r;

    float alpha = glyph * presence;
    if (alpha < 0.02) discard;

    // El color lo pone la escena: así el carácter hereda el acento del capítulo.
    //
    // El divisor se acota en 0.30 y no en 0.08. Con el suelo muy bajo, la
    // división llevaba a saturación máxima a cualquier fragmento oscuro: el
    // color perdía toda gradación y las diferencias mínimas de tinte entre
    // celdas vecinas se amplificaban hasta volverse colores distintos. A 0.30
    // solo se realzan los fragmentos que ya tienen algo de luz, y el modelado
    // del volumen sobrevive al pase.
    vec3 tint = scene.rgb / max(luma, 0.30);
    gl_FragColor = vec4(clamp(tint, 0.0, 1.0), alpha);
  }
`

/**
 * Convierte lo que haya en la escena en una imagen de caracteres. Se ejecuta
 * como pase de post-proceso dentro del lienzo de WebGL —y no con el
 * `AsciiEffect` de los ejemplos de three, que escribe una tabla de HTML— para
 * conservar el color por fragmento, la transparencia sobre el fondo de la
 * página y el rendimiento de la GPU.
 */
export function AsciiPass({
  enabled = true,
  preset = "ink",
  contrast,
  cellSize,
  font,
}: {
  enabled?: boolean
  /** Familia de símbolos. Los props siguientes la sobrescriben pieza a pieza. */
  preset?: AsciiPresetId
  contrast?: number
  cellSize?: number
  font?: string
}) {
  const { gl, scene, camera, size, viewport } = useThree()

  const config = ASCII_PRESETS[preset] ?? ASCII_PRESETS.ink
  const family = font ?? config.font
  const cell = cellSize ?? config.cellSize

  // La calibración rasteriza los candidatos, así que necesita el canvas del
  // navegador: se hace una vez por preset y se memoriza con el atlas.
  const ramp = useMemo(
    () =>
      "verbatim" in config && config.verbatim
        ? config.candidates
        : calibrateRamp(config.candidates, family, config.levels),
    [config, family],
  )

  const glyphs = useMemo(() => buildGlyphAtlas(ramp, family), [ramp, family])

  const target = useMemo(() => {
    const rt = new WebGLRenderTarget(1, 1, {
      format: RGBAFormat,
      // Nearest: cada celda toma un punto concreto de la escena; interpolar
      // aquí emborronaría el muestreo y los caracteres bailarían al moverse.
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    })
    rt.texture.generateMipmaps = false
    return rt
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uScene: { value: target.texture },
          uGlyphs: { value: glyphs },
          uCells: { value: [80, 45] },
          uRampLength: { value: ramp.length },
          uContrast: { value: contrast ?? config.contrast },
        },
      }),
    [target, glyphs, ramp, contrast, config],
  )

  const quadScene = useMemo(() => {
    const s = new Scene()
    s.add(new Mesh(new PlaneGeometry(2, 2), material))
    return s
  }, [material])

  const quadCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const cells = useRef<[number, number]>([80, 45])

  useEffect(() => {
    const dpr = Math.min(viewport.dpr ?? 1, 2)
    const cols = Math.max(24, Math.round(size.width / cell))
    const rows = Math.max(16, Math.round(size.height / cell))
    cells.current = [cols, rows]
    material.uniforms.uCells.value = [cols, rows]

    // El destino se dimensiona a la rejilla, no a la pantalla: solo hace falta
    // un téxel por celda, así que el coste de render cae en picado.
    target.setSize(cols, rows)
    void dpr
  }, [size, viewport.dpr, cell, material, target])

  useEffect(() => {
    return () => {
      target.dispose()
      material.dispose()
      glyphs.dispose()
    }
  }, [target, material, glyphs])

  // Prioridad 1: sustituye al bucle de render por defecto de react-three-fiber.
  useFrame(() => {
    if (!enabled) {
      gl.setRenderTarget(null)
      gl.render(scene, camera)
      return
    }

    gl.setRenderTarget(target)
    gl.clear()
    gl.render(scene, camera)

    gl.setRenderTarget(null)
    gl.clear()
    gl.render(quadScene, quadCamera)
  }, 1)

  return null
}
