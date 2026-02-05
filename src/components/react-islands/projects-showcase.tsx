"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface Project {
  id: string
  title: string
  description: string
  embedUrl?: string
  tags: string[]
  featured?: boolean
  thumbnail: string
  type?: "tableau" | "jupyter" | "github" | "demo"
  externalLink?: string
}

interface ProjectsShowcaseProps {
  projects: Project[]
  title: string
  subtitle: string
  sectionNumber: string
  accentColor?: string
  hideHeader?: boolean
}

export default function ProjectsShowcase({ 
  projects, 
  title, 
  subtitle, 
  sectionNumber,
  accentColor = "#39cbe3",
  hideHeader = false
}: ProjectsShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

  const getProjectTypeIcon = (type?: string) => {
    switch (type) {
      case "tableau":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        )
      case "jupyter":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        )
      case "github":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        )
    }
  }

  const handleProjectClick = (project: Project) => {
    if (project.embedUrl) {
      setSelectedProject(project)
    } else if (project.externalLink) {
      window.open(project.externalLink, '_blank')
    }
  }

  return (
    <section className={hideHeader ? "" : "py-24 px-8 md:px-12 border-b border-white/10"}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {!hideHeader && (
          <>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
              {sectionNumber}
            </p>
            <h2 className="font-sans text-3xl md:text-5xl font-light italic mb-4">
              {title} <span style={{ color: accentColor }}>{subtitle}</span>
            </h2>
            <p className="font-mono text-sm text-muted-foreground max-w-3xl mb-16">
              Explora proyectos desarrollados con metodología rigurosa, diseñados para resolver desafíos reales 
              mediante técnicas avanzadas de análisis y modelado.
            </p>
          </>
        )}

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              onClick={() => handleProjectClick(project)}
              className={`group relative border cursor-pointer transition-all duration-300 ${
                project.featured 
                  ? 'border-white/50 bg-white/5' 
                  : 'border-white/10 hover:border-white/50'
              }`}
              style={{
                borderColor: project.featured ? accentColor + '80' : undefined,
                backgroundColor: project.featured ? accentColor + '0D' : undefined
              }}
            >
              {project.featured && (
                <div className="absolute -top-3 left-6 px-3 py-1" style={{ backgroundColor: accentColor }}>
                  <span className="font-mono text-[10px] tracking-wider text-black font-bold">
                    DESTACADO
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Project Thumbnail */}
                <div className="mb-6 aspect-video border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors overflow-hidden relative"
                  style={{
                    background: `linear-gradient(to bottom right, ${accentColor}1A, transparent)`
                  }}
                >
                  <img 
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Type Badge */}
                  {project.type && (
                    <div className="absolute top-3 right-3 p-2 bg-black/80 border border-white/20" style={{ color: accentColor }}>
                      {getProjectTypeIcon(project.type)}
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="font-sans text-xl font-light group-hover:opacity-80 transition-opacity">
                    {project.title}
                  </h3>
                  
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] tracking-wider px-2 py-1 border border-white/20 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="font-mono text-[10px] tracking-wider px-2 py-1 text-muted-foreground">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="flex items-center gap-2 font-mono text-xs tracking-wider group-hover:gap-3 transition-all"
                    style={{ color: accentColor }}
                  >
                    {project.embedUrl ? 'VER PROYECTO' : 'ABRIR ENLACE'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ borderColor: accentColor }}
              />
            </motion.div>
          ))}
        </div>

        {/* Full Project Modal (for embedded content) */}
        {selectedProject && selectedProject.embedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[95vw] max-w-[1600px] h-[95vh] max-h-[90vh] bg-background border flex"
              style={{ borderColor: accentColor + '80' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Embed Container */}
              <div className="flex-1 h-full p-2 md:p-4">
                <iframe
                  src={selectedProject.embedUrl}
                  className="w-full h-full border border-white/10"
                  style={{ border: 'none' }}
                  title={selectedProject.title}
                  allowFullScreen
                />
              </div>

              {/* Toggle Panel Button */}
              <button
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-0 z-20 p-2 bg-black/40 hover:bg-black/60 border-l border-t border-b transition-all"
                style={{ 
                  right: isPanelCollapsed ? '0' : '320px',
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem',
                  borderColor: accentColor + '80',
                  color: accentColor
                }}
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isPanelCollapsed ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Right Sidebar */}
              <div 
                className={`h-full border-l border-white/10 bg-black/30 backdrop-blur-sm flex flex-col transition-all duration-300 ${
                  isPanelCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 bg-black/50 hover:bg-black/80 border border-white/20 transition-all"
                  style={{
                    borderColor: accentColor + '40'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = accentColor + '40'}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: accentColor }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="pt-8">
                    <h3 className="font-sans text-2xl font-light text-white mb-3 leading-tight">
                      {selectedProject.title}
                    </h3>
                    <div className="h-px bg-gradient-to-r to-transparent mb-4" 
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>

                  <div>
                    <p className="font-mono text-xs tracking-wider mb-2" style={{ color: accentColor }}>
                      DESCRIPCIÓN
                    </p>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-xs tracking-wider mb-3" style={{ color: accentColor }}>
                      CATEGORÍAS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-wider px-3 py-1.5 border text-white hover:border-white/50 transition-all"
                          style={{ 
                            borderColor: accentColor + '40',
                            backgroundColor: accentColor + '0D'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedProject.featured && (
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 border"
                        style={{
                          backgroundColor: accentColor + '1A',
                          borderColor: accentColor + '40'
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: accentColor }}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-mono text-[10px] tracking-wider" style={{ color: accentColor }}>
                          PROYECTO DESTACADO
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
