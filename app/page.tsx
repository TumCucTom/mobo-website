// pages/index.tsx
"use client";

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import { Mesh, Group } from 'three'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export default function Home() {
  const [animateMascot, setAnimateMascot] = useState(false)
  const [mascotLoaded, setMascotLoaded] = useState(false)
  const router = useRouter()

  // Handler for button click
  const handleRegisterClick = () => {
    setAnimateMascot(true)
  }

  // Callback for when mascot animation is done
  const handleMascotAnimationEnd = () => {
    router.push('/signup')
  }

  // Handler for mascot loaded
  const handleMascotLoaded = () => {
    setMascotLoaded(true)
  }

  return (
    <div style={{ 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      backgroundImage: 'url("/bg-simple.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Loading Overlay */}
      {!mascotLoaded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20,20,30,0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.08em' }}>Loading...</div>
          <div style={{ width: 48, height: 48, border: '5px solid #fff', borderTop: '5px solid #ff8a00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {/* Persistent Top Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '64px',
        background: 'rgba(30,30,40,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        <Link href="/" style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.6rem',
          letterSpacing: '0.08em',
          textDecoration: 'none',
        }}>
          MONOMI
        </Link>
        <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          <Link href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Sign Up</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>About</Link>
          <Link href="/team" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Team</Link>
          <Link href="/business" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Business Enquiries</Link>
        </div>
      </div>
      {/* Top Half: Landing Content */}
      <div
        style={{
          height: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textShadow: '0 0 10px rgba(0, 0, 0, 0.8)', // subtle glow
          marginTop: '64px',
        }}
      >
       <h1
  style={{
    fontSize: 'clamp(4rem, 10vw, 7rem)',
    fontWeight: 900,
    margin: '0.5rem',
    lineHeight: 1.2,
    textAlign: 'center',
    WebkitBackgroundClip: 'text',
    letterSpacing: '-0.01em',
    textShadow: '0 8px 32px rgba(255,255,255,0.4), 0 4px 16px rgba(255,255,255,0.1)', // brighter shadow
    padding: '0 1rem',
    borderRadius: '0.5rem',
    boxDecorationBreak: 'clone',
    userSelect: 'none',
  }}
>
  MONOMI IS COMING
</h1>


        <button
          onClick={handleRegisterClick}
          style={{
            marginTop: '2rem',
            width: '260px',
            height: '64px',
            borderRadius: '32px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid white',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s, transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          Sign up for pre-launch
        </button>
      </div>
      {/* Bottom Half: 3D Canvas */}
      <div style={{ height: '50vh' }}>
        <Canvas
          style={{ height: '100%', width: '100%', background: 'transparent' }}
          shadows
          gl={{ alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 7.5]} 
            intensity={1} 
            castShadow
          />
          <MascotWithEyes 
            animate={animateMascot} 
            onAnimationEnd={handleMascotAnimationEnd}
            onLoaded={handleMascotLoaded}
          />
          {/* <OrbitControls /> Uncomment for dev */}
        </Canvas>
      </div>
    </div>
  )
}

function MascotWithEyes({ animate = false, onAnimationEnd, onLoaded }: { animate?: boolean, onAnimationEnd?: () => void, onLoaded?: () => void }) {
  const { scene } = useGLTF('/models/mascot.glb', true)
  const groupRef = useRef<Group>(null)
  const leftEyeRef = useRef<Mesh>(null)
  const rightEyeRef = useRef<Mesh>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [animState, setAnimState] = useState<'idle' | 'animating' | 'done'>('idle')
  const animRef = useRef({ t: 0, triggered: false })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile (simple width check)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle mouse movement (desktop only)
  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setMouse({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  // Animation trigger
  useEffect(() => {
    if (animate && animState === 'idle') {
      animRef.current.t = 0
      animRef.current.triggered = true
      setAnimState('animating')
    }
  }, [animate, animState])

  // Animate mascot bounce and eyes
  useFrame((state, delta) => {
    let x = mouse.x
    let y = mouse.y
    if (isMobile) {
      // Animate in a slow circle
      const t = state.clock.getElapsedTime()
      x = Math.sin(t * 0.3) * 0.7
      y = Math.cos(t * 0.2) * 0.7
    }
    const moveFactor = 0.05
    const maxOffset = 0.06
    const distFromCenter = Math.sqrt(x * x + y * y)
    const normalizedDist = Math.min(distFromCenter / Math.SQRT2, 1)
    const baseZ = 0.07
    const extraZ = 0.02
    const centerFactor = 1 - normalizedDist
    const zPos = baseZ + centerFactor * extraZ
    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = clamp(x * moveFactor, -maxOffset, maxOffset)
      leftEyeRef.current.position.y = clamp(y * moveFactor, -maxOffset, maxOffset)
      leftEyeRef.current.position.z = zPos
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = clamp(x * moveFactor, -maxOffset, maxOffset)
      rightEyeRef.current.position.y = clamp(y * moveFactor, -maxOffset, maxOffset)
      rightEyeRef.current.position.z = zPos
    }
    // Mascot bounce animation
    if (groupRef.current) {
      if (animState === 'animating') {
        animRef.current.t += delta
        // Animation: 0-0.3s pull down, 0.3-0.6s bounce up, 0.6-0.8s settle
        let yPos = -4
        if (animRef.current.t < 0.3) {
          // Pull down
          yPos = -4 - animRef.current.t * 3 // down to -4.9
        } else if (animRef.current.t < 0.6) {
          // Bounce up
          const t = (animRef.current.t - 0.3) / 0.3
          yPos = -4.9 + t * 2.2 // up to -2.7
        } else if (animRef.current.t < 0.8) {
          // Settle (fall back to -4)
          const t = (animRef.current.t - 0.6) / 0.2
          yPos = -2.7 - t * 1.3 // back to -4
        } else {
          yPos = -4
          setAnimState('done')
          if (onAnimationEnd) onAnimationEnd()
        }
        groupRef.current.position.y = yPos
      } else {
        groupRef.current.position.y = -4
      }
      // Also rotate with mouse or mobile anim
      const rotateFactor = 0.4
      groupRef.current.rotation.y = x * rotateFactor
      groupRef.current.rotation.x = y * rotateFactor * 0.5
    }
  })

  useEffect(() => {
    if (scene && onLoaded) onLoaded()
  }, [scene, onLoaded])

  return (
    <group ref={groupRef} scale={[3, 3, 3]} position={[0, -4, 0]}>
      {/* Mascot Model */}
      <primitive object={scene} position={[0, 0, 0]} castShadow receiveShadow />

      {/* Left Eye White */}
      <mesh position={[-0.2, 1.3, 0.4]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={'white'} />
        {/* Left Pupil */}
        <mesh ref={leftEyeRef} position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial color={'black'} />
        </mesh>
      </mesh>

      {/* Right Eye White */}
      <mesh position={[0.2, 1.3, 0.4]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={'white'} />
        {/* Right Pupil */}
        <mesh ref={rightEyeRef} position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial color={'black'} />
        </mesh>
      </mesh>
    </group>
  )
}

// Clamp helper
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

// Preload the GLTF
useGLTF.preload('/models/mascot.glb')
