'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu')
      const button = document.getElementById('mobile-menu-button')
      if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'background 0.2s',
    display: 'block',
    width: '100%',
  }

  return (
    <div className="mobile-menu-container">
      {/* Hamburger Button */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '32px',
          height: '32px',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: '24px',
          height: '2px',
          background: 'white',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none',
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: 'white',
          opacity: isOpen ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: 'white',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none',
        }} />
      </button>

      {/* Dropdown Menu */}
      <div
        id="mobile-menu"
        style={{
          position: 'absolute',
          top: '64px', // Height of the nav bar
          right: '0',
          background: 'rgba(30,30,40,0.95)',
          backdropFilter: 'blur(8px)',
          padding: '1rem',
          borderRadius: '0 0 0 1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '1rem',
          minWidth: '200px',
          zIndex: 1000,
        }}
      >
        <Link 
          href="/signup" 
          className="mobile-menu-link"
          style={linkStyle}
          onClick={() => setIsOpen(false)}
        >
          Sign Up
        </Link>
        <Link 
          href="/about" 
          className="mobile-menu-link"
          style={linkStyle}
          onClick={() => setIsOpen(false)}
        >
          About
        </Link>
        <Link 
          href="/team" 
          className="mobile-menu-link"
          style={linkStyle}
          onClick={() => setIsOpen(false)}
        >
          Team
        </Link>
        <Link 
          href="/business" 
          className="mobile-menu-link"
          style={linkStyle}
          onClick={() => setIsOpen(false)}
        >
          Business Enquiries
        </Link>
      </div>
    </div>
  )
} 