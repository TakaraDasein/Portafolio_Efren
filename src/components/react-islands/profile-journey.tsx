"use client"

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ASCII_PRESETS, type AsciiPresetId } from "./ascii-pass"
import { ASCENDING_ORBIT, SentientFigure } from "./sentient-figure"
import {
  EXPERIENCES,
  FEATURED_PROJECTS,
  PROFILE,
  PROFILE_STATEMENTS,
  RESEARCH_LINE,
  STACK_GROUPS,
  USE_CASES,
} from "./profile-data"

/**
 * Pausa a mitad del recorrido. Asimov escribió esta frase en 1988, y dice en una
 * línea lo que el perfil sostiene entero: el problema no es la falta de datos,
 * sino el desfase entre lo que sabemos y lo que sabemos hacer con ello.
 */
const QUOTE = {
  text:
    "Lo más triste de la vida actual es que la ciencia acumula conocimiento más deprisa que la sociedad sabiduría.",
  author: "Isaac Asimov",
}

gsap.registerPlugin(ScrollTrigger)

/**
 * Tamaño de la figura en la página de perfil. Multiplica la altura normalizada
 * del modelo: con la cámara orbitando de cerca, un valor alto es lo que permite
 * leer la malla vértice a vértice en los planos cortos.
 */
const FIGURE_SCALE = 2.8

/**
 * Índice de secciones para el riel lateral. El orden debe coincidir con el de
 * los `<section data-chapter>` del árbol: el riel se pinta desde aquí y la
 * sección activa se resuelve por posición, no por id.
 */
/**
 * Posición de la pausa dentro de la trayectoria: va justo después de la primera
 * experiencia. Todo el cálculo de índices —riel, plano de cámara, lado del
 * texto— se deriva de esta constante, así que moverla reordena la página
 * entera sin tocar nada más.
 */
const QUOTE_AFTER = 1

/** Índice de capítulo de la experiencia número `i`. */
const experienceChapter = (i: number) =>
  1 + PROFILE_STATEMENTS.length + i + (i >= QUOTE_AFTER ? 1 : 0)

/** Índice de capítulo de la pausa. */
const QUOTE_CHAPTER = 1 + PROFILE_STATEMENTS.length + QUOTE_AFTER

/**
 * Los capítulos 02 y 03. El 01 aloja los tres textos del perfil —Perfil, Mirada
 * y Método— alternados con botones, así que estos dos huecos quedaron libres:
 * el 02 lo ocupa la línea de investigación y el 03 el ciclo de vida del dato.
 *
 * Conservan el número de capítulos que espera el recorrido de cámara: uno para
 * el perfil más estos dos suman los tres de `PROFILE_STATEMENTS`, que es lo que
 * cuentan `experienceChapter` y `QUOTE_CHAPTER`.
 */
const RESERVED_CHAPTERS = [
  { id: "investigacion", label: "Investigación", accent: "#10b981" },
  { id: "metodo", label: "Método", accent: "#a78bfa" },
]

/**
 * Experiencias cuyo capítulo se deja sin contenido por ahora. Siguen ocupando
 * su sitio en el recorrido: solo se vacía lo que se lee, no la sección.
 */
const BLANK_EXPERIENCES = new Set(["opax", "cosurca", "data-lab", "ocha"])

const CHAPTERS = [
  { id: "portada", label: "Portada", accent: "#ffffff" },
  {
    id: PROFILE_STATEMENTS[0].id,
    label: PROFILE_STATEMENTS[0].kicker,
    accent: PROFILE_STATEMENTS[0].accent,
  },
  ...RESERVED_CHAPTERS,
  ...EXPERIENCES.slice(0, QUOTE_AFTER).map((e) => ({
    id: e.id,
    label: e.org,
    accent: e.accent,
  })),
  { id: "cita", label: "Pausa", accent: "#39cbe3" },
  ...EXPERIENCES.slice(QUOTE_AFTER).map((e) => ({
    id: e.id,
    label: e.org,
    accent: e.accent,
  })),
  { id: "contacto", label: "Contacto", accent: "#ffffff" },
]

/**
 * A qué lado va el texto en cada capítulo. No se alterna por paridad sino que
 * se deduce del encuadre de la cámara: `frameX` positivo deja al personaje a la
 * derecha, así que el texto ocupa la mitad izquierda, y al revés. De este modo
 * basta con retocar el recorrido de cámara para que la maquetación lo siga, sin
 * riesgo de que la cara acabe debajo del titular.
 */
type ChapterSide = "left" | "right" | "center"

const CHAPTER_SIDES: ChapterSide[] = CHAPTERS.map((_, index) => {
  const frameX = ASCENDING_ORBIT[index]?.frameX ?? 0
  if (frameX > 0.1) return "left"
  if (frameX < -0.1) return "right"
  return "center"
})

/** Clases de posición del bloque de contenido para cada lado. */
const SIDE_LAYOUT: Record<ChapterSide, string> = {
  left: "mr-auto md:max-w-[36rem] xl:max-w-[40rem]",
  right: "ml-auto md:max-w-[36rem] xl:max-w-[40rem] md:text-right",
  center: "mx-auto",
}

/**
 * Divide el texto en palabras, cada una en un `span` con texto plano. Plano y
 * no anidado porque ScrambleTextPlugin reescribe el contenido del elemento que
 * anima: cualquier marcado interior se perdería en el primer frame. El texto
 * final se guarda en `data-text` para poder recomponerlo.
 */
function SplitWords({
  text,
  className = "",
  wordClassName = "",
}: {
  text: string
  className?: string
  wordClassName?: string
}) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            data-text={word}
            className={`gsap-word inline-block whitespace-nowrap ${wordClassName}`}
          >
            {word}
          </span>
          {/* El espacio va fuera del span animado: ScrambleTextPlugin reescribe
              el contenido del elemento y se lo llevaría por delante. */}
          {" "}
        </Fragment>
      ))}
    </span>
  )
}

/**
 * Segundo tiempo del capítulo 02: la selección de proyectos, una pieza en
 * pantalla y la cuadrícula de capturas como índice.
 *
 * Avanza solo cada `DWELL`, y el temporizador se detiene mientras el puntero
 * está encima o el foco vive dentro del bloque: un carrusel que sigue girando
 * mientras se lee el proyecto obliga a perseguir el texto.
 */
const PROJECT_DWELL = 5200

/**
 * Marco común de las capturas. Las originales llegan en proporciones muy
 * distintas —tableros apaisados, geovisores casi cuadrados, capturas de
 * navegador— y sin un formato fijo la vista grande cambia de alto en cada
 * proyecto y arrastra consigo todo lo que tiene debajo.
 *
 * 16:10 porque es el formato en el que se exportan la mayoría de los tableros:
 * es el recorte que menos tiene que quitar del conjunto.
 */
const PROJECT_FRAME = "aspect-[16/10]"

/**
 * Las cuatro esquinas del encuadre, cada una con los dos lados que le tocan.
 * Van separadas de la imagen —de ahí los desplazamientos negativos— para que se
 * lean como marcas de visor y no como un segundo borde pegado al primero.
 */
const PROJECT_CORNERS = [
  "-left-2 -top-2 border-l border-t",
  "-right-2 -top-2 border-r border-t",
  "-bottom-2 -left-2 border-b border-l",
  "-bottom-2 -right-2 border-b border-r",
]

function ProjectsCarousel({
  align,
  active,
}: {
  align: ChapterSide
  /** Falso mientras el bloque está oculto: detiene el avance automático. */
  active: boolean
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const project = FEATURED_PROJECTS[index]
  const toRight = align === "right"

  const go = (delta: number) =>
    setIndex((i) => (i + delta + FEATURED_PROJECTS.length) % FEATURED_PROJECTS.length)

  useEffect(() => {
    if (paused || !active) return
    const id = window.setTimeout(() => go(1), PROJECT_DWELL)
    return () => window.clearTimeout(id)
  }, [index, paused, active])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={`flex items-baseline gap-4 ${toRight ? "md:justify-end" : ""}`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          02 · Proyectos
        </p>
        <p className="font-mono text-[10px] tracking-[0.28em] text-white/25">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(FEATURED_PROJECTS.length).padStart(2, "0")}
        </p>
      </div>

      {/*
        Altura mínima reservada en el titular: ocupa una o dos líneas según el
        proyecto y, sin un suelo fijo, la imagen y los controles subirían y
        bajarían en cada cambio.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mt-7 min-h-[4.5rem] font-sans text-2xl font-light leading-[1.2] tracking-tight md:min-h-[7rem] md:text-4xl">
            {project.title}
          </h2>
          {/*
            Vista del proyecto activo, en el marco común `PROJECT_FRAME`. El
            recorte se ancla arriba porque todas las capturas son tableros: el
            encabezado con el título del dashboard es lo que identifica la pieza,
            y centrar el recorte se lo comería.

            El encuadre de esquinas va por fuera de la imagen y separado de ella:
            así se lee como visor —el gesto de un instrumento que apunta— y no
            como el borde de una tarjeta, que es justo el registro que la página
            evita. Se abre un poco al pasar el puntero.
          */}
          <div
            className={`group relative mt-7 w-full max-w-[20rem] md:max-w-[26rem] ${
              toRight ? "md:ml-auto" : ""
            }`}
          >
            {PROJECT_CORNERS.map((corner) => (
              <span
                key={corner}
                aria-hidden
                className={`pointer-events-none absolute h-3 w-3 border-white/25 transition-all duration-500 group-hover:h-4 group-hover:w-4 group-hover:border-white/60 ${corner}`}
              />
            ))}

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className={`block w-full overflow-hidden border border-white/10 transition-colors duration-500 group-hover:border-white/30 ${PROJECT_FRAME}`}
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                decoding="async"
                className="h-full w-full object-cover object-top opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              />
            </a>

            {/*
              Filete de referencia: nace en el borde de la imagen y se pierde
              hacia fuera. Es lo que ata el visor al resto de la retícula de la
              página, que está hecha de líneas de un píxel.
            */}
            <span
              aria-hidden
              className={`pointer-events-none absolute top-1/2 hidden h-px w-10 bg-gradient-to-r from-white/25 to-transparent md:block ${
                toRight ? "right-full mr-4" : "left-full ml-4 rotate-180"
              }`}
            />
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Ficha mínima del proyecto activo: tema, herramienta y año. */}
      <div
        className={`mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30 ${
          toRight ? "md:justify-end" : ""
        }`}
      >
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        <span className="text-white/15">·</span>
        <span className="text-white/45">
          {project.tool} · {project.year}
        </span>
      </div>

      {/*
        Controles al pie del bloque. Quedan fuera de `AnimatePresence` para que
        no parpadeen en cada cambio de proyecto: son el mando, no el contenido.
      */}
      <div
        className={`mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 ${
          toRight ? "md:justify-end" : ""
        }`}
      >
        {/*
          Cuadrícula de capturas como navegación. En reposo van en gris y muy
          apagadas para no competir con el titular ni con la figura; la activa
          recupera el color y se marca con un filete blanco. La miniatura del
          proyecto en pantalla no se amplía: solo cambia de tono, para que la
          fila no salte de altura al pasar de una a otra.
        */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FEATURED_PROJECTS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              data-cursor-hover
              aria-label={item.title}
              aria-current={i === index ? "true" : undefined}
              className={`group relative block w-14 overflow-hidden border transition-colors duration-500 md:w-[4.5rem] ${PROJECT_FRAME} ${
                i === index ? "border-white/70" : "border-white/10 hover:border-white/40"
              }`}
            >
              <img
                src={item.thumbnail}
                alt=""
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover object-top transition duration-500 ${
                  i === index
                    ? "opacity-90 grayscale-0"
                    : "opacity-30 grayscale group-hover:opacity-60 group-hover:grayscale-0"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            data-cursor-hover
            aria-label="Proyecto anterior"
            className="font-mono text-xs text-white/35 transition-colors duration-300 hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            data-cursor-hover
            aria-label="Proyecto siguiente"
            className="font-mono text-xs text-white/35 transition-colors duration-300 hover:text-white"
          >
            →
          </button>
        </div>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-hover
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors duration-300 hover:text-white"
        >
          Ver ↗
        </a>
      </div>
    </div>
  )
}

/**
 * Grafo del método: los tramos del ciclo de vida del dato en una espina, y las
 * herramientas del tramo activo desplegadas en abanico.
 *
 * Va en SVG y no en HTML porque lo que hay que dibujar son las aristas: curvas
 * que nacen en un nodo y mueren en cada herramienta. Con marcado corriente eso
 * exige medir posiciones en tiempo de ejecución; aquí la geometría se calcula
 * una vez y el navegador se encarga de escalarla.
 *
 * Solo se pinta de tablet en adelante. El texto dentro de un SVG escala con el
 * lienzo, así que en un móvil estos rótulos caerían por debajo de los siete
 * píxeles; ahí se muestra la misma información como lista.
 */
const METHOD_DWELL = 3600

/** Geometría del lienzo, en unidades de `viewBox`. */
const G = {
  width: 720,
  /** Margen superior e inferior, y separación entre tramos. */
  top: 34,
  row: 58,
  /** Columna de los nodos y columna donde terminan las herramientas. */
  nodeX: 300,
  toolX: 468,
  /** Separación vertical entre herramientas del abanico. */
  toolGap: 23,
}

function MethodGraph() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const group = STACK_GROUPS[active]
  const height = G.top * 2 + G.row * (STACK_GROUPS.length - 1)
  const rowY = (i: number) => G.top + i * G.row

  useEffect(() => {
    if (paused) return
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % STACK_GROUPS.length),
      METHOD_DWELL,
    )
    return () => window.clearTimeout(id)
  }, [active, paused])

  /*
   * El abanico se centra en su nodo, pero los tramos de los extremos tienen
   * pocos píxeles por encima o por debajo. Lo que se recorta es el abanico
   * entero, no cada herramienta: recortando una a una, las de fuera del lienzo
   * acabarían todas en la misma altura, unas encima de otras.
   */
  const toolY = (index: number, count: number, y: number) => {
    const spread = (count - 1) * G.toolGap
    const start = Math.min(Math.max(y - spread / 2, 14), height - 14 - spread)
    return start + index * G.toolGap
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <svg
        viewBox={`0 0 ${G.width} ${height}`}
        className="hidden w-full md:block"
        role="img"
        aria-label="Ciclo de vida del dato y herramientas de cada tramo"
      >
        {/* Espina: el hilo que recorre el dato de un extremo al otro. */}
        <line
          x1={G.nodeX}
          y1={rowY(0)}
          x2={G.nodeX}
          y2={rowY(STACK_GROUPS.length - 1)}
          stroke="rgba(255,255,255,0.12)"
        />

        {/* Aristas y rótulos del tramo activo. */}
        <AnimatePresence mode="wait">
          <motion.g
            key={group.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {group.tools.map((tool, j) => {
              const y = rowY(active)
              const ty = toolY(j, group.tools.length, y)
              return (
                <Fragment key={tool}>
                  <motion.path
                    d={`M${G.nodeX},${y} C${G.nodeX + 74},${y} ${G.toolX - 74},${ty} ${G.toolX},${ty}`}
                    fill="none"
                    stroke={group.accent}
                    strokeOpacity={0.4}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: j * 0.06, ease: "easeOut" }}
                  />
                  <circle cx={G.toolX} cy={ty} r={2} fill={group.accent} fillOpacity={0.7} />
                  <text
                    x={G.toolX + 12}
                    y={ty + 4}
                    className="font-mono"
                    fontSize={13}
                    fill="rgba(255,255,255,0.55)"
                  >
                    {tool}
                  </text>
                </Fragment>
              )
            })}
          </motion.g>
        </AnimatePresence>

        {/* Nodos: el número, el nombre del tramo y el punto sobre la espina. */}
        {STACK_GROUPS.map((item, i) => {
          const y = rowY(i)
          const on = i === active
          return (
            <g
              key={item.id}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
              role="button"
              aria-pressed={on}
              aria-label={`${item.title}: ${item.tools.join(", ")}`}
              className="cursor-pointer outline-none"
              data-cursor-hover
            >
              {/* Zona de activación: el texto suelto deja huecos muertos. */}
              <rect x={0} y={y - G.row / 2} width={G.nodeX} height={G.row} fill="transparent" />
              <text
                x={0}
                y={y + 4}
                className="font-mono"
                fontSize={11}
                fill={on ? item.accent : "rgba(255,255,255,0.25)"}
                style={{ transition: "fill 400ms" }}
              >
                {item.stage}
              </text>
              <text
                x={G.nodeX - 24}
                y={y + 1}
                textAnchor="end"
                className="font-sans"
                fontSize={18}
                fill={on ? "#ffffff" : "rgba(255,255,255,0.35)"}
                style={{ transition: "fill 400ms" }}
              >
                {item.title}
              </text>
              <text
                x={G.nodeX - 24}
                y={y + 16}
                textAnchor="end"
                className="font-mono"
                fontSize={10}
                fill={on ? "rgba(255,255,255,0.4)" : "transparent"}
                style={{ transition: "fill 400ms" }}
              >
                {item.caption}
              </text>
              {/* Halo del nodo activo: el mismo gesto que el pulso de un sensor. */}
              {on && (
                <motion.circle
                  cx={G.nodeX}
                  cy={y}
                  r={4}
                  fill="none"
                  stroke={item.accent}
                  initial={{ r: 4, opacity: 0.7 }}
                  animate={{ r: 13, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <circle
                cx={G.nodeX}
                cy={y}
                r={on ? 4.5 : 2.5}
                fill={on ? item.accent : "rgba(255,255,255,0.28)"}
                style={{ transition: "r 400ms, fill 400ms" }}
              />
            </g>
          )
        })}
      </svg>

      {/* Misma información en móvil, donde el lienzo dejaría el texto ilegible. */}
      <ul className="flex flex-col gap-5 md:hidden">
        {STACK_GROUPS.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: item.accent }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">
                {item.stage} · {item.caption}
              </p>
              <p className="mt-1 font-sans text-lg font-light leading-snug">{item.title}</p>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-white/40">
                {item.tools.join("  ·  ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Capítulo 02, en dos tiempos dentro de un mismo plano: el título de la línea de
 * investigación cede el sitio a los proyectos sin que aparezca otra sección.
 *
 * Cómo funciona: la sección mide algo más de una pantalla y media, y su
 * contenido va en un contenedor `sticky`, así que durante ese trayecto la vista
 * permanece fija y lo único que ocurre es el relevo entre los dos bloques. Para
 * el resto de la página sigue siendo un solo `data-chapter`: un color de acento,
 * una entrada en el riel lateral y una sola clave de cámara.
 *
 * El alto y el punto de relevo son un ajuste de tacto y van emparejados. Con
 * 120vh el trayecto anclado es de 20vh y el relevo cae justo en la mitad: 10vh
 * por fase, que en una pantalla corriente son unos 90 px, el recorrido de un
 * golpe de rueda. Se probó también con 130vh y la fase se va a 15vh: el título
 * gana margen de lectura, pero pasar a los proyectos cuesta algo más de un
 * golpe. Por debajo de 120vh un scroll normal se salta el título entero.
 *
 * Los dos bloques se apilan en la misma celda de una rejilla —y no con
 * posicionamiento absoluto— para que el contenedor reserve la altura del más
 * alto y el conjunto no se descuadre a mitad de la transición.
 *
 * La opacidad se anima sobre los envoltorios, nunca sobre los nodos internos:
 * dentro del título viven los `.gsap-word`, `data-rule` y `data-rise` que anima
 * la línea de tiempo del recorrido, y tocar sus estilos desde framer-motion
 * dejaría a las dos librerías peleando por la misma propiedad. Por lo mismo el
 * título no se desmonta: GSAP guarda las referencias al montarse la página.
 */
const RESEARCH_HANDOVER = 0.5

function ResearchChapter({
  side,
  chapter,
}: {
  side: ChapterSide
  chapter: { id: string; label: string; accent: string }
}) {
  const ref = useRef<HTMLElement>(null)
  const [showProjects, setShowProjects] = useState(false)
  const toRight = side === "right"

  useEffect(() => {
    const section = ref.current
    if (!section) return
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setShowProjects(self.progress > RESEARCH_HANDOVER),
    })
    return () => trigger.kill()
  }, [])

  /** Cada bloque entra desde donde salió el otro, para que se lea como relevo. */
  const phase = (visible: boolean, offset: number) => ({
    opacity: visible ? 1 : 0,
    filter: visible ? "blur(0px)" : "blur(10px)",
    y: visible ? 0 : offset,
  })

  const ease = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <section
      ref={ref}
      id={chapter.id}
      data-chapter
      data-side={side}
      data-accent={chapter.accent}
      className="relative min-h-[120vh]"
    >
      <div className="sticky top-0 flex h-screen items-center px-6 py-24 md:px-12 xl:px-24">
        <div className="mx-auto grid w-full max-w-6xl">
          {/* ── Tiempo 1 · portada de la línea ── */}
          <motion.div
            style={{ gridArea: "1 / 1" }}
            className={`w-full ${SIDE_LAYOUT[side]} ${
              showProjects ? "pointer-events-none" : ""
            }`}
            animate={phase(!showProjects, -24)}
            transition={ease}
            aria-hidden={showProjects}
          >
            <p
              data-rise
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35"
            >
              02 · {RESEARCH_LINE.kicker}
            </p>
            <h2 className="mt-6 font-sans text-[13vw] font-light leading-[0.95] tracking-tight sm:text-[9vw] xl:text-[6rem]">
              <SplitWords text={RESEARCH_LINE.title} className="block" />
              <SplitWords
                text={RESEARCH_LINE.titleAccent}
                className="block italic text-white/55"
              />
            </h2>
            <div
              data-rule
              className={`mt-8 h-px w-full max-w-md bg-white/15 ${
                toRight ? "md:ml-auto" : ""
              }`}
            />
            <p
              data-rise
              className={`mt-7 font-mono text-sm leading-relaxed text-white/55 md:text-[15px] ${
                toRight ? "md:ml-auto md:max-w-lg" : "max-w-lg"
              }`}
            >
              {RESEARCH_LINE.lead}
            </p>
            <p
              data-rise
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30"
            >
              {String(FEATURED_PROJECTS.length).padStart(2, "0")} investigaciones ↓
            </p>
          </motion.div>

          {/* ── Tiempo 2 · los proyectos ── */}
          <motion.div
            style={{ gridArea: "1 / 1" }}
            className={`w-full ${SIDE_LAYOUT[side]} ${
              showProjects ? "" : "pointer-events-none"
            }`}
            animate={phase(showProjects, 24)}
            transition={ease}
            aria-hidden={!showProjects}
          >
            <ProjectsCarousel align={side} active={showProjects} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function ProfileJourney() {
  const rootRef = useRef<HTMLDivElement>(null)
  const figureLayerRef = useRef<HTMLDivElement>(null)
  const [accent, setAccent] = useState("#ffffff")
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id)
  const activeIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => c.id === activeChapter),
  )
  const [figureReady, setFigureReady] = useState(false)
  const activeSide = CHAPTER_SIDES[activeIndex] ?? "center"
  /** Marcas cuyo nombre escrito se ha revelado en lugar del logotipo. */
  const [revealedNames, setRevealedNames] = useState<Record<string, boolean>>({})
  /**
   * Vista libre: pasado el último capítulo, la interfaz se retira y la cámara
   * pasa a seguir al cursor. Se sale volviendo a subir.
   */
  const [freeLook, setFreeLook] = useState(false)
  /**
   * Declaración visible en el panel de perfil. Los tres textos comparten ahora
   * un único capítulo y se alternan con los botones, en lugar de ocupar un
   * capítulo cada uno.
   */
  const [activeStatement, setActiveStatement] =
    useState<(typeof PROFILE_STATEMENTS)[number]["id"]>(PROFILE_STATEMENTS[0].id)
  const statement =
    PROFILE_STATEMENTS.find((s) => s.id === activeStatement) ?? PROFILE_STATEMENTS[0]
  /**
   * Banco de pruebas del acabado en caracteres: `?ascii=braille`, `?ascii=digits`,
   * `?ascii=blocks` o `?ascii=stipple` cambian la familia de símbolos sin tocar
   * el estilo por defecto. Se lee en un efecto y no durante el render porque la
   * página se genera también en el servidor, donde no existe `window`.
   */
  const [asciiPreset, setAsciiPreset] = useState<AsciiPresetId>("ink")

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("ascii")
    if (value && value in ASCII_PRESETS) setAsciiPreset(value as AsciiPresetId)
  }, [])

  /**
   * Progreso 0–1 del recorrido completo. Se guarda en una ref y no en estado:
   * la cámara lo lee dentro del bucle de render, y pasarlo por React obligaría
   * a repintar el árbol entero en cada frame de scroll.
   */
  const progressRef = useRef(0)

  /**
   * La figura entra con un retardo corto: al llegar desde el home, la esfera se
   * está desvaneciendo todavía y montar el lienzo de inmediato hace que las dos
   * mallas se solapen a mitad de la transición.
   */
  useEffect(() => {
    const t = window.setTimeout(() => setFigureReady(true), 220)
    return () => window.clearTimeout(t)
  }, [])

  /**
   * El cursor se mantiene neutro en todo el recorrido: el color de cada
   * capítulo ya lo lleva la figura, y teñir además el rastro del puntero
   * duplicaría el acento y ensuciaría la lectura del texto.
   */
  useEffect(() => {
    document.documentElement.style.setProperty("--cursor-color", "#e5e5e5")
    return () => {
      document.documentElement.style.removeProperty("--cursor-color")
    }
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]")

      /**
       * Motor del recorrido de cámara: un único trigger que abarca la página y
       * escribe el progreso en la ref. `onUpdate` corre en el bucle de scroll,
       * así que la órbita queda pegada al gesto sin re-renderizar nada.
       */
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        // El recorrido termina con el último capítulo, no con la página: la
        // zona de vista libre que va después no debe consumir progreso, o los
        // planos finales se atropellarían para dejarle sitio.
        endTrigger: "#contacto",
        end: "bottom bottom",
        onUpdate: (self) => {
          progressRef.current = self.progress
        },
      })

      const freeZone = root.querySelector<HTMLElement>("[data-free-look]")
      if (freeZone) {
        ScrollTrigger.create({
          trigger: freeZone,
          // Se activa cuando la sección ocupa ya media pantalla, no al asomar:
          // con el encaje en curso, un umbral más temprano encendía el modo a
          // mitad de la transición y la interfaz parpadeaba al volver atrás.
          start: "top 50%",
          end: "bottom bottom",
          onEnter: () => setFreeLook(true),
          onEnterBack: () => setFreeLook(true),
          onLeaveBack: () => setFreeLook(false),
        })
      }

      chapters.forEach((chapter) => {
        const chapterAccent = chapter.dataset.accent ?? "#ffffff"

        // El color de la figura y el capítulo activo siguen a la sección
        // visible, en ambos sentidos de lectura.
        const activate = () => {
          setAccent(chapterAccent)
          setActiveChapter(chapter.id)
        }

        ScrollTrigger.create({
          trigger: chapter,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: activate,
          onEnterBack: activate,
        })

        if (prefersReduced) return

        const words = gsap.utils.toArray<HTMLElement>(".gsap-word", chapter)
        const rises = chapter.querySelectorAll<HTMLElement>("[data-rise]")
        const rules = chapter.querySelectorAll<HTMLElement>("[data-rule]")

        /*
         * Dirección de entrada: los bloques llegan desde el borde que tienen
         * más cerca, de modo que el movimiento parece traerlos desde fuera de
         * la pantalla. Centrados, suben desde abajo.
         */
        const side = chapter.dataset.side ?? "center"
        const fromEdge = side === "left" ? -1 : side === "right" ? 1 : 0

        /*
         * Revelado por desenfoque, atado al scroll y en orden de jerarquía:
         * primero el titular, después su regla y por último los textos de
         * apoyo. Todo cuelga de una única línea de tiempo con `scrub`, así que
         * al retroceder el capítulo se deshace en el orden inverso al que se
         * compuso.
         */
        const revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: chapter,
            // Tramo largo: el revelado ocupa casi todo el trayecto de entrada
            // de la sección, de modo que se percibe como un desarrollo y no
            // como una animación que arranca y termina de golpe.
            start: "top 92%",
            end: "top 18%",
            // Cuanto más alto, más tarda el texto en alcanzar la posición del
            // scroll: es el mando de suavidad del efecto. Por encima de ~1.5 se
            // percibe como retardo y deja de sentirse ligado al gesto.
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        })

        const focus = { opacity: 1, filter: "blur(0px)", y: 0, ease: "none" }

        if (words.length) {
          words.forEach((word, wordIndex) => {
            revealTl.fromTo(
              word,
              { opacity: 0, filter: "blur(12px)", y: 12 },
              { ...focus, duration: 0.85 },
              // Solapamiento amplio: las palabras se enfocan casi a la vez, con
              // el desfase justo para que se lea la dirección de la frase.
              wordIndex * 0.13,
            )
          })
        }

        if (rules.length) {
          revealTl.fromTo(
            rules,
            { scaleX: 0 },
            {
              scaleX: 1,
              // La línea nace del mismo borde del que llega el texto.
              transformOrigin: fromEdge > 0 ? "right center" : "left center",
              duration: 0.7,
              ease: "none",
              stagger: 0.12,
            },
            // Encabalgada con el final del titular, no después: esperar a que
            // termine deja un hueco muerto a mitad del recorrido.
            ">-0.35",
          )
        }

        if (rises.length) {
          revealTl.fromTo(
            rises,
            {
              opacity: 0,
              filter: "blur(8px)",
              x: fromEdge * 24,
              y: fromEdge === 0 ? 18 : 0,
            },
            { ...focus, x: 0, duration: 0.85, stagger: 0.16 },
            ">-0.3",
          )
        }
      })

      if (prefersReduced) return

      /*
       * Relleno de la cita: cada palabra pasa de apagada a encendida siguiendo
       * el scroll. Va con `scrub` y no como entrada de una vez porque el gesto
       * que se busca es el de leer, no el de aparecer.
       */
      const quoteWords = gsap.utils.toArray<HTMLElement>(".quote-word")
      if (quoteWords.length) {
        gsap.fromTo(
          quoteWords,
          { color: "rgba(255,255,255,0.14)" },
          {
            color: "rgba(255,255,255,1)",
            ease: "none",
            stagger: 0.6,
            scrollTrigger: {
              trigger: quoteWords[0].closest("[data-chapter]") as HTMLElement,
              start: "top 75%",
              end: "center 45%",
              scrub: 0.5,
            },
          },
        )
      }

      // Paralaje del texto sobre la figura: los bloques se desplazan un poco
      // más despacio que la página, y la cámara aporta el resto de profundidad.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
        gsap.fromTo(
          layer,
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: layer.closest("[data-chapter]") as HTMLElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        )
      })

    }, root)

    /*
     * Las medidas se toman con la fuente de respaldo si se calculan antes de
     * que cargue Playfair: al sustituirse, los titulares cambian de alto y
     * todos los disparadores quedan desplazados. De ahí los saltos al llegar a
     * una sección.
     */
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => ctx.revert()
  }, [])

  /**
   * La pausa se guarda como variable porque no vive al final de un bloque sino
   * intercalada en la trayectoria: va después de la primera experiencia, así
   * que se inserta dentro del propio recorrido de `EXPERIENCES`.
   */
  const quoteSection = (
        <section
          id="cita"
          data-chapter
          data-side={CHAPTER_SIDES[QUOTE_CHAPTER]}
          data-accent="#39cbe3"
          className="relative flex min-h-screen items-center px-6 py-24 md:px-12 xl:px-24"
        >
          {/*
            Desplazada hacia abajo desde el centro vertical. Es la otra mitad de
            la separación: la clave de cámara sube al personaje dentro del cuadro
            y la cita baja, de modo que el rostro queda por encima del texto.
            Va con `translate` y no con márgenes porque dentro de un contenedor
            centrado con flex el margen se reparte al calcular el centrado y el
            desplazamiento real acaba siendo la mitad del que se escribe.
          */}
          <div className="mx-auto w-full max-w-5xl translate-y-[6vh] md:translate-y-[11vh]">
            <blockquote data-parallax className="w-full">
              {/*
                El relleno se hace palabra a palabra y no con un degradado sobre
                todo el bloque: con `background-clip` el texto de varias líneas
                se rellena en diagonal y la lectura se rompe. Así avanza al
                ritmo del scroll, en el mismo orden en que se lee.
              */}
              <p className="font-sans text-3xl font-light italic leading-[1.25] tracking-tight md:text-5xl xl:text-6xl">
                {QUOTE.text.split(" ").map((word, i) => (
                  <span key={`${word}-${i}`} className="quote-word inline-block">
                    {word}
                    {"\u00A0"}
                  </span>
                ))}
              </p>
              <footer className="mt-10 flex items-center gap-4">
                <span data-rule className="h-px w-16 bg-white/30" />
                <cite
                  data-rise
                  className="font-mono text-[11px] uppercase not-italic tracking-[0.3em] text-white/45"
                >
                  {QUOTE.author}
                </cite>
              </footer>
            </blockquote>
          </div>
        </section>

  )

  return (
    <div ref={rootRef} className="relative bg-[#050505] text-white">
      {/* ── Capa 3D fija: acompaña todo el recorrido ── */}
      <div
        ref={figureLayerRef}
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="h-full w-full opacity-70 transition-opacity duration-700"
          style={{ pointerEvents: figureReady ? "auto" : "none" }}
        >
          {figureReady && (
            <SentientFigure
              accentColor={accent}
              orbit={ASCENDING_ORBIT}
              progressRef={progressRef}
              scale={FIGURE_SCALE}
              texture="ascii"
              asciiPreset={asciiPreset}
              monochrome
              distortion={0.22}
              pointerDeform={1}
              /*
               * Subido de 1400 al pasar el fondo a un anillo de 24 distritos:
               * el presupuesto de puntos se reparte entre todos, y con el valor
               * anterior cada agrupación se quedaba en unas decenas de puntos,
               * demasiado escasa para leerse como densidad.
               */
              particles={3000}
              freeLook={freeLook}
            />
          )}
        </div>
      </div>

      {/*
        Velo de legibilidad: oscurece el lado por el que va el texto y deja
        limpio el del personaje. Se invierte con el capítulo, así que la figura
        nunca queda tapada por su propia sombra.
      */}
      <div
        className={`pointer-events-none fixed inset-0 z-[5] transition-opacity duration-700 ${
          freeLook ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            activeSide === "center"
              ? "radial-gradient(80% 60% at 50% 50%, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.66) 22%, rgba(5,5,5,0.52) 42%, rgba(5,5,5,0.34) 58%, rgba(5,5,5,0.16) 74%, rgba(5,5,5,0.05) 88%, transparent 100%)"
              : `linear-gradient(to ${activeSide === "left" ? "right" : "left"}, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.82) 12%, rgba(5,5,5,0.71) 25%, rgba(5,5,5,0.58) 38%, rgba(5,5,5,0.40) 50%, rgba(5,5,5,0.22) 60%, rgba(5,5,5,0.08) 66%, transparent 72%)`,
        }}
        aria-hidden="true"
      >
        {/*
          Tramado sobre el velo.

          El degradado va de rgba(5,5,5,0.88) a transparente sobre un fondo
          #050505, así que de un extremo a otro de la pantalla el brillo
          resultante solo recorre unos cinco niveles de los 256 que tiene un
          canal de 8 bits. Un degradado que dispone de cinco valores para mil
          píxeles no puede ser suave: se resuelve en cinco franjas anchas de
          borde duro. Eso son las barras verticales, y con el velo radial de los
          capítulos centrados las mismas franjas salen en forma de anillos.
          No es un efecto añadido; es el degradado que no cabe en 8 bits.

          La solución es tramar: un grano fino de amplitud comparable al escalón
          rompe la frontera entre franjas y el ojo promedia el resultado como
          una transición continua. Es el mismo motivo por el que se aplica ruido
          al reducir la profundidad de color de una imagen.

          `backgroundSize` es imprescindible. El SVG no declara `width` ni
          `height`, solo `viewBox`, de modo que sin tamaño explícito se estira
          una única vez hasta cubrir el elemento: en lugar de grano se obtienen
          manchas suaves enormes, que no traman nada. Al fijarlo en 200px el
          patrón se repite y el ruido vuelve a ser por píxel.
        */}
        <div
          className="absolute inset-0 opacity-[0.014]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />
      </div>

      {/* ── Riel de capítulos ── */}
      <nav
        className={`fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 xl:flex ${
          freeLook ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Capítulos del perfil"
      >
        {CHAPTERS.map((chapter) => {
          const isActive = chapter.id === activeChapter
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className="group flex items-center justify-end gap-3"
              aria-current={isActive ? "true" : undefined}
              data-cursor-hover
            >
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/0 group-hover:text-white/50"
                }`}
              >
                {chapter.label}
              </span>
              <span
                className={`h-px transition-all duration-500 ${
                  isActive ? "w-10" : "w-5 bg-white/20 group-hover:w-8 group-hover:bg-white/60"
                }`}
                style={isActive ? { backgroundColor: "#ffffff" } : undefined}
              />
            </a>
          )
        })}
      </nav>

      {/* ── Indicador de capítulo (móvil y tablet) ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-t border-white/10 bg-black/70 px-5 py-3 backdrop-blur-md transition-opacity duration-500 xl:hidden ${
          freeLook ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="flex items-center gap-2 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
          <span className="h-1.5 w-1.5 flex-shrink-0 bg-white/70" />
          {CHAPTERS.find((c) => c.id === activeChapter)?.label}
        </span>
        <span className="flex flex-shrink-0 items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-white/30">
          <span className="hidden sm:inline">{ASCENDING_ORBIT[activeIndex]?.label}</span>
          {String(activeIndex + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Barra de progreso del recorrido ── */}
      <div
        className={`fixed left-0 right-0 top-0 z-40 h-px bg-white/10 transition-opacity duration-500 ${
          freeLook ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${((activeIndex + 1) / CHAPTERS.length) * 100}%`,
            backgroundColor: "rgba(255,255,255,0.75)",
          }}
        />
      </div>

      {/* ── Plano de cámara actual ── */}
      <div
        className={`fixed bottom-8 right-6 z-30 hidden flex-col items-end gap-1 transition-opacity duration-500 xl:flex ${
          freeLook ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
          Cámara
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          {ASCENDING_ORBIT[activeIndex]?.label}
        </span>
      </div>

      {/* ── Volver ── */}
      <a
        href="/"
        className={`fixed left-6 top-6 z-30 flex items-center gap-2 border border-white/15 bg-black/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-sm transition-all duration-500 hover:border-white hover:text-white md:left-10 md:top-8 ${
          freeLook ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        data-cursor-hover
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </a>

      <main className="relative z-10">
        {/* ═══ 00 · PORTADA ═══ */}
        <section
          id="portada"
          data-chapter
          data-side={CHAPTER_SIDES[0]}
          data-accent="#ffffff"
          className="relative flex min-h-screen flex-col justify-center px-6 py-28 md:px-12 xl:px-24"
        >
          <div className="mx-auto w-full max-w-6xl">
          <div data-parallax className={`w-full ${SIDE_LAYOUT[CHAPTER_SIDES[0]]}`}>
            <p
              data-rise
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35"
            >
              Hoja de vida
            </p>
            <h1 className="mt-6 font-sans text-[13vw] font-light leading-[0.92] tracking-tight sm:text-[11vw] xl:text-[7.5rem]">
              <SplitWords text={PROFILE.name} className="block" />
              <SplitWords
                text={PROFILE.lastName}
                className="block italic text-white/55"
              />
            </h1>
            <div data-rule className="mt-8 h-px w-full max-w-xl bg-white/15" />
            <p data-rise className="mt-6 font-serif text-lg italic text-white/80 md:text-2xl">
              {PROFILE.role}
              <span className="font-mono text-sm not-italic text-white/40 md:text-base">
                {" "}
                · {PROFILE.specialty}
              </span>
            </p>
            <div
              data-rise
              className="mt-10 flex flex-col gap-3 font-mono text-xs text-white/45 sm:flex-row sm:items-center sm:gap-8"
            >
              <a
                href={`mailto:${PROFILE.email}`}
                className="transition-colors hover:text-white"
                data-cursor-hover
              >
                {PROFILE.email}
              </a>
              <a
                href={`tel:+57${PROFILE.phone}`}
                className="transition-colors hover:text-white"
                data-cursor-hover
              >
                +57 {PROFILE.phone}
              </a>
              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
                data-cursor-hover
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
          </div>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
              Recorrer
            </span>
            <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/*
          ═══ 01 · PERFIL · panel con selector ═══

          Los tres textos —Perfil, Mirada y Método— viven en este único
          capítulo y se alternan con los botones. Los capítulos 02 y 03 se
          conservan vacíos justo debajo: mantienen su altura de pantalla y sus
          atributos, así que el recorrido de cámara sigue teniendo el mismo
          número de planos y el mismo presupuesto de scroll.

          El bloque que cambia no lleva `data-rise` ni `SplitWords`. La entrada
          animada de los capítulos es una línea de tiempo de GSAP enganchada al
          scroll, que guarda referencias a los elementos concretos que encontró
          al montarse; al sustituir el texto, esos nodos dejan de existir y la
          animación quedaría apuntando a elementos huérfanos. El cambio se anima
          con framer-motion, que sí está pensado para contenido que entra y sale.
        */}
        <section
          id={PROFILE_STATEMENTS[0].id}
          data-chapter
          data-side={CHAPTER_SIDES[1]}
          data-accent={PROFILE_STATEMENTS[0].accent}
          className="relative flex min-h-screen items-center px-6 py-24 md:px-12 xl:px-24"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div data-parallax className={`w-full ${SIDE_LAYOUT[CHAPTER_SIDES[1]]}`}>
              <div className="w-full">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                  01 · Perfil
                </p>

                <div
                  className={`mt-5 flex flex-wrap gap-2 ${
                    CHAPTER_SIDES[1] === "right" ? "md:justify-end" : ""
                  }`}
                >
                  {PROFILE_STATEMENTS.map((option) => {
                    const active = option.id === statement.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setActiveStatement(option.id)}
                        data-cursor-hover
                        aria-pressed={active}
                        className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                          active
                            ? "border-white text-white"
                            : "border-white/15 text-white/45 hover:border-white/40 hover:text-white/80"
                        }`}
                      >
                        {option.kicker}
                      </button>
                    )
                  })}
                </div>

                {/*
                  `mode="wait"` para que el texto saliente termine antes de que
                  entre el nuevo: solapados, dos bloques de altura distinta se
                  pisan y el conjunto da un salto.
                */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statement.id}
                    initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="mt-7 font-sans text-3xl font-light leading-[1.15] tracking-tight md:text-5xl">
                      {statement.headline}
                    </h2>
                    <div
                      className={`mt-7 h-px w-24 bg-white/30 ${
                        CHAPTER_SIDES[1] === "right" ? "md:ml-auto" : ""
                      }`}
                    />
                    <p className="mt-7 font-mono text-sm leading-relaxed text-white/55 md:text-[15px]">
                      {statement.body}
                    </p>
                    <p className="mt-6 font-serif text-lg italic leading-snug text-white/90 md:text-2xl">
                      {statement.highlight}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 02 · LÍNEA DE INVESTIGACIÓN ═══ */}
        <ResearchChapter side={CHAPTER_SIDES[2]} chapter={RESERVED_CHAPTERS[0]} />

        {/*
          ═══ 03 · MÉTODO · el ciclo de vida del dato ═══

          Cierra la secuencia del recorrido: el capítulo 01 dice quién es, el 02
          qué investiga y este cómo lo hace, justo antes de que la trayectoria
          cuente dónde lo ha hecho.

          Vuelve a ocupar la pantalla entera. Mientras estuvo vacío medía media
          para no arrastrar en el vacío, pero con medio alto el bloque pegajoso
          del capítulo anterior seguía asomando por arriba al llegar aquí.
        */}
        <section
          id={RESERVED_CHAPTERS[1].id}
          data-chapter
          data-side={CHAPTER_SIDES[3]}
          data-accent={RESERVED_CHAPTERS[1].accent}
          className="relative flex min-h-screen items-center px-6 py-16 md:px-12 xl:px-24"
        >
          <div className="mx-auto w-full max-w-6xl">
            {/*
              Más ancho que el resto de capítulos: el grafo necesita sitio a lo
              largo para que el nombre del tramo y su abanico de herramientas no
              se pisen. Sigue en la mitad libre que deja la cámara.
            */}
            <div data-parallax className="mr-auto w-full md:max-w-[42rem] xl:max-w-[46rem]">
              <p
                data-rise
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35"
              >
                03 · Método
              </p>
              <h2 className="mt-6 font-sans text-3xl font-light leading-[1.1] tracking-tight md:text-4xl">
                <SplitWords text="El ciclo de vida" className="block" />
                <SplitWords text="del dato" className="block italic text-white/55" />
              </h2>
              <div data-rule className="mt-8 h-px w-full max-w-md bg-white/15" />

              <div data-rise className="mt-8">
                <MethodGraph />
              </div>

              <p
                data-rise
                className="mt-8 font-mono text-[9px] uppercase leading-relaxed tracking-[0.24em] text-white/30"
              >
                <span className="text-white/50">Casos de uso</span>{" "}
                {USE_CASES.join("  ·  ")}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ TRAYECTORIA · con la pausa intercalada ═══ */}
        {EXPERIENCES.map((exp, index) => (
          <Fragment key={exp.id}>
          {BLANK_EXPERIENCES.has(exp.id) ? (
            /*
              En blanco a la espera de rehacer el contenido. La sección se
              mantiene entera —con su id, su acento y su altura de pantalla—
              porque `CHAPTERS` y `ASCENDING_ORBIT` se emparejan por posición:
              quitarla correría todas las claves de cámara siguientes y cada
              capítulo heredaría el encuadre del de al lado.
            */
            <section
              id={exp.id}
              data-chapter
              data-side={CHAPTER_SIDES[experienceChapter(index)]}
              data-accent={exp.accent}
              className="relative min-h-screen"
            />
          ) : (
          <section
            id={exp.id}
            data-chapter
            data-side={CHAPTER_SIDES[experienceChapter(index)]}
            data-accent={exp.accent}
            className="relative flex min-h-screen items-center px-6 py-24 md:px-12 xl:px-24"
          >
            <div className="mx-auto w-full max-w-6xl">
            {/*
              Marcas con logotipo: el capítulo se presenta solo con la imagen
              levitando, y todo el contenido escrito queda tras el conmutador.
              Es una pausa deliberada en el recorrido, no una carencia.
            */}
            {exp.logo && !revealedNames[exp.id] ? (
              // Centrado dentro de su columna, no contra el borde: el logo es
              // aquí el contenido del capítulo, así que ocupa su mitad.
              <div
                className={`flex flex-col items-center gap-6 ${
                  SIDE_LAYOUT[CHAPTER_SIDES[experienceChapter(index)]]
                }`}
              >
                <motion.a
                  href={exp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visitar el sitio de ${exp.org}`}
                  data-cursor-hover
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    // Levitación continua: el ciclo vertical no termina nunca.
                    y: [0, -18, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.7 },
                    scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                    y: {
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  className="group block w-fit"
                >
                  <img
                    src={exp.logo}
                    alt={exp.org}
                    className="h-64 w-auto max-w-full transition-transform duration-500 group-hover:scale-105 md:h-[26rem] xl:h-[34rem]"
                  />
                </motion.a>

                <button
                  type="button"
                  onClick={() => setRevealedNames((prev) => ({ ...prev, [exp.id]: true }))}
                  data-cursor-hover
                  className="w-fit px-2 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-white/20 transition-colors hover:text-white/70"
                >
                  Ver
                </button>
              </div>
            ) : (
            <div
              data-parallax
              className={`w-full ${SIDE_LAYOUT[CHAPTER_SIDES[experienceChapter(index)]]}`}
            >
              <div className="flex flex-col gap-8">
                {/* Encabezado del cargo */}
                <div>
                  <div data-rise className="flex items-baseline gap-4">
                    <span
                      className="font-mono text-xs tracking-[0.25em] text-white/70"
                    >
                      {exp.year}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-white/25">
                      {String(index + 1).padStart(2, "0")} / {String(EXPERIENCES.length).padStart(2, "0")}
                    </span>
                  </div>
                  {/* El logotipo va siempre a la izquierda del nombre; en los
                      capítulos alineados a la derecha lo que se mueve es el
                      bloque entero, no el orden de sus piezas. */}
                  <div
                    className={`mt-4 flex items-center gap-5 ${
                      CHAPTER_SIDES[experienceChapter(index)] === "right" ? "md:justify-end" : ""
                    }`}
                  >
                    {exp.logo && (
                      // Al desplegarse la experiencia el logotipo no desaparece:
                      // se reduce y acompaña al nombre, conservando el enlace y
                      // un rastro de la levitación que tenía en grande.
                      <motion.a
                        href={exp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visitar el sitio de ${exp.org}`}
                        data-cursor-hover
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                        transition={{
                          opacity: { duration: 0.5 },
                          scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          y: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                        }}
                        className="flex-shrink-0"
                      >
                        <img
                          src={exp.logo}
                          alt=""
                          className="h-16 w-auto transition-transform duration-500 hover:scale-110 md:h-24"
                        />
                      </motion.a>
                    )}
                    <h2 className="font-sans text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
                      <SplitWords text={exp.org} />
                    </h2>
                  </div>
                  <div
                    data-rule
                    className="mt-6 h-px w-full bg-white/20"
                  />
                  <p
                    data-rise
                    className="mt-5 font-serif text-base italic leading-snug text-white/80 md:text-xl"
                  >
                    {exp.role}
                  </p>
                  <p
                    data-rise
                    className="mt-5 font-mono text-[13px] leading-relaxed text-white/45"
                  >
                    {exp.lead}
                  </p>
                  <ul data-rise className="mt-7 flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border border-white/10 px-2 py-1 font-mono text-[10px] tracking-wide text-white/50"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detalle */}
                <div className="flex-1">
                  <ul className="flex flex-col">
                    {exp.bullets.map((bullet) => (
                      <li
                        key={bullet.label}
                        data-rise
                        className="group border-t border-white/10 py-5 transition-colors duration-500 last:border-b hover:border-white/25"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:gap-8">
                          <h3
                            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 md:w-52 md:flex-shrink-0"
                          >
                            {bullet.label}
                          </h3>
                          <p className="font-mono text-[13px] leading-relaxed text-white/55 transition-colors duration-500 group-hover:text-white/80">
                            {bullet.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {exp.logo && (
                <button
                  type="button"
                  onClick={() => setRevealedNames((prev) => ({ ...prev, [exp.id]: false }))}
                  data-cursor-hover
                  className="mt-8 w-fit px-2 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-white/20 transition-colors hover:text-white/70"
                >
                  Ocultar
                </button>
              )}
            </div>
            )}
            </div>
          </section>
          )}

          {/* La pausa cae dentro de la trayectoria, no al final de ella. */}
          {index + 1 === QUOTE_AFTER && quoteSection}
          </Fragment>
        ))}

        {/* ═══ CIERRE · CONTACTO ═══ */}
        <section
          id="contacto"
          data-chapter
          data-side={CHAPTER_SIDES[CHAPTERS.length - 1]}
          data-accent="#ffffff"
          className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center md:px-12"
        >
          <p data-rise className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
            Conversemos
          </p>
          <h2 className="mt-6 max-w-4xl font-sans text-4xl font-light leading-[1.1] tracking-tight md:text-7xl">
            {/* Eco literal de la cita de Asimov, que habla de acumular: la
                invitación a escribir va dentro de la propia tesis, sin pedirlo
                de forma explícita. */}
            <SplitWords text="La sapiencia no se acumula: se conversa" />
          </h2>
          <div data-rule className="mt-10 h-px w-40 bg-white/25" />
          <div data-rise className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            <a
              href={`mailto:${PROFILE.email}`}
              className="border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-white hover:text-white"
              data-cursor-hover
            >
              {PROFILE.email}
            </a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-white hover:text-white"
              data-cursor-hover
            >
              LinkedIn ↗
            </a>
            <a
              href="/"
              className="border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-white hover:text-white"
              data-cursor-hover
            >
              Portafolio
            </a>
          </div>
          <p data-rise className="mt-12 font-mono text-[10px] tracking-[0.25em] text-white/20">
            +57 {PROFILE.phone}
          </p>
        </section>

        {/*
          Vista libre. Es una sección vacía a propósito: su única función es dar
          al scroll un sitio al que llegar después del cierre. Al entrar en ella
          la interfaz se retira y la cámara pasa al cursor; subiendo se vuelve.
        */}
        <section
          data-free-look
          aria-label="Vista libre de la figura"
          className="relative flex h-screen items-end justify-center pb-16"
        >
        </section>
      </main>
    </div>
  )
}
