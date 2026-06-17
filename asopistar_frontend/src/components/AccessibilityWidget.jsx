// src/components/AccessibilityWidget.jsx
import { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import ReadingMask from './ReadingMask'

function IconoAccesibilidad({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="3.5" r="1.5" />
      <path d="M17 7.5H7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5z" />
      <path d="M15.5 10.5l-1.5 4.5-2-3-2 3-1.5-4.5H6l2.5 7.5L12 15l3.5 3 2.5-7.5z" />
    </svg>
  )
}

function BotoNivel({ icono, label, nivel, nivelMax, activo, onClick }) {
  const puntos = Array.from({ length: nivelMax }, (_, i) => i + 1)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        title={label}
        className={`
          w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1
          text-xs font-semibold transition-all duration-200 border-2
          ${activo
            ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200'
            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600'}
        `}
      >
        <span className="text-lg leading-none">{icono}</span>
        <span className="text-[10px] leading-none text-center">{label}</span>
      </button>
      <div className="flex gap-1">
        {puntos.map(p => (
          <span key={p} className={`w-1.5 h-1.5 rounded-full transition-colors ${
            p <= nivel ? 'bg-teal-500' : 'bg-gray-200'
          }`} />
        ))}
      </div>
    </div>
  )
}

export default function AccessibilityWidget() {
  const [abierto, setAbierto] = useState(false)
  const panelRef = useRef(null)

  const {
    estado,
    contraste, texto, cursor,
    ciclarContraste, ciclarTexto, ciclarCursor,
    resetear, hayAlgoActivo, mascaraActiva,
  } = useAccessibility()

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const labelCursor = cursor.nivel === 0 ? 'Cursor' : cursor.nivel === 1 ? 'Grande' : 'Máscara'

  return (
    <>
      <ReadingMask activa={mascaraActiva} />

      <div
        ref={panelRef}
        id="a11y-widget"
        className="fixed bottom-6 right-4 z-[9999] flex flex-col items-end gap-2"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {abierto && (
          <div id="a11y-panel" className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accesibilidad</p>
              {hayAlgoActivo && (
                <button onClick={resetear} className="text-xs text-red-400 hover:text-red-600 font-medium">
                  Restablecer
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <BotoNivel
                icono="◑"
                label={contraste.nivel === 0 ? 'Contraste' : contraste.label}
                nivel={contraste.nivel}
                nivelMax={3}
                activo={contraste.nivel > 0}
                onClick={ciclarContraste}
              />
              <BotoNivel
                icono="T↑"
                label={texto.nivel === 0 ? 'Texto' : texto.label}
                nivel={texto.nivel}
                nivelMax={4}
                activo={texto.nivel > 0}
                onClick={ciclarTexto}
              />
              <BotoNivel
                icono="↖"
                label={labelCursor}
                nivel={cursor.nivel}
                nivelMax={2}
                activo={cursor.nivel > 0}
                onClick={ciclarCursor}
              />
            </div>

            {hayAlgoActivo && (
              <div className="text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2 text-center font-medium">
                {[
                  contraste.nivel > 0 && `Contraste: ${contraste.label}`,
                  texto.nivel > 0    && `Texto: ${texto.label}`,
                  cursor.nivel > 0   && `Cursor: ${labelCursor}`,
                ].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setAbierto(a => !a)}
          title="Opciones de accesibilidad"
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            shadow-lg transition-all duration-200
            ${hayAlgoActivo
              ? 'bg-teal-600 text-white ring-2 ring-teal-300'
              : 'bg-[#1a2332] text-white hover:bg-teal-600'}
          `}
        >
          <IconoAccesibilidad size={22} />
        </button>
      </div>
    </>
  )
}
