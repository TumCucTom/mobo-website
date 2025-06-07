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

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
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
            <MascotWithEyes />
          </Canvas>
        </div>
        {/* About Box */}
        <div style={{
          flex: 1,
          background: 'rgba(30,30,40,0.88)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          padding: '2.5rem 2rem',
          marginTop: isMobile ? 0 : '40px',
          marginBottom: '2.5rem',
          marginLeft: isMobile ? 0 : '40px',
          textAlign: 'center',
          width: isMobile ? '100%' : undefined,
          maxWidth: isMobile ? 600 : undefined,
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
            About MONOMI
          </h1>
          <p style={{ fontSize: '1.15rem', marginBottom: '1.2rem', lineHeight: 1.7 }}>
            MONOMI is a gamified financial education app designed to make learning about money engaging, interactive, and fun. In MONOMI, you&apos;ll explore a universe of themed worlds, each focused on a different aspect of personal finance—from budgeting basics to investing, credit, and beyond. As you journey through these worlds, you&apos;ll unlock bite-sized video lessons, interactive challenges, and seamless story-driven modules that make complex financial concepts easy to understand and apply.
          </p>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.2rem' }}>
            Whether you&apos;re a beginner or looking to level up your financial skills, MONOMI adapts to your pace and rewards your progress with achievements, collectibles, and real-world insights. Our mission is to empower you to build confidence and mastery over your finances, all while having fun. Join a community of learners, track your growth, and discover how financial education can be an adventure—one world at a time.
          </p>
          <div style={{
            marginTop: '2.5rem',
            padding: '1.5rem 1rem',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            fontSize: '1.08rem',
            color: '#ffe0b2',
            fontWeight: 500,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          }}>
            <div style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff8e1', letterSpacing: '0.01em' }}>
              For Investors & Businesses
            </div>
            Interested in B2B affiliate marketing or a white-label product license?<br />
            <Link href="/business" style={{ color: '#ffd180', textDecoration: 'underline', fontWeight: 600 }}>Visit our Business Enquiries page</Link>
          </div>
        </div>
      </div>
    </div>
  )
} 