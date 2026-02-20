"use client"

import MatrixBackground from "./matrix-background"

export default function HomeMatrixSection() {
  return (
    <section
      id="home-matrix-section"
      className="relative h-[68vh] min-h-[620px] w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        <MatrixBackground />
        <div className="absolute inset-0 bg-black/45" />
      </div>
    </section>
  )
}
