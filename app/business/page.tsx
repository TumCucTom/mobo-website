'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, Group } from 'three'

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
      <primitive object={scene} position={[0, 0, 0]} castShadow receiveShadow />
      <mesh position={[-0.2, 1.3, 0.4]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={'white'} />
        <mesh ref={leftEyeRef} position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial color={'black'} />
        </mesh>
      </mesh>
      <mesh position={[0.2, 1.3, 0.4]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={'white'} />
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

useGLTF.preload('/models/mascot.glb')

export default function BusinessPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animateMascot, setAnimateMascot] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await fetch('https://formspree.io/f/mvgrzjve', {
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
          MONOMI
        </Link>
        <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          <Link href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Sign Up</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>About</Link>
          <Link href="/team" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Team</Link>
          <Link href="/business" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Business Enquiries</Link>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: isMobile ? 'flex-start' : 'flex-start',
        maxWidth: isMobile ? 600 : 1300,
        margin: '0 auto',
        padding: isMobile ? '0 0.5rem' : '0 1.5rem',
        marginTop: '64px',
        gap: isMobile ? '0.5rem' : '2.5rem',
        width: '100%',
      }}>
        {/* Mascot on the left or top */}
        <div style={{
          minWidth: isMobile ? 0 : 260,
          width: isMobile ? '100%' : 260,
          height: isMobile ? 180 : 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isMobile ? 0 : '-40px',
          marginTop: isMobile ? 0 : '60px',
          marginBottom: isMobile ? '1.2rem' : 0,
        }}>
          <Canvas style={{ width: isMobile ? 140 : '100%', height: isMobile ? 140 : '100%', background: 'transparent' }} shadows gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 7.5]} intensity={1} castShadow />
            <MascotWithEyes animate={animateMascot} onAnimationEnd={handleMascotAnimationEnd} />
          </Canvas>
        </div>
        {/* Contact Form Box */}
        <div style={{
          flex: 1,
          background: 'rgba(30,30,40,0.88)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          padding: '2.5rem 2rem',
          marginTop: isMobile ? 0 : '40px',
          marginBottom: '2.5rem',
          marginLeft: isMobile ? 0 : '40px',
          width: isMobile ? '100%' : undefined,
          maxWidth: isMobile ? 600 : undefined,
        }}>
          {submitted ? (
            <>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.25)', textAlign: 'center' }}>
                Thank You!
              </h1>
              <p style={{ fontSize: '1.15rem', marginBottom: '1.2rem', lineHeight: 1.7, textAlign: 'center' }}>
                We have received your message and will get back to you shortly.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
                Business Enquiries
              </h1>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="email" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '0.8rem',
                      border: '2px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      fontSize: '1rem',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="subject" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '0.8rem',
                      border: '2px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      fontSize: '1rem',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="message" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '0.8rem',
                      border: '2px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      fontSize: '1rem',
                      width: '100%',
                      resize: 'vertical',
                      transition: 'all 0.2s',
                      minHeight: '120px',
                    }}
                  />
                </div>
                {error && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '1rem',
                    padding: '1rem 2rem',
                    borderRadius: '0.8rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8a00 0%, #ff6b6b 100%)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 