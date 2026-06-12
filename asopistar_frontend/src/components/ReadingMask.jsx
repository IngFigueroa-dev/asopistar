// src/components/ReadingMask.jsx
// Máscara de lectura: ventana iluminada que sigue el cursor verticalmente.
import { useEffect, useRef } from 'react'

const WINDOW_HEIGHT = 80  // px de la ventana iluminada

export default function ReadingMask({ activa }) {
  const topRef    = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!activa) return

    const mover = (e) => {
      const y = e.clientY
      if (topRef.current)    topRef.current.style.height    = Math.max(0, y - WINDOW_HEIGHT / 2) + 'px'
      if (bottomRef.current) bottomRef.current.style.height = Math.max(0, window.innerHeight - y - WINDOW_HEIGHT / 2) + 'px'
    }

    window.addEventListener('mousemove', mover)
    return () => window.removeEventListener('mousemove', mover)
  }, [activa])

  if (!activa) return null

  return (
    <>
      <div ref={topRef}    className="reading-mask-top"    style={{ height: '40vh' }} />
      <div ref={bottomRef} className="reading-mask-bottom" style={{ height: '40vh' }} />
    </>
  )
}
