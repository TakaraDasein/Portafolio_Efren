"use client"

import { useRef, useMemo, useEffect, useState, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { AsciiPass, type AsciiPresetId } from "./ascii-pass"
import {
  MathUtils,
  Color,
  BufferAttribute,
  BufferGeometry as ThreeBufferGeometry,
  AdditiveBlending,
} from "three"
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
 * Color del fondo lejano. Es un azul muy oscuro y desaturado, no negro: contra
 * el negro puro de la página lo lejano desaparecería del todo y la escena
 * perdería su plano más profundo. Al virar hacia él, la distancia se lee como
 * perspectiva aérea —lo lejano se enfría y pierde contraste— en vez de como un
 * simple desvanecido.
 */
const FAR_COLOR = "#101d33"

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

/**
 * Un punto del recorrido de cámara, en coordenadas esféricas alrededor de la
 * figura. Se describe así, y no con una posición cartesiana, porque el
 * movimiento que se busca es orbital: al interpolar el azimut la cámara rodea
 * al personaje por un arco, mientras que interpolando posiciones cortaría en
 * línea recta y atravesaría el cuerpo.
 *
 * - `azimuth`   giro alrededor del eje vertical, en grados. 0 es de frente,
 *               90 perfil derecho, 180 la espalda.
 * - `elevation` altura de la cámara vista desde el punto enfocado, en grados.
 *               Negativa la coloca por debajo y produce el contrapicado.
 * - `radius`    distancia al personaje, **en múltiplos de su altura**. 1.15
 *               encuadra el cuerpo entero; 0.30 es un primer plano de cabeza.
 *               Se expresa en relación con la figura y no en unidades de
 *               escena para que el encuadre no dependa de la escala del modelo:
 *               con una distancia absoluta, agrandar la figura la alejaba en la
 *               misma proporción y el plano quedaba idéntico.
 * - `target`    altura del punto enfocado, en unidades del modelo: es la parte
 *               del cuerpo que queda en el centro del encuadre.
 * - `frameX`    posición del personaje dentro del encuadre: 0 centrado, +1 lo
 *               lleva al borde derecho, -1 al izquierdo. No gira la cámara,
 *               la desplaza en paralelo (un *truck* de rodaje), de modo que la
 *               perspectiva del plano no cambia al descentrar al sujeto.
 * - `frameY`    lo mismo en vertical.
 * - `label`     nombre del plano, para poder rotularlo en la interfaz.
 */
export type CameraKey = {
  azimuth: number
  elevation: number
  radius: number
  target: number
  frameX?: number
  frameY?: number
  label: string
}

/**
 * Alturas de referencia del cuerpo. La geometría se centra en el origen y se
 * normaliza a `MODEL_TARGET_HEIGHT`, así que la cabeza queda en torno a +0.8 y
 * los pies en -0.8 en unidades de modelo, antes de la escala del `<mesh>`.
 */
export const BODY = {
  pies: -0.72,
  rodillas: -0.42,
  cadera: -0.08,
  cintura: 0.06,
  brazos: 0.24,
  pecho: 0.34,
  hombros: 0.52,
  /** Altura del rostro: es el eje de todo el recorrido de cámara. */
  rostro: 0.62,
  cabeza: 0.68,
} as const

/**
 * Recorrido por defecto: una espiral ascendente que arranca lejos y de frente,
 * baja a un contrapicado, rodea al personaje pasando por los dos perfiles y la
 * espalda, y sube de la cintura a la cabeza cerrando el plano. Cada tramo entre
 * dos claves consecutivas es un capítulo de scroll.
 */
export const ASCENDING_ORBIT: CameraKey[] = [
  /*
   * Todo el recorrido orbita el rostro por su hemisferio frontal: el azimut se
   * mueve dentro de ±55°, el arco en el que la cara sigue leyéndose.
   *
   * El signo del azimut no es libre: manda hacia dónde mira el personaje. Con
   * la cámara situada a su derecha (azimut positivo) el rostro queda vuelto
   * hacia la izquierda del cuadro, y al revés. Por eso el signo va siempre
   * emparejado con `frameX`: figura a la derecha y texto a la izquierda pide
   * azimut positivo, para que mire hacia el texto y no hacia el borde vacío.
   */
  { azimuth: 12, elevation: 5, radius: 0.26, target: BODY.cabeza, frameX: 0.52, label: "Primer plano" },
  { azimuth: 34, elevation: -11, radius: 0.30, target: BODY.rostro, frameX: 0.42, label: "Contrapicado tres cuartos" },
  { azimuth: -46, elevation: 7, radius: 0.35, target: BODY.rostro, frameX: -0.42, label: "Tres cuartos derecho" },
  { azimuth: 52, elevation: -5, radius: 0.36, target: BODY.rostro, frameX: 0.42, label: "Perfil izquierdo" },
  // V1TR0 y la pausa intercambiaron su lugar en el recorrido; sus claves van
  // con ellos para que cada capítulo conserve el encuadre con el que se diseñó.
  { azimuth: -38, elevation: -7, radius: 0.32, target: BODY.rostro, frameX: -0.38, label: "Contrapicado derecho" },
  // La pausa es el único capítulo con el texto centrado a todo el ancho, así que
  // no hay lado libre donde apartar la figura: `frameX` tiene que seguir en 0 y
  // la separación se busca en vertical. `frameY` positivo sube al personaje
  // dentro del cuadro y deja el rostro por encima de la cita.
  { azimuth: 8, elevation: 13, radius: 0.50, target: BODY.rostro, frameX: 0, frameY: 0.34, label: "Picado frontal" },
  { azimuth: 44, elevation: 10, radius: 0.24, target: BODY.rostro, frameX: 0.38, label: "Picado corto" },
  { azimuth: -55, elevation: -8, radius: 0.34, target: BODY.rostro, frameX: -0.38, label: "Perfil derecho" },
  { azimuth: 22, elevation: 4, radius: 0.22, target: BODY.rostro, frameX: 0.38, label: "Frontal corto" },
  { azimuth: -30, elevation: -3, radius: 0.18, target: BODY.rostro, frameX: -0.38, label: "Plano detalle" },
  { azimuth: 0, elevation: 4, radius: 0.44, target: BODY.rostro, frameX: 0, label: "Cierre frontal" },
]

/**
 * Generador determinista. La disposición de los distritos y de las ramas se
 * sortea, pero debe salir idéntica en cada montaje: con `Math.random` el fondo
 * cambiaba entre recargas y entre servidor y cliente, y lo que se diseña como
 * un emplazamiento concreto detrás del hombro dejaba de estar ahí.
 */
function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Emplazamiento de cada distrito, en las mismas coordenadas esféricas que el
 * recorrido de cámara para poder razonar los dos juntos.
 *
 * La relación entre cámara y fondo se resume en una regla: una cámara situada
 * en el azimut A deja en cuadro el fondo centrado en A+180. Es lo que decide
 * qué distritos se ven en cada plano del recorrido.
 *
 * `radius` va en múltiplos de la altura de la figura, igual que en `CameraKey`,
 * de modo que el fondo escala con el personaje y no hay que reajustarlo al
 * cambiar `FIGURE_SCALE`.
 */
type District = {
  azimuth: number
  elevation: number
  radius: number
  /** Radio de la nube, en múltiplos de la altura de la figura. */
  spread: number
  /** Peso relativo en el reparto de puntos: es la "densidad" del distrito. */
  weight: number
}

/** Número de distritos del anillo. Reparte el presupuesto de puntos. */
const DISTRICT_COUNT = 52

/**
 * Esfera de distritos alrededor de la figura, generada en vez de escrita a
 * mano. Con una lista literal había que ir tapando planos vacíos de uno en uno
 * —y siempre quedaba alguno—; generándola, la cobertura de los 360° está
 * garantizada por construcción.
 *
 * El reparto es una **espiral de Fibonacci**, que es la construcción estándar
 * para distribuir puntos uniformemente sobre una esfera. La clave está en de
 * dónde sale la elevación: la altura `y` avanza de forma lineal entre los polos
 * y el azimut gira con el ángulo áureo. Como en una esfera las franjas de igual
 * altura tienen igual área, un `y` uniforme reparte los puntos por área y no
 * por ángulo, que es justo lo que hace que no se apelotonen.
 *
 * La versión anterior sacaba el azimut del ángulo áureo pero la elevación de
 * una onda senoidal, y ahí estaba el defecto: una senoidal pasa más tiempo
 * cerca de sus extremos que del centro, así que los distritos se acumulaban en
 * dos bandas de altura y dejaban el resto despejado. Se veían juntos porque lo
 * estaban.
 *
 * La densidad sí sigue sesgada hacia atrás. `ASCENDING_ORBIT` mantiene la
 * cámara dentro de ±55°, de modo que el hemisferio frontal solo entra en cuadro
 * en la vista libre; los distritos existen ahí —la esfera es completa— pero con
 * menos peso, para no gastar puntos donde casi no se miran.
 */
const DISTRICTS: District[] = (() => {
  const rand = seededRandom(0xd157)
  const list: District[] = []
  // Ángulo áureo en radianes: la vuelta que nunca cierra ciclo, y por eso no
  // produce alineaciones visibles al orbitar.
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < DISTRICT_COUNT; i++) {
    // El medio punto de desplazamiento evita colocar un distrito exactamente en
    // cada polo, donde quedaría justo encima y debajo de la cabeza.
    const y = 1 - ((i + 0.5) / DISTRICT_COUNT) * 2
    const azimuth = (((GOLDEN * i * 180) / Math.PI) % 360 + 360) % 360
    // 0 de frente, 1 justo detrás: mide cuánto se mira esa dirección.
    const backness = (1 - Math.cos((azimuth * Math.PI) / 180)) / 2

    list.push({
      azimuth,
      // Achatado a 0.8: la figura es alta y estrecha, y la esfera entera dejaba
      // demasiados distritos en la vertical, fuera de cuadro en casi todos los
      // planos.
      elevation: (Math.asin(y) * 180) / Math.PI * 0.8,
      // Banda de profundidad ancha y sin relación con la dirección: es el
      // segundo eje de dispersión, el que evita que todos caigan sobre una
      // misma cáscara y se lean como un anillo plano.
      radius: 1.15 + rand() * 2.35,
      // Distritos pequeños: con la red tejida dentro de cada uno, una nube
      // ancha separaba demasiado sus propias anclas y los tramos se alargaban.
      spread: 0.14 + rand() * 0.16,
      weight: (0.55 + 0.7 * backness) * (0.7 + rand() * 0.6),
    })
  }

  return list
})()

function districtCenter(d: District, figureHeight: number): [number, number, number] {
  const az = (d.azimuth * Math.PI) / 180
  const el = (d.elevation * Math.PI) / 180
  const r = d.radius * figureHeight
  return [
    r * Math.cos(el) * Math.sin(az),
    r * Math.sin(el),
    r * Math.cos(el) * Math.cos(az),
  ]
}

/**
 * Red que enlaza la nube. La estructura es deliberadamente **local**: cada
 * distrito teje su propia malla corta entre puntos de anclaje vecinos, y solo
 * se tiende un enlace entre distritos cuando están lo bastante cerca.
 *
 * Antes esto era un único árbol de recubrimiento mínimo sobre todos los
 * distritos. Un árbol de recubrimiento tiene que llegar a todos los nodos sí o
 * sí, así que acababa tendiendo arcos larguísimos que cruzaban el encuadre de
 * lado a lado, y el resultado era lo contrario de una red: pocas líneas muy
 * largas separando zonas enteras vacías.
 *
 * Con mallas locales más enlaces por proximidad, el trazo es corto en todas
 * partes y el vacío queda repartido en huecos pequeños entre nodos, en vez de
 * concentrarse en dos o tres regiones grandes. La red se lee como tejido y no
 * como cableado.
 */
function buildBranchNetwork(figureHeight: number): Float32Array {
  const rand = seededRandom(0x5eed)
  const vertices: number[] = []

  const push = (a: number[], b: number[]) => {
    vertices.push(a[0], a[1], a[2], b[0], b[1], b[2])
  }

  /**
   * Traza un enlace partido en tramos con desvío, en lugar de un segmento
   * recto. El desvío es proporcional a la longitud, así que los enlaces cortos
   * salen casi rectos y solo los largos se arquean: es lo que evita que los
   * tramos de dentro de un distrito parezcan garabatos.
   */
  const link = (a: number[], b: number[], steps: number, wobble: number) => {
    const length = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    const amount = length * wobble
    let previous = a

    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const arc = Math.sin(t * Math.PI)
      const point =
        s === steps
          ? b
          : [
              a[0] + (b[0] - a[0]) * t + (rand() - 0.5) * amount * arc,
              a[1] + (b[1] - a[1]) * t + (rand() - 0.5) * amount * arc,
              a[2] + (b[2] - a[2]) * t + (rand() - 0.5) * amount * arc,
            ]
      push(previous, point)
      previous = point
    }
  }

  // Anclas de cada distrito: los nodos de su malla interna.
  const anchors: number[][][] = DISTRICTS.map((district) => {
    const [cx, cy, cz] = districtCenter(district, figureHeight)
    const spread = district.spread * figureHeight
    const count = 4 + Math.round(district.weight * 4)

    return Array.from({ length: count }, () => {
      const r = spread * (0.35 + rand() * 0.75)
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      return [
        cx + r * Math.sin(phi) * Math.cos(theta),
        cy + r * Math.cos(phi) * 0.8,
        cz + r * Math.sin(phi) * Math.sin(theta),
      ]
    })
  })

  // Malla interna: cada ancla se enlaza con sus dos vecinas más próximas del
  // mismo distrito. Dos y no todas contra todas —eso sería una retícula
  // cerrada— ni una sola, que daría una cadena sin ramificar.
  anchors.forEach((nodes) => {
    nodes.forEach((node, i) => {
      const neighbours = nodes
        .map((other, j) => ({
          other,
          j,
          dist: Math.hypot(node[0] - other[0], node[1] - other[1], node[2] - other[2]),
        }))
        .filter((entry) => entry.j !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2)

      // Solo hacia adelante, o cada arista se dibujaría dos veces.
      neighbours.filter((entry) => entry.j > i).forEach((entry) => link(node, entry.other, 2, 0.18))
    })
  })

  /*
   * Enlaces entre distritos, únicamente por proximidad. El umbral es lo que
   * mantiene el equilibrio que se busca: sin él la red vuelve a cruzar el
   * encuadre entero, y con él demasiado bajo los distritos quedan como islas
   * sueltas y se pierde el efecto de red.
   */
  /*
   * El umbral se deriva del número de distritos en vez de fijarse a mano. En
   * una esfera de radio R con N puntos repartidos por área, la separación
   * típica entre vecinos ronda 2R·√(π/N); el margen del 10% por encima es lo
   * que hace que cada distrito enlace con sus vecinos inmediatos y con nadie
   * más.
   *
   * Calcularlo así importa porque el umbral y el recuento están acoplados: al
   * subir `DISTRICT_COUNT` los distritos se acercan entre sí, y un umbral fijo
   * empezaría a enlazar también con los segundos y terceros vecinos hasta
   * cerrar la red en una retícula. De este modo el tejido conserva su aspecto
   * al cambiar la cantidad.
   */
  const MEAN_RADIUS = 2.3
  const MAX_LINK = figureHeight * 2 * MEAN_RADIUS * Math.sqrt(Math.PI / DISTRICT_COUNT) * 1.1
  const centers = DISTRICTS.map((d) => districtCenter(d, figureHeight))

  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const dist = Math.hypot(
        centers[i][0] - centers[j][0],
        centers[i][1] - centers[j][1],
        centers[i][2] - centers[j][2],
      )
      if (dist > MAX_LINK) continue

      // Se enlazan las anclas más próximas entre los dos distritos, no los
      // centros: así el trazo nace del borde del tejido y no lo atraviesa.
      let best = { a: anchors[i][0], b: anchors[j][0], dist: Infinity }
      for (const a of anchors[i]) {
        for (const b of anchors[j]) {
          const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
          if (d < best.dist) best = { a, b, dist: d }
        }
      }
      link(best.a, best.b, 4, 0.12)
    }
  }

  return new Float32Array(vertices)
}

/**
 * Red ramificada entre distritos. Va en blending normal y no aditivo: las
 * ramas se cruzan entre sí y con la nube, y en aditivo cada cruce se volvía un
 * nudo brillante que en el pase de caracteres saltaba dos o tres glifos de la
 * rampa.
 */
function BranchNetwork({
  figureHeight,
  nearColor,
  farColor,
}: {
  figureHeight: number
  nearColor: string
  farColor: string
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const groupRef = useRef<any>(null)

  const geometry = useMemo(() => {
    const geo = new ThreeBufferGeometry()
    geo.setAttribute("position", new BufferAttribute(buildBranchNetwork(figureHeight), 3))
    return geo
  }, [figureHeight])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNear: { value: new Color(nearColor) },
      uFar: { value: new Color(farColor) },
      uFogNear: { value: figureHeight * 0.8 },
      uFogFar: { value: figureHeight * 4.2 },
    }),
    [figureHeight, nearColor, farColor],
  )

  useFrame((state, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta
    // La red gira solidaria con la nube: si derivaran a ritmos distintos, las
    // ramas se despegarían de los distritos que enlazan.
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.014
  })

  return (
    <lineSegments ref={groupRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uFogNear;
          uniform float uFogFar;
          varying float vDepth;

          void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vDepth = clamp((-viewPosition.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
            gl_Position = projectionMatrix * viewPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uNear;
          uniform vec3 uFar;
          varying float vDepth;

          void main() {
            // La profundidad se dice dos veces, en color y en opacidad. Solo con
            // opacidad el fondo se lee como niebla gris; el viraje a frío es lo
            // que hace que la distancia se perciba como distancia.
            // Opacidad baja a propósito. En WebGL el grosor de línea no se
            // puede cambiar: linewidth se ignora en casi todas las plataformas
            // y toda línea sale de un píxel. Así que "más fina" se
            // consigue por transparencia: es lo que la vuelve un tejido sutil
            // en vez de un cableado marcado.
            vec3 color = mix(uNear, uFar, vDepth);
            float alpha = mix(0.26, 0.04, vDepth);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </lineSegments>
  )
}

/**
 * Campo de partículas que envuelve a la figura. Vive dentro del lienzo, y no
 * como capa de HTML encima, por tres razones: comparte la cámara —así el
 * paralaje entre las partículas cercanas y las lejanas es real y no simulado—,
 * queda ocluido por el cuerpo cuando pasa por detrás, y entra en el pase de
 * caracteres igual que el resto de la escena.
 *
 * Los puntos no se reparten por igual: la mayor parte se agrupa en los
 * distritos de `DISTRICTS` y el resto queda como bruma de relleno, para que el
 * espacio entre agrupaciones no se vea vacío. La densidad es el dato: un
 * distrito no es un objeto con contorno, es una zona donde hay más puntos.
 */
function ParticleField({
  count = 1200,
  accentColor = "#7dd3fc",
  scale = 1,
}: {
  count?: number
  accentColor?: string
  scale?: number
}) {
  const pointsRef = useRef<any>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const targetColorRef = useRef(new Color(accentColor))
  const currentColorRef = useRef(new Color(accentColor))

  const figureHeight = MODEL_TARGET_HEIGHT * scale

  const geometry = useMemo(() => {
    const rand = seededRandom(0xc17a)
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    // Dos tercios a los distritos y uno a la bruma. Con más proporción de bruma
    // las agrupaciones dejan de leerse como agrupaciones; con menos, el espacio
    // entre ellas se abre y el fondo se parte en islas sueltas.
    const clustered = Math.floor(count * 0.68)
    const totalWeight = DISTRICTS.reduce((sum, d) => sum + d.weight, 0)

    let index = 0

    DISTRICTS.forEach((district, di) => {
      const share = Math.round((district.weight / totalWeight) * clustered)
      const [cx, cy, cz] = districtCenter(district, figureHeight)
      const spread = district.spread * figureHeight

      for (let i = 0; i < share && index < clustered; i++, index++) {
        /*
         * Radio con potencia 1.6 en vez de lineal: concentra los puntos hacia
         * el centro del distrito y deja la periferia deshilachada. Repartir el
         * radio de forma uniforme daba una bola de densidad plana con un borde
         * neto, que se leía como un objeto sólido y no como una aglomeración.
         */
        const r = spread * Math.pow(rand(), 1.6)
        const theta = rand() * Math.PI * 2
        const phi = Math.acos(2 * rand() - 1)

        positions[index * 3] = cx + r * Math.sin(phi) * Math.cos(theta)
        positions[index * 3 + 1] = cy + r * Math.cos(phi) * 0.8
        positions[index * 3 + 2] = cz + r * Math.sin(phi) * Math.sin(theta)
        seeds[index] = rand()
      }
      void di
    })

    for (; index < count; index++) {
      /*
       * Bruma de relleno en cáscara esférica con raíz cúbica del azar: repartir
       * el radio de forma uniforme amontonaría casi todo cerca del centro,
       * porque el volumen crece con el cubo del radio.
       */
      const radius = figureHeight * (0.55 + Math.cbrt(rand()) * 2.4)
      const theta = rand() * Math.PI * 2
      // acos de un valor uniforme evita que los puntos se apelotonen en los polos.
      const phi = Math.acos(2 * rand() - 1)

      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      // Achatada en vertical: la figura es alta y estrecha, y una nube esférica
      // dejaba un halo desproporcionado por encima de la cabeza.
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.7
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      seeds[index] = rand()
    }

    const geo = new ThreeBufferGeometry()
    geo.setAttribute("position", new BufferAttribute(positions, 3))
    geo.setAttribute("aSeed", new BufferAttribute(seeds, 1))
    return geo
  }, [count, figureHeight])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    targetColorRef.current.set(accentColor)
  }, [accentColor])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: [0.49, 0.8, 0.99] },
      uSize: { value: 2.6 },
      uFar: { value: new Color(FAR_COLOR) },
      uFogNear: { value: figureHeight * 0.8 },
      uFogFar: { value: figureHeight * 4.2 },
    }),
    [figureHeight],
  )

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      currentColorRef.current.lerp(targetColorRef.current, 0.06)
      materialRef.current.uniforms.uColor.value = [
        currentColorRef.current.r,
        currentColorRef.current.g,
        currentColorRef.current.b,
      ]
    }
    if (pointsRef.current) {
      // Deriva lentísima: da vida al fondo sin competir con el movimiento de
      // cámara, que es el que debe llevar el ritmo del recorrido.
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.014
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={`
          uniform float uTime;
          uniform float uSize;
          uniform float uFogNear;
          uniform float uFogFar;
          attribute float aSeed;
          varying float vTwinkle;
          varying float vDepth;

          void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

            // Parpadeo desfasado por semilla: sin el desfase toda la nube
            // latiría a la vez y se leería como un fundido de la capa entera.
            vTwinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.4 + aSeed * 0.9) + aSeed * 40.0));

            vDepth = clamp((-viewPosition.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);

            // Atenuación de tamaño por distancia: es lo que construye la
            // profundidad geométrica. El brillo se atenúa aparte, en el
            // fragmento; el tamaño solo no basta, porque un punto lejano
            // pequeño pero a pleno brillo sigue leyéndose como cercano.
            gl_PointSize = uSize * (0.5 + aSeed) * (14.0 / max(-viewPosition.z, 0.1));
            gl_Position = projectionMatrix * viewPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uFar;
          varying float vTwinkle;
          varying float vDepth;

          void main() {
            // Punto redondo con borde suave: el cuadrado por defecto delata la
            // rejilla de píxeles en las partículas grandes.
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;

            // Perspectiva aérea: lo lejano vira al frío y pierde contraste, que
            // es la única señal de distancia que sobrevive al pase de
            // caracteres —el ASCII colapsa el color a luminancia, así que la
            // profundidad tiene que estar también en el brillo.
            vec3 color = mix(uColor, uFar, vDepth);
            float alpha = smoothstep(0.5, 0.05, d) * vTwinkle * mix(0.55, 0.12, vDepth);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </points>
  )
}

function Figure({
  accentColor = "#7dd3fc",
  intensity = 1,
  scale = 1,
  orbit = null,
  progressRef = null,
  freeLook = false,
  wireframe = true,
  monochrome = false,
  distortion = 1,
  pointerDeform = 0,
}: {
  accentColor?: string
  intensity?: number
  scale?: number
  wireframe?: boolean
  monochrome?: boolean
  distortion?: number
  pointerDeform?: number
  orbit?: CameraKey[] | null
  progressRef?: { current: number } | null
  freeLook?: boolean
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer, gl, camera, size } = useThree()
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

  /**
   * Estado del recorrido orbital. Se guarda en refs y se amortigua cada frame:
   * el scroll fija un destino y la cámara lo persigue, que es lo que hace que
   * el movimiento se lea orgánico en vez de pegado al dedo del usuario.
   */
  // Anotado a propósito: `BODY` es `as const`, así que sin el tipo explícito
  // `target` se infiere como el literal 0.68 y deja de admitir la interpolación.
  const orbitRef = useRef<{
    azimuth: number
    elevation: number
    radius: number
    target: number
    frameX: number
    frameY: number
  }>({
    azimuth: 12,
    elevation: 5,
    radius: 0.26,
    target: BODY.cabeza,
    frameX: 0.52,
    frameY: 0,
  })
  const orbitReadyRef = useRef(false)

  /**
   * Posición del puntero en la ventana, normalizada a -1..1.
   *
   * No se usa el `pointer` de react-three-fiber porque solo se actualiza con
   * eventos que llegan al lienzo, y aquí el lienzo vive por debajo del
   * contenido de la página: las secciones se los quedan todos. Escuchando en
   * la ventana el seguimiento funciona esté lo que esté encima.
   */
  const freePointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!freeLook) return

    const onMove = (event: PointerEvent) => {
      freePointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      }
    }

    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [freeLook])
  /** Factor de zoom del usuario sobre el radio del recorrido. */
  const orbitZoomRef = useRef(1)

  const { scene } = useGLTF(PERSON_MODEL_PATH) as unknown as { scene: Object3D }
  const geometry = useMemo(() => buildGeometryFromModel(scene), [scene])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uAccentColor: { value: [0.49, 0.8, 0.99] },
      uIntensity: { value: 1 },
      uShading: { value: 0 },
      uMonochrome: { value: 0 },
      uDistort: { value: 1 },
      uAspect: { value: 1 },
      uPointerRadius: { value: 0.28 },
      uPointerStrength: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    targetColorRef.current.set(accentColor)
  }, [accentColor])

  useEffect(() => {
    targetIntensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uShading.value = wireframe ? 0 : 1
    }
  }, [wireframe])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMonochrome.value = monochrome ? 1 : 0
    }
  }, [monochrome])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uDistort.value = distortion
    }
  }, [distortion])

  useEffect(() => {
    if (materialRef.current) {
      // La amplitud va en unidades del modelo sin escalar, así que se divide
      // por la escala para que el bulto se vea igual de grande a cualquier
      // tamaño de figura.
      materialRef.current.uniforms.uPointerStrength.value = (pointerDeform * 0.035) / scale
    }
  }, [pointerDeform, scale])

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

    const orbitMode = Boolean(orbit && progressRef)

    const handleWheel = (e: WheelEvent) => {
      // En modo órbita la rueda pertenece a la página: el recorrido de cámara
      // ya se mueve con el scroll, así que capturarla dejaría al usuario
      // atrapado en el lienzo, que ocupa toda la pantalla.
      if (orbitMode) return
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
        if (orbitMode) {
          // Sobre el recorrido, el pellizco solo acerca o aleja respecto al
          // radio que marque el capítulo; no sustituye la distancia.
          orbitZoomRef.current = MathUtils.clamp(ratio, 0.55, 1.8)
        } else {
          zoomRef.current = MathUtils.clamp(pinchStartZoom * ratio, MIN_ZOOM, MAX_ZOOM)
        }
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
  }, [gl, orbit, progressRef])

  const vertexShader = `
    uniform float uTime;
    uniform float uIntensity;
    uniform float uDistort;
    uniform vec2 uMouse;
    uniform float uAspect;
    uniform float uPointerRadius;
    uniform float uPointerStrength;
    varying vec2 vUv;
    varying float vDisplacement;
    varying vec3 vNormalView;
    varying vec3 vViewDir;
    varying float vPointer;

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
      // uDistort escala el desplazamiento de vértices. Con la cámara muy cerca
      // del rostro, la amplitud que funciona en un plano general deshace los
      // rasgos, así que la página de perfil la baja en vez de fijarla aquí.
      float displacement = noise * ${NOISE_DISPLACEMENT} * uIntensity * uDistort;
      vDisplacement = displacement;

      vec3 newPosition = position + normal * displacement;
      vec4 viewPosition = modelViewMatrix * vec4(newPosition, 1.0);

      /*
       * Reacción al puntero. La distancia se mide en coordenadas de pantalla y
       * no en el espacio del modelo: así el radio de influencia es constante en
       * píxeles y no se dispara al acercarse la cámara al rostro, donde unas
       * pocas unidades de mundo ocupan media pantalla.
       */
      vec4 clipBase = projectionMatrix * viewPosition;
      vec2 ndc = clipBase.xy / max(clipBase.w, 0.0001);
      // El aspecto corrige el óvalo que, si no, deja una pantalla apaisada.
      float pointerDist = distance(ndc * vec2(uAspect, 1.0), uMouse * vec2(uAspect, 1.0));
      float pointerFalloff = smoothstep(uPointerRadius, 0.0, pointerDist);
      // Curva cúbica: concentra el efecto en el centro y deja el borde del
      // radio prácticamente quieto, para que no se note un disco recortado.
      pointerFalloff = pointerFalloff * pointerFalloff * pointerFalloff;
      vPointer = pointerFalloff;

      // Solo se empuja hacia fuera, nunca hacia dentro: hundir la malla sobre
      // sí misma cruza las caras y rompe la silueta.
      newPosition += normal * pointerFalloff * uPointerStrength;
      viewPosition = modelViewMatrix * vec4(newPosition, 1.0);

      // Normal y dirección de vista en espacio de cámara: con ellas el
      // sombreado sigue al personaje aunque orbite, sin recalcular nada.
      vNormalView = normalize(normalMatrix * normal);
      vViewDir = normalize(-viewPosition.xyz);

      gl_Position = projectionMatrix * viewPosition;
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
    uniform float uShading;
    uniform float uMonochrome;
    uniform float uDistort;
    varying float vPointer;
    varying vec2 vUv;
    varying float vDisplacement;
    varying vec3 vNormalView;
    varying vec3 vViewDir;

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

      /*
       * La fase del centelleo de borde salía de vUv.x * 10.0, es decir, de una
       * función lineal de la coordenada horizontal: eso son diez franjas
       * verticales recorriendo la superficie. En color apenas se notaban, pero
       * con la figura en escala de grises la mezcla de acento se convierte en un
       * cambio de brillo, y el pase de caracteres lo traduce en columnas de
       * glifos distintos. De ahí las rayas.
       *
       * Ahora la fase viene solo del azar por celda, que no tiene gradiente
       * espacial y por tanto no puede formar bandas.
       */
      float edgeSpeed = mix(0.45, 1.0, sparklePattern);
      float edgeSparkle = smoothstep(0.7, 1.0, vDisplacement * 4.0) *
                          (sin(uTime * edgeSpeed + sparklePattern * 20.0) * 0.5 + 0.5);

      // El centelleo acompaña a la deformación: si se reduce una y no el otro,
      // la superficie queda quieta pero parpadeando, que se lee como ruido.
      float totalSparkle = max(sparkle, edgeSparkle * 0.44) * uIntensity * uDistort;

      /*
       * Sombreado de tres luces en espacio de cámara. Sin él la superficie es
       * plana y el pase de caracteres no tiene relieve del que tirar: todas las
       * celdas caen en el mismo tramo de la rampa y la cara no se distingue.
       *
       *  - clave: frontal y ligeramente alta, la que modela el rostro.
       *  - relleno: lateral opuesto y suave, para que la sombra no sea un vacío.
       *  - contra: por detrás, dibuja el contorno y despega la figura del fondo.
       */
      vec3 normal = normalize(vNormalView);
      vec3 keyDir = normalize(vec3(0.28, 0.42, 1.0));
      vec3 fillDir = normalize(vec3(-0.75, 0.05, 0.45));
      vec3 rimDir = normalize(vec3(-0.15, 0.35, -1.0));

      float key = max(dot(normal, keyDir), 0.0);
      float fill = max(dot(normal, fillDir), 0.0);
      float rim = pow(max(dot(normal, rimDir), 0.0), 1.6);
      // Fresnel: refuerza el borde de silueta, donde la normal es perpendicular.
      float fresnel = pow(1.0 - max(dot(normal, normalize(vViewDir)), 0.0), 2.4);

      /*
       * Cada luz lleva su propia temperatura, y ahí está la profundidad
       * cromática: antes las tres sumaban a un único escalar que después se
       * teñía de azul, así que la imagen era monocroma y el volumen dependía
       * solo del brillo. Con la clave cálida y el relleno frío, la cara girada
       * hacia la luz y la que queda en sombra se distinguen por color y no
       * únicamente por valor, que es como se ilumina un retrato de verdad.
       */
      /*
       * Las dos luces comparten familia cromática, y esto no es una preferencia
       * sino un requisito del pase de caracteres.
       *
       * El ASCII normaliza cada celda dividiéndola por su propia luminancia. Esa
       * división no traslada el color: lo lleva al extremo de saturación. Con una
       * clave cálida y un relleno frío, dos celdas vecinas que apenas difieren en
       * temperatura salían de ahí convertidas en naranja puro y azul puro, y la
       * figura se cubría de motas de colores opuestos —confeti, no volumen—. Un
       * degradado de temperatura que en un render normal es suave, aquí se
       * rompe en píxeles.
       *
       * Con ambas luces en el mismo hue, la normalización ya no tiene hues que
       * enfrentar: solo puede mover el valor, que es justo lo que el glifo ya
       * expresa. El volumen vuelve a leerse por densidad de carácter, que es el
       * lenguaje de esta imagen, y el cian mantiene la escena en la paleta de la
       * marca en vez de pelearse con ella.
       */
      vec3 keyTint  = vec3(0.64, 0.87, 1.00);
      vec3 fillTint = vec3(0.24, 0.42, 0.72);

      vec3 lit = vec3(0.05, 0.06, 0.09)
               + keyTint * key * 0.92
               + fillTint * fill * 0.34
               // El contra y el fresnel van en el acento del capítulo: el color
               // narrativo entra por el contorno, que es donde no compite con
               // el modelado del rostro.
               + uAccentColor * rim * 0.55
               + uAccentColor * fresnel * 0.42;

      // El acabado de alambre se queda como estaba: ahí no hay superficie que
      // modelar y el sombreado por normales no aporta nada.
      float wire = 0.4 + vDisplacement * 4.0;
      vec3 baseColor = mix(vec3(wire) * vec3(0.72, 0.85, 1.0), lit, uShading);

      /*
       * El centelleo pasa de reemplazar el color a solo empujarlo. Mezclaba el
       * acento con peso 0.92, de modo que en cada destello la celda perdía casi
       * todo el sombreado y se aplanaba: eso era lo que deshacía la imagen. Y
       * como el patrón vive en espacio UV mientras la malla se deforma, las
       * manchas nadaban sobre la superficie. Al 0.30 el destello se lee como un
       * brillo sobre el volumen en lugar de borrarlo.
       */
      vec3 finalColor = mix(baseColor, uAccentColor, clamp(totalSparkle * 0.30, 0.0, 1.0));
      // La zona tocada por el puntero se enciende un poco: sin ello el relieve
      // se pierde en los planos donde la superficie ya es casi plana.
      finalColor = mix(finalColor, uAccentColor, clamp(vPointer * 0.25, 0.0, 1.0));

      /*
       * Aquí iba una retícula fract(vUv * 20.0) que oscurecía el color hasta
       * la mitad. Se ha quitado: era una segunda cuadrícula en espacio UV que
       * batía contra la cuadrícula de celdas del pase de caracteres, y ese
       * batido es moiré por construcción.
       */

      /*
       * Paso a gris, al final de todo y no luz por luz: así el sombreado, el
       * centelleo y el acento del contorno siguen calculándose en color y solo
       * se convierten al escribir. Cada uno aporta su valor —el contra sigue
       * despegando la silueta, el fresnel sigue marcando el borde—, pero el
       * resultado entra al pase de caracteres como un único canal.
       *
       * Se pesa con los coeficientes de luminancia de Rec. 709 en vez de
       * promediar los tres canales: el ojo es mucho más sensible al verde que
       * al azul, y el promedio plano aclaraba el relleno azul de las sombras
       * hasta igualarlo con la luz clave, borrando el modelado.
       */
      float grey = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
      finalColor = mix(finalColor, vec3(grey), uMonochrome);

      float alpha = clamp(0.5 * uIntensity + 0.14 + totalSparkle * 0.36, 0.15, 1.0);
      // Con volumen, la superficie es opaca: la transparencia mezclaría caras
      // delanteras y traseras y borraría el modelado del rostro.
      alpha = mix(alpha, 1.0, uShading);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uMouse.value = [pointer.x, pointer.y]
      materialRef.current.uniforms.uAspect.value = size.width / Math.max(size.height, 1)

      currentColorRef.current.lerp(targetColorRef.current, 0.06)
      materialRef.current.uniforms.uAccentColor.value = [
        currentColorRef.current.r,
        currentColorRef.current.g,
        currentColorRef.current.b,
      ]

      currentIntensityRef.current = MathUtils.lerp(currentIntensityRef.current, targetIntensityRef.current, 0.06)
      materialRef.current.uniforms.uIntensity.value = currentIntensityRef.current
    }

    // ── Recorrido orbital continuo, gobernado por el progreso de scroll ──
    if (orbit && orbit.length > 1 && progressRef) {
      const progress = MathUtils.clamp(progressRef.current, 0, 1)
      /*
       * Modo libre: al final del recorrido el scroll suelta la cámara y la toma
       * el cursor. El destino se calcula igual que en el recorrido y se
       * amortigua con el mismo filtro, así que la entrada y la salida del modo
       * son un movimiento continuo y no un salto de encuadre.
       */
      const free = freeLook
        ? {
            azimuth: freePointerRef.current.x * 75,
            // El eje Y de la pantalla crece hacia abajo: sin invertirlo, subir
            // el cursor bajaría la cámara.
            elevation: MathUtils.clamp(-freePointerRef.current.y * 28, -32, 32),
            // Algo más lejos que los planos del recorrido: en vista libre la
            // figura se explora entera, no se examina un rasgo.
            radius: 0.95,
            /*
             * Punto de mira calculado, no elegido a ojo: a este radio la
             * cámara abarca 1.26 unidades de alto y la coronilla está en 0.8,
             * así que mirando a 0.27 la cabeza queda a un dedo del borde
             * superior y el encuadre baja hasta las rodillas.
             */
            target: 0.27,
            frameX: 0,
            frameY: 0,
          }
        : null

      const scaled = progress * (orbit.length - 1)
      const index = Math.min(Math.floor(scaled), orbit.length - 2)
      const raw = scaled - index

      /*
       * Suavizado del tramo, a medio camino entre lineal y smoothstep.
       *
       * Con smoothstep puro la velocidad es nula en cada clave y máxima en el
       * centro del tramo: la cámara se paraba en cada plano y **cruzaba el
       * trayecto a 1.5 veces la velocidad media**. Ese pico intermedio era buena
       * parte de la sensación de precipitación. Mezclado a medias con la rampa
       * lineal, el pico baja a 1.25 y el movimiento se reparte, conservando algo
       * de asentamiento al llegar a cada plano.
       */
      const local = MathUtils.lerp(raw, MathUtils.smoothstep(raw, 0, 1), 0.5)

      /*
       * Interpolación de Catmull-Rom sobre cuatro claves en vez de lineal entre
       * dos.
       *
       * Este era el defecto de fondo. Interpolando linealmente, dentro de cada
       * tramo la cámara va en línea recta y **al llegar a una clave cambia de
       * dirección de golpe**: por muy suave que sea la curva de tiempo, la
       * trayectoria tiene un pico en cada nudo, y un quiebro se percibe como
       * tirón. Catmull-Rom pasa por las mismas claves pero llega a cada una con
       * la dirección que ya trae y sale con la que va a necesitar, así que el
       * recorrido es una curva continua de principio a fin. De ahí viene lo
       * orgánico: no es que vaya más lento, es que deja de tener esquinas.
       */
      const at = (i: number) => orbit[MathUtils.clamp(i, 0, orbit.length - 1)]

      const spline = (pick: (key: CameraKey) => number) => {
        const a = pick(at(index - 1))
        const b = pick(at(index))
        const c = pick(at(index + 1))
        const d = pick(at(index + 2))
        const t2 = local * local
        const t3 = t2 * local
        return (
          0.5 *
          (2 * b +
            (-a + c) * local +
            (2 * a - 5 * b + 4 * c - d) * t2 +
            (-a + 3 * b - 3 * c + d) * t3)
        )
      }

      const goal = free ?? {
        azimuth: spline((k) => k.azimuth),
        elevation: spline((k) => k.elevation),
        // La curva se sale un poco de los valores que atraviesa —es lo que le da
        // el rebote natural—, pero en el radio ese margen acercaría la cámara
        // más que en ninguna clave y podría meterla dentro de la cabeza.
        radius: MathUtils.clamp(spline((k) => k.radius), 0.17, 0.56),
        target: spline((k) => k.target),
        frameX: spline((k) => k.frameX ?? 0),
        frameY: spline((k) => k.frameY ?? 0),
      }

      // Amortiguación por delta: el resultado no depende de los fps. La primera
      // vez se coloca en seco, si no la cámara entraría volando desde el origen.
      //
      // Bajada de 4.5 a 2.2: la cámara sigue al scroll con algo más de retraso y
      // llega a su sitio arrastrando, en lugar de pegarse al gesto. Es lo que
      // aporta peso; subirlo la vuelve nerviosa y bajarlo mucho más la
      // desconecta del scroll.
      const k = orbitReadyRef.current ? 1 - Math.exp(-2.2 * delta) : 1
      orbitReadyRef.current = true

      const o = orbitRef.current
      o.azimuth = MathUtils.lerp(o.azimuth, goal.azimuth, k)
      o.elevation = MathUtils.lerp(o.elevation, goal.elevation, k)
      o.radius = MathUtils.lerp(o.radius, goal.radius, k)
      o.target = MathUtils.lerp(o.target, goal.target, k)
      o.frameX = MathUtils.lerp(o.frameX, goal.frameX, k)
      o.frameY = MathUtils.lerp(o.frameY, goal.frameY, k)

      const azimuth = MathUtils.degToRad(o.azimuth)
      const elevation = MathUtils.degToRad(o.elevation)
      // Respiración: una oscilación mínima y lenta que evita que la cámara se
      // quede completamente muerta cuando el scroll se detiene.
      const breath = Math.sin(state.clock.elapsedTime * 0.35) * 0.012
      // El radio va en múltiplos de la altura de la figura ya escalada: así el
      // plano se mantiene aunque cambie `scale`, y agrandar el modelo agranda
      // de verdad lo que se ve, en vez de alejar la cámara en la misma medida.
      const figureHeight = MODEL_TARGET_HEIGHT * scale
      const radius = o.radius * figureHeight * orbitZoomRef.current * (1 + breath)
      const targetY = o.target * scale

      // Encuadre lateral: se desplazan cámara y punto de mira por igual sobre
      // el eje horizontal de la cámara. Al moverse los dos, la dirección de
      // vista no rota —es un *truck*, no un paneo—, y el personaje se corre
      // dentro del cuadro sin que la perspectiva del plano cambie.
      const rightX = Math.cos(azimuth)
      const rightZ = -Math.sin(azimuth)

      // Media pantalla de recorrido: lo que se ve de alto a esta distancia,
      // corregido por la relación de aspecto para que el desplazamiento sea el
      // mismo en pantalla ancha que en estrecha.
      const viewHeight = 2 * radius * Math.tan(MathUtils.degToRad(45 / 2))
      const aspect = (camera as { aspect?: number }).aspect ?? 1
      // En vertical el texto ocupa todo el ancho: descentrar tanto sacaría la
      // figura del cuadro, así que ahí el desplazamiento se reduce.
      const framing = aspect < 1 ? 0.35 : 1
      const shift = -o.frameX * framing * (viewHeight * aspect) * 0.5
      const lift = -o.frameY * framing * viewHeight * 0.5

      const targetX = shift * rightX
      const targetZ = shift * rightZ
      const focusY = targetY + lift

      camera.position.set(
        targetX + radius * Math.cos(elevation) * Math.sin(azimuth),
        focusY + radius * Math.sin(elevation),
        targetZ + radius * Math.cos(elevation) * Math.cos(azimuth),
      )
      camera.lookAt(targetX, focusY, targetZ)
    } else {
      camera.position.z = MathUtils.lerp(camera.position.z, zoomRef.current, 0.15)
    }

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
      // Con la cámara orbitando de cerca, un balanceo de 20° basta para llevarse
      // la cara fuera de eje: sobre el recorrido se reduce a un tercio.
      const swayAmplitude = orbit && progressRef ? SWAY_DEGREES / 3 : SWAY_DEGREES
      const sway =
        Math.sin((state.clock.elapsedTime * Math.PI * 2) / SWAY_SECONDS) *
        MathUtils.degToRad(swayAmplitude)

      meshRef.current.rotation.x = rotationRef.current.x
      meshRef.current.rotation.y = rotationRef.current.y + sway

      // El desplazamiento se aplica siempre: antes solo se escribía dentro del
      // arrastre y el encuadre del plano no llegaba a moverse.
      meshRef.current.position.x = panXRef.current
      meshRef.current.position.y = panYRef.current
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
      // La escala se aplica al mesh y no a la geometría para no rehacer la
      // teselación ni alterar el tamaño de la figura en el panel de control,
      // que comparte este mismo componente.
      scale={scale}
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
        // En modo ASCII la malla se rellena: el pase necesita superficie con
        // luminancia continua para elegir el carácter. Con alambre solo habría
        // signos sueltos siguiendo las aristas.
        wireframe={wireframe}
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
  scale = 1,
  orbit = null,
  progressRef = null,
  texture = "wireframe",
  asciiPreset = "ink",
  monochrome = false,
  distortion = 1,
  pointerDeform = 0,
  particles = 0,
  freeLook = false,
}: {
  accentColor?: string
  moodId?: MoodId | null
  /** Tamaño de la figura. El panel de control usa el valor por defecto. */
  scale?: number
  /** Recorrido de cámara; con él la cámara orbita en vez de quedarse fija. */
  orbit?: CameraKey[] | null
  /** Progreso 0–1 del recorrido. Es una ref para no repintar en cada frame. */
  progressRef?: { current: number } | null
  /** Acabado de la figura: malla de alambre o render en caracteres. */
  texture?: "wireframe" | "ascii"
  /** Familia de símbolos del render en caracteres. Solo con texture="ascii". */
  asciiPreset?: AsciiPresetId
  /** Pasa la figura a escala de grises. El fondo conserva su color. */
  monochrome?: boolean
  /** Multiplica la deformación de la malla. 1 es el valor histórico. */
  distortion?: number
  /** Intensidad del bulto que sigue al cursor sobre la figura. 0 lo desactiva. */
  pointerDeform?: number
  /** Número de partículas del fondo envolvente. 0 lo desactiva. */
  particles?: number
  /** Suelta la cámara del scroll y la entrega al cursor. */
  freeLook?: boolean
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
          {/*
            No hay luces de three en la escena: tanto la figura como el fondo
            usan `ShaderMaterial` con el sombreado escrito a mano, y ningún
            material de estos recibe las luces del grafo. Aquí vivía un
            `<ambientLight>` que no iluminaba nada.
          */}
          {texture === "ascii" && <AsciiPass preset={asciiPreset} />}
          {particles > 0 && (
            <>
              <ParticleField
                count={particles}
                accentColor={activeMood?.color ?? accentColor}
                scale={scale}
              />
              <BranchNetwork
                figureHeight={MODEL_TARGET_HEIGHT * scale}
                nearColor={activeMood?.color ?? accentColor}
                farColor={FAR_COLOR}
              />
            </>
          )}
          <Suspense fallback={null}>
            <Figure
              accentColor={activeMood?.color ?? accentColor}
              intensity={activeMood?.intensity ?? 1}
              scale={scale}
              orbit={orbit}
              progressRef={progressRef}
              freeLook={freeLook}
              wireframe={texture !== "ascii"}
              monochrome={monochrome}
              distortion={distortion}
              pointerDeform={pointerDeform}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
