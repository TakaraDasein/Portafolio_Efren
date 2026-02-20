"use client"

export default function HomeCertExpAnimatedTitle() {
  return (
    <div className="relative mt-8 inline-flex items-center justify-center md:mt-10">
      <h2
        className="relative text-center text-4xl font-black uppercase leading-[1.02] tracking-[0.09em] md:text-6xl lg:text-8xl"
        style={{
          fontFamily: "ui-rounded, 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif",
          color: "#ffffff",
        }}
      >
        <span className="block whitespace-nowrap">Certificaciones</span>
        <span className="mt-2 block whitespace-nowrap md:mt-3">y Experiencia</span>
      </h2>
    </div>
  )
}
