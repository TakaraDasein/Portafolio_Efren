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

/**
 * Atlas de glifos: los caracteres de la rampa dibujados en fila sobre un lienzo
 * 2D y subidos como textura. Se genera una sola vez y se reutiliza en cada
 * frame, en vez de rasterizar texto por fotograma.
 */
function buildGlyphAtlas(font: string): CanvasTexture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size * RAMP.length
  canvas.height = size

  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#fff"
  ctx.font = `${Math.floor(size * 0.82)}px ${font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  for (let i = 0; i < RAMP.length; i++) {
    ctx.fillText(RAMP[i], i * size + size / 2, size / 2 + size * 0.04)
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
    vec3 tint = scene.rgb / max(luma, 0.08);
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
  contrast = 1.35,
  cellSize = CELL_SIZE,
  font = "'Geist Mono', ui-monospace, monospace",
}: {
  enabled?: boolean
  contrast?: number
  cellSize?: number
  font?: string
}) {
  const { gl, scene, camera, size, viewport } = useThree()

  const glyphs = useMemo(() => buildGlyphAtlas(font), [font])

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
          uRampLength: { value: RAMP.length },
          uContrast: { value: contrast },
        },
      }),
    [target, glyphs, contrast],
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
    const cols = Math.max(24, Math.round(size.width / cellSize))
    const rows = Math.max(16, Math.round(size.height / cellSize))
    cells.current = [cols, rows]
    material.uniforms.uCells.value = [cols, rows]

    // El destino se dimensiona a la rejilla, no a la pantalla: solo hace falta
    // un téxel por celda, así que el coste de render cae en picado.
    target.setSize(cols, rows)
    void dpr
  }, [size, viewport.dpr, cellSize, material, target])

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
