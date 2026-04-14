"use client"

export default function HomeCertExpAnimatedTitle() {
  return (
    <div className="relative mt-8 w-full max-w-7xl md:mt-10">
      {/* Contenedor con imagen de fondo - Efecto grayscale/color igual al hero */}
      <div className="group relative overflow-hidden rounded-lg border border-white/10 cursor-default" data-cursor-hover>
        {/* Imagen de fondo con degradado overlay */}
        <div className="absolute inset-0">
          <img
            src="/yo-certificaciones.jpg"
            alt="Certificaciones background"
            className="h-full w-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:opacity-50"
            style={{ objectPosition: "center 45%" }}
          />
          {/* Degradado desde negro translúcido hasta cian/cyan con opacidad */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(5, 5, 5, 0.92) 0%, rgba(5, 5, 5, 0.85) 25%, rgba(57, 203, 227, 0.18) 60%, rgba(57, 203, 227, 0.25) 100%)",
            }}
          />
          {/* Glow cyan en hover - igual al hero */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(57, 203, 227, 0.15) 0%, transparent 70%)",
            }}
          />
          {/* Grid sutil sobre el degradado */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(57,203,227,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(57,203,227,0.7) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Contenido del título */}
        <div className="relative z-10 flex items-center justify-center px-6 py-16 md:px-12 md:py-24 lg:py-32">
          <h2
            className="text-center text-4xl font-sans font-light leading-tight tracking-tight md:text-6xl lg:text-8xl transition-all duration-500 group-hover:scale-[1.02]"
            style={{
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(57, 203, 227, 0.3)",
            }}
          >
            <span className="block whitespace-nowrap">Certificaciones</span>
            <span className="mt-2 block whitespace-nowrap md:mt-3">y Experiencia</span>
          </h2>
        </div>

        {/* Línea decorativa inferior con efecto glow - más intensa en hover */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-500" />
        
        {/* Línea superior en hover */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-500" />
      </div>
    </div>
  )
}
