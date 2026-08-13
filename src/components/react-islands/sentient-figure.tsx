"use client"

import { useRef, useMemo, useEffect, useState, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { MathUtils, Color, BufferAttribute, BufferGeometry as ThreeBufferGeometry } from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js"
import type { Mesh, ShaderMaterial, BufferGeometry, Object3D } from "three"

const PERSON_MODEL_PATH = "/ilustraciones/persona.glb"
const MIN_ZOOM = 2.2
const MAX_ZOOM = 6.5
/** Arranca en el acercamiento máximo: es la distancia donde la malla se lee mejor. */
const INITIAL_ZOOM = MIN_ZOOM

/**
 * Subdivisión de la malla, solo para modelos de poca densidad: con una malla ya
 * detallada, teselar multiplicaría cientos de miles de triángulos sin ganancia
 * visual y con un coste enorme. El umbral hace que se adapte sola al modelo
 * que haya en `persona.glb`.
 */
const TESSELLATE_BELOW_TRIANGLES = 60_000
const TESSELLATION_MAX_EDGE = 0.045
const TESSELLATION_PASSES = 6

/**
 * Amplitud del desplazamiento de vértices del shader, en unidades del modelo ya
 * escalado. Valores bajos mantienen la silueta legible; altos la deshacen.
 */
const NOISE_DISPLACEMENT = 0.005
const SPARKLE_DISPLACEMENT = 0.01

const CAMERA_Y = 0.1

/**
 * Altura de la figura en unidades de escena. Se normaliza por la caja
 * envolvente y no por el radio de la esfera: con los brazos en cruz el radio lo
 * marcaba la envergadura y el mismo valor daba tamaños muy distintos según el
 * modelo. A este alto la figura entra entera en el encuadre inicial.
 */
const MODEL_TARGET_HEIGHT = 1.6

/** Desplazamiento inicial; comparte variables con el arrastre del ratón. */
const INITIAL_PAN_X = 0
const INITIAL_PAN_Y = 0

/**
 * Recorrido máximo del arrastre. Más ancho en horizontal porque el lienzo lo es,
 * y así se puede llevar la figura a un lado para despejar el centro.
 */
const PAN_LIMIT_X = 2.6
const PAN_LIMIT_Y = 1.6

/**
 * Balanceo en reposo: la figura gira lentamente de un lado a otro sin dejar de
 * mirar al frente, asomando algo de perfil en los extremos. Se suma sobre la
 * rotación del usuario, así que arrastrarla no interrumpe el movimiento ni
 * provoca saltos al soltar.
 */
const SWAY_DEGREES = 20
const SWAY_SECONDS = 11
// El modelo no viene mirando a cámara; esta rotación fija su pose de reposo.
const BASE_ROTATION_Y = 0

export const MOODS = [
  { id: "calma", label: "Calma", color: "#7dd3fc", intensity: 0.6 },
  { id: "enfoque", label: "Enfoque", color: "#ffffff", intensity: 0.4 },
  { id: "energia", label: "Energía", color: "#fb923c", intensity: 1.5 },
  { id: "misterio", label: "Misterio", color: "#a78bfa", intensity: 1.0 },
] as const

export type MoodId = (typeof MOODS)[number]["id"]

/**
 * `keepIndex` solo es viable con una malla única: `mergeGeometries` exige que
 * todas compartan el mismo criterio, y desindexar multiplica los vértices.
 */
function normalizeMeshGeometry(mesh: Mesh, keepIndex: boolean): BufferGeometry {
  let geo = mesh.geometry.clone()
  geo.applyMatrix4(mesh.matrixWorld)
  if (geo.index && !keepIndex) geo = geo.toNonIndexed()
  if (!geo.getAttribute("normal")) geo.computeVertexNormals()

  const clean = new ThreeBufferGeometry()
  clean.setAttribute("position", geo.getAttribute("position"))
  clean.setAttribute("normal", geo.getAttribute("normal"))

  const uv = geo.getAttribute("uv")
  if (uv) {
    clean.setAttribute("uv", uv)
  } else {
    const pos = geo.getAttribute("position")
    const arr = new Float32Array(pos.count * 2)
    for (let i = 0; i < pos.count; i++) {
      arr[i * 2] = pos.getX(i)
      arr[i * 2 + 1] = pos.getY(i)
    }
    clean.setAttribute("uv", new BufferAttribute(arr, 2))
  }

  if (keepIndex && geo.index) clean.setIndex(geo.index)

  return clean
}

function buildGeometryFromModel(root: Object3D): BufferGeometry {
  root.updateWorldMatrix(true, true)

  const meshes: Mesh[] = []
  root.traverse((child) => {
    const mesh = child as Mesh
    if ((mesh as any).isMesh && mesh.geometry) meshes.push(mesh)
  })

  if (meshes.length === 0) {
    throw new Error("No se encontraron mallas en el modelo persona.glb")
  }

  // Con una sola malla no hace falta fusionar y se conserva su índice, lo que
  // evita expandir los vértices (322k indexados pasarían a 1,5M sueltos).
  const single = meshes.length === 1
  const parts = meshes.map((mesh) => normalizeMeshGeometry(mesh, single))
  const merged = single ? parts[0] : mergeGeometries(parts, false)!

  merged.center()
  merged.computeBoundingBox()
  const height = (merged.boundingBox?.max.y ?? 1) - (merged.boundingBox?.min.y ?? -1)
  const scaleFactor = MODEL_TARGET_HEIGHT / (height || 1)
  merged.scale(scaleFactor, scaleFactor, scaleFactor)

  const triangles = (merged.index?.count ?? merged.getAttribute("position").count) / 3
  if (triangles >= TESSELLATE_BELOW_TRIANGLES) {
    merged.computeBoundingSphere()
    return merged
  }

  // Se tesela después de escalar: `maxEdgeLength` se mide en las unidades finales.
  const detailed = new TessellateModifier(
    TESSELLATION_MAX_EDGE,
    TESSELLATION_PASSES,
  ).modify(merged)

  detailed.computeVertexNormals()
  detailed.computeBoundingSphere()

  return detailed
}

useGLTF.preload(PERSON_MODEL_PATH)

function Figure({
  accentColor = "#7dd3fc",
  intensity = 1,
}: {
  accentColor?: string
  intensity?: number
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer, gl, camera } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const dragModeRef = useRef<"rotate" | "pan" | null>(null)
  const rotationRef = useRef({ x: 0, y: BASE_ROTATION_Y })
  const panXRef = useRef(INITIAL_PAN_X)
  const panYRef = useRef(INITIAL_PAN_Y)
  const previousPointer = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(INITIAL_ZOOM)
  const targetColorRef = useRef(new Color(accentColor))
  const currentColorRef = useRef(new Color(accentColor))
  const targetIntensityRef = useRef(intensity)
  const currentIntensityRef = useRef(intensity)

  const { scene } = useGLTF(PERSON_MODEL_PATH) as unknown as { scene: Object3D }
  const geometry = useMemo(() => buildGeometryFromModel(scene), [scene])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uAccentColor: { value: [0.49, 0.8, 0.99] },
      uIntensity: { value: 1 },
    }),
    [],
  )

  useEffect(() => {
    targetColorRef.current.set(accentColor)
  }, [accentColor])

  useEffect(() => {
    targetIntensityRef.current = intensity
  }, [intensity])

  // Blender-style navigation: middle mouse button drags/orbits the figure. Prevent the
  // browser's native middle-click behaviors (autoscroll icon, middle-click paste) on the canvas.
  useEffect(() => {
    const dom = gl.domElement
    const blockMiddleClickDefault = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault()
    }
    dom.addEventListener("mousedown", blockMiddleClickDefault)
    dom.addEventListener("auxclick", blockMiddleClickDefault)
    return () => {
      dom.removeEventListener("mousedown", blockMiddleClickDefault)
      dom.removeEventListener("auxclick", blockMiddleClickDefault)
    }
  }, [gl])

  // Zoom: mouse wheel + touch pinch, both dolly the camera along Z within clamped bounds.
  useEffect(() => {
    const dom = gl.domElement

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomRef.current = MathUtils.clamp(zoomRef.current + e.deltaY * 0.0015, MIN_ZOOM, MAX_ZOOM)
    }

    const pinchDist = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)

    let pinchStartDist: number | null = null
    let pinchStartZoom = zoomRef.current

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStartDist = pinchDist(e.touches)
        pinchStartZoom = zoomRef.current
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDist) {
        e.preventDefault()
        const ratio = pinchStartDist / pinchDist(e.touches)
        zoomRef.current = MathUtils.clamp(pinchStartZoom * ratio, MIN_ZOOM, MAX_ZOOM)
      }
    }

    const handleTouchEnd = () => {
      pinchStartDist = null
    }

    dom.addEventListener("wheel", handleWheel, { passive: false })
    dom.addEventListener("touchstart", handleTouchStart, { passive: true })
    dom.addEventListener("touchmove", handleTouchMove, { passive: false })
    dom.addEventListener("touchend", handleTouchEnd)

    return () => {
      dom.removeEventListener("wheel", handleWheel)
      dom.removeEventListener("touchstart", handleTouchStart)
      dom.removeEventListener("touchmove", handleTouchMove)
      dom.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gl])

  const vertexShader = `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying float vDisplacement;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;

      float noise = snoise(position * 2.2 + uTime * 0.15);
      float displacement = noise * ${NOISE_DISPLACEMENT} * uIntensity;
      vDisplacement = displacement;

      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `

  /*
   * Los destellos se calculan aquí y no en el vértice a propósito: con
   * `wireframe` el shader de vértices corre 6 veces por triángulo (una por
   * extremo de cada arista), así que con medio millón de triángulos eran 3M de
   * invocaciones por frame, cada una con cuatro ruidos simplex. Las aristas
   * cubren pocos píxeles, de modo que en el fragmento sale mucho más barato.
   */
  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uAccentColor;
    uniform float uIntensity;
    varying vec2 vUv;
    varying float vDisplacement;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 sparkleCell = floor(vUv * 13.0);
      float sparklePattern = random(sparkleCell);
      float sparkleSpeed = mix(0.22, 0.55, sparklePattern);
      float sparkleTime = fract(uTime * sparkleSpeed + sparklePattern * 13.37);

      vec2 localUv = fract(vUv * 13.0) - 0.5;
      float cellWarp = snoise(vec3(localUv * 4.2 + sparkleCell * 0.17, uTime * 0.22 + sparklePattern * 4.0));
      vec2 warpedUv = localUv + vec2(
        snoise(vec3(localUv * 3.1 + sparkleCell * 0.11, uTime * 0.15)),
        snoise(vec3(localUv * 3.1 + sparkleCell * 0.19, uTime * 0.18))
      ) * 0.16;
      float blobMask = smoothstep(0.7, 0.01, length(warpedUv) + cellWarp * 0.17);

      float fadeInOut = smoothstep(0.0, 0.22, sparkleTime) * smoothstep(1.0, 0.78, sparkleTime);
      float twinkle = 0.65 + 0.35 * sin((sparkleTime + sparklePattern) * 6.28318);

      float sparkle = smoothstep(0.85, 0.95, sparklePattern) *
                      fadeInOut *
                      twinkle *
                      blobMask;

      float edgeSpeed = mix(0.45, 1.0, sparklePattern);
      float edgeSparkle = smoothstep(0.7, 1.0, vDisplacement * 4.0) *
                          (sin(uTime * edgeSpeed + vUv.x * 10.0 + sparklePattern * 20.0) * 0.5 + 0.5);

      float totalSparkle = max(sparkle, edgeSparkle * 0.44) * uIntensity;

      float intensity = 0.4 + vDisplacement * 4.0;
      vec3 baseColor = vec3(intensity) * vec3(0.72, 0.85, 1.0);

      float line = smoothstep(0.0, 0.02, abs(fract(vUv.x * 20.0) - 0.5));
      line *= smoothstep(0.0, 0.02, abs(fract(vUv.y * 20.0) - 0.5));

      vec3 finalColor = mix(baseColor, uAccentColor, clamp(totalSparkle * 0.92, 0.0, 1.0));
      finalColor = finalColor * (1.0 - line * 0.5);

      gl_FragColor = vec4(finalColor, clamp(0.5 * uIntensity + 0.14 + totalSparkle * 0.36, 0.15, 1.0));
    }
  `

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uMouse.value = [pointer.x, pointer.y]

      currentColorRef.current.lerp(targetColorRef.current, 0.06)
      materialRef.current.uniforms.uAccentColor.value = [
        currentColorRef.current.r,
        currentColorRef.current.g,
        currentColorRef.current.b,
      ]

      currentIntensityRef.current = MathUtils.lerp(currentIntensityRef.current, targetIntensityRef.current, 0.06)
      materialRef.current.uniforms.uIntensity.value = currentIntensityRef.current
    }

    camera.position.z = MathUtils.lerp(camera.position.z, zoomRef.current, 0.15)

    if (meshRef.current) {
      if (isDragging && dragModeRef.current === "rotate") {
        const deltaX = (pointer.x - previousPointer.current.x) * 3
        const deltaY = (pointer.y - previousPointer.current.y) * 3

        rotationRef.current = {
          x: rotationRef.current.x - deltaY,
          y: rotationRef.current.y + deltaX,
        }

        previousPointer.current = { x: pointer.x, y: pointer.y }

      } else if (isDragging && dragModeRef.current === "pan") {
        // Arrastre en los dos ejes: antes solo seguía el vertical.
        const deltaX = (pointer.x - previousPointer.current.x) * 2.5
        const deltaY = (pointer.y - previousPointer.current.y) * 2.5
        panXRef.current = MathUtils.clamp(panXRef.current + deltaX, -PAN_LIMIT_X, PAN_LIMIT_X)
        panYRef.current = MathUtils.clamp(panYRef.current + deltaY, -PAN_LIMIT_Y, PAN_LIMIT_Y)

        previousPointer.current = { x: pointer.x, y: pointer.y }

        meshRef.current.position.x = panXRef.current
        meshRef.current.position.y = panYRef.current
      }

      // El vaivén se aplica siempre, sobre la orientación elegida por el usuario.
      const sway =
        Math.sin((state.clock.elapsedTime * Math.PI * 2) / SWAY_SECONDS) *
        MathUtils.degToRad(SWAY_DEGREES)

      meshRef.current.rotation.x = rotationRef.current.x
      meshRef.current.rotation.y = rotationRef.current.y + sway
    }
  })

  const handlePointerDown = (e: any) => {
    // Blender-style: middle mouse orbits, left click drags/pans vertically. Touch orbits with one finger.
    if (e.pointerType === "touch") {
      dragModeRef.current = "rotate"
    } else if (e.button === 1) {
      dragModeRef.current = "rotate"
    } else if (e.button === 0) {
      dragModeRef.current = "pan"
    } else {
      return
    }
    e.stopPropagation()
    setIsDragging(true)
    previousPointer.current = { x: pointer.x, y: pointer.y }
    gl.domElement.style.cursor = "grabbing"
  }

  const handlePointerUp = (e: any) => {
    if (e) e.stopPropagation()
    setIsDragging(false)
    dragModeRef.current = null
    gl.domElement.style.cursor = "auto"
  }

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      e.stopPropagation()
    }
  }

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        handlePointerUp(null)
      }
    }

    window.addEventListener("pointerup", handleGlobalPointerUp)
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp)
  }, [isDragging])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[0, BASE_ROTATION_Y, 0]}
      position={[INITIAL_PAN_X, INITIAL_PAN_Y, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        wireframe
      />
    </mesh>
  )
}

/**
 * El estado de ánimo se controla desde fuera (ver `figure-controls.tsx`): sus
 * botones vivían anclados al pie del lienzo y en móvil quedaban cortados.
 */
export function SentientFigure({
  accentColor = "#7dd3fc",
  moodId = null,
}: {
  accentColor?: string
  moodId?: MoodId | null
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeMood = MOODS.find((m) => m.id === moodId)

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-40 h-64 rounded-full border border-white/10 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, CAMERA_Y, INITIAL_ZOOM], fov: 45 }}
          className="w-full my-0 h-full py-0"
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
          }}
          style={{ pointerEvents: "auto", touchAction: "none" }}
        >
          <ambientLight intensity={0.5} />
          <Suspense fallback={null}>
            <Figure accentColor={activeMood?.color ?? accentColor} intensity={activeMood?.intensity ?? 1} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
