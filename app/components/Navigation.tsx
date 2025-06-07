'use client'

import Link from 'next/link'
import MobileMenu from './MobileMenu'

export default function Navigation() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: 'rgba(30,30,40,0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 1000,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>MOBO</h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="desktop-nav" style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
      }}>
        <Link href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
          Sign Up
        </Link>
        <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
          About
        </Link>
        <Link href="/team" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
          Team
        </Link>
        <Link href="/business" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
          Business Enquiries
        </Link>
      </div>

      {/* Mobile Menu */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MobileMenu />
      </div>
    </nav>
  )
} 