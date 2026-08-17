/**
 * Contenido de la hoja de vida. Vive aparte del componente para que actualizar
 * el CV no obligue a tocar la capa de animación.
 */

export const PROFILE = {
  name: "Alvaro Efren",
  lastName: "Bolaños Scalante",
  role: "Politólogo",
  specialty: "Social Data Science",
  email: "efren.dataviz@gmail.com",
  phone: "3158173818",
  linkedin: "https://www.linkedin.com/in/alvaro-efren-bolanos-scalante",
} as const

/** Frases ancla del perfil: una idea por bloque, sin párrafos largos. */
export const PROFILE_STATEMENTS = [
  {
    id: "puente",
    accent: "#7dd3fc",
    kicker: "Perfil",
    headline: "Politólogo con enfoque directo en Análisis y Ciencia de Datos",
    body:
      "Sólida experiencia en el procesamiento, modelado y estructuración de información. Mi trayectoria se centra en desarrollar soluciones de software para la gestión y visualización de datos en contextos sociales, institucionales, humanitarios y ambientales.",
    highlight: "Transformo datos crudos en análisis eficaces para decisiones estratégicas.",
  },
  {
    id: "mirada",
    accent: "#10b981",
    kicker: "Mirada",
    headline: "Los datos no son cifras: son realidades complejas",
    body:
      "Mi enfoque combina la resolución técnica y analítica con la comprensión de dinámicas sociales, institucionales y políticas. Esa lectura doble es la ventaja al gestionar grupos de expertos y redes de trabajo.",
    highlight: "Instituciones, comunidades y territorios exigen soluciones multidisciplinarias.",
  },
  {
    id: "metodo",
    accent: "#a78bfa",
    kicker: "Método",
    headline: "Investigador disciplinado, orientado al aprendizaje continuo",
    body:
      "Experiencia liderando equipos multidisciplinarios. Los datos analizados y contextualizados, junto a una gestión eficiente de redes de conocimiento, son la herramienta clave para diseñar estrategias de decisión y gestión.",
    highlight: "Impacto positivo en instituciones, empresas, medio ambiente y sociedad.",
  },
] as const

/**
 * Portada de la línea de investigación: el capítulo que antecede a los
 * proyectos y les da un marco común. Evita «desastres naturales» a propósito
 * —en el vocabulario del sector la amenaza es natural, el desastre no: depende
 * de la vulnerabilidad que encuentra— y es justo lo que miden estos trabajos.
 */
export const RESEARCH_LINE = {
  kicker: "Línea de investigación",
  title: "Cartografías",
  titleAccent: "del riesgo",
  lead:
    "Conflicto armado y amenaza climática en Colombia: dónde se concentra el daño y sobre quién recae.",
} as const

export type FeaturedProject = {
  id: string
  title: string
  year: string
  /** Herramienta con la que se publicó, tal y como se muestra en pantalla. */
  tool: string
  tags: string[]
  url: string
  /** Captura del proyecto. Vive en `public/`, así que la ruta es absoluta. */
  thumbnail: string
}

/**
 * Selección para el capítulo 02 del recorrido. No es el catálogo completo —ese
 * vive en las páginas temáticas—: son cuatro piezas escogidas a mano. Tres
 * lecturas del conflicto colombiano a distintas escalas y un cierre ambiental
 * que además muestra desarrollo propio y no solo Tableau.
 */
export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "geovisor-multivariado",
    title: "Geovisor multivariado · riesgo de reclutamiento, Cauca",
    year: "2023",
    tool: "Tableau",
    tags: ["Protección infantil", "Multivariado", "Riesgo"],
    url: "https://public.tableau.com/views/DATALABGeovisormultivariadoEND/Historia",
    thumbnail: "/proyectos/1.geovisor-multivariado.png",
  },
  {
    id: "grupos-armados",
    title: "Presencia de grupos armados en Colombia",
    year: "2023",
    tool: "Tableau",
    tags: ["Conflicto", "Territorial", "Seguridad"],
    url: "https://public.tableau.com/views/PresenciadegruposarmadosenColombia2023DataLabConsulting/DataLabConsulting",
    thumbnail: "/proyectos/4.grupos-armados.png",
  },
  {
    id: "historico-desapariciones",
    title: "Histórico de desapariciones en Colombia",
    year: "2023",
    tool: "Tableau",
    tags: ["Derechos humanos", "Geoespacial", "Histórico"],
    url: "https://public.tableau.com/views/HistoricodedesaparicionesenColombia/Dashboard1",
    thumbnail: "/proyectos/7.historico-desapariciones.png",
  },
  {
    id: "riesgo-climatico",
    title: "Índice de riesgo climático en Colombia",
    year: "2025",
    tool: "Web",
    tags: ["Clima", "Riesgo", "Territorial"],
    url: "https://indice-riesgo-climatico-colombia.vercel.app/",
    thumbnail: "/proyectos/11.riesgo-climatico.jpeg",
  },
]

/**
 * El ciclo de vida del dato, un tramo por herramienta. El orden es el del dato
 * y no el de la carrera: empieza donde se captura y termina donde se decide.
 *
 * Los dos tramos de los extremos —ingesta automatizada e inteligencia
 * artificial— son los que describen el trabajo actual en V1TR0 y no aparecían
 * en la versión anterior, que se detenía en la visualización.
 */
export const STACK_GROUPS = [
  {
    id: "ingesta",
    accent: "#7dd3fc",
    stage: "01",
    title: "Ingesta y automatización",
    caption: "Captura programada en origen",
    tools: ["Python", "FastAPI", "Selenium", "APIs", "Pipelines"],
  },
  {
    id: "consultas",
    accent: "#39cbe3",
    stage: "02",
    title: "Gestión de consultas",
    caption: "Entornos relacionales y NoSQL",
    tools: ["SQL", "MySQL", "PostgreSQL", "MongoDB"],
  },
  {
    id: "eda",
    accent: "#10b981",
    stage: "03",
    title: "Análisis exploratorio",
    caption: "EDA según las necesidades del proyecto",
    tools: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "R"],
  },
  {
    id: "microsoft",
    accent: "#fb923c",
    stage: "04",
    title: "Modelado y BI",
    caption: "Suite completa dentro del ecosistema Microsoft",
    tools: ["Power BI", "Power Query", "ETL", "DAX", "Tableau"],
  },
  {
    id: "open-source",
    accent: "#f472b6",
    stage: "05",
    title: "Visualización open source",
    caption: "La tecnología libre más adecuada según el contexto",
    tools: ["D3.js", "Recharts", "Tableau Public"],
  },
  {
    id: "ia",
    accent: "#a78bfa",
    stage: "06",
    title: "Inteligencia artificial",
    caption: "Capa transversal sobre el dato ya gobernado",
    tools: ["LLMs", "RAG", "Agentes", "Clasificación", "Predicción"],
  },
] as const

/** Casos de uso que cubro con ese ciclo, de lo descriptivo a lo predictivo. */
export const USE_CASES = [
  "Análisis exploratorio (EDA)",
  "Monitoreo de KPIs",
  "Automatización de procesos",
  "Análisis predictivo",
  "Dashboards interactivos",
  "Asistentes sobre datos propios",
] as const

export type Experience = {
  id: string
  year: string
  org: string
  role: string
  accent: string
  /** Logotipo que sustituye al nombre en pantalla, si la marca tiene uno. */
  logo?: string
  /** Sitio al que lleva el logotipo. */
  url?: string
  lead: string
  bullets: { label: string; text: string }[]
  tags: string[]
}

/** Trayectoria en orden cronológico inverso. */
export const EXPERIENCES: Experience[] = [
  {
    id: "v1tr0",
    year: "2025",
    org: "V1TR0",
    role: "Coordinador de Análisis de Datos e IA",
    accent: "#a78bfa",
    logo: "/ilustraciones/v1tr.webp",
    url: "https://v1tr0.com",
    lead:
      "Lideré el diseño y la arquitectura de sistemas de información estratégica para entornos corporativos e institucionales.",
    bullets: [
      {
        label: "Arquitectura de datos",
        text: "Diseñé y construí sistemas de información estratégica y contractual, liderando la estrategia de datos y el desarrollo backend.",
      },
      {
        label: "Optimización con IA",
        text: "Implementé pipelines de datos, flujos de automatización e integraciones de IA que incrementaron la eficiencia operativa de clientes y empresa.",
      },
      {
        label: "Gestión ágil",
        text: "Coordiné equipos bajo metodología Scrum, asegurando el control de versiones y la trazabilidad del código.",
      },
      {
        label: "Relacionamiento estratégico",
        text: "Lideré la gestión con socios externos, definiendo estándares de calidad, seguridad y buenas prácticas de arquitectura.",
      },
    ],
    tags: ["Python", "FastAPI", "Pandas", "Selenium", "SQL / NoSQL", "GitHub", "Scrum"],
  },
  {
    id: "opax",
    year: "2023-2",
    org: "OPAX Colombia",
    role: "Especialista en Análisis Territorial y Visualización de Datos",
    accent: "#39cbe3",
    lead:
      "Plataforma multidimensional para el monitoreo de actores y dinámicas territoriales en Cauca, Valle del Cauca y Chocó, integrando datos de la ONU, el Fondo para la Consolidación de la Paz y socios locales.",
    bullets: [
      {
        label: "Modelamiento geoespacial",
        text: "Visores geográficos interactivos para el análisis de accesibilidad fluvial y terrestre y la identificación de nodos de riesgo en zonas de difícil acceso.",
      },
      {
        label: "Análisis de redes",
        text: "Modelos de interacción para mapear y clasificar el relacionamiento entre actores institucionales, comunitarios, sociales y no institucionales.",
      },
      {
        label: "Datos multidimensionales",
        text: "Sistematización de bases a escala nacional, departamental y municipal para el seguimiento de compromisos y alertas tempranas.",
      },
      {
        label: "Visualización científica",
        text: "Tableros de control avanzados que convierten indicadores crudos en insumos visuales para decisiones de alto nivel.",
      },
    ],
    tags: ["Power BI", "DAX", "Análisis geoespacial", "Análisis de redes", "Alertas tempranas"],
  },
  {
    id: "cosurca",
    year: "2023-2",
    org: "COSURCA",
    role: "Consultor de proyectos · Café y Legalidad",
    accent: "#10b981",
    lead:
      "Consultoría técnica para la formulación estratégica y la línea base del proyecto, integrando información técnica y social para la toma de decisiones territoriales.",
    bullets: [
      {
        label: "Gestión de redes y actores",
        text: "Facilitación de mesas técnicas y talleres participativos con actores sociales y gremiales, construyendo agendas conjuntas.",
      },
      {
        label: "Estructuración científica",
        text: "Línea base del proyecto mediante sistematización de datos territoriales y redacción de marcos conceptuales y teóricos con rigor metodológico.",
      },
      {
        label: "Análisis espacial y productivo",
        text: "Mapeo de actores clave y análisis de la distribución productiva —hectáreas de café por municipio— en el departamento del Cauca.",
      },
      {
        label: "Planificación y evaluación",
        text: "Presupuestos detallados y marcos de evaluación de impacto con indicadores para el seguimiento de metas.",
      },
    ],
    tags: ["Línea base", "KPIs", "Mapeo de actores", "Evaluación de impacto"],
  },
  {
    id: "data-lab",
    year: "2023-2",
    org: "Data Lab",
    role: "Fundador · Observatorio de análisis de datos sociales del Cauca",
    accent: "#fb923c",
    lead:
      "Fundé el equipo universitario Data Lab, de formación interdisciplinaria, centrado en el análisis y la visualización de información sobre el conflicto armado en el Cauca.",
    bullets: [
      {
        label: "Primer puesto Datathon 2023",
        text: "«Geovisor multivariado: de niñas, niños y adolescentes en riesgo de uso, utilización y reclutamiento forzado en el departamento del Cauca, 2023».",
      },
      {
        label: "Índice propio",
        text: "Creé un índice de reclutamiento forzado a partir de la triangulación de información.",
      },
      {
        label: "Estandarización",
        text: "Desarrollé un sistema de buenas prácticas incorporado a los procesos de investigación y al ciclo de vida de los datos.",
      },
      {
        label: "Dirección de investigación",
        text: "Lideré el monitoreo y seguimiento de las líneas de investigación del equipo en cada uno de sus proyectos.",
      },
    ],
    tags: ["Excel", "Tableau", "Power Query", "Power BI"],
  },
  {
    id: "ocha",
    year: "2023",
    org: "ONU · OCHA",
    role: "Analista de datos en el sector humanitario",
    accent: "#7dd3fc",
    lead:
      "Con la Oficina de la ONU para la Coordinación de Asuntos Humanitarios en Cauca: recolección y análisis de datos cualitativos y cuantitativos sobre condiciones humanitarias en zonas afectadas por el conflicto.",
    bullets: [
      {
        label: "Monitor e indicadores",
        text: "Actualización de bases de datos de Monitor y desarrollo y seguimiento de indicadores clave en proyectos humanitarios.",
      },
      {
        label: "Informes de contexto",
        text: "Análisis de emergencias y preparación de mapas geoespaciales para la planificación de la respuesta.",
      },
      {
        label: "Coordinación territorial",
        text: "Apoyo a reuniones y talleres con actores gubernamentales, no gubernamentales y líderes comunitarios para una respuesta humanitaria contextual.",
      },
      {
        label: "Dashboards de decisión",
        text: "Tableros interactivos que optimizaron la coordinación humanitaria y la identificación de grupos armados en el Cauca.",
      },
    ],
    tags: ["Análisis cuantitativo", "Análisis cualitativo", "Mapas geoespaciales", "Dashboards"],
  },
]
