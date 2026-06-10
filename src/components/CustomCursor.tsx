'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }

    const onLeave = () => { visibleRef.current = false; setVisible(false) }
    const onEnter = () => { visibleRef.current = true; setVisible(true) }
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)
    const addHover = () => setHovering(true)
    const removeHover = () => setHovering(false)

    const attachHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    attachHoverListeners()
    const t = setTimeout(attachHoverListeners, 1500)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      clearTimeout(t)
    }
  }, [])

  return (
    <div
      ref={dotRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        width: clicking ? 7 : hovering ? 10 : 8,
        height: clicking ? 7 : hovering ? 10 : 8,
        marginLeft: clicking ? -3.5 : hovering ? -5 : -4,
        marginTop: clicking ? -3.5 : hovering ? -5 : -4,
        borderRadius: '50%',
        background: hovering
          ? 'rgba(200, 169, 110, 1)'
          : 'rgba(240, 230, 211, 0.95)',
        boxShadow: hovering
          ? '0 0 10px 5px rgba(200, 169, 110, 0.55), 0 0 22px 10px rgba(200, 169, 110, 0.2)'
          : '0 0 8px 4px rgba(240, 230, 211, 0.45), 0 0 18px 8px rgba(240, 230, 211, 0.15)',
        opacity: visible ? 1 : 0,
        transform: 'translate(-200px, -200px)',
        transition: 'opacity 0.3s, width 0.15s, height 0.15s, margin 0.15s, background 0.2s, box-shadow 0.2s',
      }}
    />
  )
}
