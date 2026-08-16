"use client"

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ASCII_PRESETS, type AsciiPresetId } from "./ascii-pass"
import { ASCENDING_ORBIT, SentientFigure } from "./sentient-figure"
import { EXPERIENCES, PROFILE, PROFILE_STATEMENTS } from "./profile-data"

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

const CHAPTERS = [
  { id: "portada", label: "Portada", accent: "#ffffff" },
  ...PROFILE_STATEMENTS.map((s) => ({ id: s.id, label: s.kicker, accent: s.accent })),
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
          <div className="mx-auto w-full max-w-5xl">
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
              ? "radial-gradient(80% 60% at 50% 50%, rgba(5,5,5,0.72), rgba(5,5,5,0.25) 70%, transparent)"
              : `linear-gradient(to ${activeSide === "left" ? "right" : "left"}, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.6) 38%, transparent 68%)`,
        }}
        aria-hidden="true"
      />

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

        {/* ═══ 01–03 · PERFIL ═══ */}
        {PROFILE_STATEMENTS.map((statement, index) => (
          <section
            key={statement.id}
            id={statement.id}
            data-chapter
            data-side={CHAPTER_SIDES[index + 1]}
            data-accent={statement.accent}
            className="relative flex min-h-screen items-center px-6 py-24 md:px-12 xl:px-24"
          >
            <div className="mx-auto w-full max-w-6xl">
            <div
              data-parallax
              className={`w-full ${SIDE_LAYOUT[CHAPTER_SIDES[index + 1]]}`}
            >
              <div className="w-full">
                <p
                  data-rise
                  className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40"
                >
                  {String(index + 1).padStart(2, "0")} · {statement.kicker}
                </p>
                <h2 className="mt-5 font-sans text-3xl font-light leading-[1.15] tracking-tight md:text-5xl">
                  <SplitWords text={statement.headline} />
                </h2>
                <div
                  data-rule
                  className={`mt-7 h-px w-24 bg-white/30 ${
                    CHAPTER_SIDES[index + 1] === "right" ? "md:ml-auto" : ""
                  }`}
                />
                <p
                  data-rise
                  className="mt-7 font-mono text-sm leading-relaxed text-white/55 md:text-[15px]"
                >
                  {statement.body}
                </p>
                <p
                  data-rise
                  className="mt-6 font-serif text-lg italic leading-snug text-white/90 md:text-2xl"
                >
                  {statement.highlight}
                </p>
              </div>
            </div>
            </div>
          </section>
        ))}

        {/* ═══ TRAYECTORIA · con la pausa intercalada ═══ */}
        {EXPERIENCES.map((exp, index) => (
          <Fragment key={exp.id}>
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
