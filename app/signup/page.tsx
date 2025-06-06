'use client'

import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, Group } from 'three'
import Link from 'next/link'

function MascotWithEyes({ animate = false, onAnimationEnd }: { animate?: boolean, onAnimationEnd?: () => void }) {
  const { scene } = useGLTF('/models/mascot.glb') as { scene: Group }
  const groupRef = useRef<Group>(null)
  const leftEyeRef = useRef<Mesh>(null)
  const rightEyeRef = useRef<Mesh>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [animState, setAnimState] = useState<'idle' | 'animating' | 'done'>('idle')
  const animRef = useRef({ t: 0, triggered: false })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  useEffect(() => {
    if (animate && animState === 'idle') {
      animRef.current.t = 0
      animRef.current.triggered = true
      setAnimState('animating')
    }
  }, [animate, animState])

  useFrame((state, delta) => {
    let x = mouse.x
    let y = mouse.y
    if (isMobile) {
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
    if (groupRef.current) {
      if (animState === 'animating') {
        animRef.current.t += delta
        let yPos = -4
        if (animRef.current.t < 0.3) {
          yPos = -4 - animRef.current.t * 3
        } else if (animRef.current.t < 0.6) {
          const t = (animRef.current.t - 0.3) / 0.3
          yPos = -4.9 + t * 2.2
        } else if (animRef.current.t < 0.8) {
          const t = (animRef.current.t - 0.6) / 0.2
          yPos = -2.7 - t * 1.3
        } else {
          yPos = -4
          setAnimState('done')
          if (onAnimationEnd) onAnimationEnd()
        }
        groupRef.current.position.y = yPos
      } else {
        groupRef.current.position.y = -4
      }
      const rotateFactor = 0.4
      groupRef.current.rotation.y = x * rotateFactor
      groupRef.current.rotation.x = y * rotateFactor * 0.5
    }
  })

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

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

// Preload the GLTF
useGLTF.preload('/models/mascot.glb')

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animateMascot, setAnimateMascot] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await fetch('https://formspree.io/f/xkgbonvy', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setSubmitted(true)
        setAnimateMascot(true)
      } else {
        setError('There was a problem submitting the form. Please try again.')
      }
    } catch {
      setError('There was a problem submitting the form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMascotAnimationEnd = () => {
    setAnimateMascot(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'url("/bg-simple.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Poppins', sans-serif",
      color: 'white',
    }}>
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
          MOBO
        </Link>
        <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          <Link href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Sign Up</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>About</Link>
          <Link href="/team" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Team</Link>
        </div>
      </div>
      {/* Mascot Canvas at top */}
      <div style={{ width: '100%', height: '240px', marginBottom: '1.5rem', marginTop: '64px' }}>
        <Canvas style={{ width: '100%', height: '100%', background: 'transparent' }} shadows gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 7.5]} intensity={1} castShadow />
          <MascotWithEyes animate={animateMascot} onAnimationEnd={handleMascotAnimationEnd} />
        </Canvas>
      </div>
      <div style={{
        background: 'rgba(30,30,40,0.65)',
        borderRadius: '1.5rem',
        padding: '2.5rem 2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        minWidth: 320,
        maxWidth: '90vw',
        textAlign: 'center',
      }}>
        {submitted ? (
          <>
            <h2 style={{ marginBottom: '1.5rem' }}>Thank you for registering!</h2>
            <p>We&apos;ll let you know when Mobo launches 🚀</p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '1.5rem' }}>Sign up for pre-launch</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '0.7rem',
                  border: 'none',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '0.7rem',
                  border: 'none',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '2rem',
                  border: 'none',
                  background: 'linear-gradient(90deg, #ff8a00 0%, #e52e71 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(229,46,113,0.15)',
                  transition: 'background 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Submitting...' : 'Sign Up'}
              </button>
              {error && <div style={{ color: '#ffb4b4', marginTop: '0.7rem', fontSize: '0.98rem' }}>{error}</div>}
            </form>
          </>
        )}
      </div>
    </div>
  )
} 