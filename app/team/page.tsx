'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRef, useEffect as useEffectReact, useState as useStateReact } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, Group } from 'three'
import Image from 'next/image'

const founders = [
  {
    name: 'Pablo Moya-Angeler Lozano',
    title: 'CEO & Founder',
    img: 'pablo.jpeg',
    desc: 'Chartered Financial Analyst with a passion for financial education and gamification'
  },
  {
    name: 'Abdulbadie Lary',
    title: 'Co-Founder',
    img: 'lary.jpeg',
    desc: 'Eager-to-learn finance student at the University of Bristol committed to the field'
  },
  {
    name: 'Thomas Bale',
    title: 'CTO & Co-Founder',
    img: 'tom.jpeg',
    desc: 'Ex-Machine Learning Engineer, experienced in rapid prototyping and building scalable systems.'
  },
]

const team = [
  {
    name: 'Taylor Smith',
    title: 'Lead Designer',
    img: 'https://randomuser.me/api/portraits/men/12.jpg',
    desc: 'Crafts beautiful, intuitive interfaces for all users.'
  },
  {
    name: 'Jordan Chen',
    title: 'Full Stack Engineer',
    img: 'https://randomuser.me/api/portraits/women/23.jpg',
    desc: 'Builds robust, scalable systems for the Mobo platform.'
  },
  {
    name: 'Samira Ali',
    title: 'Content Lead',
    img: 'https://randomuser.me/api/portraits/women/56.jpg',
    desc: 'Creates engaging, educational content for every world.'
  },
  {
    name: 'Chris Evans',
    title: 'Game Designer',
    img: 'https://randomuser.me/api/portraits/men/78.jpg',
    desc: 'Designs fun, rewarding challenges and experiences.'
  },
  {
    name: 'Priya Singh',
    title: 'Community Manager',
    img: 'https://randomuser.me/api/portraits/women/81.jpg',
    desc: 'Connects and supports the Mobo learner community.'
  },
  {
    name: 'Riley Brooks',
    title: 'Mobile Engineer',
    img: 'https://randomuser.me/api/portraits/men/41.jpg',
    desc: 'Ensures a smooth experience on every device.'
  },
  {
    name: 'Ava Martinez',
    title: 'UX Researcher',
    img: 'https://randomuser.me/api/portraits/women/90.jpg',
    desc: 'Finds ways to make learning even more effective.'
  },
  {
    name: 'Ethan Zhao',
    title: 'Backend Engineer',
    img: 'https://randomuser.me/api/portraits/men/53.jpg',
    desc: 'Keeps the platform fast, secure, and reliable.'
  },
  {
    name: 'Lila Green',
    title: 'Animator',
    img: 'https://randomuser.me/api/portraits/women/67.jpg',
    desc: 'Brings the Mobo worlds and characters to life.'
  },
  {
    name: 'Omar Farouk',
    title: 'QA Lead',
    img: 'https://randomuser.me/api/portraits/men/88.jpg',
    desc: 'Ensures everything works perfectly for our users.'
  },
]

function getImgSrc(img: string) {
  return img.startsWith('http') ? img : `/team/${img}`;
}

function MascotWithEyes({ animate = false, onAnimationEnd }: { animate?: boolean, onAnimationEnd?: () => void }) {
  const { scene } = useGLTF('/models/mascot.glb') as { scene: Group }
  const groupRef = useRef<Group>(null)
  const leftEyeRef = useRef<Mesh>(null)
  const rightEyeRef = useRef<Mesh>(null)
  const [mouse, setMouse] = useStateReact<{ x: number; y: number }>({ x: 0, y: 0 })
  const [animState, setAnimState] = useStateReact<'idle' | 'animating' | 'done'>('idle')
  const animRef = useRef({ t: 0, triggered: false })
  const [isMobile, setIsMobile] = useStateReact(false)

  useEffectReact(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffectReact(() => {
    if (isMobile) return
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setMouse({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  useEffectReact(() => {
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

export default function TeamPage() {
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
          MOBO
        </Link>
        <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          <Link href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Sign Up</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>About</Link>
          <Link href="/team" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, transition: 'opacity 0.2s', opacity: 0.92 }}>Team</Link>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 1.5rem 2.5rem 1.5rem', marginTop: '64px' }}>
        {/* Mascot and Founders layout */}
        {isMobile ? (
          <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Canvas style={{ width: 180, height: 180, background: 'transparent' }} shadows gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 7.5]} intensity={1} castShadow />
                <MascotWithEyes />
              </Canvas>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2.2rem', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.25)', textAlign: 'center' }}>
              Founders
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
              {founders.map((f, i) => (
                <div key={i} style={{ background: 'rgba(30,30,40,0.7)', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '1.5rem 1.2rem', width: 220, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Image src={getImgSrc(f.img)} alt={f.name} width={90} height={90} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '1.1rem', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.98rem', color: '#ff8a00', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.97rem', opacity: 0.88 }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center' }}>
              Team
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '1.2rem' : '2.2rem 2.2rem', justifyContent: 'center' }}>
              {team.map((t, i) => (
                <div key={i} style={{ background: 'rgba(30,30,40,0.7)', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '1.2rem 1rem', width: isMobile ? '46%' : 180, minWidth: isMobile ? 0 : 180, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Image src={getImgSrc(t.img)} alt={t.name} width={70} height={70} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '0.8rem', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.93rem', color: '#ff8a00', fontWeight: 600, marginBottom: '0.4rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.93rem', opacity: 0.85 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2.2rem', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.25)', textAlign: 'center' }}>
              Founders
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
              {founders.map((f, i) => (
                <div key={i} style={{ background: 'rgba(30,30,40,0.7)', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '1.5rem 1.2rem', width: 220, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Image src={getImgSrc(f.img)} alt={f.name} width={90} height={90} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '1.1rem', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.98rem', color: '#ff8a00', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.97rem', opacity: 0.88 }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '2.5rem 0 3.5rem 0' }}>
              <Canvas style={{ width: 320, height: 320, background: 'transparent' }} shadows gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 7.5]} intensity={1} castShadow />
                <MascotWithEyes />
              </Canvas>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #fff 60%, #ff8a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center' }}>
              Team
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.2rem', maxWidth: 1200, margin: '0 auto' }}>
              {team.map((t, i) => (
                <div key={i} style={{ background: 'rgba(30,30,40,0.7)', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '1.2rem 1rem', width: 180, minWidth: 180, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Image src={getImgSrc(t.img)} alt={t.name} width={70} height={70} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '0.8rem', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.93rem', color: '#ff8a00', fontWeight: 600, marginBottom: '0.4rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.93rem', opacity: 0.85 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 