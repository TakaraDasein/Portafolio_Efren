"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MathUtils } from "three"
import type { Mesh, ShaderMaterial } from "three"

function Sphere() {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer, gl } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const previousPointer = useRef({ x: 0, y: 0 })
  const autoRotation = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
    }),
    [],
  )

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vDisplacement;
    
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
      
      float noise = snoise(position * 1.5 + uTime * 0.15);
      float displacement = noise * 0.15;
      vDisplacement = displacement;
      
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vDisplacement;
    
    // Función de ruido simplificada para destellos
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      float intensity = 0.3 + vDisplacement * 2.0;
      vec3 baseColor = vec3(intensity);
      
      float line = smoothstep(0.0, 0.02, abs(fract(vUv.x * 20.0) - 0.5));
      line *= smoothstep(0.0, 0.02, abs(fract(vUv.y * 20.0) - 0.5));
      
      // Destellos de color cyan
      vec3 accentColor = vec3(0.22, 0.8, 0.89); // Color cyan #39cbe3
      
      // Crear patrón de destellos aleatorios basado en UV y tiempo
      float sparklePattern = random(floor(vUv * 15.0));
      float sparkleTime = fract(uTime * 0.8 + sparklePattern * 6.28);
      
      // Destellos intermitentes
      float sparkle = smoothstep(0.85, 0.95, sparklePattern) * 
                      smoothstep(0.9, 1.0, sin(sparkleTime * 3.14159)) *
                      smoothstep(0.0, 0.1, sparkleTime) *
                      smoothstep(1.0, 0.9, sparkleTime);
      
      // Destellos en los bordes con noise
      float edgeSparkle = smoothstep(0.7, 1.0, vDisplacement) * 
                          sin(uTime * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
      
      // Combinar destellos
      float totalSparkle = max(sparkle, edgeSparkle * 0.3);
      
      // Mezclar color base con destellos cyan
      vec3 finalColor = mix(baseColor, accentColor, totalSparkle * 0.7);
      
      // Aplicar líneas de wireframe
      finalColor = finalColor * (1.0 - line * 0.5);
      
      gl_FragColor = vec4(finalColor, 0.6 + totalSparkle * 0.3);
    }
  `

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uMouse.value = [pointer.x, pointer.y]
    }

    if (meshRef.current) {
      if (isDragging) {
        // Calcular el delta del movimiento del mouse
        const deltaX = (pointer.x - previousPointer.current.x) * 3
        const deltaY = (pointer.y - previousPointer.current.y) * 3
        
        // Actualizar la rotación basada en el arrastre
        setRotation(prev => ({
          x: prev.x - deltaY,
          y: prev.y + deltaX,
        }))
        
        previousPointer.current = { x: pointer.x, y: pointer.y }
        
        // Aplicar la rotación inmediatamente
        meshRef.current.rotation.x = rotation.x
        meshRef.current.rotation.y = rotation.y
      } else {
        // Rotación automática suave cuando no se arrastra
        autoRotation.current += delta * 0.1
        
        // Volver suavemente a la rotación automática
        const targetX = Math.sin(autoRotation.current * 0.3) * 0.2
        const targetY = autoRotation.current
        const targetZ = Math.cos(autoRotation.current * 0.2) * 0.1
        
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.05)
        meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.05)
        meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.05)
        
        // Actualizar el estado de rotación
        setRotation({
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
        })
      }
    }
  })

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    setIsDragging(true)
    previousPointer.current = { x: pointer.x, y: pointer.y }
    gl.domElement.style.cursor = 'grabbing'
  }

  const handlePointerUp = (e: any) => {
    if (e) e.stopPropagation()
    setIsDragging(false)
    gl.domElement.style.cursor = isHovered ? 'grab' : 'auto'
  }

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      e.stopPropagation()
    }
  }

  const handlePointerEnter = (e: any) => {
    e.stopPropagation()
    setIsHovered(true)
    if (!isDragging) {
      gl.domElement.style.cursor = 'grab'
    }
  }

  const handlePointerLeave = (e: any) => {
    e.stopPropagation()
    setIsHovered(false)
    if (!isDragging) {
      gl.domElement.style.cursor = 'auto'
    }
  }

  // Limpiar el cursor cuando se suelta fuera del canvas
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        handlePointerUp(null)
      }
    }
    
    window.addEventListener('pointerup', handleGlobalPointerUp)
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
  }, [isDragging])

  return (
    <mesh 
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <icosahedronGeometry args={[1.6, 64]} />
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

export function SentientSphere() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border border-white/10 animate-pulse" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      className="w-full my-0 h-full py-0"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <ambientLight intensity={0.5} />
      <Sphere />
    </Canvas>
  )
}
